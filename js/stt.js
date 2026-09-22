// js/stt.js — NGƯỜI A sở hữu. Tính năng 1: Live Transcript.
//
// DOM: #mic-btn, #mic-label, #mic-level, #transcript-stream, #browser-warning
// PHÁT:   'transcript:interim' { text }   — đang nói, hiện mờ
//         'transcript:final'   { text }   — đã chốt câu, đẩy sang simplify
//         'mic:toggle'         { isListening }
//         'stt:error'          { message }
// NGHE:   'transcript:interim' / 'transcript:final' — để VẼ.
//         Phát rồi tự nghe: nhờ vậy Chế độ Demo bơm chữ qua BUS là màn hình
//         hiện y như người thật đang nói, demo.js không cần biết DOM nào cả.
//         'demo:toggle' — demo bật thì tắt mic, tránh hai nguồn chữ chồng nhau.
//
// Bẫy đã biết: Chrome tự ngắt recognition sau ~60s im lặng.
// onend -> start lại SAU CONFIG.STT_RESTART_MS, nhưng phải có cờ
// wantListening để không restart vô hạn khi user đã tắt mic.

(function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  const micBtn   = document.getElementById('mic-btn');
  const micLabel = document.getElementById('mic-label');
  const micLevel = document.getElementById('mic-level');
  const micDb    = document.getElementById('mic-db');
  const recPill  = document.getElementById('rec-status');
  const streamEl = document.getElementById('transcript-stream');
  const bodyEl   = document.getElementById('transcript-body');
  if (!micBtn || !bodyEl) return;   // không phải trang phỏng vấn

  // wantListening = ý định của người dùng. running = engine thực sự đang chạy.
  // Tách hai cái ra, nếu không mic sẽ tự bật lại sau khi user vừa tắt.
  let recognition   = null;
  let wantListening = false;
  let running       = false;
  let restartTimer  = null;

  let finalsEl  = null;
  let interimEl = null;

  // --- Vạch âm lượng ------------------------------------------------------
  const bars = micLevel ? Array.from(micLevel.children) : [];
  const MIN  = CONFIG.MIC_BAR_MIN;
  // Biên các dải tần (chỉ số bin), thưa dần — giọng người nằm ở dải thấp nên
  // chia kiểu log thế này thì cả 12 vạch đều nhảy, không phải mỗi 3 vạch đầu.
  const BAND_EDGES = [0, 1, 2, 3, 4, 6, 8, 11, 15, 20, 27, 36, 48];
  let audioCtx = null, analyser = null, micStream = null, rafId = null;
  let freqData = null, timeData = null;

  // ------------------------------------------------------------------ vẽ --
  function resetTranscript() {
    bodyEl.textContent = '';
    finalsEl = document.createElement('div');
    finalsEl.className = 'flex flex-col gap-1';
    interimEl = document.createElement('span');
    interimEl.className = 'block italic opacity-60';
    bodyEl.appendChild(finalsEl);
    bodyEl.appendChild(interimEl);
  }

  function renderInterim(text) {
    // textContent, tuyệt đối không innerHTML — chữ này do micro đọc vào.
    interimEl.textContent = text || '';
    scrollToEnd();
  }

  function renderFinal(text) {
    if (!text) return;
    const line = document.createElement('p');
    line.className = 'block';
    line.textContent = text;
    finalsEl.appendChild(line);
    interimEl.textContent = '';
    scrollToEnd();
  }

  function scrollToEnd() {
    if (streamEl) streamEl.scrollTop = streamEl.scrollHeight;
  }

  function setMicUi(isOn) {
    STATE.isListening = isOn;
    micBtn.setAttribute('aria-pressed', String(isOn));
    micBtn.setAttribute('aria-label', isOn ? 'Tắt micro' : 'Bật micro');
    const icon = micBtn.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = isOn ? 'stop' : 'mic';
    if (micLabel) micLabel.textContent = isOn ? 'Đang bật' : 'Đang tắt';
    micBtn.classList.toggle('bg-primary', !isOn);
    micBtn.classList.toggle('bg-tertiary', isOn);
    if (recPill) recPill.textContent = isOn ? 'Đang ghi âm & lắng nghe' : 'Micro đang tắt';
  }

  // -------------------------------------------------------------- engine --
  function startEngine() {
    if (running || !wantListening) return;

    recognition = new SR();
    recognition.lang            = CONFIG.LANG;
    recognition.continuous      = true;
    recognition.interimResults  = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { running = true; };

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res  = event.results[i];
        const text = ((res[0] && res[0].transcript) || '').trim();
        if (!text) continue;
        if (res.isFinal) {
          STATE.transcript = text;
          emit('transcript:final', { text });
        } else {
          interim += (interim ? ' ' : '') + text;
        }
      }
      if (interim) emit('transcript:interim', { text: interim });
    };

    recognition.onerror = (event) => {
      const code = event.error;

      // Bình thường khi im lặng hoặc khi chính ta gọi stop(). onend sẽ lo.
      if (code === 'no-speech' || code === 'aborted') return;

      if (code === 'not-allowed' || code === 'service-not-allowed') {
        stopSTT();
        emit('stt:error', {
          message: 'Trình duyệt đang chặn micro. Bấm biểu tượng ổ khoá trên thanh địa chỉ để cấp quyền, rồi bật mic lại.',
          sticky: true,
        });
        return;
      }

      if (code === 'audio-capture') {
        stopSTT();
        emit('stt:error', { message: 'Không tìm thấy thiết bị micro. Cắm mic rồi bật lại.', sticky: true });
        return;
      }

      emit('stt:error', { message: 'Nhận dạng giọng nói gặp lỗi (' + code + '), đang thử kết nối lại.' });
    };

    recognition.onend = () => {
      running = false;
      if (!wantListening) return;           // user đã tắt -> ĐỪNG bật lại
      clearTimeout(restartTimer);
      restartTimer = setTimeout(startEngine, CONFIG.STT_RESTART_MS);
    };

    try {
      recognition.start();
    } catch (err) {
      running = false;                      // start() khi đang chạy -> bỏ qua
    }
  }

  function startSTT() {
    if (!SR) {
      emit('stt:error', { message: NO_SR_MESSAGE, sticky: true });
      return;
    }
    if (wantListening) return;
    wantListening = true;
    setMicUi(true);
    emit('mic:toggle', { isListening: true });
    startEngine();
    startMeter();
  }

  function stopSTT() {
    wantListening = false;
    clearTimeout(restartTimer);
    if (recognition) {
      try { recognition.stop(); } catch (err) { /* chưa chạy thì thôi */ }
    }
    running = false;
    setMicUi(false);
    emit('mic:toggle', { isListening: false });
    renderInterim('');
    stopMeter();
  }

  // --------------------------------------------------------------- meter --
  // Web Speech API không cho lấy stream của nó -> phải xin một luồng mic riêng.
  async function startMeter() {
    if (audioCtx || !bars.length || !navigator.mediaDevices) return;
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      // Nếu recognition đã báo "bị chặn micro" và tự tắt rồi thì im lặng —
      // đừng đè mất thông báo quan trọng bằng một cảnh báo phụ.
      if (wantListening) {
        emit('stt:error', { message: 'Không đọc được mức âm thanh (mic bận). Phần chữ vẫn chạy bình thường.' });
      }
      return;
    }
    if (!wantListening) {                    // user tắt trong lúc chờ cấp quyền
      stream.getTracks().forEach((t) => t.stop());
      return;
    }

    micStream = stream;
    audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
    analyser  = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.75;
    audioCtx.createMediaStreamSource(micStream).connect(analyser);
    freqData = new Uint8Array(analyser.frequencyBinCount);
    timeData = new Uint8Array(analyser.fftSize);
    loop();
  }

  function loop() {
    rafId = requestAnimationFrame(loop);
    if (!analyser) return;

    analyser.getByteFrequencyData(freqData);
    for (let i = 0; i < bars.length; i++) {
      const from = BAND_EDGES[i];
      const to   = Math.min(BAND_EDGES[i + 1], freqData.length);
      let peak = 0;
      for (let j = from; j < to; j++) if (freqData[j] > peak) peak = freqData[j];
      const v = Math.min(1, (peak / 255) * 1.6);
      bars[i].style.height = (MIN + v * (100 - MIN)).toFixed(1) + '%';
    }

    // dBFS thật từ RMS miền thời gian — thay cho con số "-18 dB" cứng trong UI.
    if (micDb) {
      analyser.getByteTimeDomainData(timeData);
      let sum = 0;
      for (let i = 0; i < timeData.length; i++) {
        const s = (timeData[i] - 128) / 128;
        sum += s * s;
      }
      const rms = Math.sqrt(sum / timeData.length);
      const db  = rms > 0.0005 ? 20 * Math.log10(rms) : -60;
      micDb.textContent = Math.round(db) + ' dB • ' + (db > -12 ? 'To' : db > -40 ? 'Chuẩn' : 'Nhỏ');
    }
  }

  function stopMeter() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    if (micStream) micStream.getTracks().forEach((t) => t.stop());
    micStream = null;
    if (audioCtx) audioCtx.close().catch(() => {});
    audioCtx = null;
    analyser = null;
    bars.forEach((b) => { b.style.height = MIN + '%'; });
    if (micDb) micDb.textContent = '— dB • Chờ tín hiệu';
  }

  // ----------------------------------------------------------------- init --
  const NO_SR_MESSAGE =
    'Trình duyệt này không hỗ trợ nhận dạng giọng nói. Hãy mở bằng Chrome hoặc Edge. ' +
    'Trong lúc chờ, bật công tắc Demo ở góc phải.';

  function initSTT() {
    resetTranscript();

    // Gỡ h-* và animate-pulse mà UI dựng sẵn, nếu không Tailwind đè style.height.
    bars.forEach((b) => {
      b.className = b.className
        .split(/\s+/)
        .filter((c) => c && !/^h-/.test(c) && c !== 'animate-pulse')
        .join(' ');
      b.style.height = MIN + '%';
    });

    setMicUi(false);
    if (micDb) micDb.textContent = '— dB • Chờ tín hiệu';

    if (!SR) emit('stt:error', { message: NO_SR_MESSAGE, sticky: true });

    micBtn.addEventListener('click', () => {
      if (STATE.demoMode) return;
      if (wantListening) stopSTT(); else startSTT();
    });

    window.addEventListener('beforeunload', () => { wantListening = false; });
  }

  on('transcript:interim', (d) => renderInterim(d && d.text));
  on('transcript:final',   (d) => renderFinal(d && d.text));

  on('demo:toggle', (d) => {
    const isOn = !!(d && d.on);
    STATE.demoMode = isOn;
    if (isOn && wantListening) stopSTT();
    micBtn.disabled = isOn;
    micBtn.classList.toggle('opacity-40', isOn);
    micBtn.classList.toggle('cursor-not-allowed', isOn);
    resetTranscript();
  });

  initSTT();
})();
