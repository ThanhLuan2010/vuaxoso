# ĐẶC TẢ TÍNH NĂNG: QUẢN LÝ KỲ QUAY, NHẬP KẾT QUẢ & TRẢ THƯỞNG (`draw_result_settlement`)

## 1. TỔNG QUAN TÍNH NĂNG
- Hệ thống quản lý vòng đời toàn diện của các kỳ quay mở thưởng: Khởi tạo kỳ quay, đếm ngược thời gian mở cược, tự động khóa nhận vé tại mốc Cutoff Time, nhập kết quả mở thưởng, kích hoạt động cơ dò thưởng tự động (`prizeService`) và xử lý các tình huống khẩn cấp (sửa sai kết quả, hold rút tiền, hủy kỳ quay hoàn tiền).
- **Quy tắc Nghiệp vụ Cốt lõi (Business Rules)**:
  1. **Đồng bộ Thời Gian Chốt Nhận Vé (Cutoff Time)**:
     - Miền Nam (MN): Chốt vé lúc **16:10** (Mở thưởng 16:15).
     - Miền Trung (MT): Chốt vé lúc **17:10** (Mở thưởng 17:15).
     - Miền Bắc (MB): Chốt vé lúc **18:10** (Mở thưởng 18:15).
     - Vietlott / Điện toán: Chốt vé trước giờ mở thưởng từ 15 đến 40 phút theo quy định từng game.
     - Keno / Bingo 18: Chốt vé trước giờ mở thưởng **30 giây**.
  2. **Cơ chế Nhập Kết Quả: Thủ Công là Tiên Quyết**:
     - Các game truyền thống (MB, MT, MN, Vietlott, Điện toán): Tắt hoàn toàn cơ chế cào tự động từ web ngoài nhằm ngăn ngừa rủi ro web nguồn bị hack/sửa số ảo; 100% do Admin CMS kiểm tra và nhập tay chính thức.
     - Riêng Keno & Bingo 18: Duy trì cơ chế kép (Tự động sinh kết quả minh bạch & Cho phép Admin nhập tay ghi đè khi tổ chức quay số Livestream).
  3. **Quy trình Sửa Kết Quả & Khóa Rút Tiền Khẩn Cấp**:
     - Khi Admin phát hiện nhập sai kết quả của một kỳ quay đã trả thưởng:
       1. Hệ thống **tự động kích hoạt công tắc Hold Rút Tiền toàn hệ thống** để tránh người chơi rút tiền thưởng nhầm.
       2. Master Admin thực hiện sửa lại kết quả kỳ quay chính xác.
       3. Hệ thống chạy thuật toán rollback & recalculate: Thu hồi số dư trúng nhầm và thanh toán tiền trúng chuẩn xác cho các vé hợp lệ.
       4. Master Admin kiểm tra đối soát số dư rồi mới mở lại cổng rút tiền.
  4. **Quyền Xóa / Chỉnh Sửa Kỳ Quay Cũ Dành Cho Master Admin**: Cung cấp nút xóa hoặc chỉnh sửa kỳ quay cũ để dọn dẹp các kỳ rác hoặc cấu hình lại lịch quay.
  5. **Tự Động Hủy & Hoàn Tiền Khi Hủy Kỳ Quay**: Nếu một đài/kỳ quay bị hoãn hoặc hủy bỏ, hệ thống tự động hoàn lại 100% tiền vé vào ví cho người chơi (`refund`).

---

## 2. GIAO DIỆN & VẬN HÀNH TRÊN CMS (`DrawManagement.tsx`)

### 2.1. Danh Sách Kỳ Quay
- **Bộ lọc**: Chọn Game (Lô đề 3 miền, Keno, Vietlott, Điện toán...), Chọn Đài tỉnh, Chọn Ngày mở thưởng, Lọc theo trạng thái (`Chờ mở cược`, `Đang nhận cược`, `Đã đóng cược`, `Đã hoàn thành`).
- **Bảng hiển thị**:
  - Mã kỳ quay (ví dụ `#009124`).
  - Tên game / Đài tỉnh.
  - Giờ chốt vé & Giờ mở thưởng (hiển thị rõ `HH:mm:ss DD/MM/YYYY`).
  - Kết quả mở thưởng (các bóng số hoặc danh sách các giải).
  - Trạng thái kỳ quay.
- **Các Nút Hành Động**:
  - **[Nhập Kết Quả]**: Mở Form nhập các giải mở thưởng.
  - **[Sửa Kết Quả]**: (Chỉ hiện với Master Admin) - Cho phép sửa số trúng thưởng kèm cảnh báo tự động Hold rút tiền.
  - **[Dò Vé Lại (Re-run Prize)]**: Kích hoạt quét và tính lại tiền thưởng cho toàn bộ đơn hàng của kỳ đó.
  - **[Hủy Kỳ & Hoàn Tiền]**: Hủy kỳ quay và kích hoạt hoàn tiền tự động cho tất cả đơn hàng đã đặt.
  - **[Xóa Kỳ Quay Cũ]**: (Chỉ hiện với Master Admin) - Xóa bỏ kỳ quay cũ không có đơn cược.

