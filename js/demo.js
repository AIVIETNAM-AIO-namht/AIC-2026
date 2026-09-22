// js/demo.js — NGƯỜI C sở hữu. Công tắc "Chế độ Demo" ở header.
//
// Lý do tồn tại: micro hỏng, phòng ồn, giám khảo muốn xem nhanh.
// Bật -> phát lại một kịch bản mẫu qua đúng BUS, không cần mic.
// Các module khác KHÔNG biết gì về file này.

const DEMO_SCRIPT = [
  { transcript: 'Chào em, anh thấy em có kinh nghiệm hai năm ở kho vận. Vậy theo em, khi đơn hàng gấp mà ca của em thiếu người thì em sẽ xử lý như thế nào?',
    simple: 'Thiếu người, đơn gấp. Bạn làm gì?',
    keywords: ['thiếu người', 'xử lý gấp', 'báo cáo'],
    visual: 'xu-ly-su-co' },
];

let demoTimers = [];

function runDemo() {
  // TODO(C): duyệt DEMO_SCRIPT, emit('transcript:final') -> để simplify.js tự chạy.
  //          Chỉ dùng timer cho nhịp, KHÔNG hardcode kết quả AI.
}

function stopDemo() {
  // TODO(C): clear hết demoTimers, emit('transcript:final', { text: '' })
}

function initDemo() {
  // TODO(C): #demo-toggle change -> runDemo() / stopDemo()
}

initDemo();
