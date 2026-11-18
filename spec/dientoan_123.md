# ĐẶC TẢ GAME: ĐIỆN TOÁN 1-2-3 (`dientoan_123`)

## 1. TỔNG QUAN
- **Mã game**: `dientoan_123`
- **Tên game**: ĐIỆN TOÁN 1-2-3 (Xổ số Điện toán 1-2-3)
- **Lịch quay**: Mở thưởng hàng ngày vào lúc 18:05 (Công ty Xổ số Kiến thiết Thủ đô).
- **Kỳ quay**: Kỳ quay riêng biệt của Điện toán 1-2-3 (`drawIds`).
- **Quy luật quay**:
  - Mở thưởng quay 3 lần liên tiếp để chọn ra **3 bộ số**:
    - **Bộ 1**: Gồm **1 chữ số** (từ `0` đến `9`).
    - **Bộ 2**: Gồm **2 chữ số** (từ `00` đến `99`).
    - **Bộ 3**: Gồm **3 chữ số** (từ `000` đến `999`).

---

## 2. QUY TẮC ĐẶT CƯỢC & DỮ LIỆU
- Người chơi chọn 3 bộ số tương ứng gồm 6 chữ số:
  - Vị trí `0`: Bộ 1 (1 số)
  - Vị trí `1, 2`: Bộ 2 (2 số)
  - Vị trí `3, 4, 5`: Bộ 3 (3 số)
  - Ví dụ chọn: Bộ 1: `5`, Bộ 2: `28`, Bộ 3: `789` $\rightarrow$ mảng `["5", "2", "8", "7", "8", "9"]`.
- Mệnh giá mỗi vé cược cơ bản: 10.000 VNĐ. Có thể tăng bội số (20k, 50k, 100k, ...).
- Payload đặt vé:
```json
{
  "gameId": "dientoan_123",
  "gameName": "ĐIỆN TOÁN 1-2-3",
  "playType": "Điện toán 1-2-3",
  "drawIds": ["DT123_YYYYMMDD"],
  "boards": [
    { "id": "A", "numbers": ["5", "2", "8", "7", "8", "9"], "cost": 10000 }
  ],
  "totalCost": 10000
}
```

---

## 3. CƠ CẤU GIẢI THƯỞNG & TỶ LỆ TRẢ THƯỞNG
Kết quả mở thưởng gồm 3 bộ số (ví dụ: Bộ 1 = `5`, Bộ 2 = `28`, Bộ 3 = `789`):

| Hạng giải | Điều kiện trúng thưởng | Tỷ lệ trả thưởng (x lần) | Tiền thưởng vé 10.000đ |
| :--- | :--- | :--- | :--- |
| **Giải Nhất** | Trùng cả **3 bộ số** (Bộ 1 + Bộ 2 + Bộ 3) | **x40.000 lần** | **400.000.000 VNĐ** |
| **Giải Nhì** | Trùng **bộ 2 số + bộ 3 số** (Bộ 2 + Bộ 3) | **x1.000 lần** | **10.000.000 VNĐ** |
| **Giải Ba** | Trùng **bộ 1 số + bộ 3 số** (Bộ 1 + Bộ 3) | **x100 lần** | **1.000.000 VNĐ** |
| **Giải Tư** | Trùng duy nhất **bộ 3 số** (Bộ 3) | **x50 lần** | **500.000 VNĐ** |

*Ghi chú*:
- Vé trúng nhiều hạng giải chỉ được lĩnh thưởng giải cao nhất.
- Highlight số trúng trên Mobile:
  - Giải Nhất: Highlight toàn bộ cả 6 vị trí (0, 1, 2, 3, 4, 5).
  - Giải Nhì: Highlight các vị trí của Bộ 2 (1, 2) và Bộ 3 (3, 4, 5).
  - Giải Ba: Highlight các vị trí của Bộ 1 (0) và Bộ 3 (3, 4, 5).
  - Giải Tư: Highlight các vị trí của Bộ 3 (3, 4, 5).

---

## 4. MA TRẬN TEST CASES CHO BACKEND & MOBILE
- **Case 1: Trúng giải Nhất**
  - Vé: `["5", "2", "8", "7", "8", "9"]`
  - Kết quả: `["5", "28", "789"]`
  - Kết quả tính thưởng: Trúng Giải Nhất, x40.000 (400.000.000đ), highlight toàn bộ 6 số.
- **Case 2: Trúng giải Nhì (Bộ 2 + Bộ 3)**
  - Vé: `["3", "2", "8", "7", "8", "9"]`
  - Kết quả: `["5", "28", "789"]`
  - Kết quả tính thưởng: Trúng Giải Nhì, x1.000 (10.000.000đ), highlight Bộ 2 và Bộ 3 (`28` và `789`).
- **Case 3: Trúng giải Ba (Bộ 1 + Bộ 3)**
  - Vé: `["5", "1", "1", "7", "8", "9"]`
  - Kết quả: `["5", "28", "789"]`
  - Kết quả tính thưởng: Trúng Giải Ba, x100 (1.000.000đ), highlight Bộ 1 và Bộ 3 (`5` và `789`).
- **Case 4: Trúng giải Tư (Bộ 3)**
  - Vé: `["3", "1", "1", "7", "8", "9"]`
  - Kết quả: `["5", "28", "789"]`
  - Kết quả tính thưởng: Trúng Giải Tư, x50 (500.000đ), highlight Bộ 3 (`789`).
- **Case 5: Không trúng (chỉ trùng Bộ 1 hoặc Bộ 2)**
  - Vé: `["5", "2", "8", "1", "2", "3"]`
  - Kết quả: `["5", "28", "789"]`
  - Kết quả tính thưởng: Không trúng giải, không highlight.
