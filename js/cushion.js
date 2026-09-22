// js/cushion.js — NGƯỜI B sở hữu. Tính năng 4: Delay Cushion.
//
// DOM: #cushion-btn, #cushion-countdown, #countdownCircle
// PHÁT:   'cushion:start' { seconds }
// NGHE:   không nghe ai. Ứng viên tự bấm.
//
// Phím Space kích hoạt — nhưng PHẢI bỏ qua khi con trỏ đang ở trong ô nhập,
// nếu không ứng viên gõ dấu cách là bị đọc "xin 3 giây" giữa câu.

(function () {
  const btn   = document.getElementById('cushion-btn');
  const label = document.getElementById('cushion-countdown');
  const ring  = document.getElementById('countdownCircle');
  if (!btn) return;

  const IDLE_TEXT = label ? label.textContent : '';
  const TOTAL_MS  = CONFIG.CUSHION_SECONDS * 1000;

  let counting  = false;
  let tickTimer = null;
  let idleTimer = null;

  function setRing(fraction) {
    if (!ring) return;
    const pct = Math.max(0, Math.min(1, fraction)) * 100;
    ring.setAttribute('stroke-dasharray', pct.toFixed(1) + ', 100');
  }

  function triggerCushion() {
    if (counting) return;          // bấm 5 lần liên tiếp -> chỉ chạy một lần
    counting = true;
    clearTimeout(idleTimer);
    btn.setAttribute('aria-disabled', 'true');

    emit('cushion:start', { seconds: CONFIG.CUSHION_SECONDS });
    speakCushionLine();

    const t0 = performance.now();
    setRing(1);
    if (label) label.textContent = 'Còn ' + CONFIG.CUSHION_SECONDS + ' giây';

    clearInterval(tickTimer);
    tickTimer = setInterval(() => {
      const left = Math.max(0, TOTAL_MS - (performance.now() - t0));
      setRing(left / TOTAL_MS);
      if (label) {
        label.textContent = left > 0 ? 'Còn ' + Math.ceil(left / 1000) + ' giây' : 'Sẵn sàng';
      }
      if (left <= 0) finish();
    }, 100);
  }

  function finish() {
    clearInterval(tickTimer);
    tickTimer = null;
    counting = false;
    setRing(1);
    btn.removeAttribute('aria-disabled');
    idleTimer = setTimeout(() => {
      if (!counting && label) label.textContent = IDLE_TEXT;
    }, 1500);
  }

  function speakCushionLine() {
    // speak() do voice.js đặt lên window. B sở hữu cả hai file nên gọi trực tiếp được.
    // Không có giọng tiếng Việt -> speak() trả false, đồng hồ vẫn chạy bình thường.
    if (typeof window.speak === 'function') window.speak(CONFIG.CUSHION_LINE);
  }

  function onKeydown(e) {
    if (e.code !== 'Space' && e.key !== ' ') return;
    if (e.repeat) return;

    const t = e.target;
    if (!t) return;
    const tag = String(t.tagName || '').toUpperCase();

    // Chốt quan trọng nhất của tính năng này: gõ dấu cách trong ô nhập
    // thì KHÔNG được kích hoạt, nếu không loa đọc "xin 3 giây" giữa câu.
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable) return;

    // Space trên nút/link là thao tác bấm chuẩn của trình duyệt — để yên,
    // nút #cushion-btn tự có handler click rồi.
    if (tag === 'BUTTON' || tag === 'A') return;

    e.preventDefault();
    triggerCushion();
  }

  function initCushion() {
    setRing(1);
    document.addEventListener('keydown', onKeydown);
    btn.addEventListener('click', triggerCushion);
  }

  initCushion();
})();
