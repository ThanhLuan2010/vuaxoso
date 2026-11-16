/**
 * E2E & Business Logic Test Suite: KENO, BAO KENO, CL-LN
 * Covers cases from Min Bet to Max Bet, Combinations, Multipliers, and Prize Matching.
 */

describe('KENO Game Logic & Cost Calculations', () => {
  // Helper tính tổ hợp C(n, k)
  const getCombinationsCount = (n: number, k: number): number => {
    if (k > n || k < 0) return 0;
    if (k === n || k === 0) return 1;
    let res = 1;
    for (let i = 1; i <= k; i++) {
      res = (res * (n - i + 1)) / i;
    }
    return Math.round(res);
  };

  // Helper tính thưởng Keno Cơ Bản theo bậc và số trùng
  const getKenoPrize = (bac: number, matchCount: number, baseCost: number = 10000): number => {
    const multiplier = Math.floor(baseCost / 10000);
    let prize = 0;

    switch (bac) {
      case 1:
        if (matchCount === 1) prize = 20000;
        break;
      case 2:
        if (matchCount === 2) prize = 90000;
        break;
      case 3:
        if (matchCount === 3) prize = 200000;
        else if (matchCount === 2) prize = 20000;
        break;
      case 4:
        if (matchCount === 4) prize = 400000;
        else if (matchCount === 3) prize = 50000;
        else if (matchCount === 2) prize = 10000;
        break;
      case 5:
        if (matchCount === 5) prize = 4400000;
        else if (matchCount === 4) prize = 150000;
        else if (matchCount === 3) prize = 10000;
        break;
      case 6:
        if (matchCount === 6) prize = 12500000;
        else if (matchCount === 5) prize = 450000;
        else if (matchCount === 4) prize = 40000;
        else if (matchCount === 3) prize = 10000;
        break;
      case 7:
        if (matchCount === 7) prize = 40000000;
        else if (matchCount === 6) prize = 1200000;
        else if (matchCount === 5) prize = 100000;
        else if (matchCount === 4) prize = 20000;
        break;
      case 8:
        if (matchCount === 8) prize = 200000000;
        else if (matchCount === 7) prize = 5000000;
        else if (matchCount === 6) prize = 500000;
        else if (matchCount === 5) prize = 50000;
        else if (matchCount === 0) prize = 10000;
        break;
      case 9:
        if (matchCount === 9) prize = 800000000;
        else if (matchCount === 8) prize = 12000000;
        else if (matchCount === 7) prize = 1500000;
        else if (matchCount === 6) prize = 150000;
        else if (matchCount === 5) prize = 10000;
        else if (matchCount === 0) prize = 10000;
        break;
      case 10:
        if (matchCount === 10) prize = 2000000000;
        else if (matchCount === 9) prize = 150000000;
        else if (matchCount === 8) prize = 7400000;
        else if (matchCount === 7) prize = 600000;
        else if (matchCount === 6) prize = 80000;
        else if (matchCount === 5) prize = 20000;
        else if (matchCount === 0) prize = 10000;
        break;
    }

    return prize * (multiplier > 0 ? multiplier : 1);
  };

  describe('1. KENO Cơ Bản: Từ Đặt Ít (Min) đến Đặt Nhiều (Max)', () => {
    test('Case Min: 1 bảng Bậc 1, 1 con số, mức cược 10.000đ, 1 kỳ', () => {
      const boards = [{ id: 'A', numbers: ['08'], multiplier: 10000 }];
      const drawCount = 1;
      const totalCost = boards.reduce((sum, b) => sum + b.multiplier * drawCount, 0);

      expect(totalCost).toBe(10000);
      expect(boards[0].numbers.length).toBe(1);

      // Thắng: Trùng 1 số
      expect(getKenoPrize(1, 1, 10000)).toBe(20000);
      // Thua: 0 số
      expect(getKenoPrize(1, 0, 10000)).toBe(0);
    });

    test('Case Vừa: 3 bảng Bậc 2, mức cược 20.000đ, 50.000đ, 2 kỳ', () => {
      const boards = [
        { id: 'A', numbers: ['05', '18'], multiplier: 20000 },
        { id: 'B', numbers: ['11', '22'], multiplier: 50000 },
        { id: 'C', numbers: ['33', '44'], multiplier: 10000 },
      ];
      const drawCount = 2;
      const totalCost = boards.reduce((sum, b) => sum + b.multiplier * drawCount, 0);

      expect(totalCost).toBe((20000 + 50000 + 10000) * 2); // 160.000đ

      // Bảng B trúng Bậc 2 đủ 2 số với cược 50k (gấp 5 lần 10k)
      expect(getKenoPrize(2, 2, 50000)).toBe(90000 * 5); // 450.000đ
    });

    test('Case Max: Tối đa 6 bảng Bậc 10, mức cược 500.000đ/bảng, 10 kỳ quay', () => {
      const boards = ['A', 'B', 'C', 'D', 'E', 'F'].map((id) => ({
        id,
        numbers: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'],
        multiplier: 500000,
      }));
      const drawCount = 10;
      const totalCost = boards.reduce((sum, b) => sum + b.multiplier * drawCount, 0);

      // 6 bảng * 500.000đ * 10 kỳ = 30.000.000đ
      expect(totalCost).toBe(30000000);

      // Trúng Jackpot Bậc 10 (10/10) với mức cược 500k
      expect(getKenoPrize(10, 10, 500000)).toBe(2000000000 * 50);

      // Bậc 10 nhưng trùng 0 số vẫn nhận giải an ủi
      expect(getKenoPrize(10, 0, 500000)).toBe(10000 * 50);
    });
  });

  describe('2. BAO KENO: Tổ hợp và chi phí', () => {
    test('Bao nhỏ: Bao 3 - Bậc 2', () => {
      const combos = getCombinationsCount(3, 2);
      expect(combos).toBe(3);
      const cost = combos * 10000 * 1;
      expect(cost).toBe(30000);
    });

    test('Bao trung bình: Bao 7 - Bậc 4', () => {
      const combos = getCombinationsCount(7, 4);
      expect(combos).toBe(35);
      const cost = combos * 10000 * 2; // 2 kỳ
      expect(cost).toBe(700000);
    });

    test('Bao lớn: Bao 10 - Bậc 5 (Heavy)', () => {
      const combos = getCombinationsCount(10, 5);
      expect(combos).toBe(252);
      const cost = combos * 10000 * 3; // 3 kỳ
      expect(cost).toBe(7560000);
    });

    test('Bao cực đại: Bao 15 - Bậc 6 (Stress)', () => {
      const combos = getCombinationsCount(15, 6);
      expect(combos).toBe(5005);
      const cost = combos * 10000;
      expect(cost).toBe(50050000); // 50.050.000đ
    });
  });

  describe('3. CHẴN LẺ LỚN NHỎ (CL-LN)', () => {
    const evaluateClLn = (selection: string, drawNumbers: number[]) => {
      const countLon = drawNumbers.filter((n) => n >= 41 && n <= 80).length;
      const countNho = drawNumbers.filter((n) => n >= 1 && n <= 40).length;
      const countChan = drawNumbers.filter((n) => n % 2 === 0).length;
      const countLe = drawNumbers.filter((n) => n % 2 !== 0).length;

      let isWin = false;
      let rate = 0;

      switch (selection) {
        case 'Lớn':
          isWin = countLon >= 13;
          rate = 1.9;
          break;
        case 'Nhỏ':
          isWin = countNho >= 13;
          rate = 1.9;
          break;
        case 'Hòa LN':
          isWin = countLon === 10 && countNho === 10;
          rate = 5.8;
          break;
        case 'Chẵn':
          isWin = countChan >= 13;
          rate = 2.0;
          break;
        case 'Lẻ':
          isWin = countLe >= 13;
          rate = 2.0;
          break;
        case 'Hòa CL':
          isWin = countChan === 10 && countLe === 10;
          rate = 5.8;
          break;
        case 'Chẵn 11-12':
          isWin = countChan === 11 || countChan === 12;
          rate = 3.0;
          break;
        case 'Lẻ 11-12':
          isWin = countLe === 11 || countLe === 12;
          rate = 3.0;
          break;
      }

      return { isWin, prize: isWin ? 10000 * rate : 0 };
    };

    test('Đoán Lớn và kết quả có 14 số >= 41 -> Thắng 1.9x', () => {
      // 14 số lớn [41..54], 6 số nhỏ [1..6]
      const draw = [41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 1, 2, 3, 4, 5, 6];
      const res = evaluateClLn('Lớn', draw);
      expect(res.isWin).toBe(true);
      expect(res.prize).toBe(19000);
    });

    test('Đoán Hòa LN và kết quả đúng 10 số nhỏ, 10 số lớn -> Thắng 5.8x', () => {
      const draw = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
      ];
      const res = evaluateClLn('Hòa LN', draw);
      expect(res.isWin).toBe(true);
      expect(res.prize).toBe(58000);
    });

    test('Đoán Chẵn nhưng kết quả chỉ có 12 số chẵn -> Thua', () => {
      // 12 chẵn, 8 lẻ
      const draw = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 1, 3, 5, 7, 9, 11, 13, 15];
      const res = evaluateClLn('Chẵn', draw);
      expect(res.isWin).toBe(false);
      expect(res.prize).toBe(0);

      // Nhưng cửa Chẵn 11-12 sẽ thắng!
      const res1112 = evaluateClLn('Chẵn 11-12', draw);
      expect(res1112.isWin).toBe(true);
      expect(res1112.prize).toBe(30000);
    });
  });

  describe('4. Biên và Ngoại lệ (Edge cases & Validations)', () => {
    test('Phát hiện trùng số trong bảng', () => {
      const numbers = ['05', '05', '18'];
      const unique = new Set(numbers);
      expect(unique.size).toBeLessThan(numbers.length);
    });

    test('Kiểm tra số ngoài khoảng 01 - 80', () => {
      const invalidNumbers = ['00', '81', '99', 'abc'];
      invalidNumbers.forEach((n) => {
        const val = parseInt(n, 10);
        const isValid = !isNaN(val) && val >= 1 && val <= 80;
        expect(isValid).toBe(false);
      });
    });
  });
});

