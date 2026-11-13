# ĐẶC TẢ TÍNH NĂNG: KIỂM SOÁT RỦI RO & BẢO MẬT HỆ THỐNG (`risk_control_security`)

## 1. TỔNG QUAN TÍNH NĂNG
- Hệ thống phòng thủ đa lớp kết hợp giữa kiểm soát nghiệp vụ cá cược (Risk Control) và an toàn thông tin cơ sở dữ liệu (Cyber Security).
- **Các Trụ Cột An Ninh Trọng Yếu**:
  1. **Hạn Chế Nhận Cược (Exposure Limits)**: Cho phép người chơi cược tự do **100% số con** (không áp dụng khống chế 70% số con), áp dụng trần nhận cược tối đa **100.000.000 VNĐ / con số / ngày** trên toàn hệ thống để kiểm soát rủi ro tài chính khi nổ số.
  2. **Bộ Lọc Cú Pháp & Tự Động Xóa Số Trùng Lặp**: Tiền xử lý dữ liệu nhập cược trên Mobile App và Backend, tự động chuẩn hóa chuỗi số và loại bỏ số trùng lặp, cảnh báo lỗi cú pháp dạng popup trực quan.
  3. **Báo Cáo Cược Bất Thường Realtime Qua Email**: Tự động gửi email cảnh báo tức thời tới `developervnteam@gmail.com` khi có đơn cược giá trị lớn, cược số lượng lớn con số hoặc phát hiện hành vi nghi vấn gian lận.
  4. **Mã Hóa Dữ Liệu Cơ Sở Dữ Liệu Chuẩn AES-256 (GCM/CBC)**: Toàn bộ thông tin nhạy cảm của khách hàng (Số điện thoại, Số CCCD, Số tài khoản ngân hàng, Địa chỉ ví) đều được mã hóa bằng thuật toán AES-256 trước khi lưu vào MongoDB.

---

## 2. QUY CHUẨN KIỂM SOÁT RỦI RO CÁ CƯỢC (RISK LIMITS)

### 2.1. Quy Định Số Con Nhận Cược (Cho Phép 100% Số Con)
- **Quy tắc**: Theo quyết định chốt từ quản trị hệ thống, Vua Xổ Số **cho phép người chơi tự do đánh 100% số con** trong một kỳ quay (không áp dụng chặn 70% số con).
- **Kiểm soát rủi ro đi kèm**: Thay vì chặn số lượng con, hệ thống tập trung kiểm soát rủi ro qua:
  1. Hạn mức tiền cược tối đa trên 1 con số (**100 triệu VNĐ / con số / ngày**).
  2. Động cơ quét **Cược đối nghịch** (phát hiện nhiều tài khoản cùng dải IP cược ôm 2 chiều thắng/thua để bào khuyến mãi).

### 2.2. Giới Hạn Trần Tiền Cược Tối Đa Trên 1 Con Số (100.000.000 VNĐ / Ngày)
- **Mục đích**: Tránh rủi ro dồn tiền vào 1 con số duy nhất gây mất cân đối tài chính khi mở thưởng.
- **Quy tắc**: Tổng toàn bộ tiền cược của tất cả các người chơi hoặc của 1 người chơi cược vào cùng 1 con số cụ thể trong 1 ngày (trên tất cả các loại cược Lô, Đề, 3 Càng, 4 Càng của 3 Miền) không được vượt quá **100.000.000 VNĐ**.
- Nếu đơn cược mới làm vượt quá hạn mức 100 triệu cho con số đó: Backend trả về thông báo lỗi: *"Con số [XX] đã đạt hạn mức cược tối đa trong ngày (100.000.000đ). Vui lòng giảm tiền cược hoặc chọn số khác!"*.

---

## 3. CƠ CHẾ LỌC SỐ TRÙNG & PHÁT HIỆN LỖI CÚ PHÁP TRÊN MOBILE APP

