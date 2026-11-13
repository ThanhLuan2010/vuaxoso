# ĐẶC TẢ TÍNH NĂNG: QUẢN LÝ RÚT TIỀN (`withdraw_management`)

## 1. TỔNG QUAN TÍNH NĂNG
- Quản lý quy trình rút tiền thưởng và rút số dư của người chơi từ hệ thống về tài khoản ngân hàng hoặc ví USDT.
- **Quy tắc Nghiệp vụ Cốt lõi (Business Rules)**:
  1. **Giới hạn Tài khoản Nhận tiền**: Mỗi tài khoản người chơi chỉ được liên kết tối đa **2 Tài khoản Ngân hàng nội địa** và **2 Địa chỉ Ví USDT (mạng BEP20 / TRC20)**.
  2. **Bảo mật 2 Lớp qua Mật Khẩu Rút Tiền**: Bắt buộc nhập Mật khẩu rút tiền (mã PIN 6 số) riêng biệt mỗi khi tạo lệnh rút.
  3. **Đóng băng số dư tức thì (Balance Freezing)**: Ngay khi lệnh rút được tạo, số tiền rút sẽ được chuyển từ `balance` (khả dụng) sang `frozenBalance` (đóng băng) để ngăn chặn việc người chơi vừa rút tiền vừa cược tiếp số tiền đó.
  4. **Cơ chế Khẩn Cấp "Hold Rút Tiền" Toàn Hệ Thống**: Trong trường hợp xảy ra lỗi nhập sai kết quả xổ số hoặc phát hiện tấn công gian lận, Master Admin có quyền kích hoạt công tắc **"HOLD RÚT TIỀN TOÀN HỆ THỐNG"** để chặn tức thời toàn bộ các lệnh rút tiền đang chờ xử lý.

---

## 2. GIAO DIỆN & LUỒNG THAO TÁC TRÊN MOBILE APP

### 2.1. Màn hình Phương Thức Thanh Toán (`PaymentMethodsScreen.tsx`)
- Danh sách tài khoản nhận tiền đã liên kết:
  - Mục Ngân Hàng: Tối đa 2 tài khoản (hiển thị Logo Bank, Tên Ngân Hàng, STK, Tên chủ tài khoản in hoa).
  - Mục Ví USDT: Tối đa 2 ví (hiển thị Mạng BEP20/TRC20, Địa chỉ ví).
- Nút **[Thêm Tài Khoản Ngân Hàng]**: Nếu đã đủ 2 tài khoản thì nút bị mờ (disabled).
- Nút **[Thêm Ví USDT]**: Nếu đã đủ 2 ví thì nút bị mờ (disabled).

### 2.2. Màn hình Rút Tiền (`WalletScreen.tsx`, `WithdrawTab.tsx`)
1. **Thông tin số dư**:
   - Số dư khả dụng hiện tại (`balance`).
   - Số dư đang chờ rút / đóng băng (`frozenBalance`).
2. **Chọn Tài Khoản Rút Về**:
   - Dropdown / Thẻ chọn tài khoản: Hiển thị rõ **Họ tên đầy đủ + Ngân hàng / Ví nhận tiền**.
3. **Nhập Số Tiền Rút**:
   - Ô nhập số tiền muốn rút (tối thiểu 100.000 VNĐ, tối đa theo hạn mức ngày).
   - Nút chọn nhanh: `200k`, `500k`, `1M`, `5M`, `10M`, `Tất cả`.
4. **Xác thực Mật Khẩu Rút Tiền**:
   - Ô nhập **Mật khẩu rút tiền (6 chữ số)**.
   - Nút bấm `Quên mật khẩu rút tiền?` (chuyển hướng liên hệ CSKH).
5. **Nút [Xác nhận Rút tiền]**:
   - Kiểm tra: `withdrawAmount <= user.balance`.
   - Kiểm tra mật khẩu rút tiền chính xác.
   - Trừ số dư khả dụng, tăng số dư đóng băng:
     $$\text{user.balance} \leftarrow \text{user.balance} - \text{amount}$$
     $$\text{user.frozenBalance} \leftarrow \text{user.frozenBalance} + \text{amount}$$
   - Tạo lệnh rút ở trạng thái `pending`.

### 2.3. Màn hình Lịch Sử Rút Tiền (`TransactionHistoryScreen.tsx`)
- Tên màn hình: **"Lịch sử rút tiền"** (đã cập nhật chuẩn hóa từ "Lịch sử rút thưởng").
- Hiển thị danh sách các lệnh rút: Mã giao dịch, Số tiền (- VNĐ), Ngân hàng nhận, Trạng thái (`Chờ duyệt`, `Thành công`, `Bị từ chối / Hoàn tiền`).

