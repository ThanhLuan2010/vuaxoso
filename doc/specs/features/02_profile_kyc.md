# ĐẶC TẢ TÍNH NĂNG: HỒ SƠ NGƯỜI DÙNG & ĐỊNH DANH KYC (`profile_kyc`)

## 1. TỔNG QUAN TÍNH NĂNG
- Quản lý thông tin định danh cá nhân của người chơi nhằm đảm bảo tính chính chủ và an toàn tài chính khi giao dịch nạp rút tiền.
- **Quy tắc Nghiệp vụ Cốt lõi (Business Rule)**:
  1. **Khách hàng chỉ được phép tự chỉnh sửa thông tin 1 lần duy nhất**: Sau khi tạo tài khoản, người chơi được cập nhật hồ sơ cá nhân và gửi xác thực đúng 1 lần. Sau lần này, hệ thống sẽ **khóa hoàn toàn tính năng chỉnh sửa (Blocked Edit)** trên Mobile App.
  2. **Quyền cập nhật sau khóa thuộc về CMS**: Mọi sự thay đổi họ tên, số CCCD, số điện thoại sau lần cập nhật đầu tiên đều phải liên hệ bộ phận hỗ trợ khách hàng và được thao tác bởi Admin trên CMS.
  3. **Xác thực Email chủ động**: Cung cấp nút "Gửi mã / Link xác thực Email" trên App để khách hàng kích hoạt trạng thái "Đã xác thực".
  4. **Lưu trữ ảnh KYC vĩnh viễn**: Ảnh chụp CCCD (mặt trước, mặt sau) được lưu trữ vĩnh viễn trong hệ thống và mã hóa đường dẫn bảo mật.

---

## 2. GIAO DIỆN & LUỒNG THAO TÁC TRÊN MOBILE APP

### 2.1. Màn hình Thông Tin Tài Khoản (`AccountInfoScreen.tsx`)
1. **Các trường thông tin**:
   - **Họ và tên**: Tên thật theo CCCD / Tài khoản ngân hàng (viết hoa không dấu hoặc có dấu).
   - **Số điện thoại**: Số đã đăng ký (ẩn 3 số giữa, ví dụ `090****799`).
   - **Email**: Ô nhập email kèm huy hiệu trạng thái:
     - Chưa xác thực: Màu cam kèm nút **[Xác thực ngay]**.
     - Đã xác thực: Màu xanh lá kèm icon tích xanh `Đã xác thực`.
   - **Số CCCD / CMND**: Nhập 12 chữ số căn cước.
   - **Khu vực Tải Ảnh CCCD 2 Mặt**:
     - Khung tải ảnh Mặt trước CCCD.
     - Khung tải ảnh Mặt sau CCCD.
     - Khắc phục triệt để lỗi không hiển thị ảnh sau khi tải lên trên App (đảm bảo đồng bộ hiển thị ảnh cả trên App và CMS).
2. **Trạng thái Khóa Chỉnh Sửa**:
   - Nếu `isInfoUpdated === false`: Cho phép chỉnh sửa các trường và hiển thị nút **[Lưu thông tin]**.
   - Nếu `isInfoUpdated === true`:
     - Toàn bộ các ô nhập chuyển sang trạng thái `Read-Only` (nền xám mờ).
     - Nút "Lưu thông tin" bị ẩn, thay bằng banner thông báo: *"Thông tin cá nhân đã được khóa bảo mật. Vui lòng liên hệ CSKH nếu bạn cần thay đổi thông tin."*
     - Nút liên kết nhanh đến CSKH.

### 2.2. Màn hình Cài Đặt Mật Khẩu Rút Tiền (`WithdrawPasswordScreen.tsx`)
- Phân biệt hoàn toàn với mật khẩu đăng nhập: Mật khẩu rút tiền gồm 6 chữ số (PIN).
- Thiết lập lần đầu: Nhập mã PIN 6 số và xác nhận lại mã PIN.
- Dùng để xác thực ở bước tạo lệnh Rút tiền.

---

## 3. GIAO DIỆN & VẬN HÀNH TRÊN CMS (`UserManagement.tsx`)

