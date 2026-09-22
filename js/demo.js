// js/demo.js — NGƯỜI C sở hữu. Công tắc "Chế độ Demo" ở header.
//
// Lý do tồn tại: micro hỏng, phòng ồn, giám khảo muốn xem nhanh.
// Bật -> phát lại một kịch bản mẫu qua đúng BUS, không cần mic.
// Các module khác KHÔNG biết gì về file này.
//
// LUẬT: chỉ emit 'transcript:interim' / 'transcript:final'.
// KHÔNG hardcode kết quả AI — simplify.js vẫn phải tự gọi model như thật.

(function () {
  const toggle = document.getElementById('demo-toggle');
  if (!toggle) return;

  // Câu hỏi HR thật, dài như ngoài đời, để thấy rõ mức rút gọn.
  const DEMO_SCRIPT = [
    'Chào em, anh thấy em có kinh nghiệm hai năm ở kho vận. Vậy theo em, khi đơn hàng gấp mà ca của em thiếu người thì em sẽ xử lý như thế nào?',
    'Một câu nữa nhé, trong quá trình kiểm kê hàng hóa cuối ca mà em phát hiện số liệu trên phần mềm lệch so với hàng thực tế trong kho thì em làm gì trước tiên?',
    'Câu cuối, nếu khách hàng gọi điện phàn nàn rằng đơn hàng của họ bị giao chậm hai ngày liền, em sẽ nói gì với khách và báo lại cho ai?',
  ];

  const TYPE_MS = 70;      // nhịp gõ từng từ, cho giống người đang nói
  const GAP_MS  = 10000;   // đủ cho debounce 0.8s + AI + ảnh hiện ở giây thứ 5

  let timers  = [];
  let running = false;

  function schedule(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function runDemo() {
    running = true;
    let at = 700;

    DEMO_SCRIPT.forEach((line) => {
      const words = line.split(/\s+/);
      words.forEach((_, i) => {
        const partial = words.slice(0, i + 1).join(' ');
        schedule(() => emit('transcript:interim', { text: partial }), at + i * TYPE_MS);
      });
      at += words.length * TYPE_MS + 250;
      schedule(() => emit('transcript:final', { text: line }), at);
      at += GAP_MS;
    });

    schedule(() => {
      if (running) emit('transcript:interim', { text: '' });
    }, at);
  }

  function stopDemo() {
    running = false;
    timers.forEach(clearTimeout);
    timers = [];
  }

  function setToggle(on) {
    toggle.setAttribute('aria-pressed', String(on));
    toggle.setAttribute('aria-label', on ? 'Tắt chế độ Demo' : 'Bật chế độ Demo');
    toggle.classList.toggle('bg-surface-container', !on);
    toggle.classList.toggle('bg-tertiary', on);
    toggle.classList.toggle('text-on-tertiary', on);

    const icon = toggle.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = on ? 'stop_circle' : 'play_circle';

    // Phát TRƯỚC khi chạy kịch bản: stt.js nghe được thì mới kịp tắt mic
    // và xoá bảng transcript trước khi chữ demo đổ vào.
    emit('demo:toggle', { on });

    if (on) runDemo(); else stopDemo();
  }

  function initDemo() {
    toggle.addEventListener('click', () => {
      setToggle(toggle.getAttribute('aria-pressed') !== 'true');
    });
    window.addEventListener('beforeunload', stopDemo);
  }

  initDemo();
})();
