// js/cushion.js — NGƯỜI B sở hữu. Tính năng 4: Delay Cushion.
//
// DOM: #cushion-btn, #cushion-countdown
// PHÁT:   'cushion:start' { seconds }
// NGHE:   không nghe ai. Ứng viên tự bấm.
//
// Phím Space kích hoạt — nhưng PHẢI bỏ qua khi con trỏ đang ở trong ô nhập,
// nếu không ứng viên gõ dấu cách là bị đọc "xin 3 giây" giữa câu.

let counting = false;

function triggerCushion() {
  // TODO(B): đang đếm thì bỏ qua; emit('cushion:start', { seconds: CONFIG.CUSHION_SECONDS })
  //          rồi đếm ngược hiển thị ở #cushion-countdown
}

function speakCushionLine() {
  // TODO(B): đọc CONFIG.CUSHION_LINE. Dùng chung speak() của voice.js —
  //          B sở hữu cả hai file nên gọi trực tiếp được.
}

function onKeydown(e) {
  // TODO(B): e.code === 'Space' && target không phải INPUT/TEXTAREA -> preventDefault + trigger
}

function initCushion() {
  // TODO(B): gắn keydown ở document + click ở #cushion-btn
}

initCushion();
