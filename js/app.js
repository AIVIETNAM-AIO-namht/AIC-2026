// js/app.js — C sở hữu. HỢP ĐỒNG DÙNG CHUNG. Nạp SAU config.js.
//
// Luật: KHÔNG module nào gọi hàm của module khác.
// Mọi giao tiếp đi qua BUS. Muốn thêm sự kiện -> báo C.

window.BUS = new EventTarget();

window.STATE = {
  transcript: '',   // HR vừa nói (verbatim)
  simple:     '',   // câu đã rút gọn
  keywords:   [],   // 3 từ khóa
  reply:      '',   // câu AI ghép hộ
  isListening: false,
  demoMode:    false,
};

function emit(type, detail) {
  BUS.dispatchEvent(new CustomEvent(type, { detail }));
}

function on(type, handler) {
  BUS.addEventListener(type, (e) => handler(e.detail));
}

// Sự kiện đã chốt — không tự thêm:
//   'transcript:interim' { text }              A phát, A vẽ
//   'transcript:final'   { text }              A phát, A vẽ + B/simplify nghe
//   'question:simple'    { question, keywords }   A phát
//   'question:repeat'    { question, keywords }   C phát — HR bấm "Lặp lại câu hỏi",
//                                                 A nháy lại câu đang hiện, KHÔNG gọi AI
//   'question:reset'     {}                    C phát — HR bấm "Câu tiếp theo",
//                                                 A xoá bảng câu hỏi, B xoá ô trả lời
//   'cushion:start'      { seconds }           B phát
//   'reply:ready'        { text }              B phát
//   'demo:toggle'        { on }                C phát — demo bật thì A phải tắt mic
//
// Trạng thái phụ (ai cũng nghe được):
//   'stt:error'   { message, sticky? }
//   'ai:error'    { message }
//   'mic:toggle'  { isListening }

window.emit = emit;
window.on = on;

// --- Băng thông báo dùng chung -------------------------------------------
// Dòng 06 của bảng nghiệm thu: "mọi lỗi đều có thông báo nhìn thấy được".
// Chỉ MỘT chỗ được vẽ #browser-warning, nếu không hai module sẽ ghi đè nhau.
(function initNotice() {
  const el = document.getElementById('browser-warning');
  if (!el) return;

  const DEFAULT_TEXT = el.textContent.trim();
  let hideTimer  = null;
  let stickyText = '';     // thông báo cần người dùng ra tay, không được mất

  function show(message, sticky) {
    if (!message) return;
    clearTimeout(hideTimer);

    if (sticky) stickyText = message;

    el.textContent = message;
    el.classList.remove('hidden');

    if (sticky) return;

    // Cảnh báo thoáng qua chỉ được mượn chỗ 6 giây, sau đó phải trả lại
    // thông báo sticky — nếu không "mic đang bị chặn" biến mất vì một lỗi vặt.
    hideTimer = setTimeout(() => {
      if (stickyText) { el.textContent = stickyText; return; }
      hide();
    }, 6000);
  }

  function hide() {
    stickyText = '';
    el.classList.add('hidden');
    el.textContent = DEFAULT_TEXT;
  }

  // Mic bật lại được = vấn đề đã được xử lý xong.
  on('mic:toggle', (d) => { if (d && d.isListening) hide(); });

  on('stt:error', (d) => show(d && d.message, d && d.sticky));
  on('ai:error', (d) => show(d && d.message, false));
})();

// --- Đồng hồ phiên --------------------------------------------------------
// Ô giờ trong khung transcript là số thật, không phải ảnh chụp màn hình.
(function initClock() {
  const el = document.getElementById('transcript-clock');
  if (!el) return;
  const tick = () => {
    el.textContent = new Date().toLocaleTimeString('vi-VN', { hour12: false });
  };
  tick();
  setInterval(tick, 1000);
})();

// --- Tên ứng viên từ trang Setup -----------------------------------------
// index.html lưu sessionStorage rồi chuyển trang. Không có thì bỏ qua, không lỗi.
(function initSession() {
  let data = null;
  try {
    data = JSON.parse(sessionStorage.getItem('ei.session') || 'null');
  } catch (err) {
    data = null;
  }
  window.SESSION = data || {};
  const el = document.getElementById('candidate-name');
  if (el && window.SESSION.name) el.textContent = window.SESSION.name;
})();
