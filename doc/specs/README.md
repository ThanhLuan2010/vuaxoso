# TÀI LIỆU QUY CHUẨN ĐẶC TẢ KỸ THUẬT TOÀN DIỆN HỆ THỐNG VUAXOSO

Tài liệu này là bộ đặc tả kỹ thuật (Technical Specifications) chuẩn hóa đầy đủ và chi tiết nhất cho toàn bộ hệ thống nền tảng **Vua Xổ Số (VXS)**, bao gồm 3 bộ mã nguồn:
1. **Mobile App (`vuaxoso`)**: Ứng dụng di động đa nền tảng viết bằng React Native / TypeScript (giao diện cược, chọn số, giỏ hàng, nạp rút, lịch sử vé).
2. **Backend Server (`vuaxoso_backend`)**: Máy chủ API viết bằng Node.js / Express / TypeScript / MongoDB (xử lý đặt cược, trừ ví nguyên tử, quản lý kỳ quay, động cơ dò thưởng `prizeService`, cảnh báo gian lận realtime, mã hóa AES-256).
3. **CMS Frontend (`vuaxoso_cms`)**: Trang quản trị điều hành viết bằng React / Vite / Ant Design / TypeScript (quản lý người dùng, quản lý đơn cược, upload ảnh vé số, nhập kết quả mở thưởng, cơ chế khẩn cấp Hold rút tiền, kiểm tra cược đối nghịch).

