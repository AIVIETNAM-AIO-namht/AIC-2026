// js/simplify.js — NGƯỜI A sở hữu. Tính năng 2: AI Plain-Language Simplifier.
//
// DOM: #simple-question, #word-count-badge, #keyword-chips, #latency-badge,
//      #reduction-note
// PHÁT:   'question:simple' { question, keywords }
// NGHE:   'transcript:final' { text }
//
// Gọi AI qua askClaude() trong js/ai.js. KHÔNG tự fetch.
// Chập chờn mạng -> rút gọn tại chỗ bằng luật thô, KHÔNG để UI trống.

(function () {
  const qEl     = document.getElementById('simple-question');
  const badgeEl = document.getElementById('word-count-badge');
  const chipsEl = document.getElementById('keyword-chips');
  const latEl   = document.getElementById('latency-badge');
  const noteEl  = document.getElementById('reduction-note');
  if (!qEl) return;

  const CHIP_ICONS    = ['group_off', 'bolt', 'flag'];
  const IDLE_QUESTION = qEl.textContent.trim();
  const IDLE_NOTE     = noteEl ? noteEl.textContent.trim() : '';

  const TOOL = {
    name: 'rut_gon_cau_hoi',
    description: 'Trả câu hỏi đã rút gọn cho ứng viên Điếc, kèm 3 từ khóa trọng tâm.',
    input_schema: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'Một câu duy nhất, dưới 12 từ, cấu trúc [Tình huống] + [Bạn làm gì?]',
        },
        keywords: {
          type: 'array',
          items: { type: 'string' },
          minItems: CONFIG.KEYWORD_COUNT,
          maxItems: CONFIG.KEYWORD_COUNT,
          description: 'Đúng 3 từ khóa hành động, mỗi từ 1–3 tiếng',
        },
      },
      required: ['question', 'keywords'],
    },
  };

  let debounceTimer    = null;
  let provisionalTimer = null;
  let buffer           = '';    // HR nói 3 câu rời -> gom lại thành 1 câu hỏi
  let seq              = 0;     // chống kết quả cũ về sau đè kết quả mới
  let inflight         = null;  // AbortController của lượt đang chạy

  function countWords(s) {
    return String(s || '').trim().split(/\s+/).filter(Boolean).length;
  }

  // ------------------------------------------------------------- vào/ra --
  function onFinalTranscript(detail) {
    const text = ((detail && detail.text) || '').trim();
    if (!text) return;
    buffer = buffer ? buffer + ' ' + text : text;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(flush, CONFIG.SIMPLIFY_DEBOUNCE_MS);
  }

  function flush() {
    const text = buffer.trim();
    buffer = '';
    if (countWords(text) < CONFIG.MIN_WORDS_TO_SIMPLIFY) return;  // "dạ vâng" -> bỏ
    simplify(text);
  }

  async function simplify(text) {
    const mine = ++seq;
    if (inflight) inflight.abort();          // lượt cũ không còn giá trị
    clearTimeout(provisionalTimer);
    const ctrl = new AbortController();
    inflight = ctrl;

    setPending();

    // Mạng chậm/chết: đừng để ứng viên nhìn màn hình trống. Hiện bản rút gọn
    // tại chỗ trước, AI về kịp thì thay bằng bản tốt hơn.
    provisionalTimer = setTimeout(() => {
      if (mine === seq) renderSimple(localFallback(text), text, null, true);
    }, CONFIG.SIMPLIFY_PROVISIONAL_MS);

    const t0 = performance.now();

    const res = await askClaude({
      model: CONFIG.MODEL,
      max_tokens: 300,
      system: CONFIG.PROMPTS.SIMPLIFY,
      messages: [{ role: 'user', content: text }],
      tools: [TOOL],
      tool_choice: { type: 'tool', name: TOOL.name },
    }, { signal: ctrl.signal });

    if (mine !== seq) return;                // đã có câu mới, bỏ kết quả này
    inflight = null;
    clearTimeout(provisionalTimer);

    const ms  = Math.round(performance.now() - t0);
    const raw = res ? readToolInput(res, TOOL.name) : null;

    if (raw) renderSimple(normalize(raw), text, ms, false);
    else     renderSimple(localFallback(text), text, null, false);
  }

  // Model vẫn có thể trả thiếu/thừa. Chuẩn hoá trước khi vẽ.
  function normalize(raw) {
    const question = String(raw.question || '').trim();
    let keywords = Array.isArray(raw.keywords) ? raw.keywords : [];
    keywords = keywords.map((k) => String(k || '').trim()).filter(Boolean);
    while (keywords.length < CONFIG.KEYWORD_COUNT) keywords.push('—');
    keywords = keywords.slice(0, CONFIG.KEYWORD_COUNT);
    return { question: question || '(không rút gọn được)', keywords };
  }

  // ------------------------------------------------------------------ vẽ --
  function setPending() {
    qEl.textContent = 'Đang rút gọn câu hỏi…';
    if (badgeEl) badgeEl.textContent = '… / ' + CONFIG.MAX_WORDS + ' từ';
    if (latEl) latEl.textContent = 'đang đo…';
  }

  function renderSimple(data, rawText, ms, provisional) {
    const { question, keywords } = data;
    const after  = countWords(question);
    const before = countWords(rawText);

    qEl.textContent = question;

    if (badgeEl) {
      badgeEl.textContent = after + ' / ' + CONFIG.MAX_WORDS + ' từ';
      badgeEl.classList.toggle('text-error', after > CONFIG.MAX_WORDS);
    }

    if (chipsEl) {
      // Giữ lại nhãn "Từ khóa trọng tâm:" là node đầu, thay phần còn lại.
      while (chipsEl.children.length > 1) chipsEl.removeChild(chipsEl.lastChild);
      keywords.forEach((word, i) => {
        const chip = document.createElement('span');
        chip.className =
          'px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container ' +
          'font-label-md text-label-md font-bold shadow-sm flex items-center gap-1.5';
        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined text-[18px]';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = CHIP_ICONS[i] || 'label';
        chip.appendChild(icon);
        chip.appendChild(document.createTextNode(word));
        chipsEl.appendChild(chip);
      });
    }

    if (latEl) {
      latEl.textContent = provisional ? 'đang gọi AI…'
                        : ms === null ? 'câu mẫu'
                        : (ms / 1000).toFixed(1) + 's';
    }

    if (noteEl) {
      const cut = before > 0 ? Math.max(0, Math.round((1 - after / before) * 100)) : 0;
      const suffix = provisional  ? ' • bản rút gọn tại chỗ, đang chờ AI'
                   : ms === null  ? ' • AI không phản hồi, đang dùng bản rút gọn tại chỗ'
                   : '';
      noteEl.textContent =
        'Giảm ' + cut + '% độ dài câu (từ ' + before + ' từ xuống ' + after + ' từ) • ' +
        'Trích ' + keywords.length + ' từ khóa cốt lõi' + suffix;
    }

    STATE.simple   = question;
    STATE.keywords = keywords;
    emit('question:simple', { question, keywords });
  }

  // ------------------------------------------------- đường lui khi mất AI --
  // Không thông minh bằng model, nhưng không bao giờ để màn hình ứng viên trống.
  function localFallback(text) {
    const clean = text.replace(/\s+/g, ' ').trim().replace(/[.?!]+$/, '');

    // Câu hỏi tiếng Việt thường dồn ý hỏi về cuối -> lấy mệnh đề cuối.
    const parts = clean.split(/[,;]| thì | mà /i).map((s) => s.trim()).filter(Boolean);
    let pick = parts.length ? parts[parts.length - 1] : clean;
    if (countWords(pick) < CONFIG.MIN_WORDS_TO_SIMPLIFY) pick = clean;

    let words = pick.split(/\s+/).filter(Boolean);
    if (words.length > CONFIG.MAX_WORDS) words = words.slice(0, CONFIG.MAX_WORDS);
    let question = words.join(' ');
    question = question.charAt(0).toUpperCase() + question.slice(1);
    if (!/\?$/.test(question)) question += '?';

    return { question, keywords: pickKeywords(clean) };
  }

  // Từ tiếng Việt phần lớn là hai tiếng ("thiếu người", "đơn hàng"), nên gom
  // hai tiếng liền nhau cùng là từ có nghĩa trước, còn lẻ thì lấy một tiếng.
  function pickKeywords(text) {
    const stop   = new Set(CONFIG.STOPWORDS);
    const tokens = text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    const seen   = new Set();
    const out    = [];

    for (let i = 0; i < tokens.length; i++) {
      const a = tokens[i];
      const b = tokens[i + 1];
      if (stop.has(a) || a.length < 2) continue;
      let phrase = a;
      if (b && !stop.has(b) && b.length >= 2) { phrase = a + ' ' + b; i++; }
      if (seen.has(phrase)) continue;
      seen.add(phrase);
      out.push(phrase);
    }

    // Cụm hai tiếng nói lên nhiều hơn một tiếng lẻ -> ưu tiên trước.
    out.sort((x, y) => (y.split(' ').length - x.split(' ').length) || (y.length - x.length));
    const top = out.slice(0, CONFIG.KEYWORD_COUNT);
    while (top.length < CONFIG.KEYWORD_COUNT) top.push('—');
    return top;
  }


  // HR bấm "Lặp lại câu hỏi": KHÔNG gọi AI lại, chỉ làm câu đang hiện nháy lên
  // để ứng viên vừa nhìn đi chỗ khác biết mà nhìn lại. Nháy bằng nền, không
  // bằng chớp tắt chữ — chữ biến mất rồi hiện lại là bắt người ta đọc lại từ đầu.
  function flashQuestion() {
    if (!STATE.simple) return;
    qEl.classList.remove('bg-secondary-container');
    void qEl.offsetWidth;                       // ép trình duyệt chạy lại transition
    qEl.classList.add('bg-secondary-container');
    clearTimeout(flashQuestion._t);
    flashQuestion._t = setTimeout(() => qEl.classList.remove('bg-secondary-container'), 900);
  }

  // Huỷ mọi thứ đang bay rồi xoá bảng. Dùng chung cho Demo và nút "Câu tiếp theo",
  // nếu không thì AI trả lời muộn vài giây sau vẫn đổ chữ ra màn hình đã dọn.
  function hardReset() {
    clearTimeout(debounceTimer);
    clearTimeout(provisionalTimer);
    if (inflight) inflight.abort();
    inflight = null;
    seq += 1;              // mọi kết quả đang bay thành vô hiệu
    buffer = '';
    resetPanel();
  }

  function resetPanel() {
    qEl.textContent = IDLE_QUESTION;
    if (badgeEl) badgeEl.textContent = '— / ' + CONFIG.MAX_WORDS + ' từ';
    if (latEl) latEl.textContent = '—';
    if (noteEl) noteEl.textContent = IDLE_NOTE;
    if (chipsEl) while (chipsEl.children.length > 1) chipsEl.removeChild(chipsEl.lastChild);
    STATE.simple = '';
    STATE.keywords = [];
  }

  on('demo:toggle', hardReset);
  on('question:reset', hardReset);
  on('question:repeat', flashQuestion);
  on('transcript:final', onFinalTranscript);
})();
