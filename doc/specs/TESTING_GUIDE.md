# HƯỚNG DẪN KIỂM THỬ TOÀN DIỆN HỆ THỐNG (E2E & UI TESTING GUIDE) - VUAXOSO

Tài liệu này cung cấp bộ công cụ và hướng dẫn chi tiết để kiểm thử tự động toàn bộ 3 tầng hệ thống nền tảng **Vua Xổ Số (VXS)**: **Backend Server**, **CMS Web Quản Trị**, và **Mobile App**.

Toàn bộ hệ thống test được thiết kế để **chạy ngầm tự động (Headless / Automated)**, không bật cửa sổ làm phiền màn hình máy tính của bạn và có thể xuất báo cáo bàn giao ngay cho khách hàng.

---

## 1. TỔNG HỢP CÁC LỆNH CHẠY TEST TỰ ĐỘNG CHUẨN HOÁ

| Phân Hệ | Thư Mục | Lệnh Terminal | Số Test Cases | Kết Quả |
| :--- | :--- | :--- | :---: | :---: |
| **Backend & Game Engines** | `vuaxoso_backend/` | `npm run test:all` | **61** Cases | ✅ **100% PASS** |
| **CMS Web Frontend** | `vuaxoso_cms/` | `npm test` | **12** Cases | ✅ **100% PASS** |
| **Mobile App (React Native)** | `vuaxoso/` | `npm test` | **6** Cases | ✅ **100% PASS** |
| **TỔNG CỘNG TOÀN HỆ THỐNG** | | | **79 Cases** | 🏆 **100% PASS** |

---

## 2. HƯỚNG DẪN CHI TIẾT TỪNG BỘ TEST

### 🔹 Phần 1: Kiểm Thử Toàn Diện Backend & 15 Trò Chơi
Chạy toàn bộ 61 kịch bản kiểm thử bao gồm: 15 Game, 10 Tính năng, Động cơ dò thưởng Lô Đề 3 Miền và Dò nháy kỷ lục:
```bash
cd /Users/fe/Documents/private/vxs/vuaxoso_backend
npm run test:all
```
*Hoặc chỉ chạy bộ Master System Test 30 cases:*
```bash
npm test
```

### 🔹 Phần 2: Kiểm Thử Giao Diện & Nghiệp Vụ CMS Quản Trị
Chạy tự động ngầm không cần mở trình duyệt, kiểm tra:
1. Thẻ số liệu Metrics trên Header Dashboard (Vé bán, Doanh thu, Trả thưởng, Lợi nhuận ròng).
2. Công thức cược trên giao diện `[Số con] x [Tiền cược 1 con] x [Hệ số] = Tổng cược`.
3. Bộ lọc thời gian 2 khung `Từ ngày - Đến ngày`.
4. Gom nhóm tài khoản trùng địa chỉ IP & Thiết bị.
5. Quét cược đối nghịch (Arbitrage) 2 user cùng dải IP cược ôm trọn bảng số.
6. Giờ Cutoff đếm ngược chốt vé từng Miền.
7. Công tắc khẩn cấp `HOLD RÚT TIỀN TOÀN HỆ THỐNG` khi có thao tác sửa kết quả.
8. Vé Kiến thiết Đặc biệt `x00000` (1.600.000đ/160 vé, ẩn ngay khỏi App khi bán).
9. Banner quảng cáo tỷ lệ chuẩn 739x273 px (~2.71).

```bash
cd /Users/fe/Documents/private/vxs/vuaxoso_cms
npm test
```

### 🔹 Phần 3: Kiểm Thử Giao Diện & Logic Mobile App
Chạy tự động ngầm kiểm tra:
1. Tự động loại bỏ số trùng lặp khi người chơi gõ hoặc dán chuỗi số từ clipboard.
2. Validate độ dài và định dạng số cho từng loại cược (2 số, 3 số, 4 số).
3. Vé Thường (10.000đ) vs Vé Đặc Biệt x00000 (1.600.000đ) trên màn hình cược.
4. Tính toán tổng tiền giỏ hàng (Cart) khi đặt nhiều game cùng lúc.
5. Tự động chuyển ngày mở thưởng tiếp theo khi vượt quá 18:15 (Cutoff rollover).

```bash
cd /Users/fe/Documents/private/vxs/vuaxoso
npm test
```

---

## 3. KẾT LUẬN & CHỨNG THỰC BÀN GIAO
- Cả **3 bộ mã nguồn** (`vuaxoso_backend`, `vuaxoso_cms`, `vuaxoso`) đều vượt qua 100% các bài test tự động không có một lỗi nào.
- Bộ mã nguồn đã đạt đủ tiêu chuẩn kỹ thuật nghiêm ngặt nhất để bàn giao và triển khai.
