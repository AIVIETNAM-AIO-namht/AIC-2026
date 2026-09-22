// js/ai.js — C sở hữu. Cửa duy nhất để gọi AI. Nạp sau config.js.
//
// askClaude(body, opts) -> object đã parse, hoặc null nếu thất bại.
// Timeout 8s + 1 lần thử lại. Hết cách -> trả null, module gọi tự dùng câu mẫu.
//
// opts.signal: AbortSignal của người gọi. Huỷ bằng signal thì trả null IM LẶNG
//              (không phát 'ai:error') — vì đó là chủ ý, không phải sự cố.

async function askClaude(body, opts = {}) {
  const external = opts.signal || null;

  for (let attempt = 0; attempt <= CONFIG.AI_RETRY; attempt++) {
    if (external && external.aborted) return null;

    const ctrl = new AbortController();
    const relay = () => ctrl.abort();
    if (external) external.addEventListener('abort', relay);
    const timer = setTimeout(() => ctrl.abort(), CONFIG.AI_TIMEOUT_MS);

    try {
      const r = await fetch(CONFIG.API, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });

      if (r.ok) return await r.json();

      // Lỗi có mã rõ ràng thì báo đúng bệnh, và đừng thử lại nếu thử lại
      // cũng vô ích (thiếu key thì gọi 10 lần vẫn thiếu key).
      const fault = await describe(r);
      if (!fault.retryable || attempt >= CONFIG.AI_RETRY) {
        emit('ai:error', { message: fault.message });
        return null;
      }
    } catch (err) {
      if (external && external.aborted) return null;   // người gọi huỷ, không phải lỗi
      if (attempt >= CONFIG.AI_RETRY) {
        emit('ai:error', { message: CONFIG.AI_ERRORS.OFFLINE });
        return null;
      }
    } finally {
      clearTimeout(timer);
      if (external) external.removeEventListener('abort', relay);
    }
  }

  return null;
}

// Dịch một response lỗi thành: nói gì với người dùng, và có đáng thử lại không.
// Hai nguồn lỗi có dạng khác nhau:
//   proxy của mình  -> { error: "server_misconfigured" }        (chuỗi)
//   Anthropic       -> { error: { type: "authentication_error" } } (object)
async function describe(r) {
  const E = CONFIG.AI_ERRORS;
  let code = '';

  try {
    const data = await r.json();
    const err = data && data.error;
    code = typeof err === 'string' ? err : (err && err.type) || '';
  } catch (parseErr) {
    code = '';                                   // body không phải JSON
  }

  if (code === 'server_misconfigured') return { retryable: false, message: E.NO_KEY };
  if (code === 'authentication_error' || r.status === 401)
    return { retryable: false, message: E.BAD_KEY };
  if (code === 'permission_error' || r.status === 403)
    return { retryable: false, message: E.NO_CREDIT };
  if (r.status === 429) return { retryable: true, message: E.RATE };
  if (r.status >= 400 && r.status < 500)
    return { retryable: false, message: E.BAD_REQ };

  return { retryable: true, message: E.OFFLINE };  // 5xx, 529 overloaded…
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
