# ĐẶC TẢ KỸ THUẬT GAME: TRƯỢT LÔ TÔ (`truot_loto`)

## 1. TỔNG QUAN GAME
- **Mã định danh hệ thống (`gameType`)**: `truot_loto`.
- **Nhóm trò chơi**: Xổ số Điện toán Trượt Lô Tô theo kết quả Xổ số Miền Bắc (XSMB).
- **Lịch mở thưởng**: **18:15 hàng ngày** theo lịch quay XSMB.
- **Thời gian chốt nhận vé (Cutoff Time)**: **17:20** cùng ngày (chốt trước 55 phút để phòng ngừa rủi ro cược muộn).
- **Quy cách hiển thị kỳ mua**: Hiển thị danh sách kéo chọn **10 kỳ quay kế tiếp** để khách đặt trước.
- **Quy luật thắng cược**:
  - Người chơi chọn các bộ số gồm 2 chữ số (từ `00` đến `99`).
  - **Điều kiện thắng**: TẤT CẢ các con số trong bộ cược đều **KHÔNG ĐƯỢC XUẤT HIỆN** trong bất kỳ giải nào của bảng 27 giải kết quả XSMB. Chỉ cần **có mặt 1 con số** trong kết quả là đơn cược bị tính **THUA**.
- **Phân loại cược**:
  - **Trượt 4 Cặp**: Chọn đúng 4 con số khác nhau.
  - **Trượt 8 Cặp**: Chọn đúng 8 con số khác nhau.
  - **Trượt 10 Cặp**: Chọn đúng 10 con số khác nhau.

---

## 2. GIAO DIỆN & LUỒNG THAO TÁC TRÊN MOBILE APP (`StandardLotteryLayout.tsx`)

### 2.1. Màn hình chọn cược Trượt Lô Tô
1. **Header**:
   - Nút Back (`<ArrowLeft />`).
   - Tiêu đề: "TRƯỢT LÔ TÔ - THEO XSMB".
   - Tỉ lệ thưởng nổi bật: "🏆 Trượt 10 ăn tới x12 lần".
   - Số dư ví realtime.
2. **Khu vực Chọn Kỳ Quay (Draw Picker)**:
   - Hiển thị ngày mở thưởng và thời gian đếm ngược đến 17:20.
   - Hỗ trợ cuộn chọn 10 kỳ quay kế tiếp.
3. **Thanh chọn Loại Cược (Tabs)**:
   - `Trượt 4`: Hiển thị giao diện bố cục đúng **4 ô nhập trên cùng 1 hàng**.
   - `Trượt 8`: Hiển thị giao diện bố cục đúng **8 ô nhập trên cùng 1 hàng**.
   - `Trượt 10`: Hiển thị giao diện bố cục đúng **10 ô nhập trên cùng 1 hàng**.
4. **Bàn Phím Chọn Số / Nhập Nhanh**:
   - Chọn lần lượt các con số từ `00` đến `99` để lấp đầy các ô trên hàng.
   - Cơ chế tự động loại bỏ số trùng lặp nếu khách chọn hoặc dán chuỗi số trùng.
   - Nút `TC` (Tự chọn ngẫu nhiên đủ số lượng ô cho hàng cược).
   - Nút `Xóa` trắng hàng.
5. **Cột Mệnh Giá Tiền Cược Đầy Đủ**:
   - Cung cấp đầy đủ các mức tiền cược phím tắt chuẩn:
     - `10.000đ`
     - `20.000đ`
     - `30.000đ`
     - `40.000đ`
     - `50.000đ`
6. **Thanh Footer & Tạm Tính**:
   - Tính toán chính xác: Khi khách đặt ngẫu nhiên $N$ vé thì tạm tính hiển thị đủ $N$ vé theo công thức:
     $$\text{Tạm tính} = N \times \text{Mức cược} \times \text{Số kỳ quay}$$
   - Hiển thị Tỉ lệ thắng tương ứng: `x2.3`, `x8`, `x12`.
   - Nút [Thêm giỏ hàng] & Nút [Đặt vé ngay].

---

## 3. BẢNG CƠ CẤU TỈ LỆ THẮNG TRƯỢT LÔ TÔ

| Loại Cược | Số Lượng Con Số Bắt Buộc | Bố Cục Giao Diện Ô Nhập | Tỉ Lệ Thắng (1 ăn X) | Điều Kiện Thắng |
| :--- | :---: | :---: | :---: | :--- |
| **Trượt 4** | 4 con số | Đúng 4 ô trên 1 hàng | **x2.3** | Cả 4 con đều không xuất hiện trong 27 giải XSMB |
| **Trượt 8** | 8 con số | Đúng 8 ô trên 1 hàng | **x8.0** | Cả 8 con đều không xuất hiện trong 27 giải XSMB |
| **Trượt 10** | 10 con số | Đúng 10 ô trên 1 hàng | **x12.0** | Cả 10 con đều không xuất hiện trong 27 giải XSMB |

---

## 4. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND

### 4.1. Payload Đặt Vé Trượt Lô Tô (`POST /api/orders/checkout`)
```json
{
  "orders": [
    {
      "gameType": "truot_loto",
      "playType": "Trượt 4",
      "drawId": "sched_2026-11-13",
      "drawDate": "13/11/2026",
      "items": [
        {
          "id": "A",
          "playType": "Trượt 4",
          "numbers": ["01", "07", "43", "89"],
          "baseCost": 10000,
          "multiplier": 3,
          "cost": 30000
        }
      ]
    }
  ]
}
```

### 4.2. Thuật toán Dò Thưởng Trượt Lô Tô (`prizeService.ts`)
```typescript
// Tập hợp 2 số cuối của 27 giải XSMB
const mbLast2Set = new Set(drawMB.winningNumbers.map(n => n.slice(-2)));

for (const item of order.items) {
  // Điều kiện thắng: KHÔNG con số nào xuất hiện trong kết quả XSMB
  const hasAnyMatch = item.numbers.some(num => mbLast2Set.has(num));

  if (!hasAnyMatch) {
    let rate = 2.3;
    if (item.numbers.length === 8) rate = 8.0;
    else if (item.numbers.length === 10) rate = 12.0;

    totalPrize += (item.baseCost || 10000) * (item.multiplier || 1) * rate;
  }
}
```

---

## 5. GIAO DIỆN & VẬN HÀNH TRÊN CMS (`vuaxoso_cms`)
- Tự động kích hoạt dò thưởng ngay khi kết quả XSMB của ngày hôm đó được lưu vào hệ thống.
- Chi tiết đơn hàng: Đánh dấu màu đỏ các con số bị "dính lô" (khiến vé bị thua), hoặc đánh dấu màu xanh nếu tất cả các số đều trượt thành công.

