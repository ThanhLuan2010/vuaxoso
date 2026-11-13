# ĐẶC TẢ KỸ THUẬT GAME: XỔ SỐ KIẾN THIẾT 3 MIỀN (`kienthiet`)

## 1. TỔNG QUAN GAME
- **Mã định danh hệ thống (`gameType`)**: `MB`, `MT`, `MN` (phân loại `kienthiet`).
- **Bản chất trò chơi**: Xổ số kiến thiết truyền thống bằng vé số giấy thực tế, người chơi chọn mua số có sẵn trong kho vé của hệ thống. Đại lý/CMS tiến hành giữ vé vật lý, in vé, chụp ảnh vé thực tế và đối chiếu trao thưởng.
- **Quy chuẩn độ dài số vé**:
  - **Miền Bắc (MB)**: Gồm **5 chữ số** (từ `00000` đến `99999`).
  - **Miền Trung (MT) & Miền Nam (MN)**: Gồm **6 chữ số** (từ `000000` đến `999999`).
- **Phân loại vé & Mệnh giá**:
  1. **Vé Thường (`normal`)**:
     - Định dạng số: Số thuần chữ số (ví dụ: `12345` hoặc `123456`).
     - Mệnh giá thanh toán: **10.000 VNĐ / vé**.
     - Có thể có nhiều tờ cùng số (bội số `multiplier`, ví dụ 10 hoặc 14 vé).
  2. **Vé Đặc Biệt (`special`)**:
     - Định dạng số: Bắt đầu bằng tiền tố chữ **`x`** kèm 5 chữ số phía sau (ví dụ: `x12345`).
     - Số lượng quy chuẩn: **160 vé / cọc**.
     - Quy tắc thanh toán: Khách mua 1 lần là mua trọn gói toàn bộ **160 vé** đó với giá **1.600.000 VNĐ** (160 vé x 10.000đ).
     - Quy tắc hiển thị: Ngay khi 1 khách đặt mua thành công, số vé đó **ẩn ngay lập tức** khỏi màn hình App, trên CMS hiển thị trạng thái `Hết vé` (`isSold: true`).
- **Thời gian chốt vé (Cutoff Time)**:
  - Miền Nam: **16:10** (Mở thưởng lúc 16:15).
  - Miền Trung: **17:10** (Mở thưởng lúc 17:15).
  - Miền Bắc: **18:10** (Mở thưởng lúc 18:15).

---

## 2. GIAO DIỆN & LUỒNG THAO TÁC TRÊN MOBILE APP (`GameLayoutCScreen.tsx`)

### 2.1. Màn hình chọn vé Xổ Số Kiến Thiết
1. **Header**:
   - Nút Back (`<ArrowLeft />`).
   - Tiêu đề: "XỔ SỐ KIẾN THIẾT" kèm nhãn miền (ví dụ: "KIẾN THIẾT MIỀN NAM").
   - Số dư ví người chơi realtime.
2. **Thanh chọn Ngày & Tỉnh/Đài**:
   - Bộ chọn ngày xổ: Cho phép chọn Hôm nay hoặc các ngày tương lai có lịch mở thưởng.
   - Danh sách các đài mở thưởng trong ngày (ví dụ: TP.HCM, Đồng Tháp, Cà Mau).
   - Thời gian đếm ngược đến giờ chốt nhận vé.
3. **Thanh Tìm Kiếm & Lọc Số Vé**:
   - Ô nhập tìm kiếm số vé: Tìm theo 2 số cuối (đuôi vé), 3 số cuối hoặc chính xác cả dãy số.
   - Nút chuyển tab: Tất cả vé, Vé Thường, Vé Đặc Biệt (Biểu tượng Kim Cương).
4. **Lưới Hiển Thị Vé Đặc Biệt (Special Diamond Grid)**:
   - Hiển thị nổi bật ở khu vực trên cùng.
   - Thẻ vé đặc biệt:
     - Biểu tượng **Kim Cương vàng viền cam** (`DiamondLogo`).
     - Dãy số vé có tiền tố `x` (ví dụ `x89234`).
     - Nhãn giá trọn gói: **1.600.000 VNĐ** (Cọc 160 vé).
     - Nút chọn cọc vé.
