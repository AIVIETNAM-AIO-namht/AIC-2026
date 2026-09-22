// js/config.js — C sở hữu. Hằng số + prompt. Không chứa secret.
// Nạp TRƯỚC mọi file js khác.

window.CONFIG = {
  // --- Hạ tầng ---
  API: '/api/claude',          // proxy Vercel, key nằm ở server
  MODEL: 'claude-opus-5',
  AI_TIMEOUT_MS: 8000,         // quá hạn -> dùng câu mẫu, không treo UI
  AI_RETRY: 1,

  // --- Ngôn ngữ ---
  LANG: 'vi-VN',

  // --- Tính năng 1: Live Transcript ---
  STT_RESTART_MS: 300,         // Chrome tự ngắt mic sau ~60s im lặng -> onend -> start lại

  // --- Tính năng 2: Plain-Language ---
  SIMPLIFY_DEBOUNCE_MS: 800,   // đợi câu kết thúc rồi mới gọi AI
  MAX_WORDS: 12,
  KEYWORD_COUNT: 3,

  // --- Tính năng 3: Visual Anchor ---
  VISUAL_DELAY_MS: 5000,       // 4–6s sau khi câu hỏi hiện

  // --- Tính năng 4: Delay Cushion ---
  CUSHION_SECONDS: 3,
  CUSHION_LINE: 'Dạ em cảm ơn anh/chị, em xin 3 giây sắp xếp ý để trả lời ngay ạ',

  // --- Tính năng 5: Voice Proxy ---
  VOICE_RATE: 1.0,
  VOICE_PITCH: 1.0,

  // --- Kho ảnh minh họa (KHÔNG sinh ảnh: chọn nhãn -> map ra file) ---
  // Thả 12 file .jpg vào assets/visuals/ đúng tên dưới đây.
  VISUALS: [
    { slug: 'kho-bai',      label: 'Kho bãi' },
    { slug: 'giao-hang',    label: 'Giao hàng' },
    { slug: 'kiem-ke',      label: 'Kiểm kê' },
    { slug: 'nhap-lieu',    label: 'Nhập liệu' },
    { slug: 'sua-loi',      label: 'Sửa lỗi' },
    { slug: 'xu-ly-su-co',  label: 'Xử lý sự cố' },
    { slug: 'hop-nhom',     label: 'Họp nhóm' },
    { slug: 'bao-cao',      label: 'Báo cáo' },
    { slug: 'ca-dem',       label: 'Ca đêm' },
    { slug: 'an-toan',      label: 'An toàn' },
    { slug: 'khach-hang',   label: 'Khách hàng' },
    { slug: 'dao-tao',      label: 'Đào tạo' },
  ],
  VISUAL_FALLBACK: 'hop-nhom',

  // --- Prompt ---
  PROMPTS: {
    SIMPLIFY:
      'Bạn rút gọn câu hỏi phỏng vấn tiếng Việt cho ứng viên Điếc.\n' +
      'Quy tắc:\n' +
      '- 1 câu duy nhất, dưới 12 từ, cấu trúc [Tình huống] + [Bạn làm gì?]\n' +
      '- Bỏ từ sáo rỗng, bỏ kính ngữ, bỏ mệnh đề phụ\n' +
      '- Giữ nguyên ý chính, không bịa thêm\n' +
      '- Trích đúng 3 từ khóa hành động, mỗi từ 1–3 tiếng\n' +
      '- Chọn 1 nhãn ngữ cảnh phù hợp nhất cho hình minh họa',

    COMPOSE:
      'Bạn ghép các ý chính ứng viên gõ thành 1 câu trả lời phỏng vấn tiếng Việt.\n' +
      'Quy tắc:\n' +
      '- Giọng công sở, lịch sự, tự nhiên khi đọc to\n' +
      '- Tự xưng "em", gọi người phỏng vấn là "anh/chị"\n' +
      '- 2–3 câu, nêu hành động cụ thể theo thứ tự ưu tiên\n' +
      '- Chỉ dùng thông tin ứng viên đã gõ, không thêm dữ kiện mới\n' +
      '- Không mở bài dài dòng, vào thẳng nội dung',
  },
};
