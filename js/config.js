// js/config.js — C sở hữu. Hằng số + prompt. Không chứa secret.
// Nạp TRƯỚC mọi file js khác.

window.CONFIG = {
  // --- Hạ tầng ---
  API: '/api/claude',          // proxy Vercel, key nằm ở server
  MODEL: 'claude-opus-5',
  AI_TIMEOUT_MS: 8000,         // quá hạn -> dùng câu mẫu, không treo UI
  AI_RETRY: 1,

  // Thông báo lỗi AI — phải nói ĐÚNG thiếu cái gì, không nói chung chung.
  // "Không gọi được AI" khiến người ta đi dò mạng trong khi thật ra chưa cắm key.
  AI_ERRORS: {
    NO_KEY:   'Chưa cắm ANTHROPIC_API_KEY. Tạo file .env từ .env.example rồi khởi động lại server. Trong lúc đó AI dùng bản rút gọn tại chỗ.',
    BAD_KEY:  'API key không hợp lệ hoặc đã bị thu hồi. Kiểm tra lại .env tại console.anthropic.com.',
    NO_CREDIT:'Tài khoản Anthropic hết credit hoặc chưa bật billing.',
    RATE:     'Gọi AI quá nhanh, đang bị giới hạn tốc độ. Chờ vài giây rồi hỏi lại.',
    BAD_REQ:  'Yêu cầu gửi lên không hợp lệ (sai model hoặc sai định dạng). Xem console server.',
    OFFLINE:  'Không gọi được AI (mất mạng hoặc server chưa chạy). Đang dùng bản rút gọn tại chỗ.',
  },

  // --- Ngôn ngữ ---
  LANG: 'vi-VN',

  // --- Tính năng 1: Live Transcript ---
  STT_RESTART_MS: 300,         // Chrome tự ngắt mic sau ~60s im lặng -> onend -> start lại
  MIC_BAR_MIN: 8,              // % chiều cao vạch khi im lặng

  // --- Tính năng 2: Plain-Language ---
  SIMPLIFY_DEBOUNCE_MS: 800,   // đợi câu kết thúc rồi mới gọi AI
  // AI chưa trả lời sau ngần này -> hiện tạm bản rút gọn tại chỗ, có AI thì thay sau.
  // Không có mốc này thì lúc rớt mạng màn hình ứng viên đứng im 16 giây
  // (8s timeout x 2 lần) — đúng cái mà bảng nghiệm thu cấm.
  SIMPLIFY_PROVISIONAL_MS: 2500,
  MAX_WORDS: 12,
  KEYWORD_COUNT: 3,
  MIN_WORDS_TO_SIMPLIFY: 4,    // "dạ vâng", "ừ" -> bỏ qua, không tốn lượt gọi AI


  // --- Tính năng 4: Delay Cushion ---
  CUSHION_SECONDS: 3,
  CUSHION_LINE: 'Dạ em cảm ơn anh/chị, em xin 3 giây sắp xếp ý để trả lời ngay ạ',

  // --- Tính năng 5: Voice Proxy ---
  VOICE_RATE: 1.0,
  VOICE_PITCH: 1.0,
  // Thứ tự ưu tiên chọn giọng, so khớp theo tên (không phân biệt hoa thường).
  // HoaiMy / NamMinh  = giọng neural vi-VN của Azure, Edge lộ sẵn qua Web Speech API.
  // Google            = "Google Tiếng Việt" trên Chrome desktop.
  // Hết cả hai        -> bất kỳ giọng vi-VN nào (Windows: "Microsoft An").
  VOICE_PREFER: ['HoaiMy', 'NamMinh', 'Google'],
  VOICE_CHUNK_CHARS: 140,      // Chrome cắt ngang utterance dài -> chia nhỏ theo câu


  // Từ nối / kính ngữ — loại khi phải tự rút gọn lúc mất mạng.
  STOPWORDS: [
    'thì', 'là', 'mà', 'và', 'của', 'cho', 'với', 'khi', 'nếu', 'để', 'được',
    'các', 'những', 'một', 'này', 'đó', 'rất', 'nhé', 'ạ', 'dạ', 'vâng', 'em',
    'anh', 'chị', 'bạn', 'mình', 'tôi', 'có', 'không', 'sẽ', 'đã', 'đang',
    'trong', 'ngoài', 'về', 'theo', 'như', 'thế', 'nào', 'gì', 'sao', 'vậy',
    'thường', 'hay', 'nhưng', 'hoặc', 'bị', 'làm', 'ra', 'lên', 'xuống', 'đi',
  ],

  // --- Prompt ---
  PROMPTS: {
    SIMPLIFY:
      'Bạn rút gọn câu hỏi phỏng vấn tiếng Việt cho ứng viên Điếc.\n' +
      'Quy tắc:\n' +
      '- 1 câu duy nhất, dưới 12 từ, cấu trúc [Tình huống] + [Bạn làm gì?]\n' +
      '- Bỏ từ sáo rỗng, bỏ kính ngữ, bỏ mệnh đề phụ\n' +
      '- Giữ nguyên ý chính, không bịa thêm\n' +
      '- Trích đúng 3 từ khóa hành động, mỗi từ 1–3 tiếng',

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
