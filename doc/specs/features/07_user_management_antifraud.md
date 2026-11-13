# ĐẶC TẢ TÍNH NĂNG: QUẢN LÝ NGƯỜI DÙNG & PHÒNG CHỐNG GIAN LẬN (`user_management_antifraud`)

## 1. TỔNG QUAN TÍNH NĂNG
- Hệ thống giám sát an ninh toàn diện nhằm phát hiện các hành vi gian lận cá cược, bào khuyến mãi, rửa tiền hoặc tạo nhiều tài khoản ảo trên cùng một thiết bị/địa chỉ IP.
- **Các Module An Ninh Trọng Tâm**:
  1. **Kiểm tra Cược Đối Nghịch (Opposite Betting Detection)**: Phát hiện người chơi hoặc nhóm người chơi sử dụng từ 2 đến nhiều tài khoản cùng một IP/thiết bị để đánh trọn vẹn 100 con số (vừa đánh thắng vừa đánh thua) nhằm trục lợi chênh lệch hoặc rửa tiền.
  2. **Gom Nhóm Trùng IP & Thiết Bị (IP / Device Clustering)**: Tự động gom nhóm các tài khoản có chung địa chỉ IP đăng nhập hoặc chung chuỗi định danh thiết bị (`loginDevice`) vào một phân hệ cảnh báo chuyên biệt trên CMS.
  3. **Nhật Ký Thao Tác Bất Biến (Audit Trail & Admin Notes)**: Bắt buộc lưu vết chi tiết mọi hành động chỉnh sửa của Admin kèm họ tên, ngày giờ và tự động gửi email báo cáo về `developervnteam@gmail.com`.
  4. **Phân Quyền Chặt Chẽ: Master Admin vs Nhân Viên Vận Hành (Read-Only Auditor)**: Nhân viên vận hành chỉ có quyền Xem và Kiểm tra nghiệp vụ; tuyệt đối không có quyền Sửa/Xóa đơn cược, sửa số dư hay thay đổi kết quả.

---

## 2. GIAO DIỆN & VẬN HÀNH TRÊN CMS (`vuaxoso_cms`)

### 2.1. Phân Hệ Kiểm Tra Gian Lận (`FraudManagement.tsx`)
1. **Tab 1: Kiểm Tra Trùng IP & Thiết Bị (`duplicate-ips-devices`)**:
   - Bảng gom nhóm: Hiển thị Địa chỉ IP, Số lượng tài khoản trùng (`count > 1`).
   - Bấm vào một địa chỉ IP / Thiết bị: Mở rộng danh sách toàn bộ các tài khoản con thuộc IP đó (Họ tên, SĐT, Số dư ví, Ngày tạo, Trạng thái KYC).
   - Nút hành động nhanh: **[Khóa hàng loạt tài khoản]** hoặc **[Đặt cờ theo dõi]**.
2. **Tab 2: Phân Tích Cược Đối Nghịch (Opposite Bet Checker)**:
   - Nút **[Chạy Quét Cược Đối Nghịch]**: Hệ thống tự động phân tích các đơn cược cùng kỳ quay và cùng đài tỉnh:
     - Phát hiện trường hợp 2-3 User cùng dải IP đặt cược phủ từ 70% đến 100% tổ hợp số (ví dụ: User 1 đánh dãy chẵn 00, 02, 04...; User 2 đánh dãy lẻ 01, 03, 05...).
   - Hiển thị bảng chi tiết:
     - Danh sách User liên quan.
     - Dãy số chi tiết của từng user.
     - Trạng thái vé (Đang chờ, Thắng, Thua).
     - Ngày đặt vé, Ngày kết quả, Địa chỉ IP trùng khớp.
     - Nút **[Hủy vé & Đóng băng tài khoản]** (chỉ dành cho Master Admin).

### 2.2. Hồ Sơ Khách Hàng & Ghi Chú Admin (`UserManagement.tsx`)
1. **Tìm kiếm toàn diện**: Tìm khách hàng theo: SĐT, Họ tên, CCCD, Email, IP đăng nhập, Tên thiết bị, STK ngân hàng, Địa chỉ ví USDT.
2. **Tab Ghi Chú Admin (Admin Notes)**:
   - Hiển thị dòng thời gian (Timeline) các ghi chú:
     - Nội dung ghi chú.
     - Ngày giờ ghi chú (chính xác đến từng giây).
     - Tên tài khoản Admin thực hiện.
   - Bắt buộc Admin nhập ghi chú mỗi khi thay đổi bất kỳ trường thông tin nào của khách hàng.
3. **Tab Lịch Sử Đăng Nhập & IP**:
   - Lưu trữ lịch sử mỗi lần đăng nhập: Thời gian, Địa chỉ IP, Tên thiết bị / Trình duyệt.