5. **Lưới Hiển Thị Vé Thường (Normal Ticket Grid)**:
   - Thẻ vé thường mô phỏng tờ vé số kiến thiết:
     - Logo đài tỉnh (Ngôi sao vàng nền đỏ viền vàng).
     - Tên đài phát hành & Ngày mở thưởng.
     - Dãy số vé to, rõ ràng (5 số cho MB, 6 số cho MT/MN).
     - Số lượng vé khả dụng còn lại trong kho (bội số `multiplier`, ví dụ `x10`, `x14`).
     - Bộ tăng/giảm số lượng muốn mua (từ 1 vé đến tối đa số lượng có sẵn trong kho).
     - Giá tiền: `Số lượng x 10.000 VNĐ`.
6. **Thanh Footer & Đặt Mua**:
   - Tổng số vé đã chọn.
   - Tạm tính tổng tiền: `Tổng số vé x 10.000đ` + `Số cọc đặc biệt x 1.600.000đ`.
   - Nút [Thêm giỏ hàng] & Nút [Thanh toán ngay].

### 2.2. Màn hình Chi tiết vé & Xem ảnh vé thực tế (`HistoryDetailScreen.tsx`)
- Sau khi đơn hàng được CMS tiếp nhận và xử lý in vé / gán vé:
  - Khách hàng bấm vào đơn hàng kiến thiết trong màn hình Lịch sử cược.
  - Hiển thị nút **"Xem ảnh vé số thật"**: Bấm vào mở Modal phóng to ảnh chụp tờ vé số vật lý có đóng dấu / seri rõ ràng do CMS tải lên.

---

## 3. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND

### 3.1. Model Kho Vé (`Ticket.ts`)
```typescript
{
  number: string;              // Số vé: "12345" (MB), "123456" (MT/MN) hoặc "x12345" (Đặc biệt)
  price: number;               // 10000
  ticketType: 'normal' | 'special';
  multiplier: number;          // Số lượng vé khả dụng còn lại (vé đặc biệt là 1 cọc)
  originalMultiplier: number;  // Số lượng ban đầu khi tạo kho
  provinceId: string;          // Mã đài: "MB", "HCM", "LA", "BD"...
  drawDate: string;            // Ngày mở thưởng: "DD/MM/YYYY"
  imageUrl?: string;           // Link ảnh chụp tờ vé thật (upload từ CMS)
  isSold: boolean;             // Đã bán hết hay chưa (true -> ẩn khỏi App)
  isLocked: boolean;           // Tạm khóa không cho mua
}
```

### 3.2. Payload Đặt Vé Kiến Thiết (`POST /api/orders/checkout`)
```json
{
  "orders": [
    {
      "gameType": "MN",
      "provinceName": "TP. Hồ Chí Minh",
      "provinceId": "HCM",
      "drawDate": "13/11/2026",
      "drawId": "sched_2026-11-13",
      "items": [
        {
          "id": "TICKET_NORMAL_01",
          "numbers": ["823912"],
          "baseCost": 10000,
          "multiplier": 5,
          "cost": 50000
        },
        {
          "id": "TICKET_SPECIAL_01",
          "numbers": ["x92834"],
          "baseCost": 1600000,
          "multiplier": 1,
          "cost": 1600000
        }
      ]
    }
  ]
}
```

### 3.3. Xử lý Logic Backend khi Mua Vé
1. **Kiểm tra tình trạng vé trong kho (`Ticket`)**:
   - Sử dụng khóa dòng (locking) hoặc query nguyên tử:
     - Nếu vé `isSold === true`: Trả lỗi 400 `"Vé này vừa có người khác đặt mua, vui lòng chọn số khác!"`.
     - Với vé Thường: Kiểm tra `ticket.multiplier >= số_lượng_mua`. Nếu đủ, trừ số lượng `multiplier -= qty`. Nếu `multiplier === 0` thì chuyển `isSold = true`.
     - Với vé Đặc Biệt: Đánh dấu ngay `isSold = true`, `multiplier = 0`.
2. **Khấu trừ tiền ví User**:
   - Trừ chính xác `totalCost` từ `user.balance`.
   - Tạo bản ghi `BalanceHistory`: `type: 'bet'`, lưu kèm mã đơn hàng.
3. **Liên kết Order và Ticket**:
   - Ghi nhận `ticketId` vào item của đơn hàng để sau này Admin CMS upload ảnh vé đối soát.

