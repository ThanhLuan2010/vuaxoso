# ĐẶC TẢ KỸ THUẬT GAME: MAX 3D & MAX 3D PRO (`max_3d`, `max_3d_pro`)

## 1. TỔNG QUAN GAME
- **Mã định danh hệ thống (`gameType`)**: `max_3d`, `max_3d_pro`.
- **Nhóm trò chơi**: Xổ số ma trận số Vietlott (Dãy 3 chữ số `000` - `999`).
- **Lịch mở thưởng**: Luân phiên các ngày trong tuần lúc **18:00**:
  - **Max 3D**: Thứ 2, Thứ 4, Thứ 6.
  - **Max 3D Pro**: Thứ 3, Thứ 5, Thứ 7.
- **Thời gian chốt vé (Cutoff Time)**: **17:45** cùng ngày (trước giờ mở thưởng 15 phút).
- **Cơ chế mở thưởng**: Nhập kết quả thủ công từ CMS dựa trên các bộ 3 số quay thưởng chính thức của Vietlott (gồm 20 bộ số cho các hạng giải ĐB, Nhất, Nhì, Ba).

---

## 2. GIAO DIỆN & LUỒNG THAO TÁC TRÊN MOBILE APP (`GameLayoutBScreen.tsx`)

### 2.1. Màn hình chọn cược Max 3D / Max 3D Pro
1. **Header**:
   - Nút Back (`<ArrowLeft />`).
   - Tiêu đề: "MAX 3D & MAX 3D PRO".
   - Giải thưởng cao nhất: "🏆 Giải Đặc Biệt lên tới 2.000.000.000 VNĐ".
   - Số dư ví realtime.
2. **Khu vực Thông tin Kỳ Quay & Đếm Ngược**:
   - Hiển thị ngày xổ và số hiệu kỳ quay.
   - Đồng hồ đếm ngược đến 17:45.
   - Hỗ trợ chọn mua trước cho tối đa 6 kỳ quay liên tiếp.
3. **Thanh chọn Chế Độ Chơi (Tabs)**:
   - **Max 3D Cơ Bản**: Chọn 1 bộ 3 chữ số (từ `000` đến `999`).
   - **Max 3D+ / Max 3D Pro**: Chọn 2 bộ 3 chữ số (Bộ số 1 và Bộ số 2, ví dụ: `123` & `456`).
   - **Bao Bộ Số**: Chọn từ 3 đến 20 bộ 3 số để hệ thống tự động ghép cặp.
   - **Cuộn Số (Roll)**: Giữ cố định 2 chữ số và cuộn chữ số còn lại từ 0 đến 9.
4. **Bàn Phím Chọn Số Ma Trận 3 Cột**:
   - 3 cột chọn số tương ứng: Hàng Trăm (`0 - 9`), Hàng Chục (`0 - 9`), Hàng Đơn Vị (`0 - 9`).
   - Bảng cược hỗ trợ tối đa 6 hàng (Hàng A, B, C, D, E, F).
   - Nút `TC` (Tự chọn ngẫu nhiên) và `Xóa` từng hàng.
5. **Bộ chọn Tiền Cược / Bội Số (Multiplier)**:
   - Mức cược chuẩn: `10.000 VNĐ / vé`.
   - Các mức nhân: `10k`, `20k`, `50k`, `100k`, `200k`, `500k`.
   - Tiền thưởng được nhân tương ứng theo cấp nhân của số tiền cược.
6. **Thanh Footer & Đặt Vé**:
   - Tạm tính tổng tiền: `Tổng tiền = Số bộ cược x Mức cược x Số kỳ`.
   - Nút [Thêm giỏ hàng] & Nút [Đặt vé ngay].

---

## 3. BẢNG CƠ CẤU GIẢI THƯỞNG MAX 3D & MAX 3D PRO (MỨC CƯỢC 10.000 VNĐ)

