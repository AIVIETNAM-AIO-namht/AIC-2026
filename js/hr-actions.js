// js/hr-actions.js — NGƯỜI C sở hữu. Hai nút "Thao tác nhanh" ở panel HR.
//
// DOM: #hr-repeat-btn, #hr-next-btn
// PHÁT:   'question:repeat' { question, keywords }   — HR muốn nhắc lại câu hỏi
//         'question:reset'  {}                       — HR chuyển sang câu mới
// NGHE:   'question:simple' — có câu hỏi rồi mới cho bấm "Lặp lại"
//         'demo:toggle'     — bật/tắt Demo thì về trạng thái chưa có câu hỏi
//
// File này KHÔNG chạm DOM của panel ứng viên. Nó chỉ phát sự kiện;
// simplify.js và voice.js tự dọn phần của mình.

(function () {
  const repeatBtn = document.getElementById('hr-repeat-btn');
  const nextBtn   = document.getElementById('hr-next-btn');
  if (!repeatBtn && !nextBtn) return;

  function setHasQuestion(has) {
    if (!repeatBtn) return;
    // Nút bấm được mà không xảy ra gì là kiểu hỏng khó chịu nhất.
    // Chưa có câu hỏi thì khoá hẳn, nhìn là biết chưa dùng được.
    repeatBtn.disabled = !has;
    repeatBtn.title = has ? 'Hiện lại câu hỏi cho ứng viên' : 'Chưa có câu hỏi nào để lặp lại';
  }

  function onRepeat() {
    if (!STATE.simple) return;
    emit('question:repeat', { question: STATE.simple, keywords: STATE.keywords });
  }

  function onNext() {
    emit('question:reset', {});
  }

  if (repeatBtn) repeatBtn.addEventListener('click', onRepeat);
  if (nextBtn) nextBtn.addEventListener('click', onNext);

  on('question:simple', () => setHasQuestion(true));
  on('question:reset', () => setHasQuestion(false));
  on('demo:toggle', () => setHasQuestion(false));

  setHasQuestion(false);
})();
