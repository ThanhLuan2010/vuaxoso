# ĐẶC TẢ KỸ THUẬT GAME: LÔ ĐỀ 3 MIỀN (`lode_3mien`)

## 1. TỔNG QUAN GAME
- **Mã định danh hệ thống (`gameType`)**: `xoso_3mien` hoặc `lode`.
- **Phân loại**: Xổ số Lô Đề Truyền Thống 3 Miền (Bắc, Trung, Nam).
- **Vùng cược (`region`)**:
  - `MB` (Miền Bắc): 27 giải mở thưởng lúc **18:15** hàng ngày.
  - `MT` (Miền Trung): 18 giải mở thưởng lúc **17:15** hàng ngày theo các đài tỉnh mở thưởng trong ngày.
  - `MN` (Miền Nam): 18 giải mở thưởng lúc **16:15** hàng ngày theo các đài tỉnh mở thưởng trong ngày.
- **Thời gian chốt nhận vé (Cutoff Time)**:
  - Miền Nam: **16:10** (trước giờ mở thưởng 5 phút).
  - Miền Trung: **17:10** (trước giờ mở thưởng 5 phút).
  - Miền Bắc: **18:10** (trước giờ mở thưởng 5 phút).
  - *Quá giờ chốt vé*: Hệ thống tự động chuyển ngày quay sang kỳ ngày hôm sau, chặn mọi thao tác đặt cược cho ngày hiện tại.

---

## 2. GIAO DIỆN & LUỒNG THAO TÁC TRÊN MOBILE APP (REACT NATIVE)

### 2.1. Điểm truy cập màn hình (Entry Point)
- **Vị trí**: Từ màn hình chính Home (`HomeScreen.tsx`), danh mục trò chơi nổi bật.
- **Tên hiển thị & Tag**: "LÔ ĐỀ 3 MIỀN" kèm icon 🔥 (Hót) và icon Thần Tài. Banner phụ đề: "Tỉ lệ 99.99 - ĐÁNH LÔ ĐỀ - USDT/BANK/VISA".
- **Điều hướng**: `navigation.navigate('GameLayoutLode', { gameCode: 'xoso_3mien' })`.

### 2.2. Chi tiết các thành phần trên màn hình cược (`GameLayoutLodeScreen.tsx`)
1. **Header**:
   - Nút Back (`<ArrowLeft />`).
   - Tiêu đề: "LÔ ĐỀ 3 MIỀN".
   - Hiển thị số dư ví hiện tại của User (`balance` realtime từ `useAppStore`).
   - Nút "Hướng dẫn / Luật chơi" mở modal xem bảng tỉ lệ thưởng.
2. **Bộ chọn Miền & Đài Tỉnh**:
   - 3 Tab lớn: **MIỀN BẮC**, **MIỀN TRUNG**, **MIỀN NAM**.
   - Với Miền Trung & Miền Nam: Dropdown / Modal chọn Đài Tỉnh theo lịch mở thưởng trong ngày (ví dụ MN thứ 7: TP.HCM, Long An, Bình Phước, Hậu Giang).
   - Hiển thị thời gian đếm ngược còn lại đến giờ chốt nhận vé (ví dụ: `Còn lại: 01:25:40`).
