// js/ai.js — C sở hữu. Cửa duy nhất để gọi AI. Nạp sau config.js.
//
// askClaude(body) -> object đã parse, hoặc null nếu thất bại.
// Timeout 8s + 1 lần thử lại. Hết cách -> trả null, module gọi tự dùng câu mẫu.

async function askClaude(body, attempt = 0) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CONFIG.AI_TIMEOUT_MS);

  try {
    const r = await fetch(CONFIG.API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });

    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (err) {
    if (attempt < CONFIG.AI_RETRY) return askClaude(body, attempt + 1);
    emit('ai:error', { message: 'Không gọi được AI, đang dùng dữ liệu mẫu.' });
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Lấy input của tool_use đầu tiên. Trả null nếu model không gọi tool.
function readToolInput(response, toolName) {
  const block = response?.content?.find(
    (b) => b.type === 'tool_use' && b.name === toolName
  );
  return block?.input ?? null;
}

window.askClaude = askClaude;
window.readToolInput = readToolInput;
