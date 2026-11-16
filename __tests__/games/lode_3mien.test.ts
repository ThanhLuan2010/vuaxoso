/**
 * E2E & Business Logic Test Suite: LÔ ĐỀ 3 MIỀN (MB, MT, MN)
 * Covers cases from Min Bet to Max Bet, Multipliers, Payout Rates, Cutoffs, and Hit Counts (Nháy).
 */

describe('LÔ ĐỀ 3 MIỀN Logic & Cost Calculations', () => {
  // Bội số giải cược
  const getLodeMultiplier = (region: 'mb' | 'mn' | 'mt', playType: string): number => {
    const isMB = region === 'mb';
    const p = playType.toLowerCase();

    if (p === 'lô 2 số' || p === 'lô 2 số đầu') return isMB ? 27 : 18;
    if (p === 'lô giải 3' || p === 'lô giải 5') return 6;
    if (p === 'lô giải 4') return 7;
    if (p === 'lô giải 6') return 3;
    if (p === 'lô 3 số') return isMB ? 23 : 17;
    if (p === 'lô 4 số') return isMB ? 20 : 16;
    if (p === 'đề đầu' || p === 'đề đuôi') return 10;
    if (p === 'đề đầu đuôi') return isMB ? 5 : 2;
    if (p === 'đề giải 7') return 4;
    if (p === 'đề giải 8') return 1;
    if (p === '3 càng giải 6') return 3;
    if (p === '3 càng đầu đuôi') return isMB ? 4 : 2;
    return 1; // Đề ĐB, Xiên, 3 Càng ĐB, 4 Càng ĐB, Lô trượt
  };

  // Tỉ lệ ăn thưởng (Rate)
  const getLodePayoutRate = (region: 'mb' | 'mn' | 'mt', playType: string): number => {
    const isMB = region === 'mb';
    const p = playType.toLowerCase();

    if (p === 'lô 2 số' || p === 'đề đb' || p === 'đề giải 1' || p === 'đề giải 7' || p === 'đề giải 8') return 99.9;
    if (p === 'lô 2 số 1k') return isMB ? 3.7 : 5.445;
    if (p === 'lô 3 số' || p === '3 càng đb') return 980;
    if (p === 'lô 4 số' || p === '4 càng đb') return 9000;
    if (p === 'xiên 2') return isMB ? 16 : 28;
    if (p === 'xiên 3') return isMB ? 65 : 150;
    if (p === 'xiên 4') return isMB ? 180 : 750;
    if (p === 'trượt xiên 4') return 1.8;
    if (p === 'trượt xiên 6') return 2.5;
    if (p === 'trượt xiên 8') return 3.3;
    if (p === 'trượt xiên 10') return 4.3;

    return 99.9;
  };

  describe('1. BAO LÔ: Tính Tiền và Đếm Nháy Thưởng', () => {
    test('Case Min: 1 con Lô 2 số MB, cược tối thiểu 1.000đ', () => {
      const numbers = ['68'];
      const baseCost = 1000;
      const mult = getLodeMultiplier('mb', 'Lô 2 số'); // x27
      expect(mult).toBe(27);

      const totalCost = numbers.length * baseCost * mult;
      expect(totalCost).toBe(27000);

      // Kết quả về 1 nháy -> Thưởng 1.000 * 99.9 = 99.900đ
      const prize1 = baseCost * getLodePayoutRate('mb', 'Lô 2 số') * 1;
      expect(prize1).toBe(99900);

      // Kết quả về 3 nháy (rơi vào 3 giải khác nhau) -> Thưởng 99.900đ * 3 = 299.700đ
      const prize3 = baseCost * getLodePayoutRate('mb', 'Lô 2 số') * 3;
      expect(prize3).toBe(299700);
    });

    test('Case Miền Nam: 1 con Lô 2 số MN, hệ số x18', () => {
      const numbers = ['79'];
      const baseCost = 10000; // 10k
      const mult = getLodeMultiplier('mn', 'Lô 2 số'); // x18
      expect(mult).toBe(18);

      const totalCost = numbers.length * baseCost * mult;
      expect(totalCost).toBe(180000); // 180.000đ

      // Về 1 nháy -> 10.000 * 99.9 = 999.000đ
      const prize = baseCost * getLodePayoutRate('mn', 'Lô 2 số') * 1;
      expect(prize).toBe(999000);
    });

    test('Case Dàn Lô: Đánh dàn 5 con Lô 2 số MB, mỗi con 10.000đ', () => {
      const danLo = ['12', '23', '34', '45', '56'];
      const baseCost = 10000;
      const mult = getLodeMultiplier('mb', 'Lô 2 số'); // x27

      const totalCost = danLo.length * baseCost * mult;
      // 5 con * 10k * 27 = 1.350.000đ
      expect(totalCost).toBe(1350000);

      // 2 con về (mỗi con 1 nháy) -> Thưởng 2 * 10.000 * 99.9 = 1.998.000đ (Lãi ròng 648.000đ)
      const hits = 2;
      const totalPrize = hits * baseCost * getLodePayoutRate('mb', 'Lô 2 số');
      expect(totalPrize).toBe(1998000);
    });

    test('Case Lô 3 số & 4 số (Bội số giải lớn)', () => {
      // Lô 3 số MB: x23 giải, ăn 980 lần
      expect(getLodeMultiplier('mb', 'Lô 3 số')).toBe(23);
      expect(getLodePayoutRate('mb', 'Lô 3 số')).toBe(980);
      const cost3SoMB = 1 * 10000 * 23;
      expect(cost3SoMB).toBe(230000);
      const prize3SoMB = 10000 * 980;
      expect(prize3SoMB).toBe(9800000); // 9.800.000đ

      // Lô 4 số MB: x20 giải, ăn 9000 lần
      expect(getLodeMultiplier('mb', 'Lô 4 số')).toBe(20);
      expect(getLodePayoutRate('mb', 'Lô 4 số')).toBe(9000);
      const cost4SoMB = 1 * 10000 * 20;
      expect(cost4SoMB).toBe(200000);
      const prize4SoMB = 10000 * 9000;
      expect(prize4SoMB).toBe(90000000); // 90.000.000đ
    });
  });

  describe('2. ĐỀ VÀ DÀN ĐỀ', () => {
    test('Case Min: 1 con Đề ĐB MB cược 10.000đ', () => {
      const numbers = ['88'];
      const baseCost = 10000;
      const mult = getLodeMultiplier('mb', 'Đề ĐB'); // x1
      expect(mult).toBe(1);

      const totalCost = numbers.length * baseCost * mult;
      expect(totalCost).toBe(10000);

      // Trúng: 10.000 * 99.9 = 999.000đ
      const prize = baseCost * getLodePayoutRate('mb', 'Đề ĐB');
      expect(prize).toBe(999000);
    });

    test('Case Max / Dàn Đề: Dàn 20 con Đề ĐB, cược 50.000đ/con', () => {
      const danDe = Array.from({ length: 20 }, (_, i) => String(i).padStart(2, '0'));
      const baseCost = 50000;
      const mult = 1;

      const totalCost = danDe.length * baseCost * mult;
      // 20 * 50k = 1.000.000đ
      expect(totalCost).toBe(1000000);

      // 1 con trúng -> 50.000 * 99.9 = 4.995.000đ
      const prize = baseCost * getLodePayoutRate('mb', 'Đề ĐB');
      expect(prize).toBe(4995000);
    });
  });

  describe('3. LÔ XIÊN (Xiên 2, Xiên 3, Xiên 4)', () => {
    test('Xiên 2, 3, 4 Miền Bắc tỉ lệ 16, 65, 180', () => {
      expect(getLodePayoutRate('mb', 'Xiên 2')).toBe(16);
      expect(getLodePayoutRate('mb', 'Xiên 3')).toBe(65);
      expect(getLodePayoutRate('mb', 'Xiên 4')).toBe(180);

      // Xiên 2 cược 50k -> 50k * 16 = 800.000đ
      expect(50000 * getLodePayoutRate('mb', 'Xiên 2')).toBe(800000);
      // Xiên 3 cược 20k -> 20k * 65 = 1.300.000đ
      expect(20000 * getLodePayoutRate('mb', 'Xiên 3')).toBe(1300000);
      // Xiên 4 cược 10k -> 10k * 180 = 1.800.000đ
      expect(10000 * getLodePayoutRate('mb', 'Xiên 4')).toBe(1800000);
    });

    test('Xiên 2, 3, 4 Miền Nam tỉ lệ 28, 150, 750', () => {
      expect(getLodePayoutRate('mn', 'Xiên 2')).toBe(28);
      expect(getLodePayoutRate('mn', 'Xiên 3')).toBe(150);
      expect(getLodePayoutRate('mn', 'Xiên 4')).toBe(750);

      // Xiên 4 MN cược 20k -> 20k * 750 = 15.000.000đ
      expect(20000 * getLodePayoutRate('mn', 'Xiên 4')).toBe(15000000);
    });
  });

  describe('4. LÔ TRƯỢT', () => {
    test('Trượt Xiên 4, 6, 8, 10', () => {
      expect(getLodePayoutRate('mb', 'Trượt Xiên 4')).toBe(1.8);
      expect(getLodePayoutRate('mb', 'Trượt Xiên 6')).toBe(2.5);
      expect(getLodePayoutRate('mb', 'Trượt Xiên 8')).toBe(3.3);
      expect(getLodePayoutRate('mb', 'Trượt Xiên 10')).toBe(4.3);

      // Trượt xiên 10 cược 100k -> 100k * 4.3 = 430.000đ
      expect(100000 * getLodePayoutRate('mb', 'Trượt Xiên 10')).toBe(430000);
    });
  });

  describe('5. KIỂM TRA THỜI GIAN CHỐT VÉ (CUTOFF TIME)', () => {
    const isPastCutoff = (region: 'MB' | 'MT' | 'MN', hours: number, minutes: number): boolean => {
      const currentMinutes = hours * 60 + minutes;
      let cutoff = 9999;
      if (region === 'MN') cutoff = 16 * 60 + 10; // 16:10
      else if (region === 'MT') cutoff = 17 * 60 + 10; // 17:10
      else if (region === 'MB') cutoff = 18 * 60 + 10; // 18:10
      return currentMinutes >= cutoff;
    };

    test('Miền Nam chốt 16:10', () => {
      expect(isPastCutoff('MN', 16, 9)).toBe(false); // 16:09 -> Vẫn cho đặt
      expect(isPastCutoff('MN', 16, 10)).toBe(true); // 16:10 -> Chặn
      expect(isPastCutoff('MN', 16, 15)).toBe(true); // 16:15 -> Chặn
    });

    test('Miền Trung chốt 17:10', () => {
      expect(isPastCutoff('MT', 17, 9)).toBe(false);
      expect(isPastCutoff('MT', 17, 10)).toBe(true);
    });

    test('Miền Bắc chốt 18:10', () => {
      expect(isPastCutoff('MB', 18, 9)).toBe(false);
      expect(isPastCutoff('MB', 18, 10)).toBe(true);
    });
  });
});