3. **Danh mục Loại Cược (Tabs chính & Sub-tabs)**:
   - **Bao Lô**: Lô 2 số, Lô 2 số 1k, Lô 3 số, Lô 4 số, Lô 2 số đầu, Lô Giải 4 (MT/MN), Lô Giải 6 (MT/MN).
   - **Đánh Đề**: Đề ĐB, Đề Đầu ĐB, Đề Giải 1, Đề Đầu Giải 1, Đề Giải 7 (MB), Đề Giải 8 (MT/MN), Đề Đầu, Đề Đuôi, Đề Đầu Đuôi, Xiên ĐB, Xiên Giải 1, Đảo ĐB, Đảo G1, Đảo Đầu ĐB, Đảo Đầu G1.
   - **Lô Xiên**: Xiên 2, Xiên 3, Xiên 4.
   - **3 Càng**: 3 Càng ĐB, 3 Càng Đầu ĐB, 3 Càng Giải 1, 3 Càng Giải 6 (MB) / Giải 7 (MT/MN), 3C Đảo ĐB, 3C Đảo G1, 3C Đảo Đầu ĐB, 3C Đảo Đầu G1, Xiên 3C ĐB, Xiên 3C G1.
   - **4 Càng**: 4 Càng ĐB, 4 Càng Đầu ĐB, 4 Càng Giải 1, 4 Càng Đầu Giải 1, 4C Đảo ĐB, 4C Đảo G1, 4C Đảo Đầu ĐB, 4C Đảo Đầu G1, Xiên 4C ĐB, Xiên 4C G1.
   - **Lô Trượt**: Trượt Xiên 4, Trượt Xiên 6, Trượt Xiên 8, Trượt Xiên 10.
4. **Khu vực Chọn số & Nhập số**:
   - **Chế độ Chọn Số Ma Trận**: Bàn phím số tương ứng (00-99 cho 2 số; bàn phím chọn từng hàng Trăm - Chục - Đơn vị cho 3 càng, 4 càng).
   - **Chế độ Nhập Nhanh (Nhập tay)**: Textarea cho phép dán hoặc nhập dãy số cách nhau bởi dấu phẩy, khoảng trắng, dấu chấm phẩy hoặc dấu gạch nối (ví dụ: `12, 34, 56, 78`).
   - **Nút Tiện Ích Chọn Nhanh**:
     - `TC` (Tất cả từ 00 đến 99).
     - `Chẵn` (Các số đuôi 0, 2, 4, 6, 8).
     - `Lẻ` (Các số đuôi 1, 3, 5, 7, 9).
     - `Lớn` (Từ 50 đến 99).
     - `Nhỏ` (Từ 00 đến 49).
     - `Tự chọn`: Hệ thống chọn ngẫu nhiên các bộ số hợp lệ.
5. **Bộ chọn Số Tiền Cược / Bội Số (Multiplier)**:
   - Ô nhập số tiền đánh cho 1 con (tối thiểu 1.000đ).
   - Các nút phím tắt tiền cược nhanh: `1k`, `5k`, `10k`, `20k`, `50k`, `100k`, `500k`.
6. **Thanh Footer Thông Tin Cược & Nút Hành Động**:
   - **Hiển thị Tạm Tính**: Công thức tự động: `[Số con] x [Tiền đánh 1 con] x [Cấp nhân theo đài] = Tổng tiền (VNĐ)`.
   - **Hiển thị Tỉ lệ thắng**: Ví dụ: `Tỉ lệ thắng: x99.9` hoặc `x980` hoặc `x9000`.
   - **Nút [Thêm vào giỏ hàng]**: Đóng gói vé vào giỏ hàng cục bộ, cho phép tiếp tục chọn game khác.
   - **Nút [Đặt vé ngay]**: Mở modal xác nhận đặt cược hoặc chuyển thẳng đến màn hình thanh toán.

---

## 3. QUY TẮC CƯỢC, KIỂM TRA HỢP LỆ & HẠN MỨC RỦI RO

### 3.1. Quy tắc chọn số theo từng loại cược
- **Lô 2 số / Đề 2 số**: Các số từ `00` đến `99` (gồm đúng 2 chữ số).
- **Lô 3 số / 3 Càng**: Các số từ `000` đến `999` (gồm đúng 3 chữ số).
- **Lô 4 số / 4 Càng**: Các số từ `0000` đến `9999` (gồm đúng 4 chữ số).
- **Đề Đầu / Đề Đuôi**: Chỉ chọn 1 chữ số đơn từ `0` đến `9` (không cho nhập tay, chỉ chọn số).
- **Xiên 2 / Xiên 3 / Xiên 4**:
  - Xiên 2: Chọn 2 con số lô khác nhau (ví dụ: `00&01`).
  - Xiên 3: Chọn 3 con số lô khác nhau (ví dụ: `00&01&02`).
  - Xiên 4: Chọn 4 con số lô khác nhau (ví dụ: `00&01&02&03`).
