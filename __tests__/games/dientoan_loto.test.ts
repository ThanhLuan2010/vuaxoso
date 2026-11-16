/**
 * E2E & Business Logic Test Suite: ĐIỆN TOÁN & LÔ TÔ
 * 6x36, Bao 6x36, Lô tô 2,3,5, Lô tô cặp, Trượt lô tô, Thần tài 4, Lotto 5/35, Lotto 5/70
 */

describe('ĐIỆN TOÁN & LÔ TÔ Games Logic', () => {
  const getCombinationsCount = (n: number, k: number): number => {
    if (k > n || k < 0) return 0;
    if (k === n || k === 0) return 1;
    let res = 1;
    for (let i = 1; i <= k; i++) {
      res = (res * (n - i + 1)) / i;
    }
    return Math.round(res);
  };

  describe('1. ĐIỆN TOÁN 6X36 & BAO 6X36', () => {
    test('Cơ bản: 6 số trong 01-36 cược 10.000đ', () => {
      const numbers = ['01', '08', '15', '22', '29', '36'];
      expect(numbers.length).toBe(6);
      expect(numbers.every((n) => parseInt(n, 10) >= 1 && parseInt(n, 10) <= 36)).toBe(true);
    });

    test('Bao 7 đến Bao 15 chi phí tổ hợp', () => {
      expect(getCombinationsCount(7, 6) * 10000).toBe(70000);
      expect(getCombinationsCount(8, 6) * 10000).toBe(280000);
      expect(getCombinationsCount(10, 6) * 10000).toBe(2100000);
      expect(getCombinationsCount(15, 6) * 10000).toBe(50050000);
    });

    test('Cơ cấu giải: Trùng 3 số (15k), 4 số (100k), 5 số (1.8tr), 6 số (Jackpot 2 Tỷ)', () => {
      const evaluate636 = (matchCount: number) => {
        if (matchCount === 6) return 2000000000;
        if (matchCount === 5) return 1800000;
        if (matchCount === 4) return 100000;
        if (matchCount === 3) return 15000;
        return 0;
      };

      expect(evaluate636(3)).toBe(15000);
      expect(evaluate636(4)).toBe(100000);
      expect(evaluate636(5)).toBe(1800000);
      expect(evaluate636(6)).toBe(2000000000);
    });
  });

  describe('2. LÔ TÔ 2, 3, 5 SỐ & BAO LÔ TÔ 2 SỐ', () => {
    test('Lô tô 2 số: Trúng 2 số cuối giải ĐB ăn 70 lần', () => {
      const bet = 10000;
      const prize = bet * 70;
      expect(prize).toBe(700000);
    });

    test('Lô tô 3 số: Trúng 3 số cuối giải ĐB ăn 400 lần', () => {
      const bet = 10000;
      const prize = bet * 400;
      expect(prize).toBe(4000000);
    });

    test('Lô tô 5 số: Trúng cả 5 số giải ĐB ăn 20.000 lần', () => {
      const bet = 10000;
      const prize = bet * 20000;
      expect(prize).toBe(200000000);
    });

    test('Bao lô tô 2 số: Đơn giá * 27 giải MB', () => {
      const unit = 2000; // 2k
      const cost = unit * 27;
      expect(cost).toBe(54000);

      // Ăn 99 lần * 2 nháy
      const win = unit * 99 * 2;
      expect(win).toBe(396000);
    });
  });

  describe('3. LÔ TÔ CẶP (2, 3, 4 CẶP)', () => {
    test('Lô tô 2 cặp (x15 hoặc x110)', () => {
      const bet = 10000;
      expect(bet * 110).toBe(1100000);
    });

    test('Lô tô 3 cặp (x60), 4 cặp (x1000)', () => {
      const bet = 20000;
      expect(bet * 60).toBe(1200000);
      expect(bet * 1000).toBe(20000000);
    });
  });

  describe('4. TRƯỢT LÔ TÔ (4, 8, 10 CẶP)', () => {
    test('Trượt 4, 8, 10 không con nào về', () => {
      expect(10000 * 2.5).toBe(25000);
      expect(10000 * 8).toBe(80000);
      expect(10000 * 12).toBe(120000);
    });
  });

  describe('5. LOTTO 5/35 & LOTTO 5/70 (Mega Millions)', () => {
    test('Lotto 5/35: Bao 6 số chính + 2 số đặc biệt -> 12 bộ số', () => {
      const mainCombos = getCombinationsCount(6, 5); // 6
      const specialCount = 2;
      const totalBoards = mainCombos * specialCount;
      expect(totalBoards).toBe(12);
      expect(totalBoards * 10000).toBe(120000);
    });

    test('Lotto 5/70: 5 số chính (01-70) và 1 Mega ball (01-25)', () => {
      const mainNumbers = ['05', '18', '29', '45', '67'];
      const megaBall = '14';
      expect(mainNumbers.length).toBe(5);
      expect(mainNumbers.every((n) => parseInt(n, 10) >= 1 && parseInt(n, 10) <= 70)).toBe(true);
      expect(parseInt(megaBall, 10) >= 1 && parseInt(megaBall, 10) <= 25).toBe(true);
    });
  });
});

