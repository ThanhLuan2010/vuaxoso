# ĐẶC TẢ TÍNH NĂNG: QUẢN LÝ NẠP TIỀN (`deposit_management`)

## 1. TỔNG QUAN TÍNH NĂNG
- Hệ thống hỗ trợ nạp tiền đa kênh linh hoạt: **Chuyển khoản Ngân hàng nội địa** (qua VietQR) và **Nạp tiền mã hóa USDT** (mạng BEP20 & TRC20).
- Bổ sung màn hình **Lịch sử nạp tiền** trên Mobile App tương tự như bên rút tiền.
- **Chính sách lưu trữ sao kê**:
  - Hình ảnh sao kê / biên lai nạp tiền chỉ lưu trữ **1 tháng** (sau 30 ngày hệ thống tự động dọn dẹp để tối ưu dung lượng lưu trữ).
  - Bản ghi lịch sử giao dịch nạp tiền được lưu trữ **1 năm** để phục vụ báo cáo doanh thu và đối soát tài chính.

---

## 2. GIAO DIỆN & LUỒNG THAO TÁC TRÊN MOBILE APP (`WalletScreen.tsx`, `DepositTab.tsx`)

### 2.1. Màn hình Nạp Tiền
1. **Chọn Phương Thức Nạp**:
   - Tab 1: **Ngân hàng (VietQR / Chuyển khoản)**.
   - Tab 2: **Tiền điện tử USDT (BEP20 / TRC20)**.
2. **Kênh Chuyển Khoản Ngân Hàng**:
   - Nhập số tiền muốn nạp (tối thiểu 50.000 VNĐ).
   - Các nút chọn nhanh: `100k`, `200k`, `500k`, `1M`, `2M`, `5M`, `10M`.
   - Bấm **[Tạo lệnh nạp tiền]**:
     - Hiển thị mã **VietQR** động (quét bằng app ngân hàng tự điền đúng STK và Nội dung chuyển khoản).
     - Thông tin chi tiết: Tên Ngân Hàng, Số Tài Khoản, Chủ Tài Khoản.
     - **Nội dung chuyển khoản (Memo Code)**: Mã duy nhất (ví dụ: `VXS98234`). Kèm nút copy 1 chạm. Khuyến cáo khách ghi chính xác nội dung này.
     - Nút tải lên **Ảnh biên lai chuyển khoản thành công** (tùy chọn nhưng khuyến khích).
     - Nút **[Tôi đã chuyển tiền]**: Đưa lệnh nạp về trạng thái `Chờ duyệt (Pending)`.
3. **Kênh Nạp USDT (`DepositBinanceScreen.tsx`)**:
   - Chọn mạng: `USDT - BEP20 (BSC)` hoặc `USDT - TRC20 (TRON)`.
   - Hiển thị Địa chỉ ví nhận tiền của hệ thống kèm mã QR.
   - Tỷ giá quy đổi USDT/VNĐ theo thời gian thực (ví dụ: `1 USDT = 25.800 VNĐ`).
   - Nhập mã giao dịch (TXID / Hash) sau khi chuyển tiền và gửi xác nhận.

### 2.2. Màn hình Lịch Sử Nạp Tiền (`TransactionHistoryScreen.tsx`)
- Danh sách tất cả các lệnh nạp tiền của người chơi.
- Hiển thị rõ:
  - Mã giao dịch, Phương thức nạp (Bank/USDT).
  - Số tiền nạp (+ VNĐ).
  - Ngày giờ tạo lệnh.
  - Trạng thái: `Chờ duyệt` (Màu vàng), `Thành công` (Màu xanh lá), `Từ chối` (Màu đỏ kèm lý do nếu có).

---

## 3. GIAO DIỆN & VẬN HÀNH TRÊN CMS (`vuaxoso_cms`)

### 3.1. Quản lý Lệnh Nạp Tiền (`TransactionManagement.tsx`)
- **Danh sách chờ duyệt**: Hiển thị trên đầu danh sách các lệnh nạp đang ở trạng thái `pending`.
- **Thông tin trên mỗi dòng**:
  - Mã lệnh nạp, Ngày tạo.
  - Thông tin khách hàng: Tên, SĐT, Link sang `UserManagement`.
  - Phương thức (Ngân hàng nào / Mạng USDT nào).
  - Số tiền yêu cầu nạp.
  - Nội dung chuyển khoản đối chiếu.
  - Ảnh biên lai đính kèm: Bấm vào xem ảnh phóng to.
- **Thao tác của Admin**:
  1. **Nút [Duyệt Nạp]**:
     - Modal xác nhận: Nhập số tiền thực nhận vào tài khoản ngân hàng (cho phép điều chỉnh nếu khách chuyển lệch số tiền).
     - Bấm Xác nhận:
       - Trạng thái chuyển sang `completed`.
       - Hệ thống tự động cộng tiền ngay lập tức vào `user.balance`.
       - Tạo bản ghi `BalanceHistory`: `type: 'deposit'`.
       - Tự động kích hoạt thông báo Push FCM tới App của khách hàng: *"Nạp tiền thành công! Bạn đã được cộng +X VNĐ vào tài khoản."*
       - Ghi nhận `AdminLog`.
  2. **Nút [Từ Chối]**:
     - Bắt buộc Admin nhập lý do từ chối (ví dụ: "Không nhận được tiền vào tài khoản", "Sai nội dung chuyển khoản").
     - Trạng thái chuyển sang `rejected`.
     - Gửi thông báo Push giải thích lý do cho khách hàng.

---

## 4. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND

### 4.1. Model Giao Dịch Nạp Tiền (`Transaction.ts`)
```typescript
{
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: String, required: true, unique: true },
  type: 'deposit',
  amount: { type: Number, required: true },
  method: 'bank' | 'usdt_bep20' | 'usdt_trc20',
  bankInfo?: {
    bankName: String,
    accountNumber: String,
    accountName: String,
    memoCode: String
  },
  usdtInfo?: {
    network: String,
    walletAddress: String,
    txid: String,
    rate: Number
  },
  receiptImage?: String,        // URL ảnh biên lai
  receiptImageCreatedAt?: Date, // Thời điểm tải ảnh (dùng cho cron xóa sau 30 ngày)
  status: 'pending' | 'completed' | 'rejected',
  rejectedReason?: String,
  approvedBy?: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt?: Date
}
```

### 4.2. Cron Job Tự Động Xóa Ảnh Sao Kê Sau 1 Tháng (`cronService.ts`)
```typescript
// Chạy định kỳ vào 02:00 sáng mỗi ngày
cron.schedule('0 2 * * *', async () => {
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  // Tìm các giao dịch nạp tiền có ảnh sao kê cũ hơn 30 ngày
  const oldTransactions = await Transaction.find({
    type: 'deposit',
    receiptImage: { $exists: true, $ne: null },
    createdAt: { $lt: oneMonthAgo }
  });

  for (const trans of oldTransactions) {
    if (trans.receiptImage) {
      deleteFileFromDisk(trans.receiptImage); // Xóa file vật lý trên server
      trans.receiptImage = undefined;
      await trans.save();
    }
  }
});
```

