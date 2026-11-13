# ĐẶC TẢ TÍNH NĂNG: ĐĂNG KÝ, ĐĂNG NHẬP & QUẢN LÝ MẬT KHẨU (`auth_register_login`)

## 1. TỔNG QUAN TÍNH NĂNG
Hệ thống xác thực và phân quyền tài khoản đa tầng bao gồm:
1. **Khách hàng (Mobile App)**: Đăng ký bằng Số điện thoại / Email, đăng nhập nhanh bằng mã PIN hoặc mật khẩu, cơ chế quên mật khẩu và bắt buộc đổi mật khẩu định kỳ 2 tháng/lần (60 ngày).
2. **Nhân viên CMS & Master Admin (Web CMS)**: Đăng nhập trang quản trị, bắt buộc đổi mật khẩu định kỳ 1 tháng/lần (30 ngày đối với nhân viên), phân quyền chặt chẽ giữa Master Admin và Nhân viên vận hành (Read-Only).
3. **Cơ chế Giám Sát Thiết Bị & IP**: Mỗi lượt đăng nhập đều được lưu lại IP mạng (`loginIp`) và Thiết bị (`loginDevice`) để phát hiện đăng nhập bất thường và phục vụ phân hệ Chống gian lận.

---

## 2. GIAO DIỆN & LUỒNG THAO TÁC TRÊN MOBILE APP (`LoginScreen.tsx`)

### 2.1. Màn hình Đăng Nhập
1. **Logo & Nhận diện**:
   - Logo thương hiệu Vua Xổ Số (hoặc Thần Tài).
   - Ô nhập Số Điện Thoại (hỗ trợ đầu số Việt Nam `+84` hoặc `0xxx`).
   - Ô nhập Mật Khẩu (icon con mắt ẩn/hiện mật khẩu).
2. **Cụm Nút Điều Hướng Chức Năng**:
   - Nút **[Đăng Nhập]** to, nổi bật.
   - Bên dưới phân tách rõ ràng thành 2 nút bấm riêng biệt:
     - **[Quên mật khẩu?]**: Mở modal/màn hình hướng dẫn liên hệ CSKH hoặc xác minh SMS/Email để reset mật khẩu.
     - **[Đăng ký mới]**: Chuyển sang màn hình Đăng ký tài khoản.
3. **Icon Chăm Sóc Khách Hàng (CSKH)**:
   - Icon CSKH (Tai nghe / Chat live) được neo nổi ở góc phải màn hình, có độ nâng cách đáy (bottom margin) tối thiểu 24px để **không bị líp bởi thanh điều hướng hệ thống (Home Indicator / Navigation Bar)**.
   - Bấm vào mở hộp thoại kết nối CSKH qua Telegram / Zalo / LiveChat.

### 2.2. Màn hình Đăng Ký Tài Khoản
- Nhập: Họ và tên, Số điện thoại, Mật khẩu, Nhập lại mật khẩu.
- Mã giới thiệu (tùy chọn).
- Checkbox đồng ý với "Điều khoản & Điều kiện" của Vua Xổ Số.
- Nút **[Hoàn tất đăng ký]**: Tự động đăng nhập và chuyển về màn hình chính.

### 2.3. Màn hình Bắt Buộc Đổi Mật Khẩu Định Kỳ (Password Expiry Prompt)
- Nếu tài khoản đã quá **60 ngày** kể từ lần đổi mật khẩu gần nhất:
  - App hiển thị Modal toàn màn hình yêu cầu đổi mật khẩu mới.
  - Nhập: Mật khẩu cũ, Mật khẩu mới, Xác nhận mật khẩu mới.
  - Bắt buộc đổi thành công mới được tiếp tục sử dụng ứng dụng.

---

## 3. GIAO DIỆN & VẬN HÀNH TRÊN CMS (`vuaxoso_cms/src/pages/Login.tsx`)
- Form đăng nhập quản trị CMS: Tên đăng nhập / Email và Mật khẩu.
- **Quy tắc đổi mật khẩu CMS**:
  - Với tài khoản nhân viên (Role `operator` / `staff`): Yêu cầu đổi mật khẩu định kỳ **1 tháng/lần (30 ngày)**. Nếu quá hạn, hệ thống chuyển hướng bắt buộc vào trang Đổi mật khẩu.
  - Với tài khoản `master_admin`: Có quyền tự đổi mật khẩu bất kỳ lúc nào và có quyền reset mật khẩu / mở khóa tài khoản cho nhân viên và khách hàng.

---

## 4. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND

### 4.1. Bổ sung trường trong Model `User.ts`
```typescript
{
  phone: string;                // Đã mã hóa AES-256 (Deterministic để tìm kiếm)
  password: string;             // Hash bcrypt (10 rounds)
  role: 'user' | 'operator' | 'master_admin';
  name: string;
  email?: string;
  isEmailVerified: boolean;
  loginIp?: string;             // IP đăng nhập mới nhất
  loginDevice?: string;         // Thông tin thiết bị (User-Agent, Device ID)
  lastLoginAt?: Date;
  lastPasswordChange: Date;     // Ngày đổi mật khẩu gần nhất
  status: 'active' | 'banned' | 'locked';
}
```

### 4.2. Danh sách API Xác Thực (`authRoutes.ts`)

#### 1. Đăng ký tài khoản (`POST /api/auth/register`)
- **Body**: `{ phone, password, name, referralCode }`
- **Xử lý**:
  - Mã hóa `phone` bằng `EncryptionHelper.encryptDeterministic(phone)`.
  - Hash `password` bằng `bcrypt.hash(password, 10)`.
  - Lưu `lastPasswordChange = new Date()`, `loginIp = req.ip`, `loginDevice = req.headers['user-agent']`.
  - Trả về JWT Token (thời hạn 30 ngày) và thông tin User.

#### 2. Đăng nhập tài khoản (`POST /api/auth/login`)
- **Body**: `{ phone, password }`
- **Xử lý**:
  - Tìm user theo `phone` mã hóa. Kiểm tra trạng thái tài khoản (`status !== 'banned'`).
  - Kiểm tra mật khẩu `bcrypt.compare`. Nếu sai 5 lần liên tiếp: tạm khóa tài khoản 15 phút.
  - Cập nhật `loginIp`, `loginDevice`, `lastLoginAt`.
  - Kiểm tra hạn mật khẩu:
    - Nếu User khách và `Date.now() - lastPasswordChange > 60 ngày`: Trả cờ `requirePasswordChange: true`.
    - Nếu Nhân viên CMS và `Date.now() - lastPasswordChange > 30 ngày`: Trả cờ `requirePasswordChange: true`.
  - Trả về JWT Token.

#### 3. Bắt buộc Đổi Mật Khẩu (`POST /api/auth/change-password`)
- **Headers**: `Authorization: Bearer <Token>`
- **Body**: `{ oldPassword, newPassword }`
- **Xử lý**: So sánh `oldPassword`, hash `newPassword`, cập nhật `lastPasswordChange = new Date()`.

#### 4. CMS Hỗ Trợ Đặt Lại Mật Khẩu Khách Hàng (`POST /api/admin/users/:id/reset-password`)
- **Chỉ dành cho Master Admin**: Cho phép Master Admin tạo mật khẩu mới cho khách hàng khi khách quên mật khẩu và liên hệ CSKH.
- Ghi lại nhật ký `AdminLog`: `action: 'RESET_PASSWORD'`.

