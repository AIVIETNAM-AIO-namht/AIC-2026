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
  visualSlug: '',   // nhãn ảnh minh họa đang hiện
  isListening: false,
};

function emit(type, detail) {
  BUS.dispatchEvent(new CustomEvent(type, { detail }));
}

function on(type, handler) {
  BUS.addEventListener(type, (e) => handler(e.detail));
}

// Sự kiện đã chốt — không tự thêm:
//   'transcript:interim' { text }              A phát
//   'transcript:final'   { text }              A phát
//   'question:simple'    { question, keywords, visual }   A phát
//   'cushion:start'      { seconds }           B phát
//   'reply:ready'        { text }              B phát
//
// Trạng thái phụ (ai cũng nghe được):
//   'stt:error'   { message }
//   'ai:error'    { message }
//   'mic:toggle'  { isListening }

window.emit = emit;
window.on = on;
