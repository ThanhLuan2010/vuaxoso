# ĐẶC TẢ TÍNH NĂNG: GIỎ HÀNG, ĐẶT VÉ & QUẢN LÝ ĐƠN HÀNG (`order_cart_ticket`)

## 1. TỔNG QUAN TÍNH NĂNG
- Hệ thống quản lý toàn diện quy trình mua vé: Từ thêm giỏ hàng, đặt vé trực tiếp trên Mobile App, xử lý thanh toán khấu trừ ví tại Backend, đến quản lý đơn hàng, xuất vé, upload ảnh vé vật lý và xuất báo cáo trên CMS.
- **Quy tắc Nghiệp vụ Cốt lõi (Business Rules)**:
  1. **Hiển thị nhất quán giữa App và CMS**: Công thức cược hiển thị chuẩn xác: `[Số con] x [Số tiền / 1 con] x [Hệ số nhân] = Tổng cược`. Người dùng nhập thế nào ngoài App thì CMS hiển thị đúng nguyên vẹn như vậy.
  2. **Hiển thị đầy đủ thời gian mở thưởng**: Cột Ngày xổ bắt buộc hiển thị định dạng đầy đủ: `DD/MM/YYYY HH:mm:ss`.
  3. **Liên kết điều hướng 2 chiều (Bidirectional Linking)**:
     - Từ `UserManagement`: Bấm vào Mã đơn hàng sẽ mở ngay chi tiết đơn đó ở `OrderManagement`.
     - Từ `OrderManagement`: Bấm vào Tên khách hàng / SĐT sẽ mở ngay hồ sơ khách hàng đó ở `UserManagement`.
  4. **Tích hợp Ảnh chụp vé số vật lý thực tế**: Hỗ trợ Admin upload ảnh vé chụp tại đại lý (chọn file hoặc paste URL link). Đảm bảo xem mượt mà trên CMS và hiển thị sắc nét cho người chơi ngoài Mobile App.
  5. **Bảng Thống Kê Tổng Thể (Summary Header Dashboard)**: Nằm ở đầu trang Quản lý đặt vé, hiển thị tổng số vé bán ra, tổng doanh thu cược, tổng tiền trả thưởng cho khách, tổng tiền nhà cái thắng/thua theo bộ lọc ngày.
  6. **Chính sách Lưu Trữ 2 Tháng**: Lịch sử cược lưu trữ trong CSDL tối đa 2 tháng gần nhất. Định kỳ xuất báo cáo lưu trữ và dọn dẹp các đơn cũ hơn 60 ngày.

---

## 2. GIAO DIỆN & LUỒNG THAO TÁC TRÊN MOBILE APP

### 2.1. Màn hình Giỏ Hàng (`CartScreen.tsx`)
- Danh sách tất cả các vé đã chọn từ nhiều game khác nhau (Lô đề, Keno, Vietlott, Kiến thiết...).
- Cho phép tích chọn/bỏ chọn từng vé để thanh toán.
- Nút xóa từng vé hoặc xóa trắng giỏ hàng.
- Nút **[Thanh toán tất cả]**: Gửi mảng `orders` lên API Checkout. Tối ưu hóa xử lý Batch xử lý hoàn tất dưới 2 giây (giải quyết triệt để lỗi chậm > 2 phút khi cược nhiều vé cùng lúc).

### 2.2. Màn hình Lịch Sử Đặt Vé (`HistoryScreen.tsx`, `HistoryDetailScreen.tsx`)
1. **Các Tab Lọc Đơn Hàng**:
   - `Tất cả`
   - `Chờ mở thưởng` (Trạng thái `pending`)
   - `Trúng thưởng` (Trạng thái `completed` và `isWinner === true`, màu xanh lá)
   - `Không trúng / Thua` (Trạng thái `completed` và `isWinner === false`, màu xám)
2. **Chi tiết đơn hàng (`HistoryDetailScreen.tsx`)**:
   - Mã đơn hàng (dạng `#ORD-XXXXX`).
   - Tên game, Tên đài, Ngày giờ đặt, Ngày giờ mở thưởng đầy đủ.
   - Chi tiết từng bộ số đã cược (highlight màu đỏ hoặc xanh các con số trúng thưởng).
   - Tổng tiền cược và Tiền thưởng nhận được.
   - **Nút "Xem ảnh vé số thật"**: Mở Modal hiển thị ảnh vé giấy do đại lý CMS upload lên.

---

## 3. GIAO DIỆN & VẬN HÀNH TRÊN CMS (`OrderManagement.tsx`)

### 3.1. Bảng Thống Kê Tổng Thể Trên Đầu Trang (Dashboard Metrics)
- Hiển thị 4 thẻ số liệu tổng hợp (thay đổi theo bộ lọc thời gian và bộ lọc game):
  1. **Tổng số lượng vé bán ra**: (Ví dụ: `12.450 vé`).
  2. **Tổng doanh thu bán vé**: (Ví dụ: `158.200.000 VNĐ`).
  3. **Tổng tiền khách trúng**: (Ví dụ: `89.500.000 VNĐ`).
  4. **Doanh thu ròng (Lợi nhuận)**: `Tổng doanh thu - Tổng tiền khách trúng` (Màu xanh nếu dương, màu đỏ nếu âm).