### 2.3. Ma Trận Phân Quyền Vai Trò (Role-Based Access Control)

| Tính Năng / Thao Tác | Nhân Viên Vận Hành (`operator`) | Master Admin (`master_admin`) |
| :--- | :---: | :---: |
| Tra cứu danh sách User & Đơn cược | Có (Read-Only) | Toàn quyền |
| Xem chi tiết vé cược & ảnh vé thật | Có (Read-Only) | Toàn quyền |
| Xem phân tích Trùng IP & Cược đối nghịch | Có (Read-Only) | Toàn quyền |
| Duyệt Nạp tiền / Duyệt Rút tiền | Có quyền duyệt | Toàn quyền |
| Chỉnh sửa thông tin cá nhân khách hàng | Ẩn nút (Bị chặn) | Cho phép (Có ghi log) |
| Điều chỉnh số dư khách hàng thủ công | Ẩn nút (Bị chặn) | Cho phép (Có ghi log) |
| Sửa kết quả kỳ quay / Xóa kỳ quay cũ | Ẩn nút (Bị chặn) | Cho phép |
| Bật công tắc "Hold Rút Tiền Toàn Hệ Thống" | Ẩn nút (Bị chặn) | Cho phép |
| Hủy vé cược / Khóa tài khoản khách hàng | Ẩn nút (Bị chặn) | Cho phép |

---

## 3. THIẾT KẾ CSDL & SCHEMA DỮ LIỆU BACKEND

### 3.1. Thuật toán Aggregation Phát Hiện Trùng IP & Thiết Bị (`fraudController.ts`)
```typescript
export const getDuplicateIPsAndDevices = async (req: Request, res: Response) => {
  // Gom nhóm theo IP
  const ipAggregation = await User.aggregate([
    { $match: { loginIp: { $exists: true, $nin: [null, ''] } } },
    { $group: { 
        _id: '$loginIp', 
        count: { $sum: 1 }, 
        users: { $push: { _id: '$_id', phone: '$phone', name: '$name', balance: '$balance', createdAt: '$createdAt' } } 
    } },
    { $match: { count: { $gt: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Gom nhóm theo Device
  const deviceAggregation = await User.aggregate([
    { $match: { loginDevice: { $exists: true, $nin: [null, ''] } } },
    { $group: { 
        _id: '$loginDevice', 
        count: { $sum: 1 }, 
        users: { $push: { _id: '$_id', phone: '$phone', name: '$name', balance: '$balance', createdAt: '$createdAt' } } 
    } },
    { $match: { count: { $gt: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json({ duplicateIps: ipAggregation, duplicateDevices: deviceAggregation });
};
```

### 3.2. Thuật toán Quét Cược Đối Nghịch (Opposite Bet Engine)
```typescript
export const detectOppositeBets = async (drawId: string, gameType: string) => {
  // Lấy tất cả đơn cược của kỳ quay này
  const orders = await Order.find({ drawId, gameType }).populate('user').lean();
  
  // Gom nhóm đơn cược theo IP đặt cược
  const ipMap: Record<string, any[]> = {};
  orders.forEach(o => {
    if (o.ipAddress) {
      if (!ipMap[o.ipAddress]) ipMap[o.ipAddress] = [];
      ipMap[o.ipAddress].push(o);
    }
  });

  const suspiciousGroups = [];
  for (const [ip, groupOrders] of Object.entries(ipMap)) {
    // Nếu cùng 1 IP có từ 2 User khác nhau trở lên
    const distinctUsers = new Set(groupOrders.map(o => o.user._id.toString()));
    if (distinctUsers.size >= 2) {
      // Tập hợp toàn bộ con số cược của các user thuộc IP này
      const allNumbers = new Set();
      groupOrders.forEach(o => {
        o.items?.forEach((item: any) => item.numbers.forEach((n: string) => allNumbers.add(n)));
      });

      // Nếu tổng số con cược vượt quá 70 con (với lô đề 2 số 00-99)
      if (allNumbers.size >= 70) {
        suspiciousGroups.push({
          ip,
          userCount: distinctUsers.size,
          users: Array.from(distinctUsers),
          totalNumbersBet: allNumbers.size,
          orders: groupOrders.map(o => o.orderId)
        });
      }
    }
  }

  return suspiciousGroups;
};
```

### 3.3. Middleware Bảo Vệ Đa Lớp Ở Backend (`authMiddleware.ts`)
```typescript
export const requireMasterAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'master_admin') {
    next();
  } else {
    // Ghi nhật ký cố tình truy cập trái phép
    AdminLog.create({
      adminId: req.user?._id,
      adminName: req.user?.name,
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      details: `Nhân viên cố tình gọi API yêu cầu quyền Master: ${req.originalUrl}`
    });
    res.status(403).json({ message: "Bạn không có quyền thực hiện thao tác nguy hiểm này!" });
  }
};
```

