# EasyInterview

Trợ lý phỏng vấn cho ứng viên Điếc / khiếm thính (DHH).

> Tính năng **Visual Anchor** (ảnh minh họa ngữ cảnh) trong outline đã bị nhóm bỏ.
> Sản phẩm còn 4 tính năng: Live Transcript, Plain-Language, Delay Cushion, Voice Proxy.

Kế hoạch chia việc chi tiết: mở `plan-mvp.html` bằng trình duyệt.

## Chạy máy mình

Cắm key một lần:

```bash
cp .env.example .env     # rồi dán ANTHROPIC_API_KEY vào
```

### Cách 1 — Python, không cần cài gì (dùng cho demo tại chỗ)

```bash
python dev-server.py
```

Mở http://localhost:3000 bằng **Chrome hoặc Edge**.

`dev-server.py` vừa phục vụ file tĩnh vừa làm proxy `/api/claude` y như
`api/claude.js`: key đọc từ `.env`, không bao giờ đi xuống browser. Nó chỉ nghe
trên `127.0.0.1` nên máy khác trong mạng không vào được — đúng cho demo một máy.

### Cách 2 — Node, giống hệt môi trường deploy

Cần **Node.js 18+** (kiểm tra `node -v`, chưa có thì tải ở https://nodejs.org).

```bash
npx vercel dev
```

Dùng cách này khi muốn kiểm chứng `api/claude.js` và `vercel.json` trước khi deploy.

> **Không mở bằng `file://`.** Proxy `/api/claude` và `getUserMedia` đều không chạy
> qua giao thức file: mic sẽ im và AI sẽ luôn rơi về câu mẫu.

> **Vẫn cần Internet dù chạy local.** Web Speech API gửi âm thanh lên server của
> Google/Microsoft để nhận dạng, và giọng đọc "Online (Natural)" cũng tải về qua mạng.
> Không có mạng thì STT và giọng đọc đều ngừng; phần rút gọn câu hỏi rơi về bản tại chỗ.

## Kiến trúc

Không framework, không build step. Ba lớp:

| Lớp | File | Việc |
|---|---|---|
| Hằng số | `js/config.js` | Prompt, timeout, thông báo lỗi. Sửa hành vi thì sửa ở đây. |
| Hợp đồng | `js/app.js` | `BUS` (EventTarget) + `STATE` + băng thông báo lỗi dùng chung. |
| Cổng AI | `js/ai.js` | `askClaude()` — timeout 8s, 1 lần thử lại, hỏng thì trả `null`. |
| Proxy | `api/claude.js` | Bản deploy (Vercel). Giữ key, chỉ cho model trong danh sách trắng. |
| Proxy | `dev-server.py` | Bản chạy local, làm đúng việc như trên nhưng không cần Node. |

Bốn tính năng, mỗi tính năng một file, **không file nào gọi hàm của file khác** —
tất cả đi qua `BUS`:

| File | Tính năng | Phát | Nghe |
|---|---|---|---|
| `js/stt.js` | Live Transcript | `transcript:interim/final`, `mic:toggle`, `stt:error` | `transcript:*`, `demo:toggle` |
| `js/simplify.js` | Rút gọn câu hỏi | `question:simple` | `transcript:final`, `demo:toggle` |
| `js/cushion.js` | Khoảng đệm 3 giây | `cushion:start` | — |
| `js/voice.js` | Ghép câu + đọc to | `reply:ready` | — |
| `js/hr-actions.js` | 2 nút thao tác nhanh của HR | `question:repeat`, `question:reset` | `question:simple`, `demo:toggle` |
| `js/demo.js` | Công tắc Demo | `demo:toggle`, `transcript:*` | — |

Thêm sự kiện mới thì phải ghi vào danh sách trong `js/app.js`, nếu không
sẽ có người phát ra tên mà không ai nghe.

## Giọng đọc tiếng Việt — đọc trước khi demo

Text-to-speech dùng **Web Speech API** của trình duyệt: không cần API key,
không tốn tiền, không có độ trễ mạng. Nhưng giọng nằm ở **máy/trình duyệt**,
không nằm trong repo — nên phải thử trên đúng máy sẽ demo.

Thứ tự ưu tiên trong `CONFIG.VOICE_PREFER`:

1. `Microsoft HoaiMy Online (Natural)` / `NamMinh` — giọng neural vi-VN của
   Azure, **Microsoft Edge lộ sẵn miễn phí**. Hay nhất trong các lựa chọn.
2. `Google Tiếng Việt` — Chrome desktop, cần mạng.
3. Bất kỳ giọng `vi-VN` nào cài trên máy (Windows: `Microsoft An`).
4. Không có gì cả → **hiện chữ TO** thay vì đọc, kèm cảnh báo.
   Không bao giờ để giọng tiếng Anh đọc tiếng Việt.

Kiểm tra máy có giọng nào, dán vào Console:

```js
speechSynthesis.getVoices().filter(v => v.lang.startsWith('vi'))
```

Trả về mảng rỗng thì làm một trong ba cách:

- **Nhanh nhất:** demo bằng **Microsoft Edge** (có sẵn HoaiMy + NamMinh).
- Cài gói tiếng Việt: Settings → Time & Language → Language & region →
  Add a language → Tiếng Việt → tick **Text-to-speech** → khởi động lại trình duyệt.
- Chấp nhận đường lui: câu trả lời hiện chữ to cho người phỏng vấn đọc.

## Đường lui đã cài sẵn — đừng tháo

| Hỏng cái gì | Sản phẩm làm gì |
|---|---|
| Micro hỏng / phòng ồn | Công tắc **Demo** ở header chạy kịch bản qua đúng BUS |
| AI không gọi được | Sau 2,5 giây hiện bản rút gọn tại chỗ, có AI thì thay sau |
| Trình duyệt không có Web Speech | Băng cảnh báo vàng + gợi ý bật Demo |
| Máy không có giọng tiếng Việt | Hiện chữ to thay vì đọc |

## Thao tác nhanh của HR

| Nút | Làm gì | Chi tiết đáng để ý |
|---|---|---|
| **Lặp lại câu hỏi** | Nháy nền câu hỏi đang hiện trong 0,9 giây | KHÔNG gọi lại AI, KHÔNG đổi chữ. Chữ biến mất rồi hiện lại là bắt ứng viên đọc lại từ đầu. Khoá nút khi chưa có câu hỏi nào. |
| **Câu tiếp theo** | Phát `question:reset` → dọn panel ứng viên + ô trả lời | Huỷ luôn lượt gọi AI đang bay ở cả `simplify.js` lẫn `voice.js`, nếu không thì vài giây sau loa đọc câu của câu hỏi cũ. Bản ghi lời HR giữ nguyên vì đó là nhật ký phiên. |

## Mở rộng — chưa làm

| Việc | Vì sao hoãn |
|---|---|
| Nút **Thêm ghi chú** ở panel HR | Cần ô nhập cho HR + chỗ lưu (`sessionStorage`), chưa có thiết kế UI. Nút hiện vẫn chưa có hành vi. |

## Bảo mật

Repo này **public**. `ANTHROPIC_API_KEY` chỉ nằm ở server
(`api/claude.js` + Environment Variables trên Vercel), không bao giờ xuống browser.
Key lỡ lọt vào file đã push thì thu hồi ngay tại console.anthropic.com rồi tạo key mới.
