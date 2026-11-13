# ĐẶC TẢ KỸ THUẬT GAME: ĐIỆN TOÁN BINGO 18 (`bingo18`)

## 1. TỔNG QUAN GAME
- **Mã định danh hệ thống (`gameType`)**: `bingo18`.
- **Nhóm trò chơi**: Xổ số quay nhanh Điện toán Vietlott (Fast Draw).
- **Chu kỳ mở thưởng**: Cố định **8 phút / 1 kỳ quay**, quay liên tục từ **06:00 đến 21:55** hàng ngày (khoảng 96 kỳ/ngày, khớp cấu hình hệ thống `badge: "8p-1 kỳ"`, cron `*/8 * * * *`).
- **Nguồn kết quả & Quy cách quay**:
  - Mỗi kỳ rút ngẫu nhiên **3 quả bóng**, mỗi quả có giá trị từ **`1` đến `6`** (tổng điểm từ `3` đến `18`).
  - **Cơ chế mở thưởng kép**:
    1. *Tự động (Auto)*: Backend tự động sinh 3 quả bóng ngẫu nhiên khi đếm ngược về 0.
    2. *Thủ công (Manual / Livestream)*: Hỗ trợ Admin CMS nhập tay 3 quả bóng kết quả khi tổ chức Livestream quay số trực tiếp.
- **Thời gian chốt vé (Cutoff Time)**: Chốt trước giờ mở thưởng **30 giây**.
- **Hiển thị kỳ mua**: Hiển thị ô đếm ngược và danh sách **10 kỳ quay gần nhất / kế tiếp**.

---

## 2. GIAO DIỆN & LUỒNG THAO TÁC TRÊN MOBILE APP (`GameLayoutBingo18Screen.tsx`)

### 2.1. Màn hình chọn cược Bingo 18
1. **Header**:
   - Nút Back (`<ArrowLeft />`).
   - Tiêu đề: "BINGO 18 - QUAY NHANH".
   - Giá trị giải thưởng cao nhất: "🏆 Giải thưởng lên tới 79.000.000 VNĐ".
   - Số dư ví realtime.
2. **Khu vực Thông tin Kỳ Quay & Đếm Ngược**:
   - Chèn ô hiển thị kỳ quay trên đầu: Số hiệu kỳ quay (ví dụ: `#008234`) kèm đồng hồ đếm ngược `MM:SS`.
   - Danh sách 10 kỳ quay gần nhất để khách theo dõi lịch sử về số.
3. **Danh mục Các Kiểu Chơi (Tabs & Sections)**:
   - **Mục 1: Một Số (Cược Số Đơn)**:
     - 6 nút chọn số: `1`, `2`, `3`, `4`, `5`, `6`.
     - Tỉ lệ trả thưởng:
       - Trùng 1 lần: `1 ăn 1.2` (trả về 12.000đ / vé 10k).
       - Trùng 2 lần (2 bóng giống nhau): `1 ăn 2.4` (trả về 24.000đ).
       - Trùng 3 lần (cả 3 bóng giống nhau): `1 ăn 3.6` (trả về 36.000đ).
   - **Mục 2: Hai Số Trùng (Cược Cặp)**:
     - 6 nút chọn cặp: `11`, `22`, `33`, `44`, `55`, `66`.
     - Tỉ lệ trả thưởng: `1 ăn 7.5` (trả về 75.000đ / vé 10k).
   - **Mục 3: Ba Số Trùng (Bão / Bộ 3 Đồng Nhất)**:
     - Nút **"Ba số trùng bất kỳ"** (kết quả ra bất kỳ bộ 3 nào từ 111-666): Tỉ lệ `1 ăn 32` (trả về 320.000đ).
     - 6 nút **"Ba số trùng chính xác"**: `111`, `222`, `333`, `444`, `555`, `666`. Tỉ lệ `1 ăn 120` (hoặc tính theo hệ số thưởng cao nhất lên tới 79.000.000đ).
   - **Mục 4: Chọn Tổng Của 3 Con Số (Tổng từ 3 đến 18)**:
     - Dải nút chọn tổng điểm: `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12`, `13`, `14`, `15`, `16`, `17`, `18`.
     - Bảng tỉ lệ trả thưởng tương ứng từng tổng điểm:
       - Tổng `3` hoặc `18`: `1 ăn 120`.
       - Tổng `4` hoặc `17`: `1 ăn 40`.
       - Tổng `5` hoặc `16`: `1 ăn 20`.
       - Tổng `6` hoặc `15`: `1 ăn 12`.
       - Tổng `7` hoặc `14`: `1 ăn 8`.
       - Tổng `8` hoặc `13`: `1 ăn 7`.
       - Tổng `9`, `10`, `11`, `12`: `1 ăn 6`.
   - **Mục 5: Tài - Xỉu - Hòa (Lớn - Nhỏ - Hòa)**:
     - **Tài (Lớn)**: Tổng điểm từ `11` đến `18` (ngoại trừ bộ 3 trùng). Tỉ lệ `1 ăn 2.0`.
     - **Xỉu (Nhỏ)**: Tổng điểm từ `3` đến `10` (ngoại trừ bộ 3 trùng). Tỉ lệ `1 ăn 2.0`.
     - **Hòa**: Tổng điểm bằng 10 hoặc 11. Tỉ lệ `1 ăn 2.6`.
