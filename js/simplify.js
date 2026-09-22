// js/simplify.js — NGƯỜI A sở hữu. Tính năng 2: AI Plain-Language Simplifier.
//
// DOM: #simple-question, #word-count-badge, #keyword-chips, #latency-badge
// PHÁT:   'question:simple' { question, keywords, visual }
// NGHE:   'transcript:final' { text }
//
// Gọi AI qua askClaude() trong js/ai.js. KHÔNG tự fetch.
// Chập chờn mạng -> câu mẫu trong CONFIG.PROMPTS/fallback, KHÔNG để UI trống.

let debounceTimer = null;

function onFinalTranscript(text) {
  // TODO(A): debounce CONFIG.SIMPLIFY_DEBOUNCE_MS rồi gọi simplify(text)
}

async function simplify(text) {
  // TODO(A): askClaude({ model, max_tokens, system: CONFIG.PROMPTS.SIMPLIFY,
  //          messages: [{ role:'user', content: text }],
  //          tools: [<tool 'rut_gon_cau_hoi' với input_schema
  //                   { question: string, keywords: string[3], visual: enum 12 slug }>],
  //          tool_choice: { type:'tool', name:'rut_gon_cau_hoi' } })
  //          -> readToolInput(res, 'rut_gon_cau_hoi')
  //          -> null thì dùng câu mẫu
}

function renderSimple({ question, keywords, visual }) {
  // TODO(A): đổ #simple-question, badge "N / 12 từ",
  //          chip từ khóa vào #keyword-chips, emit('question:simple', ...)
}

function countWords(s) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

on('transcript:final', onFinalTranscript);
