// api/claude.js — C sở hữu. Vercel serverless. KEY KHÔNG RỜI SERVER.
// Repo này là public: key lọt xuống browser là phải thu hồi ngay.
//
// Chạy local:  npx vercel dev   (không mở interview.html bằng file:// rồi gọi AI)
// Env:         ANTHROPIC_API_KEY   (Vercel → Settings → Environment Variables)
//
// ponytail: không có auth/rate-limit. Thêm khi có tên miền thật —
//           lúc đó dùng Vercel KV đếm theo IP, hoặc bật Vercel Authentication.

const ALLOWED_MODELS = ['claude-opus-5'];
const MAX_BODY_BYTES = 200_000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    // Không lộ chi tiết nội bộ ra ngoài.
    console.error('ANTHROPIC_API_KEY is not set');
    return res.status(500).json({ error: 'server_misconfigured' });
  }

  const body = req.body || {};
  if (!ALLOWED_MODELS.includes(body.model)) {
    return res.status(400).json({ error: 'model_not_allowed' });
  }
  if (JSON.stringify(body).length > MAX_BODY_BYTES) {
    return res.status(413).json({ error: 'payload_too_large' });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    // Chuyển nguyên status + JSON, không kèm header nội bộ.
    return res.status(r.status).json(await r.json());
  } catch (err) {
    console.error('upstream_failed', err);
    return res.status(502).json({ error: 'upstream_failed' });
  }
}
