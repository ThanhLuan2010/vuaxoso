# ĐẶC TẢ GAME: TRƯỢT LÔ TÔ (`truot_loto`)

## 1. TỔNG QUAN
- **Mã game**: `truot_loto`
- **Nguồn kết quả**: So khớp với 2 số cuối của **27 giải Xổ số Miền Bắc**.

---

## 2. CÁC HÌNH THỨC CHƠI & TỈ LỆ THƯỞNG

Người chơi chọn các con số từ `00` đến `99`. Điều kiện trúng thưởng là **TẤT CẢ các con số đã chọn đều KHÔNG ĐƯỢC XUẤT HIỆN** trong 2 số cuối của 27 giải mở thưởng:
1. **Trượt 4 cặp**: Chọn 4 số khác nhau (ví dụ: `01, 02, 03, 04`).
   - Cả 4 số đều không về trong 27 giải $\rightarrow$ Thưởng **x2.5 lần** tiền cược (hoặc theo cấu hình game x2 lần).
2. **Trượt 8 cặp**: Chọn 8 số khác nhau.
   - Cả 8 số đều không về $\rightarrow$ Thưởng **x8 lần** tiền cược.
3. **Trượt 10 cặp**: Chọn 10 số khác nhau.
   - Cả 10 số đều không về $\rightarrow$ Thưởng **x12 lần** tiền cược.

---

## 3. MA TRẬN TEST CASES E2E CHO TRƯỢT LÔ TÔ

### Case 1: Trượt 4 cặp tối thiểu (Min Bet)
- **Input**:
  - PlayType: `Trượt 4`
  - Các số chọn: `["00", "01", "02", "03"]`
  - Tiền cược: 10.000đ.
- **Kỳ vọng**:
  - Tiền cược: 10.000đ.
  - Kết quả 27 giải Miền Bắc không có con nào trong `{00, 01, 02, 03}` $\rightarrow$ Trúng thưởng.
  - Nếu chỉ cần 1 con xuất hiện (ví dụ có số `02`) $\rightarrow$ Thua 0đ.

### Case 2: Trượt 8 cặp & 10 cặp
- **Input**:
  - PlayType: `Trượt 10`
  - Chọn 10 số: `["10", "20", "30", "40", "50", "60", "70", "80", "90", "00"]`.
  - Cược: 50.000đ.
- **Kỳ vọng**:
  - Tiền cược: 50.000đ.
  - Tất cả 10 số không về $\rightarrow$ Thưởng $50.000 \times 12 = \mathbf{600.000đ}$.

---

## 4. QUY CHUẨN HIỂN THỊ GIAO DIỆN (UI LIMIT & HIGHLIGHT)
1. **Giới hạn tối đa 10 số / bộ số trên thẻ vé & chi tiết vé**:
   - Khi vé có nhiều hơn 10 bộ số (ví dụ: người chơi đánh dàn nhiều bộ số trượt như 110 bộ trượt xiên):
     - **Trên thẻ vé danh sách (`HistoryTicketCard`)**: Chỉ hiển thị tối đa **10 bộ số đầu tiên**. Phần còn lại phải hiển thị nút `+[X] Xem thêm` (ví dụ `+100 Xem thêm`). Tuyệt đối không show tràn lan làm vỡ layout hoặc kéo dài thẻ vé.
     - **Trên màn hình chi tiết vé (`HistoryDetailScreen`)**: Dãy cược hiển thị tối đa 10 bộ số đầu tiên kèm nút `+[X] Xem thêm`. Chỉ khi bấm vào `Xem thêm` mới hiển thị modal popup ("Tất cả [N] số") cuộn xem toàn bộ danh sách.
2. **Quy tắc Highlight trúng thưởng**:
   - Bộ số trượt nào trúng thưởng sẽ được highlight màu đỏ (`#E11D48`), nền hồng nhạt (`#FFF1F2`) và có nhãn `(Trúng)`.
   - Các bộ số chưa đạt giải giữ màu đen mặc định (`#0F2942`).


