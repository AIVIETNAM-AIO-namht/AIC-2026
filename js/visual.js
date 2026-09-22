// js/visual.js — NGƯỜI A sở hữu. Tính năng 3: Visual Anchor Engine.
//
// DOM: #visual-anchor, #visual-placeholder
// PHÁT:   không phát. Chỉ vẽ.
// NGHE:   'question:simple' { question, keywords, visual }
//
// KHÔNG sinh ảnh. Chọn 1 trong 12 slug ở CONFIG.VISUALS -> đổi src.
// Slug lạ -> CONFIG.VISUAL_FALLBACK. Ảnh lỗi -> quay về placeholder.

let showTimer = null;

function onSimpleQuestion({ visual }) {
  // TODO(A): clearTimeout cũ, hẹn CONFIG.VISUAL_DELAY_MS rồi showVisual(visual)
}

function showVisual(slug) {
  // TODO(A): tra CONFIG.VISUALS, set #visual-anchor.src = assets/visuals/<slug>.jpg,
  //          bỏ .hidden khỏi ảnh và thêm .hidden vào #visual-placeholder
}

function hideVisual() {
  // TODO(A): ẩn ảnh, hiện lại placeholder
}

on('question:simple', onSimpleQuestion);
