# ĐẶC TẢ KỸ THUẬT GAME: LÔ TÔ CẶP SỐ (`loto_cap`)

## 1. TỔNG QUAN GAME
- **Mã định danh hệ thống (`gameType`)**: `loto_cap`.
- **Nhóm trò chơi**: Xổ số Lô tô Cặp Điện toán (Lô xiên tổ hợp theo kết quả XSMB).
- **Lịch mở thưởng**: **18:15 hàng ngày** theo lịch quay Xổ số Miền Bắc.
- **Thời gian chốt vé (Cutoff Time)**: **18:10** cùng ngày (trước giờ mở thưởng 5 phút).
- **Quy luật trúng thưởng**:
  - Người chơi chọn các cặp số (mỗi cặp gồm 2 chữ số từ `00` đến `99`).
  - **Điều kiện thắng**: TẤT CẢ các con số trong bộ cược đều phải xuất hiện trong bảng 27 giải kết quả XSMB. Chỉ cần thiếu 1 con số $\rightarrow$ Thua.
- **Phân loại cược**:
  - **Lô 2 Cặp Số**: Chọn 2 con số lô khác nhau (ví dụ: `12` & `34`).
  - **Lô 3 Cặp Số**: Chọn 3 con số lô khác nhau (ví dụ: `12` & `34` & `56`).
  - **Lô 4 Cặp Số**: Chọn 4 con số lô khác nhau (ví dụ: `12` & `34` & `56` & `78`).

---

## 2. GIAO DIỆN & LUỒNG THAO TÁC TRÊN MOBILE APP (`StandardLotteryLayout.tsx`)

### 2.1. Màn hình chọn cược Lô Tô Cặp
1. **Header**:
   - Nút Back (`<ArrowLeft />`).
   - Tiêu đề: "LÔ TÔ 2, 3, 4 CẶP SỐ - XSMB".
   - Số dư ví realtime.
2. **Khu vực Thông tin Kỳ Quay & Đếm Ngược**:
   - Hiển thị ngày mở thưởng XSMB hôm nay.
   - Đồng hồ đếm ngược đến 18:10.
3. **Thanh chọn Phân Loại Cược (Tabs)**:
   - `Lô 2 Cặp Số`: Yêu cầu chọn đúng 2 con số.
   - `Lô 3 Cặp Số`: Yêu cầu chọn đúng 3 con số.
   - `Lô 4 Cặp Số`: Yêu cầu chọn đúng 4 con số.
4. **Khu vực Chọn Số**:
   - Hiển thị các ô trống tương ứng với số lượng cặp số cần chọn.
   - Bàn phím số ma trận từ `00` đến `99` hoặc ô nhập nhanh chuỗi số.
   - Cơ chế tự động loại bỏ số trùng lặp và báo lỗi nếu nhập thiếu/thừa số.
5. **Bộ chọn Tiền Cược (Multiplier)**:
   - Mức cược tối thiểu: `10.000 VNĐ / vé`.
   - Phím tắt cược nhanh: `10k`, `20k`, `30k`, `40k`, `50k`, `100k`.
6. **Thanh Footer & Đặt Vé**:
   - Tạm tính tổng tiền cược.
   - Nút [Thêm giỏ hàng] & Nút [Đặt vé ngay].

---

## 3. BẢNG CƠ CẤU TỈ LỆ TRẢ THƯỞNG LÔ TÔ CẶP

| Loại Cược | Số Lượng Con Số | Điều Kiện Thắng | Tỉ Lệ Thắng (1 ăn X) |
| :--- | :---: | :--- | :---: |
| **Lô 2 Cặp Số** | 2 con số | Cả 2 con đều xuất hiện trong 27 giải XSMB | **x15** |
| **Lô 3 Cặp Số** | 3 con số | Cả 3 con đều xuất hiện trong 27 giải XSMB | **x50** |
| **Lô 4 Cặp Số** | 4 con số | Cả 4 con đều xuất hiện trong 27 giải XSMB | **x150** |

---

## 4. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND

### 4.1. Payload Đặt Vé Lô Tô Cặp (`POST /api/orders/checkout`)
```json
{
  "orders": [
    {
      "gameType": "loto_cap",
      "playType": "Lô 2 Cặp",
      "drawId": "sched_2026-11-13",
      "drawDate": "13/11/2026",
      "items": [
        {
          "id": "A",
          "playType": "Lô 2 Cặp",
          "numbers": ["18", "81"],
          "baseCost": 10000,
          "multiplier": 2,
          "cost": 20000
        }
      ]
    }
  ]
}
```

### 4.2. Thuật toán Dò Thưởng Lô Tô Cặp (`prizeService.ts`)
```typescript
// Tập hợp 2 số cuối của 27 giải XSMB
const mbLast2Set = new Set(drawMB.winningNumbers.map(n => n.slice(-2)));

for (const item of order.items) {
  // Kiểm tra xem tất cả con số khách chọn có nằm trong mbLast2Set không
  const isAllMatch = item.numbers.every(num => mbLast2Set.has(num));

  if (isAllMatch) {
    let rate = 15;
    if (item.numbers.length === 3) rate = 50;
    else if (item.numbers.length === 4) rate = 150;

    totalPrize += (item.baseCost || 10000) * (item.multiplier || 1) * rate;
  }
}
```

---

## 5. GIAO DIỆN & VẬN HÀNH TRÊN CMS (`vuaxoso_cms`)
- Tự động dò thưởng ngay khi kết quả XSMB của ngày hôm đó được lưu vào hệ thống.
- Quản lý đơn hàng: Thể hiện chi tiết các cặp số, highlight các con số trúng và trạng thái thắng/thua.

