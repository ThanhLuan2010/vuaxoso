# ĐẶC TẢ KỸ THUẬT GAME: KENO VIETLOTT (`keno`)

## 1. TỔNG QUAN GAME
- **Mã định danh hệ thống (`gameType`)**: `keno`, `bao_keno`, `clln_keno`.
- **Nhóm trò chơi**: Xổ số quay nhanh Vietlott (Fast Draw).
- **Chu kỳ mở thưởng**: **8 phút / 1 kỳ quay**, diễn ra liên tục từ **06:00 đến 21:55** hàng ngày (khoảng 96 kỳ/ngày).
- **Nguồn kết quả & Quy cách quay**:
  - Hệ thống rút ngẫu nhiên **20 con số** trong tập hợp từ **`01` đến `80`**.
  - **Cơ chế mở thưởng kép**:
    1. *Tự động (Auto)*: Backend cron tự động sinh ngẫu nhiên 20 số kết quả minh bạch đúng thời gian đếm ngược.
    2. *Thủ công (Manual / Livestream)*: Hỗ trợ Admin CMS nhập tay 20 con số kết quả khi tổ chức sự kiện quay số Livestream trực tiếp. Khi Admin đã nhập tay, kết quả nhập tay sẽ được ưu tiên tuyệt đối để kích hoạt dò vé.
- **Thời gian chốt vé (Cutoff Time)**: Chốt trước giờ mở thưởng **30 giây**. Khi còn 30 giây cuối cùng, hệ thống tự động khóa cược kỳ hiện tại và chuyển sang kỳ tiếp theo.

---

## 2. GIAO DIỆN & LUỒNG THAO TÁC TRÊN MOBILE APP (`KenoGameLayout.tsx`)

### 2.1. Màn hình chọn cược Keno
1. **Header**:
   - Nút Back (`<ArrowLeft />`).
   - Tiêu đề: "KENO - 8 PHÚT / KỲ".
   - Số dư ví realtime.
   - Nút hướng dẫn cơ cấu giải thưởng.
2. **Khu vực Thông tin Kỳ Quay & Đếm Ngược**:
   - Mã hiệu kỳ quay hiện tại (ví dụ: `#009124`).
   - Đồng hồ đếm ngược thời gian mở thưởng dạng `MM:SS` (nền cam nổi bật).
   - Nút mở Modal xem lịch sử kết quả các kỳ quay gần nhất.
3. **Thanh chọn Chế Độ Chơi (Tabs)**:
   - **Tab 1: Keno Cơ Bản (Bậc 1 đến Bậc 10)**:
     - Dải nút chọn bậc: `Bậc 1`, `Bậc 2`, `Bậc 3`, ..., `Bậc 10`.
     - Ứng với mỗi bậc, hệ thống bắt buộc người chơi chọn đúng số lượng số tương ứng (ví dụ: Bậc 3 chọn đúng 3 số; Bậc 10 chọn đúng 10 số).
     - Hiển thị giải thưởng cao nhất của bậc (ví dụ: Bậc 10: "Giải thưởng lên tới 2.000.000.000 VNĐ").
   - **Tab 2: Chẵn - Lẻ - Lớn - Nhỏ (`clln_keno`)**:
     - 6 cửa đặt cược trực quan:
       - **Lớn** (Từ 13 số trở lên trong khoảng 41-80) - Tỉ lệ `1 ăn 1.9`.
       - **Nhỏ** (Từ 13 số trở lên trong khoảng 01-40) - Tỉ lệ `1 ăn 1.9`.
       - **Hòa Lớn Nhỏ** (Đúng 10 số Lớn và 10 số Nhỏ) - Tỉ lệ `1 ăn 2.6`.
       - **Chẵn** (Từ 13 số chẵn trở lên) - Tỉ lệ `1 ăn 1.9`.
       - **Lẻ** (Từ 13 số lẻ trở lên) - Tỉ lệ `1 ăn 1.9`.
       - **Hòa Chẵn Lẻ** (Đúng 10 số Chẵn và 10 số Lẻ) - Tỉ lệ `1 ăn 2.6`.
   - **Tab 3: Bao Keno**:
     - Chọn từ 11 đến 20 số để hệ thống tự động bung các tổ hợp cược.
