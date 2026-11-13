# ĐẶC TẢ KỸ THUẬT TÍNH NĂNG / GAME: MUA CHUNG VIETLOTT (`mua_chung`)

## 1. TỔNG QUAN GAME & MÔ HÌNH HOẠT ĐỘNG
- **Mã định danh hệ thống (`gameType`)**: `mua_chung`.
- **Bản chất nghiệp vụ**: Tính năng góp vốn mua chung các bộ vé số Bao lớn (Bao 9 đến Bao 18) của **Power 6/55** hoặc **Mega 6/45**.
- **Mục tiêu**: Giúp người chơi có cơ hội tham gia các vé Bao lớn trị giá hàng chục đến hàng trăm triệu đồng với số vốn nhỏ (chỉ từ 10.000đ - 50.000đ), tối ưu hóa xác suất trúng giải Jackpot.
- **Quy tắc phân chia tiền thưởng**:
  - Khi phòng mua chung trúng bất kỳ giải thưởng nào (từ giải Ba đến Jackpot), tổng tiền thưởng sau khi trừ thuế thu nhập cá nhân (nếu có) sẽ được **tự động chia theo tỷ lệ phần trăm vốn góp (`percent`)** của từng thành viên.
  - Tiền thưởng được tự động cộng trực tiếp vào số dư ví của từng người chơi ngay khi kỳ quay hoàn tất dò vé.

---

## 2. GIAO DIỆN & LUỒNG THAO TÁC TRÊN MOBILE APP

### 2.1. Màn hình Danh Sách Phòng Mua Chung (`CoBuyScreen.tsx`)
1. **Header & Thống kê**:
   - Tiêu đề: "MUA CHUNG VIETLOTT".
   - Bộ lọc theo game: `Tất cả`, `Power 6/55`, `Mega 6/45`.
   - Bộ lọc trạng thái phòng: `Đang mở (Open)`, `Đã đầy (Full)`, `Lịch sử phòng đã xong`.
2. **Thẻ Phòng Mua Chung (Co-Buy Room Card)**:
   - Tên phòng & Mã phòng: Ví dụ `Phòng #PB10-092 (Bao 10 Power 6/55)`.
   - Dãy số vé bao đã chốt (ví dụ: 10 con số đã chọn).
   - Tổng giá trị phòng: Ví dụ `2.100.000 VNĐ`.
   - Mức góp tối thiểu: Ví dụ `21.000 VNĐ / 1%`.
   - Thanh tiến độ góp vốn (`Progress Bar`): Hiển thị phần trăm đã góp (ví dụ `75% - Còn thiếu 25%`).
   - Thời gian đếm ngược còn lại đến giờ chốt phòng.
   - Nút **[Tham gia góp vốn]**.

### 2.2. Màn hình Chi Tiết & Góp Vốn (`CoBuyDetailScreen.tsx` & `CoBuyPaymentScreen.tsx`)
1. **Thông tin chi tiết**:
   - Chi tiết kỳ quay, ngày mở thưởng, giờ chốt nhận góp.
   - Danh sách các thành viên đã tham gia góp và tỷ lệ phần trăm sở hữu.
2. **Bộ chọn Tỷ Lệ Góp Vốn**:
   - Thanh trượt (Slider) hoặc phím tắt chọn % muốn mua: `1%`, `5%`, `10%`, `20%`, `50%` hoặc tự nhập số tiền góp.
   - Hệ thống tự động tính: `Số tiền thanh toán = Tổng giá trị phòng x % muốn góp`.
3. **Xác nhận thanh toán**:
   - Trừ tiền ví User realtime.
   - Cập nhật thanh tiến độ phòng.
   - Nếu tiến độ đạt `100%`: Phòng tự động chuyển sang trạng thái `closed` (Đã đủ người, chờ mở thưởng).

### 2.3. Màn hình Lịch Sử Mua Chung (`CoBuyHistoryScreen.tsx`)
- Danh sách các phòng người chơi đã từng tham gia.
- Hiển thị rõ số vốn đã góp, % sở hữu, kết quả kỳ quay và số tiền thưởng thực nhận sau khi chia.

---

## 3. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND

