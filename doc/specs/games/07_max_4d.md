# ĐẶC TẢ KỸ THUẬT GAME: MAX 4D (`max_4d`)

## 1. TỔNG QUAN GAME
- **Mã định danh hệ thống (`gameType`)**: `max_4d`.
- **Nhóm trò chơi**: Xổ số ma trận 4 chữ số Vietlott (`0000` đến `9999`).
- **Lịch mở thưởng**: **18:00 hàng ngày** (theo chỉ thị tại sheet `Các trò chơi khác` row 27).
- **Thời gian chốt nhận vé (Cutoff Time)**: **17:20** cùng ngày (trước giờ mở thưởng 40 phút). Quá giờ chốt vé, hệ thống tự động khóa cược hôm nay và chuyển sang các kỳ tiếp theo.
- **Hiển thị kỳ mua**: Cho phép hiển thị danh sách kéo chọn **10 kỳ quay gần nhất / kế tiếp**.
- **Cơ chế mở thưởng**: Nhập kết quả thủ công từ CMS theo kết quả mở thưởng chính thức của Vietlott.

---

## 2. GIAO DIỆN & LUỒNG THAO TÁC TRÊN MOBILE APP (`GameLayoutBScreen.tsx`)

### 2.1. Màn hình chọn cược Max 4D
1. **Header**:
   - Nút Back (`<ArrowLeft />`).
   - Tiêu đề: "MAX 4D".
   - Giá trị giải thưởng cao nhất: "🏆 Giải Nhất lên tới 15.000.000 VNĐ / vé 10k".
   - Số dư ví realtime.
2. **Khu vực Chọn Kỳ Quay (Draw Picker Modal)**:
   - Hiển thị kỳ quay hiện tại và đồng hồ đếm ngược đến 17:20.
   - Bấm vào mở danh sách cuộn **10 kỳ quay kế tiếp** (hiển thị rõ Ngày - Thứ - Giờ xổ) để người chơi đặt vé dài hạn.
3. **Thanh chọn Chế Độ Chơi (Tabs)**:
   - **Cơ bản**: Chọn 1 bộ gồm đúng 4 chữ số (ví dụ: `2849`). Hỗ trợ tối đa 6 bảng cược (Bảng A đến F).
   - **Bao Bộ Số (Tổ hợp)**: Chọn 4 chữ số và hệ thống tự động đảo hoán vị tạo thành các tổ hợp số (Bao 4, Bao 6, Bao 12, Bao 24).
   - **Cuộn Đầu (Roll First)**: Giữ cố định 3 chữ số cuối, chữ số đầu tiên cuộn từ 0 đến 9 (tạo thành 10 bộ số).
   - **Cuộn Đuôi (Roll Last)**: Giữ cố định 3 chữ số đầu, chữ số cuối cùng cuộn từ 0 đến 9 (tạo thành 10 bộ số).
4. **Bàn Phím Chọn Số Ma Trận 4 Cột**:
   - 4 cột chọn số tương ứng: Hàng Nghìn (`0-9`), Hàng Trăm (`0-9`), Hàng Chục (`0-9`), Hàng Đơn Vị (`0-9`).
   - Nút `TC` (Tự chọn nhanh 4 số ngẫu nhiên).
   - Nút `Xóa` trắng bảng.
5. **Cột Mệnh Giá Tiền Cược Đầy Đủ**:
   - Cung cấp đầy đủ các mức cược phím tắt chuẩn theo yêu cầu:
     - `10.000đ`
     - `20.000đ`
     - `30.000đ`
     - `40.000đ`
     - `50.000đ`
   - Tiền thưởng trúng giải được nhân theo tỷ lệ tương ứng với mệnh giá vé cược.
6. **Thanh Footer & Đặt Vé**:
   - Tạm tính tổng tiền cược.
   - Nút [Thêm giỏ hàng] & Nút [Đặt vé ngay].

---

## 3. BẢNG CƠ CẤU GIẢI THƯỞNG MAX 4D (MỨC CƯỢC 10.000 VNĐ)

| Tên Giải | Điều Kiện Trùng Khớp | Giá Trị Giải Thưởng (VNĐ) | Tỉ Lệ Ăn |
| :--- | :--- | :--- | :---: |
| **Giải Nhất** | Trùng khớp **4 chữ số giải Nhất** theo đúng thứ tự | **15.000.000 VNĐ** | x1.500 |
| **Giải Nhì** | Trùng khớp 1 trong 2 số thuộc giải Nhì | **6.500.000 VNĐ** | x650 |
| **Giải Ba** | Trùng khớp 1 trong 3 số thuộc giải Ba | **3.000.000 VNĐ** | x300 |
| **Giải Khuyến Khích 1** | Trùng khớp **3 chữ số cuối** của giải Nhất | **1.000.000 VNĐ** | x100 |
| **Giải Khuyến Khích 2** | Trùng khớp **2 chữ số cuối** của giải Nhất | **100.000 VNĐ** | x10 |

*Quy tắc cộng dồn giải*: Nếu vé cược trúng nhiều hạng giải khác nhau, người chơi được nhận đầy đủ tổng giá trị giải thưởng của tất cả các hạng giải đã trúng.

---

## 4. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND

### 4.1. Payload Đặt Vé Max 4D (`POST /api/orders/checkout`)
```json
{
  "orders": [
    {
      "gameType": "max_4d",
      "playType": "Cơ bản",
      "drawId": "6650def333333333",
      "drawCode": "#00812",
      "drawDate": "13/11/2026",
      "items": [
        {
          "id": "A",
          "playType": "Cơ bản",
          "numbers": ["8294"],
          "baseCost": 10000,
          "multiplier": 3,
          "cost": 30000
        }
      ]
    }
  ]
}
```

### 4.2. Thuật toán Dò Thưởng Max 4D (`prizeService.ts`)
```typescript
// Kết quả mở thưởng gồm:
// - Giải Nhất: 1 số 4 chữ số (g1)
// - Giải Nhì: 2 số 4 chữ số (g2_1, g2_2)
// - Giải Ba: 3 số 4 chữ số (g3_1, g3_2, g3_3)

for (const item of order.items) {
  const num = item.numbers[0]; // e.g. "8294"
  const mult = item.multiplier || 1;

  if (num === g1) {
    totalPrize += 15000000 * mult;
  }
  if (num === g2_1 || num === g2_2) {
    totalPrize += 6500000 * mult;
  }
  if (num === g3_1 || num === g3_2 || num === g3_3) {
    totalPrize += 3000000 * mult;
  }
  if (num.slice(1) === g1.slice(1)) {
    // Trùng 3 số cuối giải Nhất
    totalPrize += 1000000 * mult;
  }
  if (num.slice(2) === g1.slice(2)) {
    // Trùng 2 số cuối giải Nhất
    totalPrize += 100000 * mult;
  }
}
```

---

## 5. GIAO DIỆN & VẬN HÀNH TRÊN CMS (`vuaxoso_cms`)
- **Quản lý kỳ quay**: Lọc theo `max_4d`, mở modal nhập kết quả gồm 6 bộ 4 số: Giải Nhất (1 số), Giải Nhì (2 số), Giải Ba (3 số).
- **Kiểm tra hợp lệ**: Bắt buộc mỗi số gồm đúng 4 chữ số (từ 0000 đến 9999).
- **Trả thưởng**: Tự động duyệt đơn hàng và cập nhật tiền thưởng vào tài khoản khách hàng.