4. **Ma Trận 80 Bóng Số (Keno Matrix)**:
   - Lưới ma trận 80 bóng số tròn từ `01` đến `80`.
   - Trạng thái bóng số:
     - Chưa chọn: Nền trắng viền xám nhạt, chữ đen.
     - Đang chọn: Nền cam đậm, chữ trắng nổi bật.
   - Khống chế số lượng bóng: Không cho phép chọn vượt quá số lượng của Bậc đã chọn.
5. **Tiện ích Chọn Nhanh**:
   - `Tự chọn`: Hệ thống chọn ngẫu nhiên đủ số lượng bóng theo bậc.
   - `Xóa chọn`: Xóa trắng toàn bộ bóng đang chọn trên bảng.
6. **Bộ chọn Bội Số Tiền Cược & Số Kỳ Quay**:
   - Mức cược mặc định: `10.000 VNĐ / bộ`.
   - Nút chọn tiền nhanh: `10k`, `20k`, `50k`, `100k`, `200k`, `500k`.
   - Bộ chọn số kỳ quay liên tiếp: Cho phép đánh từ 1 đến 10 kỳ quay liên tiếp.
7. **Thanh Footer & Đặt Vé**:
   - Hiển thị tổng tiền: `Tổng tiền = Số bộ cược x Mức cược x Số kỳ quay`.
   - Nút [Thêm giỏ hàng] & Nút [Đặt vé ngay].

---

## 3. BẢNG CƠ CẤU GIẢI THƯỞNG KENO CƠ BẢN (CHO MỨC CƯỢC 10.000 VNĐ)

| Bậc Cược | Trùng Khớp | Tiền Thưởng (VNĐ) | Tỉ Lệ Ăn | Ghi Chú |
| :---: | :---: | :---: | :---: | :--- |
| **Bậc 1** | Trúng 1 số | **20.000** | x2 | |
| **Bậc 2** | Trúng 2 số | **90.000** | x9 | |
| **Bậc 3** | Trúng 3 số | **200.000** | x20 | |
| | Trúng 2 số | **20.000** | x2 | |
| **Bậc 4** | Trúng 4 số | **400.000** | x40 | |
| | Trúng 3 số | **50.000** | x5 | |
| | Trúng 2 số | **10.000** | x1 | Hoàn vốn |
| **Bậc 5** | Trúng 5 số | **4.400.000** | x440 | |
| | Trúng 4 số | **150.000** | x15 | |
| | Trúng 3 số | **20.000** | x2 | |
| **Bậc 6** | Trúng 6 số | **12.500.000** | x1.250 | |
| | Trúng 5 số | **450.000** | x45 | |
| | Trúng 4 số | **40.000** | x4 | |
| | Trúng 3 số | **10.000** | x1 | Hoàn vốn |
| **Bậc 7** | Trúng 7 số | **40.000.000** | x4.000 | |
| | Trúng 6 số | **1.200.000** | x120 | |
| | Trúng 5 số | **100.000** | x10 | |
| | Trúng 4 số | **20.000** | x2 | |
| | Trúng 0 số | **10.000** | x1 | Không trúng số nào vẫn có thưởng |
| **Bậc 8** | Trúng 8 số | **200.000.000** | x20.000 | |
| | Trúng 7 số | **5.000.000** | x500 | |
| | Trúng 6 số | **500.000** | x50 | |
| | Trúng 5 số | **50.000** | x5 | |
| | Trúng 0 số | **10.000** | x1 | |
| **Bậc 9** | Trúng 9 số | **800.000.000** | x80.000 | |
| | Trúng 8 số | **12.000.000** | x1.200 | |
| | Trúng 7 số | **1.500.000** | x150 | |
| | Trúng 6 số | **150.000** | x15 | |
| | Trúng 5 số | **10.000** | x1 | |
| | Trúng 0 số | **10.000** | x1 | |
| **Bậc 10** | **Trúng 10 số** | **2.000.000.000** | **x200.000** | Giải Jackpot Keno |
| | Trúng 9 số | **150.000.000** | x15.000 | |
| | Trúng 8 số | **7.400.000** | x740 | |
| | Trúng 7 số | **600.000** | x60 | |
| | Trúng 6 số | **80.000** | x8 | |
| | Trúng 5 số | **20.000** | x2 | |
| | **Trúng 0 số** | **10.000** | **x1** | |

