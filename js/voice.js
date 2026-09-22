// js/voice.js — NGƯỜI B sở hữu. Tính năng 5: AI Response Assistant & Voice Proxy.
//
// DOM: #reply-input, #voice-proxy-btn, #voice-status, #reply-preview
// PHÁT:   'reply:ready' { text }
// NGHE:   không nghe ai. Ứng viên tự bấm.
//
// TTS = Web Speech API, KHÔNG cần key, KHÔNG cần model riêng.
// Thứ tự chọn giọng (CONFIG.VOICE_PREFER):
//   1. "Microsoft HoaiMy/NamMinh Online (Natural)" — giọng neural vi-VN, Edge lộ sẵn
//   2. "Google Tiếng Việt" — Chrome desktop
//   3. bất kỳ giọng vi-VN nào trên máy (Windows: "Microsoft An")
//   4. không có giọng nào -> HIỆN CHỮ TO, không đọc bằng giọng tiếng Anh
//      (giọng Anh đọc tiếng Việt ra tiếng vô nghĩa, tệ hơn im lặng)
//
// Bẫy đã biết: speechSynthesis.getVoices() trả MẢNG RỖNG ở lần gọi đầu.
// Phải đợi sự kiện 'voiceschanged' rồi mới chọn giọng vi-VN.