---

## 4. QUY CÁCH DÒ THƯỞNG VÉ SỐ KIẾN THIẾT (`prizeService.ts`)

### 4.1. Cơ cấu Giải thưởng Miền Nam & Miền Trung (18 Giải)
- **Giải Đặc Biệt**: Trùng khớp toàn bộ 6 chữ số (`2.000.000.000 VNĐ / vé`).
- **Giải Phụ Đặc Biệt**: Trùng 5 số cuối của Giải Đặc Biệt (chỉ sai chữ số đầu tiên hàng trăm nghìn) (`50.000.000 VNĐ / vé`).
- **Giải Khuyến Khích**: Trúng chữ số đầu tiên và sai đúng 1 chữ số bất kỳ trong 5 chữ số còn lại của Giải Đặc Biệt (`6.000.000 VNĐ / vé`).
- **Giải Nhất**: Trùng 5 chữ số (`30.000.000 VNĐ`).
- **Giải Nhì**: Trùng 5 chữ số (`15.000.000 VNĐ`).
- **Giải Ba**: Trùng 5 chữ số (`10.000.000 VNĐ`).
- **Giải Tư**: Trùng 5 chữ số (`3.000.000 VNĐ`).
- **Giải Năm**: Trùng 4 chữ số cuối (`1.000.000 VNĐ`).
- **Giải Sáu**: Trùng 4 chữ số cuối (`400.000 VNĐ`).
- **Giải Bảy**: Trùng 3 chữ số cuối (`200.000 VNĐ`).
- **Giải Tám**: Trùng 2 chữ số cuối (`100.000 VNĐ`).

### 4.2. Cơ cấu Giải thưởng Miền Bắc (27 Giải)
- **Giải Đặc Biệt**: Trùng khớp 5 chữ số (`1.000.000.000 VNĐ / vé`) kèm ký hiệu vé phụ nếu có.
- **Giải Phụ ĐB**: Trùng 5 số ĐB nhưng khác ký hiệu (`20.000.000 VNĐ`).
- **Giải Khuyến Khích**: Trùng 2 số cuối của Giải ĐB (`40.000 VNĐ`).
- **Giải Nhất -> Giải Bảy**: Đối chiếu theo bảng kết quả 27 giải chính thức.

---

## 5. GIAO DIỆN & QUẢN TRỊ TRÊN CMS (`vuaxoso_cms`)

### 5.1. Quản lý Kho Vé Số (`TicketManagement.tsx`)
- **Tạo vé hàng loạt (`bulkGenerateTickets`)**:
  - Chọn Đài/Tỉnh & Ngày xổ.
  - Nhập số lượng vé Thường muốn tạo (mặc định 500 số).
  - Nhập số lượng vé Đặc Biệt tiền tố `x` muốn tạo (mặc định 500 số).
  - Chọn bội số mặc định cho vé Thường (MB: 10 vé, MN/MT: 14 vé).
  - Hệ thống tự động sinh số ngẫu nhiên không trùng lặp và ghi nhận `AdminLog`.
- **Quản lý danh sách vé**:
  - Tìm kiếm theo số vé, đài, ngày xổ, loại vé.
  - Cột trạng thái: `Còn vé` (màu xanh), `Đã bán hết` (màu đỏ).
- **Upload Ảnh Vé Thật**:
  - Hỗ trợ 2 phương thức:
    1. Chọn file ảnh trực tiếp từ máy tính/điện thoại (Upload qua `/api/upload`).
    2. Nhập URL link ảnh trực tiếp.
  - Nút **Xem ảnh**: Kiểm tra ảnh trước khi lưu để đảm bảo không bị lỗi link. Khách ngoài App sẽ thấy ngay ảnh này trong chi tiết đơn hàng.

### 5.2. Quản lý Đơn Hàng Kiến Thiết (`OrderManagement.tsx`)
- Hiển thị danh sách vé kiến thiết khách đã đặt mua.
- Cột **Trạng thái in vé**: `Chưa in` / `Đã in vé` / `Đã đối soát`.
- Khi có kết quả mở thưởng: CMS đối chiếu tự động hoặc bấm nút "Dò vé kỳ này" để trả thưởng vào ví khách hàng.