---

## 4. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND

### 4.1. Payload Đặt Vé Keno (`POST /api/orders/checkout`)
```json
{
  "orders": [
    {
      "gameType": "keno",
      "playType": "Bậc 3",
      "drawId": "6640abc123456789",
      "drawCode": "#009124",
      "drawDate": "13/11/2026",
      "items": [
        {
          "id": "A",
          "playType": "Bậc 3",
          "numbers": ["05", "18", "72"],
          "baseCost": 10000,
          "multiplier": 2,
          "cost": 20000
        }
      ]
    }
  ]
}
```

### 4.2. Khống chế Rủi ro Keno (Excel Doc Note)
- Do Keno chỉ có 80 con số, hệ thống áp dụng:
  - Khống chế tối đa 1 user không được bao quá nhiều bộ số dẫn đến việc ôm trọn 80 số gây thâm hụt tài chính của nhà cái.
  - Trần thưởng tối đa cho 1 tài khoản trong 1 kỳ quay là **2.000.000.000 VNĐ**.

---

## 5. THUẬT TOÁN DÒ THƯỞNG KENO (`prizeService.ts`)

```typescript
// 20 số trúng thưởng của kỳ quay
const winNums = new Set(draw.winningNumbers); // e.g. ["03", "05", "12", ..., "79"]

// Dò từng item của khách
for (const item of order.items) {
  if (item.playType?.startsWith('Bậc')) {
    const matchCount = item.numbers.filter((num: string) => winNums.has(num)).length;
    const tier = item.numbers.length; // 1 -> 10
    const prizeMultiplier = KENO_PAYOUT_TABLE[tier][matchCount] || 0;
    const prize = (item.baseCost || 10000) * (item.multiplier || 1) * prizeMultiplier;
    totalPrize += prize;
  } else if (item.playType === 'clln_keno') {
    // So khớp Chẵn, Lẻ, Lớn, Nhỏ, Hòa
    const bigCount = draw.winningNumbers.filter(n => parseInt(n) >= 41).length;
    const evenCount = draw.winningNumbers.filter(n => parseInt(n) % 2 === 0).length;
    // Đối chiếu theo cửa cược
  }
}
```

---

## 6. GIAO DIỆN & VẬN HÀNH TRÊN CMS (`vuaxoso_cms`)

### 6.1. Quản lý Kỳ Quay Keno (`DrawManagement.tsx`)
- Danh sách kỳ quay 8 phút liên tục.
- Hiển thị trạng thái: `Đang mở cược`, `Chờ quay`, `Đã có kết quả`.
- Cột **Kết quả**: 20 bóng số tròn.
- Nút **"Nhập kết quả Livestream"**:
  - Cho phép Admin nhập nhanh 20 số kết quả nếu có buổi quay số trực tiếp.
  - Bấm "Xác nhận & Trả thưởng ngay": Hệ thống khóa kết quả và chạy `processDrawResults` thanh toán toàn bộ đơn hàng trong vòng 5 giây.

### 6.2. Quản lý Đơn Đặt Vé Keno (`OrderManagement.tsx`)
- Thể hiện rõ: Bậc cược, danh sách con số đã chọn, số lượng con số trùng khớp (highlight màu xanh lá), tổng tiền cược và tiền thắng.
- Hỗ trợ xuất dữ liệu ra file Excel theo ngày.