### 3.1. Model Phòng Mua Chung (`CoBuyRoom.ts`)
```typescript
export interface ICoBuyParticipant {
  user: ObjectId;              // Ref to User
  percent: number;             // Phần trăm sở hữu (ví dụ 10.5%)
  cost: number;                // Số tiền đã đóng góp (VNĐ)
  joinedAt: Date;
}

export interface ICoBuyRoom extends Document {
  gameType: 'mega' | 'power';
  roomNum: string;             // Mã hiệu phòng duy nhất
  baoType: number;             // Loại bao (ví dụ 10)
  totalCost: number;           // Tổng chi phí mua vé bao (VNĐ)
  minGop: number;              // Số tiền góp tối thiểu cho 1 suất
  drawNum: string;             // Kỳ quay Vietlott
  drawDate: string;            // Ngày mở thưởng
  closeTime: string;           // Thời điểm chốt phòng
  progress: number;            // Tiến độ hoàn thành (0 - 100%)
  status: 'open' | 'closed' | 'completed';
  participants: ICoBuyParticipant[];
  ticketNumbers: string[];     // Danh sách con số của vé bao
  totalPrizeWon?: number;      // Tổng tiền trúng thưởng của cả phòng
}
```

### 3.2. API Tham Gia Phòng (`POST /api/cobuy/join`)
- **Headers**: `Authorization: Bearer <Token>`
- **Request Body**:
  ```json
  {
    "roomId": "6650def888888888",
    "percent": 15,
    "cost": 315000
  }
  ```
- **Xử lý Backend (`coBuyController.ts`)**:
  1. Kiểm tra phòng tồn tại và `status === 'open'`.
  2. Kiểm tra `progress + percent <= 100`. Nếu vượt quá: Trả lỗi `"Số phần trăm còn lại của phòng không đủ"`.
  3. Kiểm tra số dư ví User: `user.balance >= cost`.
  4. Trừ tiền ví User, tạo `BalanceHistory`: `type: 'cobuy_join'`.
  5. Thêm User vào mảng `participants`, cập nhật `progress += percent`.
  6. Nếu `progress === 100`: Chuyển `status = 'closed'`.

---

## 4. THUẬT TOÁN DÒ THƯỞNG & PHÂN BỔ TIỀN TRÚNG (`prizeService.ts`)

```typescript
// Khi kỳ quay hoàn tất và có kết quả:
const rooms = await CoBuyRoom.find({ 
  gameType: game.code === 'power_655' ? 'power' : 'mega', 
  drawNum: draw.drawCode, 
  status: 'closed' 
});

for (const room of rooms) {
  // 1. Tính tổng giải thưởng của vé bao theo winningNumbers của draw
  const totalRoomPrize = calculateBaoPrize(room.ticketNumbers, room.baoType, draw);
  room.totalPrizeWon = totalRoomPrize;
  room.status = 'completed';
  await room.save();

  if (totalRoomPrize > 0) {
    // 2. Chia thưởng cho từng thành viên theo đúng tỷ lệ phần trăm
    for (const p of room.participants) {
      const userPrize = Math.floor((totalRoomPrize * p.percent) / 100);
      if (userPrize > 0) {
        await User.findByIdAndUpdate(p.user, { $inc: { balance: userPrize } });
        await BalanceHistory.create({
          user: p.user,
          type: 'cobuy_prize',
          amount: userPrize,
          details: `Thưởng mua chung phòng ${room.roomNum} (${p.percent}%)`
        });
        // Gửi thông báo Push FCM
        sendFcmNotification(p.user, "🎉 Chúc mừng trúng thưởng Mua Chung!", `Bạn nhận được ${userPrize.toLocaleString()}đ từ phòng ${room.roomNum}`);
      }
    }
  }
}
```

---

## 5. GIAO DIỆN & VẬN HÀNH TRÊN CMS (`vuaxoso_cms`)
- **Quản lý phòng Mua Chung**:
  - Tạo phòng mua chung mới: Chọn Game (Power / Mega), Chọn loại Bao (Bao 8 đến Bao 18), chọn danh sách con số, cấu hình mức góp tối thiểu.
  - Xem danh sách người tham gia và tiến độ của từng phòng.
  - Upload ảnh chụp tờ vé bao vật lý thực tế đã in tại đại lý cho phòng.
  - Thao tác đóng phòng thủ công hoặc hủy phòng hoàn tiền lại 100% cho người chơi nếu phòng không đủ người trước giờ quay.