- **Lô Trượt (Trượt 4 / 6 / 8 / 10)**: Chọn tương ứng 4, 6, 8, 10 con số không được trùng nhau.

### 3.2. Cơ chế lọc số tự động & Báo lỗi cú pháp
- Khi khách nhập tay hoặc dán từ clipboard:
  - Hệ thống tự động tách chuỗi theo các ký tự phân tách: `,`, `;`, ` `, `\n`, `|`.
  - Tự động chuẩn hóa padding số 0 (ví dụ `5` -> `05` với cược 2 chữ số).
  - **Tự động xóa số trùng lặp**: Nếu khách nhập trùng (ví dụ `01, 02, 01`), hệ thống tự động loại bỏ con `01` trùng thứ hai.
  - **Phát hiện cú pháp sai**: Nếu phát hiện số có độ dài không khớp hoặc ký tự lạ, hiển thị popup thông báo lỗi đỏ cụ thể để khách sửa trước khi đặt.

### 3.3. Hạn mức rủi ro (Risk Limits)
- **Số lượng con nhận**: Cho phép người chơi tự do đánh **100% số con** (không áp dụng hạn chế 70% số con theo quyết định chốt từ quản trị).
- **Tối đa tiền cược 1 con**: Không vượt quá **100.000.000 VNĐ** cho 1 con số / ngày trên toàn bộ các loại cược.

---

## 4. BẢNG CƠ CHẾ TÍNH TIỀN CƯỢC & TỈ LỆ TRẢ THƯỞNG CHI TIẾT

### 4.1. Miền Bắc (MB - 27 Giải)

