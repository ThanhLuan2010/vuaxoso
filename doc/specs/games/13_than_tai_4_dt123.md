# ĐẶC TẢ KỸ THUẬT GAME: THẦN TÀI 4 & ĐIỆN TOÁN 1-2-3 (`than_tai_4`)

## 1. TỔNG QUAN GAME
- **Mã định danh hệ thống (`gameType`)**: `than_tai_4`.
- **Nhóm trò chơi**: Xổ số Điện toán Thủ Đô (Thần Tài 4 và Điện Toán 1-2-3).
- **Lịch mở thưởng**: **18:15 hàng ngày** theo lịch quay Xổ số Thủ Đô.
- **Thời gian chốt nhận vé (Cutoff Time)**: **17:20** cùng ngày (trước giờ mở thưởng 55 phút).
- **Quy cách hiển thị kỳ mua**: Hiển thị danh sách kéo chọn **10 kỳ quay kế tiếp** để khách đặt trước.
- **Cơ chế mở thưởng**: Nhập kết quả thủ công từ CMS dựa trên kết quả mở thưởng chính thức của Xổ số Điện toán Thủ Đô.

---

## 2. GIAO DIỆN & LUỒNG THAO TÁC TRÊN MOBILE APP (`GameLayoutBScreen.tsx`)

### 2.1. Phân hệ THẦN TÀI 4
1. **Header & Banner Giải Thưởng**:
   - Tiêu đề: "THẦN TÀI 4 - QUAY HÀNG NGÀY".
   - Dòng giải thưởng nổi bật: **"🏆 Giải thưởng lên tới 179.000.000 VNĐ"**.
   - Số dư ví realtime.
2. **Khu vực Chọn Kỳ Quay**:
   - Đồng hồ đếm ngược đến 17:20.
   - Modal hiển thị cuộn 10 kỳ quay kế tiếp.
3. **Khu vực Chọn Số**:
   - Chọn 1 bộ gồm đúng **4 chữ số** (từ `0000` đến `9999`).
   - 4 cột ma trận: Hàng Nghìn (`0-9`), Hàng Trăm (`0-9`), Hàng Chục (`0-9`), Hàng Đơn Vị (`0-9`).
   - Hỗ trợ tối đa 6 hàng cược (Bảng A đến F).
   - Nút `TC` (Tự chọn nhanh) và `Xóa`.
4. **Cột Mệnh Giá Tiền Cược Chuẩn**:
   - `10.000đ`
   - `20.000đ`
   - `30.000đ`
   - `40.000đ`
   - `50.000đ`
5. **Cơ cấu giải thưởng Thần Tài 4 (Mức cược 10.000 VNĐ)**:
   - **Giải Nhất (Trúng cả 4 số)**: **179.000.000 VNĐ** (hoặc x17.900 lần).
   - **Giải Nhì (Trúng 3 số đầu)**: **1.200.000 VNĐ**.
   - **Giải Ba (Trúng 3 số cuối)**: **1.200.000 VNĐ**.
   - **Giải Tư (Trúng 2 số đầu)**: **110.000 VNĐ**.
   - **Giải Năm (Trúng 2 số cuối)**: **110.000 VNĐ**.

---

### 2.2. Phân hệ ĐIỆN TOÁN 1-2-3 (ĐT 123)
1. **Header & Banner Giải Thưởng**:
   - Tiêu đề: "ĐIỆN TOÁN 1-2-3".
   - Dòng giải thưởng nổi bật: **"🏆 Giải thưởng lên tới 139.000.000 VNĐ"**.
2. **Giao diện Định Dạng Chọn Số Ngăn Cách `? | ?? | ???`**:
   - Màn hình hiển thị đúng 3 ô chọn số được ngăn cách bằng dấu gạch đứng `|`:
     - **Bộ 1 (`?`)**: Chọn **1 chữ số** đơn (từ `0` đến `9`).
     - **Bộ 2 (`??`)**: Chọn **2 chữ số** (từ `00` đến `99`).
     - **Bộ 3 (`???`)**: Chọn **3 chữ số** (từ `000` đến `999`).
   - Khắc phục triệt để lỗi líp giao diện ở hàng cuối (hàng F).
3. **Cột Mệnh Giá Tiền Cược Chuẩn**:
   - Đầy đủ 5 mức cược: `10.000đ`, `20.000đ`, `30.000đ`, `40.000đ`, `50.000đ`.
4. **Cơ cấu giải thưởng Điện Toán 1-2-3 (Mức cược 10.000 VNĐ)**:
   - **Giải Nhất (Trúng cả 3 bộ: `?` và `??` và `???`)**: **139.000.000 VNĐ** (hoặc x13.900 lần).
   - **Giải Nhì (Trúng Bộ 2 và Bộ 3)**: **5.000.000 VNĐ**.
   - **Giải Ba (Trúng Bộ 1 và Bộ 3)**: **500.000 VNĐ**.
   - **Giải Tư (Trúng Bộ 3)**: **100.000 VNĐ**.
   - **Giải Năm (Trúng Bộ 1 và Bộ 2)**: **100.000 VNĐ**.
   - **Giải Sáu (Trúng Bộ 2)**: **20.000 VNĐ**.
   - **Giải Bảy (Trúng Bộ 1)**: **10.000 VNĐ**.

---

## 3. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND

### 3.1. Payload Đặt Vé Thần Tài 4 & ĐT 123 (`POST /api/orders/checkout`)
```json
{
  "orders": [
    {
      "gameType": "than_tai_4",
      "playType": "Thần Tài 4",
      "drawId": "sched_2026-11-13",
      "drawDate": "13/11/2026",
      "items": [
        {
          "id": "A",
          "playType": "Thần Tài 4",
          "numbers": ["7392"],
          "baseCost": 10000,
          "multiplier": 2,
          "cost": 20000
        }
      ]
    },
    {
      "gameType": "than_tai_4",
      "playType": "ĐT 123",
      "drawId": "sched_2026-11-13",
      "drawDate": "13/11/2026",
      "items": [
        {
          "id": "A",
          "playType": "ĐT 123",
          "numbers": ["7", "39", "812"],
          "baseCost": 10000,
          "multiplier": 1,
          "cost": 10000
        }
      ]
    }
  ]
}
```

### 3.2. Thuật toán Dò Thưởng Backend (`prizeService.ts`)
- **Với Thần Tài 4**:
  - So khớp chuỗi số 4 ký tự với số trúng thưởng giải Thần Tài 4 của kỳ quay.
  - Kiểm tra lần lượt: Trúng cả 4 số $\rightarrow$ Trúng 3 số đầu $\rightarrow$ Trúng 3 số cuối $\rightarrow$ Trúng 2 số đầu $\rightarrow$ Trúng 2 số cuối.
- **Với ĐT 123**:
  - So khớp 3 thành phần: `match1 = (num1 === win1)`, `match2 = (num2 === win2)`, `match3 = (num3 === win3)`.
  - Đối chiếu tổ hợp `[match1, match2, match3]` theo bảng cơ cấu giải từ Nhất đến Bảy.

---

## 4. GIAO DIỆN & VẬN HÀNH TRÊN CMS (`vuaxoso_cms`)
- **Quản lý kỳ quay**: Nhập kết quả mở thưởng Thần Tài 4 (1 chuỗi 4 chữ số) và kết quả ĐT 123 (gồm 3 chuỗi số tương ứng `?`, `??`, `???`).
- **Kích hoạt dò vé**: Tự động tính toán tiền thưởng và cộng tiền vào ví người chơi.