(function () {
  const input     = document.getElementById('reply-input');
  const btn       = document.getElementById('voice-proxy-btn');
  const statusEl  = document.getElementById('voice-status');
  const previewEl = document.getElementById('reply-preview');
  if (!input || !btn) return;

  const synth = window.speechSynthesis || null;

  let viVoice    = null;
  let mode       = 'idle';   // idle | composing | speaking
  let warned     = false;
  let speakToken   = 0;      // huỷ trong lúc chờ nhịp cancel() -> bỏ lượt đọc
  let composeToken = 0;      // HR chuyển câu giữa lúc AI đang ghép -> bỏ kết quả

  const BIG_TEXT = ['text-[26px]', 'leading-9', 'font-extrabold', 'text-on-surface'];

  const TOOL = {
    name: 'ghep_cau_tra_loi',
    description: 'Ghép các ý rời ứng viên gõ thành một câu trả lời phỏng vấn hoàn chỉnh.',
    input_schema: {
      type: 'object',
      properties: {
        reply: {
          type: 'string',
          description: '2–3 câu tiếng Việt, xưng "em", gọi người phỏng vấn là "anh/chị"',
        },
      },
      required: ['reply'],
    },
  };

  // ------------------------------------------------------------- chọn giọng --
  function pickVoice() {
    if (!synth) return null;
    // Suy ra từ CONFIG.LANG ('vi-VN' -> 'vi') chứ không viết cứng 'vi',
    // để đổi ngôn ngữ chỉ phải sửa một chỗ trong config.
    const prefix = String(CONFIG.LANG).split('-')[0].toLowerCase();
    const all = synth.getVoices() || [];
    const vi  = all.filter((v) => String(v.lang || '').toLowerCase().startsWith(prefix));
    if (!vi.length) return null;

    for (const needle of CONFIG.VOICE_PREFER) {
      const hit = vi.find((v) => String(v.name || '').toLowerCase().includes(needle.toLowerCase()));
      if (hit) return hit;
    }
    return vi.find((v) => v.lang === 'vi-VN') || vi[0];
  }

  function refreshVoice() {
    viVoice = pickVoice();
    if (viVoice) {
      warned = false;
      setStatus('Giọng đọc: ' + viVoice.name);
    } else if (!warned) {
      warned = true;
      setStatus('Máy này chưa có giọng tiếng Việt. Câu trả lời sẽ hiện CHỮ TO thay vì đọc. ' +
                'Mở bằng Microsoft Edge để có giọng HoaiMy/NamMinh.', true);
    }
  }

  // ------------------------------------------------------------------ đọc --
  // Chrome cắt ngang utterance dài -> chia theo câu, mỗi mẩu <= VOICE_CHUNK_CHARS.
  function chunk(text) {
    const out = [];
    let buf = '';
    String(text).split(/(?<=[.!?…;])\s+/).forEach((sentence) => {
      const s = sentence.trim();
      if (!s) return;
      if ((buf + ' ' + s).trim().length > CONFIG.VOICE_CHUNK_CHARS && buf) {
        out.push(buf.trim());
        buf = s;
      } else {
        buf = (buf ? buf + ' ' : '') + s;
      }
    });
    if (buf.trim()) out.push(buf.trim());
    return out.length ? out : [String(text)];
  }

  // Trả true nếu thật sự phát ra tiếng. false -> người gọi tự lo hiển thị.
  function speak(text, opts) {
    const o = opts || {};
    if (!synth || !text) return false;
    if (!viVoice) viVoice = pickVoice();
    if (!viVoice) return false;

    const token = ++speakToken;
    synth.cancel();
    const parts = chunk(text);

    // cancel() rồi speak() ngay là Chrome nuốt mất câu đầu. Nhường 1 nhịp.
    setTimeout(() => {
      if (token !== speakToken) return;   // bị huỷ/thay thế trong 60ms chờ
      parts.forEach((part, i) => {
        const u = new SpeechSynthesisUtterance(part);
        u.voice = viVoice;
        u.lang  = viVoice.lang || CONFIG.LANG;
        u.rate  = CONFIG.VOICE_RATE;
        u.pitch = CONFIG.VOICE_PITCH;
        if (i === 0 && o.onstart) u.onstart = o.onstart;
        if (i === parts.length - 1 && o.onend) u.onend = o.onend;
        // Kể cả bị cắt ngang (ứng viên bấm "Xin 3 giây" giữa chừng) vẫn phải
        // báo về, nếu không nút kẹt mãi ở trạng thái "Dừng đọc".
        u.onerror = () => { if (o.onend) o.onend(); };
        synth.speak(u);
      });
    }, 60);

    return true;
  }

  // ----------------------------------------------------------- ghép câu AI --
  async function composeReply(rawInput) {
    const res = await askClaude({
      model: CONFIG.MODEL,
      max_tokens: 400,
      system: CONFIG.PROMPTS.COMPOSE,
      messages: [{ role: 'user', content: rawInput }],
      tools: [TOOL],
      tool_choice: { type: 'tool', name: TOOL.name },
    });
    const out = res ? readToolInput(res, TOOL.name) : null;
    const reply = out && typeof out.reply === 'string' ? out.reply.trim() : '';
    return reply || null;
  }

  // ------------------------------------------------------------------- UI --
  function setStatus(msg, isWarning) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.toggle('text-error', !!isWarning);
    statusEl.classList.toggle('font-semibold', !!isWarning);
  }

  function showPreview(text, big) {
    if (!previewEl) return;
    previewEl.textContent = text;
    previewEl.classList.remove('hidden');
    BIG_TEXT.forEach((c) => previewEl.classList.toggle(c, !!big));
  }

  function setMode(next) {
    mode = next;
    const label = { idle: 'Đọc câu trả lời (Voice Proxy)', composing: 'Đang ghép câu…', speaking: 'Dừng đọc' }[next];
    const icon  = { idle: 'volume_up', composing: 'progress_activity', speaking: 'stop_circle' }[next];

    btn.disabled = next === 'composing';
    btn.classList.toggle('opacity-60', next === 'composing');
    btn.classList.toggle('cursor-not-allowed', next === 'composing');

    btn.textContent = '';
    const iconEl = document.createElement('span');
    iconEl.className = 'material-symbols-outlined text-[22px]' + (next === 'composing' ? ' animate-spin' : '');
    iconEl.setAttribute('aria-hidden', 'true');
    iconEl.textContent = icon;
    btn.appendChild(iconEl);
    btn.appendChild(document.createTextNode(label));
    btn.setAttribute('aria-label', label);
  }

  function stopSpeaking() {
    speakToken += 1;
    setMode('idle');            // đặt trước cancel() để onend không ghi đè status
    if (synth) synth.cancel();
    setStatus('Đã dừng đọc.');
  }

  async function onClick() {
    if (mode === 'composing') return;
    if (mode === 'speaking') { stopSpeaking(); return; }

    const raw = input.value.trim();
    if (!raw) {
      setStatus('Bạn chưa gõ ý nào. Hãy gõ vài từ khóa rồi bấm lại.', true);
      input.focus();
      return;                                   // ô rỗng -> KHÔNG gọi AI
    }

    setMode('composing');
    setStatus('Đang ghép câu trả lời…');

    const mine  = ++composeToken;
    const reply = await composeReply(raw);
    if (mine !== composeToken) return;           // HR đã chuyển câu, bỏ kết quả này
    const text  = reply || raw;                 // AI lỗi -> đọc nguyên văn, không im lặng

    STATE.reply = text;
    emit('reply:ready', { text });

    if (!viVoice) viVoice = pickVoice();
    const canSpeak = !!(synth && viVoice);

    showPreview(text, !canSpeak);

    if (!canSpeak) {
      setMode('idle');
      setStatus('Không có giọng tiếng Việt trên máy này — câu trả lời đang hiện chữ to để anh/chị đọc.', true);
      return;
    }

    setMode('speaking');
    setStatus(reply ? 'Đang đọc câu AI ghép…' : 'AI không phản hồi — đang đọc nguyên văn phần bạn gõ.');

    const spoke = speak(text, {
      onend: () => { if (mode === 'speaking') { setMode('idle'); setStatus('Đọc xong. Bấm để đọc lại.'); } },
    });
    if (!spoke) { setMode('idle'); setStatus('Không phát được âm thanh. Câu trả lời đang hiện phía trên.', true); }
  }

  function initVoice() {
    setMode('idle');
    if (previewEl) previewEl.classList.add('hidden');

    if (!synth) {
      setStatus('Trình duyệt này không đọc được văn bản. Câu trả lời sẽ hiện chữ to.', true);
    } else {
      refreshVoice();                            // lần đầu thường rỗng…
      synth.onvoiceschanged = refreshVoice;      // …nên phải chọn lại ở đây
    }

    btn.addEventListener('click', onClick);

    // Rời trang mà loa còn đang đọc thì tiếng vẫn chạy tiếp -> cắt.
    window.addEventListener('beforeunload', () => { if (synth) synth.cancel(); });
  }

  // HR bấm "Câu tiếp theo": ứng viên phải bắt đầu lại từ trang trắng.
  // Còn chữ của câu trước trong ô nhập là dễ bấm đọc nhầm câu cũ.
  on('question:reset', () => {
    composeToken += 1;          // lượt ghép câu đang bay thành vô hiệu
    stopSpeaking();
    input.value = '';
    if (previewEl) {
      previewEl.textContent = '';
      previewEl.classList.add('hidden');
      BIG_TEXT.forEach((c) => previewEl.classList.remove(c));
    }
    STATE.reply = '';
    setStatus(viVoice ? 'Giọng đọc: ' + viVoice.name : 'Sẵn sàng đọc câu trả lời của bạn.');
  });

  // cushion.js dùng chung hàm này. B sở hữu cả hai file nên gọi chéo được.
  window.speak = speak;

  initVoice();
})();