| Danh Mục | Tên Loại Cược | Cấp Nhân (Bội số giải) | Tỉ Lệ Thắng (1 ăn X) | Quy Luật Trúng & Công Thức |
| :--- | :--- | :---: | :---: | :--- |
| **Bao Lô** | Lô 2 số | **x27** | **99.9** | Trùng 2 số cuối của 27 giải. Trúng $N$ nháy nhận $N \times 99.9 \times \text{Tiền cược 1 con}$. |
| | Lô 2 số 1k | x1 | 3.7 | Đánh 1.000đ ăn 3.700đ. |
| | Lô Giải 3 | x6 | 99.9 | Trùng 2 số cuối của 6 giải Ba. |
| | Lô Giải 5 | x6 | 99.9 | Trùng 2 số cuối của 6 giải Năm. |
| | Lô 2 số đầu | x27 | 99.9 | Trùng 2 số đầu của 27 giải. |
| | Lô 3 số | **x23** | **980** | Trùng 3 số cuối của 23 giải (từ giải 6 đến giải ĐB). |
| | Lô 4 số | **x20** | **9000** | Trùng 4 số cuối của 20 giải (từ giải 5 đến giải ĐB). |
| **Đánh Đề** | Đề ĐB | x1 | 99.9 | Trùng 2 số cuối giải Đặc Biệt. |
| | Đề Đầu ĐB | x1 | 99.9 | Trùng 2 số đầu giải Đặc Biệt. |
| | Đề Giải 1 | x1 | 99.9 | Trùng 2 số cuối giải Nhất. |
| | Đề Đầu Giải 1 | x1 | 99.9 | Trùng 2 số đầu giải Nhất. |
| | Đề Giải 7 | x4 | 99.9 | Trùng 2 số cuối 4 giải Bảy. |
| | Đề Đầu | x10 | 99.9 | Trùng chữ số hàng chục của giải ĐB (0-9). |
| | Đề Đuôi | x10 | 99.9 | Trùng chữ số hàng đơn vị của giải ĐB (0-9). |
| | Đề Đầu Đuôi | x5 | 99.9 | Trùng 2 số đầu giải 1 hoặc 2 số cuối giải ĐB. |
| | Xiên ĐB | x1 | 4.8 | Trúng 1 trong 2 chữ số cuối của giải ĐB. |
| | Xiên Giải 1 | x1 | 4.8 | Trúng 1 trong 2 chữ số cuối của giải Nhất. |
| | Đảo ĐB | x1 | 4.9 | Đảo các chữ số của 2 số cuối giải ĐB. |
| | Đảo G1 | x1 | 4.9 | Đảo các chữ số của 2 số cuối giải Nhất. |
| | Đảo Đầu ĐB | x1 | 4.9 | Đảo các chữ số của 2 số đầu giải ĐB. |
| | Đảo Đầu G1 | x1 | 4.9 | Đảo các chữ số của 2 số đầu giải Nhất. |
| **Lô Xiên** | Xiên 2 | x1 | **16** | Cả 2 con lô đều xuất hiện trong 27 giải. |
| | Xiên 3 | x1 | **65** | Cả 3 con lô đều xuất hiện trong 27 giải. |
| | Xiên 4 | x1 | **180** | Cả 4 con lô đều xuất hiện trong 27 giải. |
| **3 Càng** | 3 Càng ĐB | x1 | **980** | Trùng 3 số cuối giải Đặc Biệt. |
| | 3 Càng Đầu ĐB | x1 | 980 | Trùng 3 số đầu giải Đặc Biệt. |
| | 3 Càng Giải 1 | x1 | 980 | Trùng 3 số cuối giải Nhất. |
| | 3 Càng Đầu Giải 1 | x1 | 980 | Trùng 3 số đầu giải Nhất. |
| | 3 Càng Giải 6 | x3 | 980 | Trùng 3 số cuối 3 giải Sáu. |
| | 3C Đảo ĐB | x1 | **158** | Đảo các chữ số của 3 càng ĐB MB. |
| | 3C Đảo G1 | x1 | 158 | Đảo các chữ số của 3 càng G1 MB. |
| | 3C Đảo Đầu ĐB | x1 | 158 | Đảo các chữ số của 3 càng đầu ĐB MB. |
| | 3C Đảo Đầu G1 | x1 | 158 | Đảo các chữ số của 3 càng đầu G1 MB. |
| | Xiên 3C ĐB | x1 | 3.2 | Trúng 1 trong các chữ số của 3 càng ĐB. |
| | Xiên 3C G1 | x1 | 3.2 | Trúng 1 trong các chữ số của 3 càng G1. |
| **4 Càng** | 4 Càng ĐB | x1 | **9000** | Trùng 4 số cuối giải Đặc Biệt. |
| | 4 Càng Đầu ĐB | x1 | 9000 | Trùng 4 số đầu giải Đặc Biệt. |
| | 4 Càng Giải 1 | x1 | 9000 | Trùng 4 số cuối giải Nhất. |
| | 4 Càng Đầu Giải 1 | x1 | 9000 | Trùng 4 số đầu giải Nhất. |
| | 4C Đảo ĐB | x1 | **388** | Đảo 4 chữ số của 4 càng ĐB MB. |
| | 4C Đảo G1 | x1 | 388 | Đảo 4 chữ số của 4 càng G1 MB. |
| | 4C Đảo Đầu ĐB | x1 | 388 | Đảo 4 chữ số của 4 càng đầu ĐB MB. |
| | 4C Đảo Đầu G1 | x1 | 388 | Đảo 4 chữ số của 4 càng đầu G1 MB. |
| | Xiên 4C ĐB | x1 | 2.4 | Trúng chữ số thuộc 4 càng ĐB. |
| | Xiên 4C G1 | x1 | 2.4 | Trúng chữ số thuộc 4 càng G1. |
| **Lô Trượt** | Trượt Xiên 4 | x1 | **1.8** | Cả 4 con lô đều KHÔNG xuất hiện trong 27 giải. |
| | Trượt Xiên 6 | x1 | **2.5** | Cả 6 con lô đều KHÔNG xuất hiện trong 27 giải. |
| | Trượt Xiên 8 | x1 | **3.3** | Cả 8 con lô đều KHÔNG xuất hiện trong 27 giải. |
| | Trượt Xiên 10 | x1 | **4.3** | Cả 10 con lô đều KHÔNG xuất hiện trong 27 giải. |