### 3.1. Max 3D Pro (2 Bộ 3 Số)
| Tên Giải | Điều Kiện Trùng Khớp | Giá Trị Giải Thưởng (VNĐ) |
| :--- | :--- | :--- |
| **Giải Đặc Biệt** | Trùng khớp **2 bộ số giải ĐB** theo đúng thứ tự quay | **2.000.000.000 VNĐ** |
| **Giải Phụ ĐB** | Trùng khớp 2 bộ số giải ĐB nhưng **ngược thứ tự** | **400.000.000 VNĐ** |
| **Giải Nhất** | Trùng khớp 2 bộ số thuộc giải Nhất | **30.000.000 VNĐ** |
| **Giải Nhì** | Trùng khớp 2 bộ số thuộc giải Nhì | **10.000.000 VNĐ** |
| **Giải Ba** | Trùng khớp 2 bộ số thuộc giải Ba | **4.000.000 VNĐ** |
| **Giải Tư** | Trùng khớp 2 bộ số bất kỳ trong giải ĐB, Nhất, Nhì, Ba | **1.000.000 VNĐ** |
| **Giải Năm** | Trùng khớp 2 bộ số bất kỳ trong giải Nhì, Ba | **100.000 VNĐ** |
| **Giải Sáu** | Trùng khớp 1 bộ số giải ĐB | **40.000 VNĐ** |

### 3.2. Max 3D Cơ Bản (1 Bộ 3 Số)
| Tên Giải | Điều Kiện Trùng Khớp | Giá Trị Giải Thưởng (VNĐ) |
| :--- | :--- | :--- |
| **Giải Nhất** | Trùng khớp 1 trong 2 bộ số giải Nhất | **1.000.000 VNĐ** |
| **Giải Nhì** | Trùng khớp 1 trong 4 bộ số giải Nhì | **350.000 VNĐ** |
| **Giải Ba** | Trùng khớp 1 trong 6 bộ số giải Ba | **210.000 VNĐ** |
| **Giải Khuyến Khích**| Trùng khớp 1 trong 8 bộ số giải Khuyến Khích | **100.000 VNĐ** |

---

## 4. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND

### 4.1. Payload Đặt Vé Max 3D Pro (`POST /api/orders/checkout`)
```json
{
  "orders": [
    {
      "gameType": "max_3d_pro",
      "playType": "Cơ bản",
      "drawId": "6650def777777777",
      "drawCode": "#00450",
      "drawDate": "13/11/2026",
      "items": [
        {
          "id": "A",
          "playType": "Cơ bản",
          "numbers": ["123", "456"],
          "baseCost": 10000,
          "multiplier": 2,
          "cost": 20000
        }
      ]
    }
  ]
}
```

### 4.2. Thuật toán Dò Thưởng Max 3D Pro (`prizeService.ts`)
- Lấy danh sách 20 bộ số kết quả mở thưởng:
  - Giải ĐB: 2 bộ số (`[db1, db2]`).
  - Giải Nhất: 4 bộ số.
  - Giải Nhì: 6 bộ số.
  - Giải Ba: 8 bộ số.
- So khớp 2 bộ số `[num1, num2]` của người chơi:
  - Nếu `num1 === db1 && num2 === db2`: Trúng Giải Đặc Biệt (`2.000.000.000đ x multiplier`).
  - Nếu `num1 === db2 && num2 === db1`: Trúng Giải Phụ Đặc Biệt (`400.000.000đ x multiplier`).
  - Tương tự duyệt các giải Nhất, Nhì, Ba, Tư, Năm, Sáu.

---

## 5. GIAO DIỆN & VẬN HÀNH TRÊN CMS (`vuaxoso_cms`)
- **Quản lý kỳ quay**: Nhập danh sách 20 bộ 3 số theo từng giải thưởng.
- **Xác thực kết quả**: Kiểm tra mỗi bộ số gồm đúng 3 chữ số (000-999).
- **Kích hoạt trả thưởng**: Tự động duyệt đơn hàng và cập nhật số dư cho các vé trúng.