4. **Bộ chọn Tiền Cược & Số Kỳ**:
   - Mức cược mặc định: `10.000 VNĐ / vé`.
   - Phím tắt cược nhanh: `10k`, `20k`, `50k`, `100k`, `200k`, `500k`.
   - Chọn đánh từ 1 đến 10 kỳ liên tiếp.
5. **Thanh Footer & Đặt Vé**:
   - Tạm tính tổng tiền cược.
   - Nút [Thêm giỏ hàng] & Nút [Đặt vé ngay].

---

## 3. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND

### 3.1. Payload Đặt Vé Bingo 18 (`POST /api/orders/checkout`)
```json
{
  "orders": [
    {
      "gameType": "bingo18",
      "playType": "Hai số trùng",
      "drawId": "6650def666666666",
      "drawCode": "#008234",
      "drawDate": "13/11/2026",
      "items": [
        {
          "id": "A",
          "playType": "Hai số trùng",
          "numbers": ["33"],
          "baseCost": 10000,
          "multiplier": 5,
          "cost": 50000
        }
      ]
    }
  ]
}
```

### 3.2. Thuật toán Dò Thưởng Bingo 18 (`prizeService.ts`)
```typescript
// 3 quả bóng kết quả từ 1 đến 6
const [b1, b2, b3] = draw.winningNumbers.map(Number);
const sum = b1 + b2 + b3;

// Đếm tần suất từng mặt xúc xắc
const counts: Record<number, number> = {};
[b1, b2, b3].forEach(n => { counts[n] = (counts[n] || 0) + 1; });

for (const item of order.items) {
  const mult = item.multiplier || 1;
  const base = item.baseCost || 10000;

  if (item.playType === 'Một số') {
    const chosen = Number(item.numbers[0]);
    const freq = counts[chosen] || 0;
    if (freq === 1) totalPrize += base * mult * 1.2;
    else if (freq === 2) totalPrize += base * mult * 2.4;
    else if (freq === 3) totalPrize += base * mult * 3.6;
  } else if (item.playType === 'Hai số trùng') {
    const pairDigit = Number(item.numbers[0].charAt(0));
    if ((counts[pairDigit] || 0) >= 2) {
      totalPrize += base * mult * 7.5;
    }
  } else if (item.playType === 'Ba số trùng') {
    const tripleDigit = Number(item.numbers[0].charAt(0));
    if (counts[tripleDigit] === 3) {
      totalPrize += base * mult * 120;
    }
  } else if (item.playType === 'Tổng') {
    const targetSum = Number(item.numbers[0]);
    if (sum === targetSum) {
      const rate = BINGO_SUM_RATES[targetSum] || 0;
      totalPrize += base * mult * rate;
    }
  } else if (item.playType === 'Tài') {
    if (sum >= 11 && sum <= 18) totalPrize += base * mult * 2.0;
  } else if (item.playType === 'Xỉu') {
    if (sum >= 3 && sum <= 10) totalPrize += base * mult * 2.0;
  }
}
```

---

## 4. GIAO DIỆN & VẬN HÀNH TRÊN CMS (`vuaxoso_cms`)
- **Quản lý kỳ quay**: Lọc theo `bingo18`. Hiển thị 3 ô số kết quả mở thưởng dạng bóng tròn số to rõ ràng.
- **Hỗ trợ Nhập kết quả Livestream**: Admin có thể nhập tay 3 bóng số từ 1 đến 6 và bấm nút thanh toán tức thì.
- **Thống kê đơn hàng**: Thống kê số lượng vé đặt theo từng cửa Tài/Xỉu/Tổng để theo dõi cân bằng rủi ro.

