# ĐẶC TẢ TÍNH NĂNG: QUẢN LÝ THÔNG BÁO & BANNER QUẢNG CÁO (`notifications_banners`)

## 1. TỔNG QUAN TÍNH NĂNG
- Hệ thống truyền thông và tiếp thị số kết nối giữa ban quản trị CMS và người dùng Mobile App thông qua 2 kênh chủ đạo:
  1. **Quản lý Banner Quảng Cáo (Banner Carousel)**: Hiển thị các chiến dịch tiếp thị, sự kiện ưu đãi trên trang chủ Mobile App với kích thước chuẩn xác.
  2. **Hệ thống Thông Báo Đa Kênh (Notifications & Push)**: Gửi thông báo trực tiếp vào Hộp thư cá nhân trong App và bắn thông báo đẩy (Push Notification) qua dịch vụ Firebase Cloud Messaging (FCM) khi có khuyến mãi mới, nạp/rút tiền thành công hoặc vé cược trúng thưởng.

---

## 2. GIAO DIỆN & LUỒNG THAO TÁC TRÊN MOBILE APP

### 2.1. Banner Quảng Cáo Trang Chủ (`BannerCarousel.tsx`, `HomeScreen.tsx`)
- Vị trí: Đặt ngay dưới Header trang chủ, hiển thị dạng băng chuyền (Carousel) tự động cuộn (Auto-scroll mỗi 4 giây).
- **Quy chuẩn kích thước hình ảnh**: **Tỷ lệ chuẩn 739 x 273 pixels** (hoặc tỷ lệ khung hình ~2.7:1).
  - Tối ưu hóa tải ảnh mượt mà, hỗ trợ cache ảnh để người dùng không bị giật lag.
  - Sửa lỗi banner không hiển thị trên phiên bản app cũ: Tự động fallback về ảnh mặc định nếu mạng chậm hoặc lỗi ảnh.
- Khi người dùng chạm vào banner:
  - Nếu banner gắn link điều hướng nội bộ (`deepLink`): Tự động mở màn hình tương ứng (ví dụ: chuyển thẳng vào game Keno hoặc màn hình Nạp tiền).
  - Nếu banner gắn URL ngoài: Mở trình duyệt ngoài hoặc In-App Webview.

### 2.2. Màn hình Hộp Thư & Thông Báo (`NotificationsScreen.tsx`)
- Biểu tượng quả chuông trên Header có chấm đỏ hiển thị số lượng thông báo chưa đọc.
- **Phân loại thông báo (Tabs)**:
  - **Khuyến mãi & Sự kiện**: Các chương trình thưởng nạp, hoàn trả cược do CMS gửi tới toàn thể người chơi.
  - **Giao dịch**: Thông báo Nạp tiền thành công, Rút tiền thành công, Lệnh rút bị từ chối.
  - **Trúng thưởng**: Thông báo vé cược trúng thưởng kèm số tiền thưởng nhận được.
- Chức năng: Đánh dấu đã đọc tất cả, xóa thông báo.

---

## 3. GIAO DIỆN & VẬN HÀNH TRÊN CMS (`vuaxoso_cms`)

### 3.1. Quản lý Banner Quảng Cáo (`BannerManagement.tsx`)
- **Danh sách Banner đang chạy**:
  - Hình ảnh thumbnail xem trước (kèm nhãn chuẩn `739x273`).
  - Tiêu đề banner, Vị trí hiển thị (Trang chủ / Màn hình nạp tiền).
  - Thứ tự ưu tiên sắp xếp (`priority`).
  - Trạng thái: `Bật (Active)` / `Tắt (Inactive)`.
- **Thao tác Thêm / Sửa Banner**:
  - Tải lên ảnh từ máy tính (hệ thống tự động kiểm tra tỷ lệ và dung lượng ảnh) hoặc dán link ảnh trực tiếp.
  - Nhập liên kết điều hướng (`link` hoặc `screenName`).
  - Bấm Lưu: Thay đổi lập tức được đồng bộ ra Mobile App trong lần làm mới tiếp theo.
- **Quyền thao tác**: Cả Master Admin và Nhân viên vận hành CMS đều có quyền Thêm, Sửa, Xóa banner.

### 3.2. Quản lý Gửi Thông Báo Khuyến Mãi (`NotificationManagement.tsx`)
- Nút **[Tạo Thông Báo Mới]**:
  - Chọn đối tượng nhận:
    - *Tất cả người chơi* (Gửi Broadcast toàn hệ thống).
    - *Người chơi cụ thể* (Nhập danh sách ID hoặc SĐT).
  - Nhập: Tiêu đề thông báo, Nội dung thông báo (hỗ trợ định dạng rich text / HTML cơ bản).
  - Checkbox: **Gửi thông báo đẩy (Send Push Notification qua FCM)** ngay lập tức tới thiết bị di động của khách hàng.
  - Bấm **[Phát Hành Thông Báo]**: Hệ thống lưu vào cơ sở dữ liệu và kích hoạt gửi FCM ngầm trong vòng 3 giây.

---

## 4. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND

### 4.1. Model Banner (`Banner.ts`)
```typescript
export interface IBanner extends Document {
  title: string;
  imageUrl: string;            // Ảnh kích thước chuẩn 739x273
  link?: string;               // Deep link hoặc external URL
  position: 'home' | 'wallet' | 'game';
  priority: number;            // Thứ tự hiển thị (1, 2, 3...)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2. Model Thông Báo (`Notification.ts`)
```typescript
export interface INotification extends Document {
  user?: ObjectId;             // Null nếu là thông báo chung cho tất cả
  title: string;
  content: string;
  type: 'promo' | 'transaction' | 'prize' | 'system';
  isRead: boolean;
  data?: Record<string, any>;  // Metadata kèm theo để deep link
  createdAt: Date;
}
```

### 4.3. Dịch Vụ Bắn Thông Báo Đẩy FCM (`fcmService.ts`)
```typescript
import admin from 'firebase-admin';

export const sendPushNotification = async (fcmToken: string, title: string, body: string, data?: any) => {
  try {
    if (!fcmToken) return;
    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: { title, body },
      data: data || {},
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } }
    };
    await admin.messaging().send(message);
  } catch (error) {
    console.error('Lỗi khi gửi Push Notification qua FCM:', error);
  }
};
```