### 3.2. Bộ Lọc Đa Năng & Ô Tìm Kiếm Toàn Diện
- **Ô Tìm kiếm**: Tìm kiếm được tất cả các thông tin: Mã đơn hàng, Tên khách hàng, SĐT khách hàng, Dãy số cược, Địa chỉ IP đặt cược.
- **Bộ lọc ngày mở rộng**:
  - Chọn khoảng ngày linh hoạt từ ngày `YYYY-MM-DD` đến ngày `YYYY-MM-DD`.
  - Phím tắt: `Hôm nay`, `Hôm qua`, `Tuần này`, `Tháng này`.
- **Nút [Xuất Dữ Liệu Excel]**: Xuất toàn bộ danh sách đơn hàng đã lọc ra file Excel đầy đủ các cột phục vụ kế toán.

### 3.3. Bảng Danh Sách Đơn Hàng
| Cột | Nội Dung Hiển Thị & Thao Tác |
| :--- | :--- |
| **Mã Đơn** | Dạng `#ORD-XXXXX`. Bấm vào mở Drawer xem chi tiết đầy đủ của đơn hàng. |
| **Khách Hàng** | Tên khách + SĐT. **Bấm vào chuyển hướng thẳng sang hồ sơ User tại `UserManagement`**. |
| **Trò Chơi** | Tên game + Đài tỉnh (ví dụ: `Lô Đề 3 Miền - MB`). |
| **Loại Cược** | Chi tiết loại cược (ví dụ: `Lô 2 số`, `Bao 7`). |
| **Dãy Số Cược** | Hiển thị chi tiết các con số cược. Hỗ trợ nút "Xem thêm" nếu số lượng con cược nhiều. |
| **Tổng Tiền Cược** | Hiển thị: `Số con x Tiền đánh 1 con = Tổng cược` (định dạng VNĐ). |
| **Ngày Đặt** | `DD/MM/YYYY HH:mm:ss`. |
| **Ngày Xổ** | `DD/MM/YYYY HH:mm:ss` (đầy đủ giờ-phút-giây). |
| **Cột KẾT QUẢ** | Trạng thái thắng thua: `Chờ xổ` (Vàng) / `Thắng: +XX đ` (Xanh lá) / `Thua` (Xám). |
| **Ảnh Vé Số** | Thumbnail ảnh vé thật nếu có. Nút **[Upload / Sửa ảnh vé]**. |
| **IP & Thiết Bị** | IP mạng + Tên thiết bị đặt cược (giúp đối soát gian lận). |

### 3.4. Modal Upload & Xem Ảnh Vé Thật
- Cho phép Admin tải ảnh lên từ máy tính hoặc dán trực tiếp đường link ảnh.
- Nút **[Xem Thử Ảnh]** để kiểm tra ảnh trước khi lưu, đảm bảo link ảnh không bị lỗi 404.

---

## 4. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND

### 4.1. Model Đơn Hàng (`Order.ts`)
```typescript
export interface IOrder extends Document {
  user: ObjectId;              // Ref to User
  orderId: string;             // Mã đơn duy nhất (#ORD-XXXXX)
  gameType: string;            // 'xoso_3mien', 'keno', 'power_655', 'MB'...
  playType?: string;           // 'Lô 2 số', 'Bậc 3', 'Bao 7'...
  provinceName?: string;
  provinceId?: string;
  drawId?: string;
  drawCode?: string;
  drawDate: string;
  items: [
    {
      id: String,
      playType: String,
      numbers: [String],
      specialNumbers: [String],
      baseCost: Number,
      multiplier: Number,
      cost: Number
    }
  ];
  totalCost: number;
  status: 'pending' | 'completed' | 'cancelled';
  isWinner: boolean;
  prizeAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  ticketImageUrl?: string;     // URL ảnh chụp tờ vé thật
  ipAddress?: string;          // IP đặt cược
  loginDevice?: string;        // Thiết bị đặt cược
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2. Cron Job Xuất Báo Cáo & Xóa Dữ Liệu Cũ Hơn 2 Tháng (`cronService.ts`)
```typescript
// Chạy vào 03:00 sáng ngày mùng 1 hàng tháng
cron.schedule('0 3 1 * *', async () => {
  const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  
  // 1. Xuất dữ liệu các đơn cũ hơn 60 ngày ra file backup JSON/CSV nén
  await exportOldOrdersToBackup(twoMonthsAgo);

  // 2. Xóa các đơn hàng cũ hơn 60 ngày khỏi collection chính để duy trì hiệu năng database
  const result = await Order.deleteMany({ createdAt: { $lt: twoMonthsAgo } });
  console.log(`Đã dọn dẹp ${result.deletedCount} đơn hàng cũ hơn 2 tháng.`);
});
```

