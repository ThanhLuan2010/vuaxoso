export interface BannerItem {
  id: string;
  title: string;
  imageColor: string; 
  promoText: string;
  rewardText: string;
}

export interface ProvinceItem {
  id: string;
  name: string;
  code: string; 
  region: 'MB' | 'MT' | 'MN';
}

export interface DaySchedule {
  dateString: string;
  isToday: boolean;
  isTomorrow: boolean;
  isDayAfterTomorrow: boolean;
  mb: ProvinceItem[];
  mt: ProvinceItem[];
  mn: ProvinceItem[];
}

export interface PaperTicket {
  id: string;
  number: string;
  price: number;
  sold: boolean;
  ticketType: 'normal' | 'special';
  multiplier?: number;
  provinceId: string;
}

const getDaysData = (): DaySchedule[] => {
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const today = new Date();
  
  const formatDate = (date: Date) => {
    const dayName = daysOfWeek[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${dayName}, ${day}/${month}`;
  };

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);

  const getMBForDay = (date: Date): ProvinceItem[] => {
    return [{ id: 'MB', name: 'Miền Bắc', code: 'XSMB', region: 'MB' }];
  };

  const getMTForDay = (date: Date): ProvinceItem[] => {
    const day = date.getDay();
    if (day === 3) return [{ id: 'KH', name: 'Khánh Hòa', code: 'K.Hòa', region: 'MT' }, { id: 'DN', name: 'Đà Nẵng', code: 'Đ.Nẵng', region: 'MT' }];
    else if (day === 4) return [{ id: 'BD', name: 'Bình Định', code: 'B.Định', region: 'MT' }, { id: 'QT', name: 'Quảng Trị', code: 'Q.Trị', region: 'MT' }, { id: 'QB', name: 'Quảng Bình', code: 'Q.Bình', region: 'MT' }];
    else if (day === 5) return [{ id: 'GL', name: 'Gia Lai', code: 'G.Lai', region: 'MT' }, { id: 'NT', name: 'Ninh Thuận', code: 'N.Thuận', region: 'MT' }];
    else if (day === 6) return [{ id: 'DNG', name: 'Đà Nẵng', code: 'Đ.Nẵng', region: 'MT' }, { id: 'QNG', name: 'Quảng Ngãi', code: 'Q.Ngãi', region: 'MT' }, { id: 'DNO', name: 'Đắk Nông', code: 'Đ.Nông', region: 'MT' }];
    else if (day === 0) return [{ id: 'KT', name: 'Kon Tum', code: 'K.Tum', region: 'MT' }, { id: 'KH2', name: 'Khánh Hòa', code: 'K.Hòa', region: 'MT' }];
    else if (day === 1) return [{ id: 'TTH', name: 'Thừa Thiên Huế', code: 'T.T.Huế', region: 'MT' }, { id: 'PY', name: 'Phú Yên', code: 'P.Yên', region: 'MT' }];
    else return [{ id: 'DL', name: 'Đắk Lắk', code: 'Đ.Lắk', region: 'MT' }, { id: 'QN', name: 'Quảng Nam', code: 'Q.Nam', region: 'MT' }];
  };

  const getMNForDay = (date: Date): ProvinceItem[] => {
    const day = date.getDay();
    if (day === 3) return [{ id: 'DNAI', name: 'Đồng Nai', code: 'Đ.Nai', region: 'MN' }, { id: 'CT', name: 'Cần Thơ', code: 'C.Thơ', region: 'MN' }, { id: 'ST', name: 'Sóc Trăng', code: 'S.Trăng', region: 'MN' }];
    else if (day === 4) return [{ id: 'TN', name: 'Tây Ninh', code: 'T.Ninh', region: 'MN' }, { id: 'AG', name: 'An Giang', code: 'A.Giang', region: 'MN' }, { id: 'BTH', name: 'Bình Thuận', code: 'B.Thuận', region: 'MN' }];
    else if (day === 5) return [{ id: 'VL', name: 'Vĩnh Long', code: 'V.Long', region: 'MN' }, { id: 'BDU', name: 'Bình Dương', code: 'B.Dương', region: 'MN' }, { id: 'TV', name: 'Trà Vinh', code: 'T.Vinh', region: 'MN' }];
    else if (day === 6) return [{ id: 'HCM', name: 'TP. Hồ Chí Minh', code: 'TP.HCM', region: 'MN' }, { id: 'LA', name: 'Long An', code: 'L.An', region: 'MN' }, { id: 'BP', name: 'Bình Phước', code: 'B.Phước', region: 'MN' }, { id: 'HG', name: 'Hậu Giang', code: 'H.Giang', region: 'MN' }];
    else if (day === 0) return [{ id: 'TG', name: 'Tiền Giang', code: 'T.Giang', region: 'MN' }, { id: 'KG', name: 'Kiên Giang', code: 'K.Giang', region: 'MN' }, { id: 'DLM', name: 'Đà Lạt', code: 'Đ.Lạt', region: 'MN' }];
    else if (day === 1) return [{ id: 'DT', name: 'Đồng Tháp', code: 'Đ.Tháp', region: 'MN' }, { id: 'TP', name: 'TP. Hồ Chí Minh', code: 'TP.HCM', region: 'MN' }, { id: 'CM', name: 'Cà Mau', code: 'C.Mau', region: 'MN' }];
    else return [{ id: 'BT', name: 'Bến Tre', code: 'B.Tre', region: 'MN' }, { id: 'VT', name: 'Vũng Tàu', code: 'V.Tàu', region: 'MN' }, { id: 'BL', name: 'Bạc Liêu', code: 'B.Liêu', region: 'MN' }];
  };

  return [
    { dateString: formatDate(today) + " (Hôm nay)", isToday: true, isTomorrow: false, isDayAfterTomorrow: false, mb: getMBForDay(today), mt: getMTForDay(today), mn: getMNForDay(today) },
    { dateString: formatDate(tomorrow) + " (Ngày mai)", isToday: false, isTomorrow: true, isDayAfterTomorrow: false, mb: getMBForDay(tomorrow), mt: getMTForDay(tomorrow), mn: getMNForDay(tomorrow) },
    { dateString: formatDate(dayAfter) + " (Ngày kia)", isToday: false, isTomorrow: false, isDayAfterTomorrow: true, mb: getMBForDay(dayAfter), mt: getMTForDay(dayAfter), mn: getMNForDay(dayAfter) }
  ];
};

export const APP_BANNERS: BannerItem[] = [
  { id: 'b1', title: 'XỔ SỐ KIẾN THIẾT MIỀN BẮC', imageColor: '#E51F27', promoText: 'Jackpot Kiến Thiết hàng ngày cực khủng', rewardText: 'Giải đặc biệt lên tới 500 Triệu Đồng!' },
  { id: 'b2', title: 'SIÊU PHẨM POWER 6/55', imageColor: '#5C2D91', promoText: 'Cơ hội đổi đời chạm tay tỷ phú', rewardText: 'Giá trị Jackpot đã vượt 150 Tỷ Đồng!' },
  { id: 'b3', title: 'KENO - 10 PHÚT CÓ KẾT QUẢ', imageColor: '#FF6F00', promoText: 'Chơi nhanh, trúng lớn, quay liên tục', rewardText: 'Trúng thưởng lên tới 10 Tỷ Đồng!' }
];

export const PROVINCE_SCHEDULES: DaySchedule[] = getDaysData();