### 4.2. Miền Trung (MT) & Miền Nam (MN) - 18 Giải Mỗi Đài Tỉnh

| Danh Mục | Tên Loại Cược | Cấp Nhân | Tỉ Lệ Thắng | Ghi Chú Quy Luật |
| :--- | :--- | :---: | :---: | :--- |
| **Bao Lô** | Lô 2 số | **x18** | **99.9** | Trùng 2 số cuối 18 giải đài tỉnh. Trúng $N$ nháy tính $N$ lần thưởng. |
| | Lô 2 số 1k | x1 | 5.445 | |
| | Lô Giải 4 | x7 | 99.9 | Trùng 2 số cuối 7 giải Tư. |
| | Lô Giải 6 | x3 | 99.9 | Trùng 2 số cuối 3 giải Sáu. |
| | Lô 2 số đầu | x18 | 99.9 | Trùng 2 số đầu 18 giải. |
| | Lô 3 số | **x17** | **980** | Trùng 3 số cuối 17 giải (từ giải 7 đến giải ĐB). |
| | Lô 4 số | **x16** | **9000** | Trùng 4 số cuối 16 giải (từ giải 6 đến giải ĐB). |
| **Đánh Đề** | Đề ĐB | x1 | 99.9 | 2 số cuối giải Đặc Biệt. |
| | Đề Đầu ĐB | x1 | 99.9 | 2 số đầu giải Đặc Biệt. |
| | Đề Giải 1 | x1 | 99.9 | 2 số cuối giải Nhất. |
| | Đề Giải 8 | x1 | 99.9 | 2 số giải Tám. |
| | Đề Đầu Đuôi | x2 | 99.9 | Trùng giải 8 hoặc 2 số cuối giải ĐB. |
| | Đảo ĐB | x1 | 4.9 | Đảo các chữ số của đề ĐB. |
| | Đảo G1 | x1 | 4.9 | Đảo các chữ số của đề G1. |
| **Lô Xiên** | Xiên 2 | x1 | **28** | Cả 2 con cùng xuất hiện trong 18 giải đài tỉnh. |
| | Xiên 3 | x1 | **150** | Cả 3 con cùng xuất hiện trong 18 giải đài tỉnh. |
| | Xiên 4 | x1 | **750** | Cả 4 con cùng xuất hiện trong 18 giải đài tỉnh. |
| **3 Càng** | 3 Càng ĐB | x1 | **980** | 3 số cuối giải Đặc Biệt. |
| | 3 Càng Giải 7 | x1 | 980 | 3 chữ số giải Bảy. |
| | 3 Càng Đầu Đuôi | x2 | 980 | Trùng giải 7 hoặc 3 số cuối giải ĐB. |
| | 3C Đảo ĐB | x1 | **165** | Đảo các chữ số của 3 càng ĐB MN/MT. |
| | 3C Đảo G1 | x1 | 165 | Đảo các chữ số của 3 càng G1 MN/MT. |
| **4 Càng** | 4 Càng ĐB | x1 | **9000** | 4 số cuối giải Đặc Biệt. |
| | 4C Đảo ĐB | x1 | **414** | Đảo các chữ số của 4 càng ĐB MN/MT. |
| | 4C Đảo G1 | x1 | 414 | Đảo các chữ số của 4 càng G1 MN/MT. |
| **Lô Trượt** | Trượt Xiên 4 | x1 | **1.8** | Cả 4 con đều không xuất hiện trong 18 giải. |
| | Trượt Xiên 8 | x1 | **3.3** | Cả 8 con đều không xuất hiện trong 18 giải. |
| | Trượt Xiên 10 | x1 | **4.3** | Cả 10 con đều không xuất hiện trong 18 giải. |

