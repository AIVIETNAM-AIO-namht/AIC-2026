# UI/ — bản thiết kế gốc (tạo bằng Stitch)

Hai màn, mỗi màn một thư mục: `Setup/` và `Live Interview/`.

| File | Dùng thế nào |
|---|---|
| `code.html` | **Chuẩn.** Đây là thứ `index.html` và `interview.html` ở gốc repo dựng ra. Cần màu, khoảng cách, class Tailwind → tra ở đây. |
| `screen.png` | Ảnh chụp màn hình, để đối chiếu. |
| `DESIGN.md` | Mô tả ý đồ. Đọc để hiểu ý, **không** đọc để lấy số. |

## Một chỗ lệch — biết trước

Hai file `DESIGN.md` giống hệt nhau (Stitch export kèm vào cả hai thư mục), và phần chữ trong đó
không khớp với `code.html`:

- Nó ghi màu primary `#0D9488` / coral `#EA580C`. Màu thật trong `tailwind.config` của `code.html` là
  `primary #00685f`, `tertiary #a33900`.
- Nó mô tả bố cục có khung video, "Interpreter Dock", "Pin Video". Trong `code.html` **không có** ô video
  nào — bố cục thật là chia 5/7 giữa bảng HR và bảng ứng viên.

**Lấy `code.html` làm chuẩn.** `DESIGN.md` chỉ để hiểu tinh thần thiết kế.
