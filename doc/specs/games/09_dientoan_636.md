# ĐẶC TẢ KỸ THUẬT GAME: ĐIỆN TOÁN 6X36 & BAO 6X36 (`dientoan_636`, `bao_636`)

## 1. TỔNG QUAN GAME
- **Mã định danh hệ thống (`gameType`)**: `dientoan_636`, `bao_636`.
- **Nhóm trò chơi**: Xổ số Điện toán Ma trận truyền thống (Công ty Xổ số Thủ Đô).
- **Lịch mở thưởng**: **Thứ 4 & Thứ 7** hàng tuần lúc **18:15**.
- **Thời gian chốt vé (Cutoff Time)**: **18:10** cùng ngày (trước giờ quay 5 phút).
- **Quy cách quay thưởng**:
  - Rút ngẫu nhiên **6 con số** trong tập hợp từ **`01` đến `36`**.
  - Không có số phụ.
- **Cơ chế mở thưởng**: Nhập kết quả thủ công từ CMS dựa trên kết quả mở thưởng chính thức của Xổ số Thủ Đô.

---

## 2. GIAO DIỆN & LUỒNG THAO TÁC TRÊN MOBILE APP (`GameLayoutAScreen.tsx`)

### 2.1. Màn hình chọn cược Điện Toán 6x36
1. **Header**:
   - Nút Back (`<ArrowLeft />`).
   - Tiêu đề: "ĐIỆN TOÁN 6X36 - THỨ 4 & THỨ 7".
   - Giá trị giải thưởng Jackpot: "🏆 Giải Đặc Biệt: > 1.000.000.000 VNĐ + Tích lũy".
   - Số dư ví realtime.
2. **Khu vực Thông tin Kỳ Quay & Đếm Ngược**:
   - Hiển thị ngày mở thưởng và số hiệu kỳ quay.
   - Đồng hồ đếm ngược đến 18:10 ngày mở thưởng.
3. **Thanh chọn Chế Độ Chơi (Tabs)**:
   - **Cơ bản**: Chọn 6 số từ `01` đến `36`. Hỗ trợ tối đa 6 bảng cược (Bảng A đến F).
   - **Bao 6x36 (`bao_636`)**:
     - Bao 7 (Chọn 7 số $\rightarrow$ 7 bộ $\rightarrow$ 70.000đ).
     - Bao 8 (Chọn 8 số $\rightarrow$ 28 bộ $\rightarrow$ 280.000đ).
     - Bao 9 (Chọn 9 số $\rightarrow$ 84 bộ $\rightarrow$ 840.000đ).
     - Bao 10 (Chọn 10 số $\rightarrow$ 210 bộ $\rightarrow$ 2.100.000đ).
     - Bao 11 đến Bao 18 (Tương tự công thức tổ hợp $C_N^6$).
4. **Bàn Phím Ma Trận 36 Bóng Số**:
   - Lưới ma trận các bóng từ `01` đến `36`.
   - Màu sắc nhận diện: Xanh dương đậm (`#004F9F`).
   - Nút `TC` (Tự chọn nhanh) và `Xóa` trắng từng bảng.
5. **Thanh Footer & Đặt Vé**:
   - Tạm tính tổng tiền: `Tổng tiền = Số bộ cược x 10.000 VNĐ x Số kỳ`.
   - Nút [Thêm giỏ hàng] & Nút [Đặt vé ngay].

---

## 3. BẢNG CƠ CẤU GIẢI THƯỞNG ĐIỆN TOÁN 6X36 (MỨC CƯỢC 10.000 VNĐ)

| Tên Giải | Điều Kiện Trùng Khớp | Giá Trị Giải Thưởng (VNĐ) |
| :--- | :--- | :--- |
| **Giải Đặc Biệt** | Trùng khớp cả **6 số** | Tối thiểu **1.000.000.000 VNĐ** + Tích lũy |
| **Giải Nhất** | Trùng khớp **5 số** | **1.800.000 VNĐ** |
| **Giải Nhì** | Trùng khớp **4 số** | **100.000 VNĐ** |
| **Giải Ba** | Trùng khớp **3 số** | **15.000 VNĐ** |

*Lưu ý đối với vé Bao*: Trúng nhiều giải sẽ được tính thưởng cộng dồn đầy đủ theo từng tổ hợp 6 số trúng giải.

---

## 4. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND

### 4.1. Payload Đặt Vé Điện Toán 6x36 (`POST /api/orders/checkout`)
```json
{
  "orders": [
    {
      "gameType": "dientoan_636",
      "playType": "Cơ bản",
      "drawId": "6650def636636636",
      "drawCode": "#00512",
      "drawDate": "14/11/2026",
      "items": [
        {
          "id": "A",
          "playType": "Cơ bản",
          "numbers": ["05", "11", "18", "24", "30", "36"],
          "baseCost": 10000,
          "multiplier": 1,
          "cost": 10000
        }
      ]
    }
  ]
}
```

### 4.2. Thuật toán Dò Thưởng 6x36 (`prizeService.ts`)
```typescript
const winNums = new Set(draw.winningNumbers); // 6 số từ 01-36

for (const item of order.items) {
  const combos = item.playType === 'Cơ bản' 
    ? [item.numbers] 
    : getCombinationsList(item.numbers, 6);

  for (const combo of combos) {
    const matchCount = combo.filter(n => winNums.has(n)).length;

    if (matchCount === 6) {
      itemPrize += JACKPOT_636_VALUE;
    } else if (matchCount === 5) {
      itemPrize += 1800000;
    } else if (matchCount === 4) {
      itemPrize += 100000;
    } else if (matchCount === 3) {
      itemPrize += 15000;
    }
  }
}
```

---

## 5. GIAO DIỆN & VẬN HÀNH TRÊN CMS (`vuaxoso_cms`)
- **Quản lý kỳ quay**: Lọc theo `dientoan_636` hoặc `bao_636`.
- **Nhập kết quả**: 6 số mở thưởng từ 01 đến 36, không trùng lặp.
- **Kích hoạt trả thưởng**: Tự động duyệt đơn hàng và cập nhật số dư cho người chơi trúng giải.

