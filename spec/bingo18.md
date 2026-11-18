# ĐẶC TẢ GAME: BINGO 18 (`bingo18`)

## 1. TỔNG QUAN
- **Mã game**: `bingo18`
- **Loại game**: Điện toán quay nhanh (8 phút / kỳ).
- **Quy luật quay thưởng**: Mỗi kỳ quay chọn ngẫu nhiên **3 quả bóng** (mỗi quả nhận giá trị từ **1 đến 6**, tương đương với 3 con súc sắc / xí ngầu).
  - Kết quả có thể trùng lặp, ví dụ: `(1, 1, 1)`, `(2, 4, 5)`, `(6, 6, 3)`.
  - Tổng điểm 3 quả bóng dao động từ **3 đến 18**.

---

## 2. CÁC HÌNH THỨC CHƠI & CƠ CẤU GIẢI THƯỞNG

### 2.1. HÌNH THỨC "CƠ BẢN"
Người chơi đặt cược vào số lần xuất hiện của các con số (theo bảng tỉ lệ hệ thống):
1. **Một số (Đơn số)**: Chọn 1 số từ `1` đến `6`.
   - Điều kiện: Trúng 1 số $\rightarrow$ Thưởng **$2\times$** tiền cược (20.000đ cho mỗi 10.000đ).
2. **Hai số trùng**: Chọn 1 bộ 2 số giống nhau trong `{11, 22, 33, 44, 55, 66}`.
   - Điều kiện: Trúng 2 giống nhau $\rightarrow$ Thưởng **$3\times$** tiền cược (30.000đ cho mỗi 10.000đ).
3. **Ba số trùng**: Chọn 1 bộ trong `{111, 222, 333, 444, 555, 666}`.
   - Điều kiện: Trúng 3 giống nhau $\rightarrow$ Thưởng **$4\times$** tiền cược (40.000đ cho mỗi 10.000đ).

### 2.2. HÌNH THỨC "CỘNG TỔNG"
Người chơi dự đoán chính xác tổng điểm của 3 quả bóng (từ `3` đến `18`):

| Tổng Điểm | Tỉ Lệ Thưởng (x lần cược) | Tiền Thưởng cho 10.000đ | Ghi Chú |
| :---: | :---: | :--- | :--- |
| **Tổng 3** | **120x** | 1.200.000đ | Tổng 3: thắng |
| **Tổng 4** | **40x** | 400.000đ | Tổng 4: thắng |
| **Tổng 5** | **20x** | 200.000đ | Tổng 5: thắng |
| **Tổng 6** | **12x** | 120.000đ | Tổng 6: thắng |
| **Tổng 7** | **8x** | 80.000đ | Tổng 7: thắng |
| **Tổng 8** | **6x** | 60.000đ | Tổng 8: thắng |
| **Tổng 9** | **5x** | 50.000đ | Tổng 9: thắng |
| **Tổng 10** | **5x** | 50.000đ | Tổng 10: thắng |
| **Tổng 11** | **5x** | 50.000đ | Tổng 11: thắng |
| **Tổng 12** | **5x** | 50.000đ | Tổng 12: thắng |
| **Tổng 13** | **6x** | 60.000đ | Tổng 13: thắng |
| **Tổng 14** | **8x** | 80.000đ | Tổng 14: thắng |
| **Tổng 15** | **12x** | 120.000đ | Tổng 15: thắng |
| **Tổng 16** | **20x** | 200.000đ | Tổng 16: thắng |
| **Tổng 17** | **40x** | 400.000đ | Tổng 17: thắng |
| **Tổng 18** | **120x** | 1.200.000đ | Tổng 18: thắng |

### 2.3. HÌNH THỨC "TÀI XỈU HOÀ"
- **Tài**: Tổng 3 số từ 12 đến 18 (hoặc theo bảng cược).
  - Tỉ lệ ăn: **$2\times$** (10.000đ ăn 20.000đ).
- **Hoà**: Tổng 3 số là 10 hoặc 11.
  - Tỉ lệ ăn: **$3\times$** (10.000đ ăn 30.000đ).
- **Xỉu**: Tổng 3 số từ 3 đến 9.
  - Tỉ lệ ăn: **$2\times$** (10.000đ ăn 20.000đ).

---

## 3. MA TRẬN TEST CASES E2E CHO BINGO 18

### Case 1: Đặt ít nhất (Min Bet)
- **Input**:
  - Tab: `Cơ bản`
  - Chọn 1 cửa: Số `3` (Đơn số)
  - Multiplier: 1 (10.000đ), 1 kỳ quay.
- **Kỳ vọng**:
  - Tiền cược: 10.000đ.
  - Kết quả ra: `(3, 4, 5)` $\rightarrow$ Trúng 1 số $\rightarrow$ Thưởng 12.000đ.
  - Kết quả ra: `(3, 3, 5)` $\rightarrow$ Trúng 2 số $\rightarrow$ Thưởng 20.000đ.
  - Kết quả ra: `(3, 3, 3)` $\rightarrow$ Trúng 3 số $\rightarrow$ Thưởng 30.000đ.
  - Kết quả ra: `(1, 2, 4)` $\rightarrow$ Thua 0đ.

### Case 2: Đặt Tài Xỉu Hoà (Multi-bets & Multiplier)
- **Input**:
  - Tab: `Tài Xỉu Hoà`
  - Đặt cửa `Lớn` (100.000đ)
  - Đặt cửa `Hòa` (20.000đ)
  - 1 kỳ quay.
- **Kỳ vọng**:
  - Tiền cược: 120.000đ.
  - Kết quả: `(4, 5, 6)` $\rightarrow$ Tổng 15 (không phải bộ ba) $\rightarrow$ Cửa `Lớn` thắng nhận $100k \times 2 = 200.000đ$. Cửa `Hòa` thua. Lãi ròng: +80.000đ.
  - Kết quả: `(4, 4, 4)` $\rightarrow$ Ra bộ 3 giống nhau $\rightarrow$ Cửa `Lớn` thua (theo luật cược Tài Xỉu), Cửa `Hòa` thắng nhận $20k \times 8 = 160.000đ$.

### Case 3: Đặt nhiều ô Cộng tổng (Spread bets)
- **Input**:
  - Đặt Tổng 9 (20.000đ), Tổng 10 (20.000đ), Tổng 11 (20.000đ), Tổng 12 (20.000đ).
  - Chọn 3 kỳ quay liên tiếp.
- **Kỳ vọng**:
  - Chi phí 1 kỳ: 80.000đ.
  - Tổng tiền 3 kỳ: $80.000 \times 3 = \mathbf{240.000đ}$.
  - Backend trừ ví 240.000đ và theo dõi kết quả từng kỳ quay.

### Case 4: Biên & Ngoại lệ
- Chưa chọn bất kỳ ô nào nhưng bấm Đặt vé $\rightarrow$ Toast báo lỗi "Không có vé nào để thêm".
- Số dư tài khoản không đủ $\rightarrow$ Báo lỗi số dư.