Tài liệu được biên soạn dựa trên cơ sở tài liệu gốc [Functions VuaXoSo.xlsx](file:///Users/fe/Documents/private/vxs/doc/Functions%20VuaXoSo.xlsx) và hiện trạng triển khai trong source code. Toàn bộ các game loại trừ **Vé số cào** và **Bóng đá** theo đúng yêu cầu.

---

## 1. CÁC QUYẾT ĐỊNH CHỐT CHÍNH THỨC
Toàn bộ các điểm khác biệt giữa Document và Source Code đã được chốt và cập nhật đồng bộ 100%:
1. **Hạn mức cược Lô Đề**: **Không khống chế 70% số con**, cho phép người chơi đánh **100% số con** tự do; duy trì trần nhận cược tối đa **100 triệu VNĐ / con số / ngày**.
2. **Chu kỳ quay Bingo 18**: Cố định **8 phút / 1 kỳ** (từ 06:00 đến 21:55 hàng ngày).
3. **Lịch chốt cược Lotto 5/70**: Chốt cược đúng **17:20 hàng ngày**.
4. **Cơ chế Nhập kết quả**: Tắt hoàn toàn cào tự động cho các game truyền thống, 100% nhập tay trên CMS; riêng Keno và Bingo 18 duy trì auto + hỗ trợ nhập tay ghi đè khi livestream.
5. **Đồng bộ giờ chốt vé (Cutoff Time) Lô Đề 3 Miền**: Chốt trước giờ mở thưởng 5 phút: **Miền Nam 16:10**, **Miền Trung 17:10**, **Miền Bắc 18:10**. Quá giờ tự động chuyển sang ngày mai.

👉 Xem chi tiết tại: **[Báo Cáo Điểm Lệch Giữa Doc & Code (`DISCREPANCIES.md`)](file:///Users/fe/Documents/private/vxs/doc/specs/DISCREPANCIES.md)**
👉 Hướng dẫn kiểm thử toàn diện: **[Hướng Dẫn Chạy Test E2E Bàn Giao (`TESTING_GUIDE.md`)](file:///Users/fe/Documents/private/vxs/doc/specs/TESTING_GUIDE.md)**

---

## 2. DANH MỤC ĐẶC TẢ TỪNG TRÒ CHƠI (GAMES)
Mỗi trò chơi được đặc tả độc lập thành 1 file riêng biệt, chi tiết từ giao diện vào game, các phần tử trên màn hình, cách thức chọn số/bảng A-F, công thức tính tiền cược từ min đến max, cấu trúc payload gửi lên Backend, vòng đời kỳ quay, thuật toán dò giải thưởng và giao diện quản trị trên CMS:

| STT | Tên Trò Chơi | Mã Game (`gameType`) | Nhóm Xổ Số | File Đặc Tả Chi Tiết |
| :---: | :--- | :--- | :--- | :--- |
| **01** | **Lô Đề 3 Miền** | `xoso_3mien` / `lode` | Lô Đề Truyền Thống | [01_lode_3mien.md](file:///Users/fe/Documents/private/vxs/doc/specs/games/01_lode_3mien.md) |
| **02** | **Xổ Số Kiến Thiết 3 Miền** | `MB`, `MT`, `MN` | XSKT Giấy Truyền Thống | [02_kienthiet_3mien.md](file:///Users/fe/Documents/private/vxs/doc/specs/games/02_kienthiet_3mien.md) |
| **03** | **Keno (8 phút / kỳ)** | `keno`, `bao_keno`, `clln_keno` | Vietlott Nhanh | [03_keno.md](file:///Users/fe/Documents/private/vxs/doc/specs/games/03_keno.md) |
| **04** | **Power 6/55** | `power_655` | Vietlott Jackpot | [04_power_655.md](file:///Users/fe/Documents/private/vxs/doc/specs/games/04_power_655.md) |
| **05** | **Mega 6/45** | `mega_645` | Vietlott Jackpot | [05_mega_645.md](file:///Users/fe/Documents/private/vxs/doc/specs/games/05_mega_645.md) |
| **06** | **Max 3D & Max 3D Pro** | `max_3d`, `max_3d_pro` | Vietlott Ma Trận Số | [06_max_3d_pro.md](file:///Users/fe/Documents/private/vxs/doc/specs/games/06_max_3d_pro.md) |
| **07** | **Max 4D** | `max_4d` | Vietlott Ma Trận Số | [07_max_4d.md](file:///Users/fe/Documents/private/vxs/doc/specs/games/07_max_4d.md) |
| **08** | **Bingo 18** | `bingo18` | Điện Toán Nhanh | [08_bingo18.md](file:///Users/fe/Documents/private/vxs/doc/specs/games/08_bingo18.md) |
| **09** | **Điện Toán 6x36 & Bao 6x36** | `dientoan_636`, `bao_636` | Điện Toán Thủ Đô | [09_dientoan_636.md](file:///Users/fe/Documents/private/vxs/doc/specs/games/09_dientoan_636.md) |
| **10** | **Lô Tô 2, 3, 5 Số** | `loto_235` | Điện Toán / Lô Tô | [10_loto_235.md](file:///Users/fe/Documents/private/vxs/doc/specs/games/10_loto_235.md) |
| **11** | **Lô Tô Cặp (2, 3, 4 Cặp Số)** | `loto_cap` | Điện Toán / Lô Tô Xiên | [11_loto_cap.md](file:///Users/fe/Documents/private/vxs/doc/specs/games/11_loto_cap.md) |
| **12** | **Trượt Lô Tô (4, 8, 10 Cặp)** | `truot_loto` | Điện Toán / Lô Tô Trượt | [12_truot_loto.md](file:///Users/fe/Documents/private/vxs/doc/specs/games/12_truot_loto.md) |
| **13** | **Thần Tài 4 & Điện Toán 1-2-3** | `than_tai_4` | Điện Toán Thủ Đô | [13_than_tai_4_dt123.md](file:///Users/fe/Documents/private/vxs/doc/specs/games/13_than_tai_4_dt123.md) |
| **14** | **Lotto 5/35 & Mega Millions 5/70** | `lotto_535`, `lotto_570` | Xổ Số Quốc Tế | [14_lotto_535_570.md](file:///Users/fe/Documents/private/vxs/doc/specs/games/14_lotto_535_570.md) |
| **15** | **Mua Chung Vietlott (Co-Buy)** | `mua_chung` | Góp Vốn Vé Bao | [15_mua_chung_vietlott.md](file:///Users/fe/Documents/private/vxs/doc/specs/games/15_mua_chung_vietlott.md) |

---

## 3. DANH MỤC ĐẶC TẢ TỪNG TÍNH NĂNG CHUNG (FEATURES)
Mỗi tính năng hệ thống nhỏ lẻ được đặc tả độc lập thành 1 file riêng biệt, chi tiết trên cả 3 tầng (Mobile App, CMS Frontend, Backend API & CSDL):

| STT | Tên Tính Năng | Mô Tả Nghiệp Vụ Cốt Lõi | File Đặc Tả Chi Tiết |
| :---: | :--- | :--- | :--- |
| **01** | **Đăng Ký, Đăng Nhập & Quản Lý Mật Khẩu** | Xác thực số điện thoại mã hóa, quên mật khẩu, icon CSKH chống líp, bắt buộc đổi mật khẩu định kỳ (User 60 ngày, CMS 30 ngày). | [01_auth_register_login.md](file:///Users/fe/Documents/private/vxs/doc/specs/features/01_auth_register_login.md) |
| **02** | **Hồ Sơ Người Dùng & Định Danh KYC** | Cho phép khách tự cập nhật đúng 1 lần rồi khóa, xác thực Email, ảnh CCCD 2 mặt lưu vĩnh viễn, CMS hỗ trợ chỉnh sửa. | [02_profile_kyc.md](file:///Users/fe/Documents/private/vxs/doc/specs/features/02_profile_kyc.md) |
| **03** | **Quản Lý Nạp Tiền (Deposit)** | Nạp VietQR Ngân hàng & USDT (BEP20/TRC20), Lịch sử nạp tiền trên App, CMS duyệt nạp, tự động dọn dẹp ảnh sao kê sau 30 ngày. | [03_deposit_management.md](file:///Users/fe/Documents/private/vxs/doc/specs/features/03_deposit_management.md) |
| **04** | **Quản Lý Rút Tiền (Withdraw)** | Mật khẩu rút tiền (PIN 6 số), giới hạn 2 bank + 2 ví USDT, đóng băng số dư tức thì, cơ chế khẩn cấp "Hold Rút Tiền Toàn Hệ Thống". | [04_withdraw_management.md](file:///Users/fe/Documents/private/vxs/doc/specs/features/04_withdraw_management.md) |
| **05** | **Quản Lý Ví & Biến Động Số Dư** | Thẻ ví số dư khả dụng và đóng băng, nhật ký biến động số dư bất biến (`BalanceHistory`), lưu đầy đủ trước/sau giao dịch. | [05_wallet_balance_history.md](file:///Users/fe/Documents/private/vxs/doc/specs/features/05_wallet_balance_history.md) |
| **06** | **Giỏ Hàng, Đặt Vé & Quản Lý Đơn Hàng** | Tối ưu hóa checkout batch cược nhiều vé cùng lúc, xuất báo cáo Excel theo khoảng ngày, liên kết 2 chiều User <-> Order, in và upload ảnh vé thật. | [06_order_cart_ticket.md](file:///Users/fe/Documents/private/vxs/doc/specs/features/06_order_cart_ticket.md) |
| **07** | **Quản Lý Người Dùng & Chống Gian Lận** | Phân tích cược đối nghịch, gom nhóm trùng IP và Thiết bị, ghi chú Admin bắt buộc kèm timestamp, phân quyền Master Admin vs Nhân viên CMS Read-Only. | [07_user_management_antifraud.md](file:///Users/fe/Documents/private/vxs/doc/specs/features/07_user_management_antifraud.md) |
| **08** | **Quản Lý Kỳ Quay, Kết Quả & Trả Thưởng** | Đồng bộ Cutoff Time chốt vé, chuyển 100% sang nhập tay cho game truyền thống, quy trình sửa kết quả & rollback tiền thưởng, tự động hoàn tiền khi hủy kỳ. | [08_draw_result_settlement.md](file:///Users/fe/Documents/private/vxs/doc/specs/features/08_draw_result_settlement.md) |
| **09** | **Quản Lý Thông Báo & Banner Quảng Cáo** | Banner trang chủ kích thước chuẩn 739x273, hộp thư cá nhân In-App, dịch vụ bắn Push Notification tức thời qua Firebase Cloud Messaging (FCM). | [09_notifications_banners.md](file:///Users/fe/Documents/private/vxs/doc/specs/features/09_notifications_banners.md) |
| **10** | **Kiểm Soát Rủi Ro & Bảo Mật Hệ Thống** | Cho phép đánh 100% số con, hạn mức 100tr/con/ngày, tự động lọc trùng và cảnh báo cú pháp sai, gửi email cảnh báo realtime, mã hóa cơ sở dữ liệu AES-256. | [10_risk_control_security.md](file:///Users/fe/Documents/private/vxs/doc/specs/features/10_risk_control_security.md) |

---

## 4. QUY CHUẨN PAYLOAD ĐẶT VÉ (CHECKOUT SCHEMA)
Mọi thao tác cược từ các màn hình game con hoặc từ Giỏ hàng đều tuân thủ cấu trúc JSON thống nhất gửi đến endpoint `POST /api/orders/checkout`:

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
          "numbers": ["18", "81"],
          "baseCost": 10000,
          "multiplier": 27,
          "cost": 540000
        }
      ]
    }
  ]
}
```