---

## 5. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND (NODE.JS/EXPRESS)

### 5.1. Payload gửi lên Checkout (`POST /api/orders/checkout`)
```json
{
  "clearCart": false,
  "orders": [
    {
      "gameType": "xoso_3mien",
      "playType": "Lô 2 số",
      "provinceName": "Hà Nội",
      "provinceId": "MB",
      "drawDate": "13/11/2026",
      "drawId": "sched_2026-11-13",
      "items": [
        {
          "id": "A",
          "playType": "Lô 2 số",
          "numbers": ["18", "81", "99"],
          "baseCost": 10000,
          "multiplier": 27,
          "cost": 810000
        }
      ]
    }
  ]
}
```

### 5.2. Luồng xử lý Backend (`orderController.ts`)
1. **Kiểm tra phiên đăng nhập & User Token**: Lấy `req.user._id`.
2. **Kiểm tra thời gian chốt vé (Cutoff Check)**:
   - Nếu `drawDate` là hôm nay và giờ hiện tại > Cutoff Time (MB: 18:10, MT: 17:10, MN: 16:10): Trả lỗi HTTP 400: `"Đài này đã đóng cổng nhận cược cho hôm nay!"`.
3. **Kiểm tra Hạn mức (Risk Limit Check)**:
   - Cho phép cược 100% số con.
   - Tổng tiền cược của từng con số trong ngày của user không vượt quá 100.000.000đ.
4. **Kiểm tra Số dư Ví & Trừ tiền**:
   - `totalCost = sum(order.items.cost)`.
   - Nếu `user.balance < totalCost`: Trả lỗi HTTP 400 `"Số dư tài khoản không đủ"`.
   - Sử dụng transaction MongoDB trừ tiền `user.balance -= totalCost`.
5. **Ghi log Biến động số dư & Lưu đơn hàng**:
   - Tạo bản ghi `Order` với trạng thái `pending`, ghi nhận `ipAddress` và `loginDevice`.
   - Tạo bản ghi `BalanceHistory`: `type: 'bet'`, `amount: -totalCost`, `balanceBefore`, `balanceAfter`.
6. **Kiểm tra cảnh báo gian lận & Gửi Email Realtime**:
   - Gọi `sendLogNotificationEmail` tới `developervnteam@gmail.com` khi phát hiện cược lớn hoặc cược nhiều bộ số bất thường.

---

## 6. VÒNG ĐỜI KỲ QUAY & THUẬT TOÁN DÒ THƯỞNG (`prizeService.ts`)

### 6.1. Vòng đời kỳ quay
1. **Khởi tạo (`upcoming`)**: Sinh kỳ quay mỗi ngày cho các đài theo lịch.
2. **Nhận cược (`active`)**: Người chơi đặt cược.
3. **Đóng cược (`closed`)**: Đúng giờ chốt vé (16:10, 17:10, 18:10), hệ thống tự động khóa nhận vé.
4. **Nhập kết quả & Hoàn thành (`completed`)**:
   - Kết quả do Admin CMS nhập thủ công sau giờ xổ chính thức (hoặc cron cào kết quả).
   - Khi kỳ quay chuyển sang `completed` và có `winningNumbers`, trigger tự động hàm `processDrawResults(drawId)`.

### 6.2. Thuật toán so khớp & Dò thưởng
1. **Thu thập tập hợp số kết quả**:
   - Tách toàn bộ số kết quả thành danh sách 2 số cuối, 3 số cuối, 4 số cuối của từng giải.
   - Đếm tần suất xuất hiện ($N$ nháy) cho từng con số.
