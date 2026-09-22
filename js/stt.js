// js/stt.js — NGƯỜI A sở hữu. Tính năng 1: Live Transcript.
//
// DOM: #mic-btn, #mic-label, #mic-level, #transcript-stream, #browser-warning
// PHÁT:   'transcript:interim' { text }   — đang nói, hiện mờ
//         'transcript:final'   { text }   — đã chốt câu, đẩy sang simplify
//         'mic:toggle'         { isListening }
//         'stt:error'          { message }
// NGHE:   không nghe ai. Module này là đầu vào của cả hệ thống.
//
// Bẫy đã biết: Chrome tự ngắt recognition sau ~60s im lặng.
// onend -> start lại SAU CONFIG.STT_RESTART_MS, nhưng phải có cờ
// isListening để không restart vô hạn khi user đã tắt mic.

let recognition = null;

function startSTT() {
  // TODO(A): new webkitSpeechRecognition(), lang = CONFIG.LANG,
  //          interimResults = true, continuous = true
}

function stopSTT() {
  // TODO(A): dừng và set cờ để onend không tự bật lại
}

function renderInterim(text) {
  // TODO(A): ghi text mờ vào #transcript-stream, cập nhật STATE.transcript
}

function renderFinal(text) {
  // TODO(A): chốt dòng, cuộn xuống cuối, emit('transcript:final', { text })
}

function renderMicLevel(level) {
  // TODO(A): level 0..1 -> 12 vạch trong #mic-level đổi height
}

function initSTT() {
  // TODO(A): gắn sự kiện #mic-btn, ẩn/hiện #browser-warning
}

initSTT();
