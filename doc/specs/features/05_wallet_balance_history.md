# ĐẶC TẢ TÍNH NĂNG: QUẢN LÝ VÍ & BIẾN ĐỘNG SỐ DƯ (`wallet_balance_history`)

## 1. TỔNG QUAN TÍNH NĂNG
- Hệ thống ví điện tử tích hợp phục vụ lưu trữ số dư, thực hiện đặt cược, nhận thưởng và giao dịch nạp rút.
- **Nguyên tắc Quản trị Dòng tiền (Financial Integrity)**:
  1. **Tính Bất biến (Immutability)**: Mọi biến động cộng hoặc trừ tiền trong tài khoản người chơi đều **bắt buộc** phải sinh ra một bản ghi `BalanceHistory` tương ứng. Tuyệt đối không cập nhật trực tiếp `user.balance` mà không có nhật ký biến động.
  2. **Bảo toàn Số dư**: Mỗi bản ghi biến động số dư đều phải lưu lại: Số dư trước giao dịch (`balanceBefore`), Số tiền thay đổi (`amount`) và Số dư sau giao dịch (`balanceAfter`), đảm bảo công thức:
     $$\text{balanceAfter} = \text{balanceBefore} + \text{amount}$$
  3. **Truy nguyên Nguồn gốc (Traceability)**: Mỗi biến động đều gắn liền với một mã tham chiếu duy nhất (`referenceId` là mã Đơn hàng, mã Lệnh nạp/rút hoặc mã Phòng mua chung).

---

## 2. GIAO DIỆN & LUỒNG THAO TÁC TRÊN MOBILE APP

### 2.1. Thẻ Số Dư Ví (`AccountBalanceCard.tsx`)
- Hiển thị ở đầu màn hình Ví (`WalletScreen.tsx`):
  - **Tổng tài sản**: Tổng số dư khả dụng (`balance`) hiển thị định dạng VNĐ có dấu phân cách hàng nghìn (ví dụ: `15.850.000 đ`).
  - **Số dư đóng băng**: `Số tiền đang chờ duyệt rút` (ví dụ: `2.000.000 đ`).
  - Icon con mắt ẩn/hiện số dư để bảo mật nơi công cộng.
  - 2 nút hành động nhanh: **[Nạp Tiền]** (Màu xanh dương) và **[Rút Tiền]** (Màu cam).

### 2.2. Màn hình Biến Động Số Dư (`TransactionHistoryScreen.tsx`)
- Danh sách dòng tiền hiển thị theo thứ tự thời gian giảm dần (mới nhất ở trên).
- **Phân loại hiển thị**:
  - Tiền cộng vào (+): Hiển thị màu xanh lá (ví dụ: `+500.000 đ`).
  - Tiền trừ đi (-): Hiển thị màu đỏ (ví dụ: `-135.000 đ`).
- **Bộ lọc giao dịch**:
  - `Tất cả`
  - `Nạp tiền`
  - `Rút tiền`
  - `Tiền cược`
  - `Tiền thưởng`
  - `Hoàn tiền`
- Bấm vào từng dòng: Mở Popup chi tiết giao dịch (Mã đơn hàng, Game nào, Số dư trước/sau, Thời gian chính xác đến giây).

---

## 3. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND

### 3.1. Model Lịch Sử Biến Động Số Dư (`BalanceHistory.ts`)
```typescript
export interface IBalanceHistory extends Document {
  user: ObjectId;              // Ref to User
  type: 
    | 'deposit'                // Nạp tiền thành công (+)
    | 'withdraw'               // Rút tiền (-)
    | 'withdraw_refund'        // Hoàn tiền do lệnh rút bị từ chối (+)
    | 'bet'                    // Đặt vé cược (-)
    | 'prize'                  // Trúng thưởng cược (+)
    | 'refund'                 // Hoàn tiền vé cược (kỳ hủy) (+)
    | 'cobuy_join'             // Tham gia mua chung (-)
    | 'cobuy_prize'            // Trúng thưởng mua chung (+)
    | 'admin_adjustment';      // Master Admin điều chỉnh (+/-)
  amount: number;              // Số tiền thay đổi (Dương: cộng, Âm: trừ)
  balanceBefore: number;       // Số dư trước khi đổi
  balanceAfter: number;        // Số dư sau khi đổi
  referenceId?: string;        // Mã OrderId, TransactionId, RoomNum
  details?: string;            // Mô tả chi tiết giao dịch
  createdAt: Date;
}
```

### 3.2. Hàm Tiện Ích Thay Đổi Số Dư An Toàn (Transaction Helper)
```typescript
export const adjustUserBalance = async ({
  userId,
  amount,
  type,
  referenceId,
  details,
  session
}: AdjustBalanceParams) => {
  const user = await User.findById(userId).session(session);
  if (!user) throw new Error("User không tồn tại");

  const balanceBefore = user.balance;
  const balanceAfter = balanceBefore + amount;

  if (balanceAfter < 0) {
    throw new Error("Số dư tài khoản không đủ để thực hiện giao dịch");
  }

  user.balance = balanceAfter;
  await user.save({ session });

  await BalanceHistory.create([{
    user: userId,
    type,
    amount,
    balanceBefore,
    balanceAfter,
    referenceId,
    details
  }], { session });

  return { balanceBefore, balanceAfter };
};
```

---

## 4. GIAO DIỆN & VẬN HÀNH TRÊN CMS (`vuaxoso_cms`)
- **Tra cứu Dòng Tiền Người Dùng (`UserManagement.tsx`)**:
  - Tại trang chi tiết của bất kỳ User nào, có tab **"Biến động số dư"**.
  - Cho phép Admin xem toàn bộ lịch sử nạp tiền, đặt cược, trúng thưởng và rút tiền của User đó.
- **Tính năng Điều Chỉnh Số Dư (Chỉ dành cho Master Admin)**:
  - Cho phép Master Admin cộng hoặc trừ tiền thủ công khi xử lý khiếu nại.
  - Bắt buộc Admin nhập **"Lý do điều chỉnh"**.
  - Hệ thống ghi nhận biến động loại `admin_adjustment` và gửi cảnh báo về email `developervnteam@gmail.com`.