2. **Dò thưởng theo loại cược**:
   - **Bao Lô**: Duyệt từng số khách chọn, nếu trùng 2 số cuối thì `số_nháy = tần_suất`. Tiền thắng = `số_nháy * baseCost * tỉ_lệ_ăn`.
   - **Đề ĐB**: Chỉ so sánh với 2 số cuối của giải Đặc Biệt. Nếu trùng: `Tiền thắng = baseCost * 99.9`.
   - **Lô Xiên (Xiên 2, 3, 4)**: Cần TẤT CẢ các con số trong bộ xiên đều có mặt trong tập kết quả (tần suất $\ge 1$). Nếu thiếu dù chỉ 1 con -> Thua. Nếu đủ -> Thắng = `baseCost * tỉ_lệ_xiên`.
   - **Lô Trượt (Trượt 4, 6, 8, 10)**: TẤT CẢ các con số trong bộ trượt đều KHÔNG ĐƯỢC có mặt trong tập kết quả (tần suất $= 0$). Nếu có bất kỳ con nào về -> Thua.
3. **Cộng tiền thưởng**:
   - Nếu `totalPrize > 0`: Cập nhật `order.isWinner = true`, `order.prizeAmount = totalPrize`.
   - Cộng tiền ví User: `user.balance += totalPrize`.
   - Tạo `BalanceHistory`: `type: 'prize'`, `amount: totalPrize`.
   - Gửi Push Notification thông báo trúng thưởng qua FCM về Mobile App.

---

## 7. GIAO DIỆN & VẬN HÀNH TRÊN CMS (`vuaxoso_cms`)

### 7.1. Quản lý Đơn Hàng (`OrderManagement.tsx`)
- **Bộ lọc đa năng**: Lọc theo Game (`LÔ ĐỀ 3 MIỀN`), Miền (`MB`, `MT`, `MN`), Ngày đặt, Ngày xổ, Trạng thái (`Chờ mở thưởng`, `Thắng`, `Thua`).
- **Bảng danh sách**:
  - Mã đơn hàng (Link mở chi tiết).
  - Khách hàng (Username, SĐT, Link sang `UserManagement`).
  - Đài tỉnh & Loại cược.
  - Chi tiết dãy số: Thể hiện rõ số con, tiền cược 1 con, tổng tiền cược.
  - Cột KẾT QUẢ: Hiển thị trạng thái Thắng (kèm số tiền thắng màu xanh) / Thua (màu xám).
  - IP & Thiết bị đặt cược: Hiển thị IP và Device lúc đặt vé.
- **Nút "Xuất dữ liệu"**: Cho phép chọn khoảng thời gian từ ngày A đến ngày B để xuất file Excel chi tiết doanh thu, tổng cược, tổng trả thưởng.

### 7.2. Quản lý Kỳ Quay & Kết Quả Lô Đề (`DrawManagement.tsx`)
- Danh sách kỳ quay theo từng ngày và từng đài tỉnh.
- Nút **"Nhập kết quả"**: Mở modal nhập đầy đủ các giải:
  - MB: Giải ĐB (5 số), Giải Nhất, Giải Nhì (2 giải), Giải Ba (6 giải), Giải Tư (4 giải), Giải Năm (6 giải), Giải Sáu (3 giải), Giải Bảy (4 giải).
  - MT/MN: Giải ĐB (6 số), Giải Nhất đến Giải Tám.
- **Cơ chế Khẩn cấp: Sửa kết quả & Hold Rút tiền**:
  - Nếu Admin nhập sai kết quả, hệ thống cho phép sửa lại kết quả kỳ quay.
  - Khi kích hoạt sửa kết quả: Hệ thống tự động kích hoạt cờ **Hold rút tiền** toàn hệ thống để Master Admin kiểm tra rà soát số dư trước khi mở lại cổng rút tiền.