---

## 3. GIAO DIỆN & VẬN HÀNH TRÊN CMS (`vuaxoso_cms`)

### 3.1. Quản lý Lệnh Rút Tiền (`TransactionManagement.tsx`)
- Danh sách các lệnh rút tiền cần duyệt:
  - Thời gian tạo lệnh.
  - Khách hàng (Username, SĐT, IP, Thiết bị).
  - Số tiền rút.
  - Thông tin tài khoản nhận tiền: Tên ngân hàng, Số tài khoản, Tên chủ sở hữu.
  - Kiểm tra gian lận nhanh: Cảnh báo đỏ nếu IP hoặc Thiết bị này trùng với các tài khoản khác đang có đơn cược đối nghịch.
- **Các Thao Tác Của Admin**:
  1. **Nút [Duyệt Rút (Hoàn tất chuyển khoản)]**:
     - Admin thực hiện chuyển khoản từ Internet Banking của công ty tới khách hàng.
     - Bấm Duyệt: Trừ `frozenBalance -= amount`, trạng thái `completed`.
     - Gửi Push Notification thông báo rút tiền thành công cho khách hàng.
  2. **Nút [Từ Chối Rút]**:
     - Bắt buộc nhập lý do từ chối (ví dụ: "Chưa đủ vòng cược", "Sai thông tin tên chủ tài khoản").
     - Hệ thống tự động **Hoàn lại tiền**:
       $$\text{user.frozenBalance} \leftarrow \text{user.frozenBalance} - \text{amount}$$
       $$\text{user.balance} \leftarrow \text{user.balance} + \text{amount}$$
     - Gửi thông báo Push giải thích lý do tới khách hàng.
  3. **Nút [Giữ Lệnh (Hold)]**:
     - Chuyển trạng thái lệnh sang `on_hold` để bộ phận Chống gian lận kiểm tra chuyên sâu mà không làm mất lượt của khách.

### 3.2. Chức năng Khẩn Cấp "Hold Rút Tiền Toàn Hệ Thống"
- Nằm tại thanh Header hoặc trang `SettingsManagement.tsx`.
- **Nút Chuyển Mạch Đỏ: "KHÓA RÚT TIỀN TOÀN BỘ"**:
  - Khi được bật: Mọi thao tác tạo lệnh rút mới ngoài App đều bị chặn với thông báo: *"Hệ thống đang bảo trì kênh rút tiền định kỳ. Vui lòng quay lại sau ít phút!"*.
  - Toàn bộ các lệnh rút đang chờ trên CMS bị khóa không cho bấm "Duyệt".
  - Cho phép Master Admin sửa lại kết quả kỳ quay xổ số nếu bị nhầm lẫn mà không sợ khách hàng rút tiền tẩu tán.

---

## 4. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND

### 4.1. Bổ sung trường trong Model `User.ts`
```typescript
{
  balance: { type: Number, default: 0 },         // Số dư khả dụng
  frozenBalance: { type: Number, default: 0 },   // Số dư đang bị đóng băng bởi lệnh rút
  bankAccounts: [
    {
      bankName: String,
      accountNumber: String,
      accountName: String,
      branch: String
    }
  ], // Tối đa 2 phần tử
  usdtWallets: [
    {
      network: { type: String, enum: ['BEP20', 'TRC20'] },
      walletAddress: String
    }
  ], // Tối đa 2 phần tử
  withdrawPassword: String,                      // Hash mã PIN 6 số
  isWithdrawLocked: { type: Boolean, default: false } // Khóa rút tài khoản cá nhân
}
```

### 4.2. Model Cài Đặt Hệ Thống (`Setting.ts`)
```typescript
{
  key: "SYSTEM_HOLD_WITHDRAW",
  value: false, // true = Khóa rút tiền toàn hệ thống
  updatedBy: ObjectId,
  updatedAt: Date
}
```

### 4.3. API Xử Lý Rút Tiền (`transactionController.ts`)
- **Tạo lệnh rút (`POST /api/transactions/withdraw`)**:
  - Kiểm tra `SYSTEM_HOLD_WITHDRAW === false` và `user.isWithdrawLocked === false`.
  - Kiểm tra `user.balance >= amount`.
  - So sánh `bcrypt.compare(withdrawPassword, user.withdrawPassword)`.
  - Thực hiện cập nhật số dư nguyên tử trong MongoDB Transaction.

