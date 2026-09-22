// js/voice.js — NGƯỜI B sở hữu. Tính năng 5: AI Response Assistant & Voice Proxy.
//
// DOM: #reply-input, #voice-proxy-btn, #voice-status
// PHÁT:   'reply:ready' { text }
// NGHE:   không nghe ai. Ứng viên tự bấm.
//
// Bẫy đã biết: speechSynthesis.getVoices() trả MẢNG RỖNG ở lần gọi đầu.
// Phải đợi sự kiện 'voiceschanged' rồi mới chọn giọng vi-VN.

let voices = [];

function pickVoice() {
  // TODO(B): voices.find(v => v.lang.startsWith('vi')) — Windows: "Microsoft An"
}

function speak(text) {
  // TODO(B): speechSynthesis.cancel() trước, rồi utter với
  //          CONFIG.VOICE_RATE / CONFIG.VOICE_PITCH
}

async function composeReply(rawInput) {
  // TODO(B): askClaude({ model, max_tokens, system: CONFIG.PROMPTS.COMPOSE,
  //          messages: [{ role:'user', content: rawInput }],
  //          tools: [<tool 'ghep_cau_tra_loi' input_schema { reply: string }>],
  //          tool_choice: { type:'tool', name:'ghep_cau_tra_loi' } })
  //          -> readToolInput(...)?.reply ?? null
  //          null -> đọc nguyên văn những gì ứng viên gõ, KHÔNG im lặng
}

function setStatus(msg) {
  // TODO(B): #voice-status
}

function initVoice() {
  // TODO(B): speechSynthesis.onvoiceschanged -> pickVoice()
  //          #voice-proxy-btn click -> validate input rỗng -> composeReply -> speak
  //          đang đọc thì nút chuyển thành "Dừng" và bấm lần nữa là huỷ
}

initVoice();