### 3.1. Tự Động Xóa Số Trùng Lặp
- Khi khách hàng gõ hoặc dán một chuỗi số:
  - Hệ thống sử dụng Regex tách chuỗi theo các ký tự phân tách: `,`, `;`, ` `, `\n`, `|`, `&`.
  - Tự động chuyển đổi thành mảng các chuỗi số duy nhất (`Set`):
    ```typescript
    const cleanNumbers = Array.from(new Set(rawInputs.map(n => n.trim())));
    ```
  - Nếu phát hiện có số trùng bị xóa: Hiển thị thông báo nhỏ (Toast/Badge) thông báo: *"Hệ thống đã tự động loại bỏ [X] con số bị trùng lặp"*.

### 3.2. Báo Lỗi Cú Pháp Bằng Popup Trực Quan
- Nếu chuỗi nhập vào chứa ký tự không hợp lệ (chữ cái, ký tự đặc biệt không phải dấu phân tách) hoặc độ dài con số không khớp với loại cược đang chọn (ví dụ: đang đánh 3 Càng nhưng gõ con số có 2 hoặc 4 chữ số):
  - Hệ thống hiển thị Modal Popup cảnh báo màu đỏ:
    - Tiêu đề: ⚠️ **LỖI CÚ PHÁP NHẬP SỐ**
    - Nội dung: Chỉ rõ chính xác con số bị sai độ dài hoặc ký tự không hợp lệ.
    - Người dùng bấm "Đồng ý sửa" để quay lại chỉnh sửa trước khi bấm Đặt vé.

---

## 4. BÁO CÁO CƯỢC REALTIME QUA EMAIL (`logEmailService.ts`)
- Khi một đơn cược được tạo thành công:
  - Nếu đơn cược có tổng giá trị $\ge$ **5.000.000 VNĐ** hoặc số lượng con cược $\ge$ **50 con**:
    - Backend tự động đóng gói dữ liệu và gọi hàm `sendLogNotificationEmail` gửi email về `developervnteam@gmail.com`.
- **Nội dung email bao gồm**:
  - Thời gian đặt cược (giờ Việt Nam).
  - Thông tin khách hàng: Tên khách hàng, SĐT đã giải mã.
  - Địa chỉ IP mạng và Chuỗi định danh thiết bị (`User-Agent`).
  - Tên trò chơi, Đài tỉnh, Loại cược.
  - Danh sách chi tiết các con số cược và tổng tiền cược.
  - Bảng so sánh các thay đổi nếu có can thiệp từ quản trị viên.

---

## 5. MÃ HÓA CƠ SỞ DỮ LIỆU CHUẨN AES-256 (`EncryptionHelper.ts`)

### 5.1. Kiến Trúc Mã Hóa Dữ Liệu Nhạy Cảm
- Sử dụng thuật toán chuẩn công nghiệp **AES-256 (GCM/CBC)**.
- Khóa mã hóa `ENCRYPTION_KEY` gồm 32 bytes (256 bits) được lưu trữ an toàn trong biến môi trường `.env`.
- Hỗ trợ 2 chế độ mã hóa:
  1. **Mã hóa ngẫu nhiên (Randomized IV)**: Dùng cho các trường không cần tìm kiếm (Số CCCD, Ảnh CCCD, Mật khẩu rút tiền) $\rightarrow$ Cùng 1 giá trị mỗi lần mã hóa sẽ ra một chuỗi ciphertext khác nhau.
  2. **Mã hóa tất định (Deterministic IV)**: Dùng cho trường Số điện thoại (`phone`) $\rightarrow$ Cho phép tìm kiếm chính xác (`User.findOne({ phone: encryptedPhone })`) trong MongoDB mà không làm lộ dữ liệu thô ra database.

```typescript
// Trích xuất từ /vuaxoso_backend/src/utils/EncryptionHelper.ts
export class EncryptionHelper {
  private static readonly ALGORITHM = 'aes-256-cbc';
  private static readonly KEY = Buffer.from(process.env.ENCRYPTION_KEY || '...', 'hex');

  public static encryptDeterministic(text: string): string {
    // Sử dụng IV cố định phái sinh từ text để phục vụ query tìm kiếm
    const hash = crypto.createHash('sha256').update(text).digest();
    const iv = hash.slice(0, 16);
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  public static decryptDeterministic(encryptedText: string): string {
    const [ivHex, cipherHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.ALGORITHM, this.KEY, iv);
    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

