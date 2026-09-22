# -*- coding: utf-8 -*-
"""
dev-server.py — chạy EasyInterview trên máy mình mà KHÔNG cần cài Node.

Làm đúng hai việc của `npx vercel dev`:
  1. phục vụ file tĩnh (index.html, interview.html, js/, assets/)
  2. nhận POST /api/claude rồi chuyển tiếp sang api.anthropic.com

Key đọc từ .env và KHÔNG BAO GIỜ đi xuống browser — giống hệt api/claude.js.
File này chỉ dùng để demo tại chỗ; bản deploy thật vẫn là api/claude.js trên Vercel.

    python dev-server.py            # http://localhost:3000
    python dev-server.py 8080       # đổi cổng

Chỉ dùng thư viện chuẩn, không cần pip install.
"""

import json
import os
import sys
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

# Console Windows mặc định là cp1252, in tiếng Việt ra là crash ngay lúc khởi động.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = os.path.dirname(os.path.abspath(__file__))
ALLOWED_MODELS = {"claude-opus-5"}
MAX_BODY_BYTES = 200_000
UPSTREAM = "https://api.anthropic.com/v1/messages"
TIMEOUT_S = 30


def load_api_key():
    """Ưu tiên biến môi trường, không có thì đọc .env cạnh file này."""
    key = os.environ.get("ANTHROPIC_API_KEY")
    if key:
        return key.strip()

    path = os.path.join(ROOT, ".env")
    if not os.path.exists(path):
        return None

    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            name, _, value = line.partition("=")
            if name.strip() == "ANTHROPIC_API_KEY":
                return value.strip().strip("'\"")
    return None


API_KEY = load_api_key()


def current_key():
    """Chưa có key thì thử đọc lại .env mỗi lần gọi — tạo .env xong là chạy ngay,
    không phải nhớ restart server. Có key rồi thì không đọc đĩa nữa."""
    global API_KEY
    if not API_KEY:
        API_KEY = load_api_key()
        if API_KEY:
            print(">> Đã nạp ANTHROPIC_API_KEY từ .env")
    return API_KEY


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    # --------------------------------------------------------------- tiện --
    def send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        # Không cache js/ trong lúc dev, nếu không sửa code xong F5 vẫn chạy bản cũ.
        if self.path.endswith((".js", ".html", ".css")):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    # --------------------------------------------------------------- proxy --
    def do_POST(self):
        # Phải đọc hết body TRƯỚC khi trả lời, kể cả khi sắp từ chối. Bỏ dở body
        # là socket còn rác, request kế tiếp đứt giữa chừng và browser báo
        # ERR_EMPTY_RESPONSE — nhìn như mạng hỏng chứ không ra lỗi thật.
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            length = 0

        if length > MAX_BODY_BYTES:
            self.rfile.read(min(length, MAX_BODY_BYTES))
            return self.send_json(413, {"error": "payload_too_large"})

        raw = self.rfile.read(length) if length > 0 else b""

        if self.path.rstrip("/") != "/api/claude":
            return self.send_json(404, {"error": "not_found"})

        key = current_key()
        if not key:
            print("!! ANTHROPIC_API_KEY chưa có. Tạo .env từ .env.example (không cần restart).")
            return self.send_json(500, {"error": "server_misconfigured"})

        try:
            body = json.loads(raw.decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            return self.send_json(400, {"error": "bad_json"})

        if body.get("model") not in ALLOWED_MODELS:
            return self.send_json(400, {"error": "model_not_allowed"})

        req = urllib.request.Request(
            UPSTREAM,
            data=raw,
            method="POST",
            headers={
                "content-type": "application/json",
                "x-api-key": key,
                "anthropic-version": "2023-06-01",
            },
        )

        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT_S) as r:
                self.send_json(r.status, json.loads(r.read().decode("utf-8")))
        except urllib.error.HTTPError as e:
            # Chuyển nguyên status + JSON của Anthropic để browser đọc được lỗi thật.
            detail = e.read().decode("utf-8", "replace")
            try:
                self.send_json(e.code, json.loads(detail))
            except ValueError:
                self.send_json(e.code, {"error": "upstream_error"})
            print("!! upstream %s: %s" % (e.code, detail[:300]))
        except Exception as err:                       # mạng chết, DNS hỏng...
            print("!! upstream_failed: %r" % (err,))
            self.send_json(502, {"error": "upstream_failed"})

    def log_message(self, fmt, *args):
        # Cẩn thận: log_error() truyền args khác log_request(), nên tuyệt đối
        # không int(args[...]) ở đây — ném exception là chết cả thread đang phục
        # vụ request, browser nhận ERR_EMPTY_RESPONSE mà không hiểu vì sao.
        try:
            line = fmt % args
        except Exception:
            line = " ".join(str(a) for a in args)

        # File tĩnh trả về bình thường thì im lặng, còn lại in hết.
        if "/api/claude" not in self.path and (" 200 " in line or " 304 " in line):
            return

        sys.stderr.write("%s  %s\n" % (self.log_date_time_string(), line))


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    print("EasyInterview dev server  ->  http://localhost:%d" % port)
    if API_KEY:
        print("ANTHROPIC_API_KEY: đã nạp")
    else:
        print("ANTHROPIC_API_KEY: CHƯA CÓ -> AI sẽ dùng bản rút gọn tại chỗ.")
        print("                   Tạo .env từ .env.example là chạy ngay, không cần restart.")
    print("Mở bằng Chrome hoặc Edge. Ctrl+C để dừng.\n")
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()


if __name__ == "__main__":
    main()