### 2.2. Modal Nhập Kết Quả Lô Đề 3 Miền
- **Miền Bắc (27 Giải)**:
  - Giải ĐB (5 chữ số).
  - Giải Nhất (5 chữ số).
  - Giải Nhì (2 giải, mỗi giải 5 chữ số).
  - Giải Ba (6 giải, mỗi giải 5 chữ số).
  - Giải Tư (4 giải, mỗi giải 4 chữ số).
  - Giải Năm (6 giải, mỗi giải 4 chữ số).
  - Giải Sáu (3 giải, mỗi giải 3 chữ số).
  - Giải Bảy (4 giải, mỗi giải 2 chữ số).
- **Miền Nam & Miền Trung (18 Giải)**:
  - Nhập từ Giải Đặc Biệt (6 chữ số) đến Giải Tám (2 chữ số).
- Nút **[Xác nhận & Trả thưởng ngay]**: Sau khi nhập đủ, bấm nút này để hệ thống khóa kết quả và chạy ngầm `processDrawResults`.

---

## 3. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND

### 3.1. Model Kỳ Quay (`Draw.ts`)
```typescript
export interface IDraw extends Document {
  game: ObjectId;              // Ref to Game
  drawCode: string;            // Mã kỳ quay (#01024)
  drawDate: string;            // DD/MM/YYYY
  provinceId?: string;         // Mã tỉnh: 'MB', 'HCM', 'DN'...
  closeTime: Date;             // Thời điểm chốt vé cược (Cutoff Time)
  drawTime: Date;              // Thời điểm mở thưởng
  winningNumbers: string[];    // Danh sách số kết quả trúng thưởng
  specialNumber?: string;      // Số phụ (Power bonus, Mega Ball)
  status: 'upcoming' | 'active' | 'closed' | 'completed' | 'cancelled';
  isAutoResult: boolean;       // True nếu sinh tự động, False nếu nhập tay
  settledAt?: Date;            // Thời điểm hoàn tất trả thưởng
  updatedBy?: ObjectId;        // Admin sửa đổi kết quả
}
```

### 3.2. Quy Trình Sửa Kết Quả & Điều Chỉnh Tiền Thưởng (`drawController.ts`)
```typescript
export const updateDrawResultAndResettle = async (req: any, res: Response) => {
  const { drawId } = req.params;
  const { winningNumbers, specialNumber, reason } = req.body;

  // 1. TỰ ĐỘNG BẬT HOLD RÚT TIỀN TOÀN HỆ THỐNG
  await Setting.findOneAndUpdate(
    { key: 'SYSTEM_HOLD_WITHDRAW' },
    { value: true, updatedBy: req.user._id, updatedAt: new Date() },
    { upsert: true }
  );

  // 2. Ghi nhận nhật ký khẩn cấp
  await AdminLog.create({
    adminId: req.user._id,
    adminName: req.user.name,
    action: 'RESYNC_DRAW_EMERGENCY',
    details: `Sửa kết quả kỳ quay ${drawId}. Lý do: ${reason}. Hệ thống tự động kích hoạt HOLD RÚT TIỀN.`
  });

  // 3. Cập nhật kết quả mới vào Draw
  const draw = await Draw.findById(drawId);
  draw.winningNumbers = winningNumbers;
  if (specialNumber) draw.specialNumber = specialNumber;
  draw.status = 'completed';
  await draw.save();

  // 4. Kích hoạt xử lý lại toàn bộ đơn cược của kỳ này
  await resettleOrdersForDraw(draw);

  res.json({ message: "Đã cập nhật kết quả và chạy lại dò thưởng. Cổng rút tiền đang được tạm khóa để kiểm tra an toàn!" });
};
```

### 3.3. Quy Trình Hủy Kỳ Quay & Hoàn Tiền Tự Động
```typescript
export const cancelDrawAndRefund = async (drawId: string, reason: string) => {
  const draw = await Draw.findById(drawId);
  draw.status = 'cancelled';
  await draw.save();

  const orders = await Order.find({ drawId, status: 'pending' });
  for (const order of orders) {
    order.status = 'cancelled';
    await order.save();

    // Hoàn trả 100% tiền cược vào ví user
    await adjustUserBalance({
      userId: order.user,
      amount: order.totalCost,
      type: 'refund',
      referenceId: order.orderId,
      details: `Hoàn tiền vé cược do hủy kỳ quay ${draw.drawCode}: ${reason}`
    });
  }
};
```