### 3.1. Bảng Danh Sách Người Dùng
- **Tìm kiếm đa năng**: Tìm kiếm theo bất kỳ thông tin nào: Số điện thoại, Họ tên, Số CCCD, Địa chỉ Email, Địa chỉ IP đăng nhập, Số tài khoản ngân hàng, Địa chỉ ví USDT.
- **Cột trạng thái KYC**: `Chưa cập nhật` / `Chờ duyệt` / `Đã xác thực`.

### 3.2. Modal Chi Tiết Khách Hàng (User Detail Drawer)
1. **Thông tin định danh**:
   - Hiển thị Họ tên, SĐT, Email (kèm trạng thái xác thực).
   - Hiển thị ảnh chụp CCCD 2 mặt dạng thumbnail, bấm vào để phóng to ảnh kích thước gốc đối soát.
2. **Quyền Chỉnh Sửa Dành Cho Admin**:
   - Cho phép Admin cập nhật lại Họ tên, SĐT, Email cho khách hàng khi có yêu cầu hợp lệ.
   - Nút **[Reset Mật Khẩu Rút Tiền]** cho khách hàng khi khách quên mã PIN rút tiền.
3. **Ghi Chú Admin Bắt Buộc (Audit Log)**:
   - Mỗi lần Admin bấm nút Lưu thay đổi thông tin khách hàng, hệ thống bắt buộc Admin phải nhập nội dung **"Lý do chỉnh sửa"**.
   - Lưu trữ: Nội dung ghi chú, Ngày giờ thao tác chính xác đến giây, Tên tài khoản Admin thực hiện.
   - Tự động kích hoạt `sendLogNotificationEmail` thông báo về email `developervnteam@gmail.com`.

---

## 4. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND

### 4.1. Bổ sung trường trong Model `User.ts`
```typescript
{
  isInfoUpdated: { type: Boolean, default: false }, // Đã tự sửa 1 lần hay chưa
  idCardNumber?: string;                            // Số CCCD (Mã hóa)
  idCardFrontImage?: string;                        // URL ảnh mặt trước CCCD
  idCardBackImage?: string;                         // URL ảnh mặt sau CCCD
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  isEmailVerified: { type: Boolean, default: false },
  withdrawPassword?: string;                        // Hash mã PIN 6 số rút tiền
  adminNotes: [
    {
      adminId: { type: Schema.Types.ObjectId, ref: 'User' },
      adminName: String,
      content: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
}
```

### 4.2. Danh sách API Backend

#### 1. Người dùng cập nhật hồ sơ cá nhân (`PUT /api/users/profile`)
- **Headers**: `Authorization: Bearer <Token>`
- **Body**: `{ name, email, idCardNumber, idCardFrontImage, idCardBackImage }`
- **Xử lý**:
  - Kiểm tra nếu `user.isInfoUpdated === true`: Trả lỗi HTTP 403 `"Thông tin tài khoản đã bị khóa. Vui lòng liên hệ CSKH để hỗ trợ thay đổi!"`.
  - Cập nhật thông tin và đánh dấu `user.isInfoUpdated = true`.
  - Lưu bản ghi và trả về dữ liệu mới.

#### 2. Gửi email xác thực (`POST /api/users/verify-email/send`)
- Tạo mã token ngẫu nhiên, lưu vào `emailVerificationToken` (hạn 24 giờ).
- Gửi email kích hoạt qua dịch vụ `sendEmail`.

#### 3. Xác thực email qua link (`GET /api/users/verify-email/:token`)
- Kiểm tra token hợp lệ và còn hạn.
- Cập nhật `isEmailVerified = true`, `emailVerificationToken = undefined`.

#### 4. CMS Admin cập nhật thông tin User (`PUT /api/admin/users/:id/update-info`)
- **Chỉ dành cho Admin có quyền**:
- **Body**: `{ name, phone, email, idCardNumber, adminNote }`
- **Xử lý**: Bắt buộc có trường `adminNote`. Cập nhật dữ liệu, đẩy ghi chú vào mảng `adminNotes`, ghi nhận `AdminLog` và gửi email cảnh báo hệ thống.

