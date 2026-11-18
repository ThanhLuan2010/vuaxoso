# ĐẶC TẢ GAME: THẦN TÀI 4 (`than_tai_4`)

## 1. TỔNG QUAN
- **Mã game**: `than_tai_4`
- **Tên game**: THẦN TÀI 4 (Xổ số Điện toán Thần Tài 4)
- **Lịch quay**: Mở thưởng hàng ngày vào lúc 18:05 (Công ty Xổ số Kiến thiết Thủ đô).
- **Kỳ quay**: Kỳ quay riêng biệt của Thần Tài 4 (`drawIds`).
- **Quy luật quay**: Quay chọn 1 bộ gồm **4 chữ số** (từ `0000` đến `9999`).

---

## 2. QUY TẮC ĐẶT CƯỢC & DỮ LIỆU
- Người chơi chọn 4 chữ số (mỗi số từ 0 đến 9), ví dụ: `["1", "9", "8", "9"]` $\rightarrow$ Số vé: `1989`.
- Mệnh giá mỗi vé cược cơ bản: 10.000 VNĐ. Người chơi có thể tăng bội số (20k, 50k, 100k, ...).
- Payload đặt vé:
```json
{
  "gameId": "than_tai_4",
  "gameName": "THẦN TÀI 4",
  "playType": "Thần tài 4",
  "drawIds": ["TT4_YYYYMMDD"],
  "boards": [
    { "id": "A", "numbers": ["1", "9", "8", "9"], "cost": 10000 }
  ],
  "totalCost": 10000
}
```

---

## 3. CƠ CẤU GIẢI THƯỞNG & TỶ LỆ TRẢ THƯỞNG
Kết quả mở thưởng gồm 1 dãy số 4 chữ số (ví dụ: `1989`):

| Hạng giải | Điều kiện trúng thưởng | Tỷ lệ trả thưởng (x lần) | Tiền thưởng vé 10.000đ |
| :--- | :--- | :--- | :--- |
| **Giải Nhất (Đặc biệt)** | Trùng đúng cả **4 chữ số** theo thứ tự | **x1.220 lần** | **12.200.000 VNĐ** |
| **Giải Nhì** | Trùng đúng **3 chữ số đầu** theo thứ tự | **x110 lần** | **1.100.000 VNĐ** |
| **Giải Ba** | Trùng đúng **3 chữ số cuối** theo thứ tự | **x110 lần** | **1.100.000 VNĐ** |
| **Giải Khuyến khích 1** | Trùng đúng **2 chữ số đầu** theo thứ tự | **x10 lần** | **100.000 VNĐ** |
| **Giải Khuyến khích 2** | Trùng đúng **2 chữ số cuối** theo thứ tự | **x10 lần** | **100.000 VNĐ** |

*Ghi chú*: Người chơi trúng nhiều giải trong cùng một vé được nhận giải cao nhất hoặc tính thưởng theo quy định XSKT Thủ đô. Trên mobile và helper:
- Trùng 4 số: Highlight cả 4 vị trí (0, 1, 2, 3), tính giải Nhất.
- Trùng 3 số đầu: Highlight 3 vị trí đầu (0, 1, 2), tính giải Nhì.
- Trùng 3 số cuối: Highlight 3 vị trí cuối (1, 2, 3), tính giải Ba.
- Trùng 2 số đầu: Highlight 2 vị trí đầu (0, 1), tính giải Khuyến khích.
- Trùng 2 số cuối: Highlight 2 vị trí cuối (2, 3), tính giải Khuyến khích.

---

## 4. MA TRẬN TEST CASES CHO BACKEND & MOBILE
- **Case 1: Trúng giải Nhất**
  - Vé cược: `["1", "9", "8", "9"]`
  - Kết quả: `1989`
  - Kết quả tính thưởng: Trúng Giải Nhất, tỷ lệ x1.220 (12.200.000đ với vé 10k), highlight 4 số.
- **Case 2: Trúng giải Nhì (3 số đầu)**
  - Vé cược: `["1", "9", "8", "9"]`
  - Kết quả: `1980`
  - Kết quả tính thưởng: Trúng Giải Nhì, tỷ lệ x110 (1.100.000đ), highlight vị trí 0, 1, 2 (`1, 9, 8`).
- **Case 3: Trúng giải Ba (3 số cuối)**
  - Vé cược: `["0", "9", "8", "9"]`
  - Kết quả: `1989`
  - Kết quả tính thưởng: Trúng Giải Ba, tỷ lệ x110 (1.100.000đ), highlight vị trí 1, 2, 3 (`9, 8, 9`).
- **Case 4: Trúng Khuyến khích 2 số cuối**
  - Vé cược: `["7", "5", "8", "9"]`
  - Kết quả: `1989`
  - Kết quả tính thưởng: Trúng Giải Khuyến khích, tỷ lệ x10 (100.000đ), highlight vị trí 2, 3 (`8, 9`).
- **Case 5: Không trúng**
  - Vé cược: `["7", "5", "3", "1"]`
  - Kết quả: `1989`
  - Kết quả tính thưởng: Không trúng, không highlight.
