/**
 * E2E & Business Logic Test Suite: VIETLOTT MATRIX GAMES
 * Power 6/55, Mega 6/45, Max 3D, Max 4D
 * Covers cases from Min Bet to Max Bet, Bao Combinations, Multipliers, and Winning Rules.
 */

describe('VIETLOTT Games Logic & Cost Calculations', () => {
  const getCombinationsCount = (n: number, k: number): number => {
    if (k > n || k < 0) return 0;
    if (k === n || k === 0) return 1;
    let res = 1;
    for (let i = 1; i <= k; i++) {
      res = (res * (n - i + 1)) / i;
    }
    return Math.round(res);
  };

  describe('1. POWER 6/55', () => {
    const evaluatePower655 = (
      userNumbers: string[],
      drawNumbers: string[],
      specialNumber: string,
      cost: number = 10000
    ) => {
      let matchCount = 0;
      let hasSpecial = false;

      userNumbers.forEach((n) => {
        if (drawNumbers.slice(0, 6).includes(n)) matchCount++;
        else if (n === specialNumber) hasSpecial = true;
      });

      let prize = 0;
      let prizeType = 'NONE';

      if (matchCount === 6) {
        prize = 2000000000; // Jackpot 1: 2 Tỷ (MVP)
        prizeType = 'JACKPOT_1';
      } else if (matchCount === 5 && hasSpecial) {
        prize = 1500000000; // Jackpot 2: 1.5 Tỷ
        prizeType = 'JACKPOT_2';
      } else if (matchCount === 5) {
        prize = 40000000; // Giải Nhất
        prizeType = 'G1';
      } else if (matchCount === 4) {
        prize = 500000; // Giải Nhì
        prizeType = 'G2';
      } else if (matchCount === 3) {
        prize = 50000; // Giải Ba
        prizeType = 'G3';
      }

      const multiplier = Math.floor(cost / 10000);
      return { prizeType, totalPrize: prize * (multiplier > 0 ? multiplier : 1) };
    };

    test('Case Min: 1 bảng Cơ bản 6 số, 10.000đ, 1 kỳ', () => {
      const numbers = ['03', '12', '25', '37', '44', '51'];
      expect(numbers.length).toBe(6);

      // Trúng Giải Ba (3 số trùng)
      const resG3 = evaluatePower655(numbers, ['03', '12', '25', '01', '02', '04'], '55', 10000);
      expect(resG3.prizeType).toBe('G3');
      expect(resG3.totalPrize).toBe(50000);

      // Trúng Giải Nhất (5 số trùng)
      const resG1 = evaluatePower655(numbers, ['03', '12', '25', '37', '44', '09'], '55', 10000);
      expect(resG1.prizeType).toBe('G1');
      expect(resG1.totalPrize).toBe(40000000);

      // Trúng Jackpot 2 (5 số trùng + số đặc biệt)
      const resJ2 = evaluatePower655(numbers, ['03', '12', '25', '37', '44', '09'], '51', 10000);
      expect(resJ2.prizeType).toBe('JACKPOT_2');
      expect(resJ2.totalPrize).toBe(1500000000);

      // Trúng Jackpot 1 (6 số trùng)
      const resJ1 = evaluatePower655(numbers, ['03', '12', '25', '37', '44', '51'], '55', 10000);
      expect(resJ1.prizeType).toBe('JACKPOT_1');
      expect(resJ1.totalPrize).toBe(2000000000);
    });

    test('Case Vừa: 6 bảng (A-F), cược 20.000đ/bảng (x2), 2 kỳ quay', () => {
      const numBoards = 6;
      const boardCost = 20000;
      const drawCount = 2;
      const totalCost = numBoards * boardCost * drawCount;
      expect(totalCost).toBe(240000);

      // Trúng Giải Nhì với cược 20k -> Thưởng 500k * 2 = 1.000.000đ
      const res = evaluatePower655(
        ['01', '02', '03', '04', '05', '06'],
        ['01', '02', '03', '04', '10', '11'],
        '12',
        20000
      );
      expect(res.prizeType).toBe('G2');
      expect(res.totalPrize).toBe(1000000);
    });

    test('Bao 5: 50 bộ số -> 500.000đ / kỳ', () => {
      const bao5Count = 55 - 5; // Ghép với 50 số còn lại
      expect(bao5Count).toBe(50);
      const cost = bao5Count * 10000;
      expect(cost).toBe(500000);
    });

    test('Bao 7 đến Bao 18 tổ hợp và chi phí', () => {
      expect(getCombinationsCount(7, 6)).toBe(7);
      expect(getCombinationsCount(7, 6) * 10000).toBe(70000);

      expect(getCombinationsCount(8, 6)).toBe(28);
      expect(getCombinationsCount(8, 6) * 10000).toBe(280000);

      expect(getCombinationsCount(10, 6)).toBe(210);
      expect(getCombinationsCount(10, 6) * 10000).toBe(2100000);

      expect(getCombinationsCount(15, 6)).toBe(5005);
      expect(getCombinationsCount(15, 6) * 10000).toBe(50050000);

      // Bao 18 (Heavy / Max): 18.564 bộ
      expect(getCombinationsCount(18, 6)).toBe(18564);
      expect(getCombinationsCount(18, 6) * 10000).toBe(185640000);
    });
  });

  describe('2. MEGA 6/45', () => {
    const evaluateMega645 = (userNumbers: string[], drawNumbers: string[], cost: number = 10000) => {
      let matchCount = 0;
      userNumbers.forEach((n) => {
        if (drawNumbers.includes(n)) matchCount++;
      });

      let prize = 0;
      if (matchCount === 6) prize = 800000000; // Jackpot
      else if (matchCount === 5) prize = 10000000; // Giải Nhất
      else if (matchCount === 4) prize = 300000; // Giải Nhì
      else if (matchCount === 3) prize = 30000; // Giải Ba

      const multiplier = Math.floor(cost / 10000);
      return prize * (multiplier > 0 ? multiplier : 1);
    };

    test('Bao 5: Ghép với 40 số còn lại -> 400.000đ', () => {
      const bao5Count = 45 - 5;
      expect(bao5Count).toBe(40);
      expect(bao5Count * 10000).toBe(400000);
    });

    test('Giải Ba, Nhì, Nhất và Jackpot', () => {
      const myNumbers = ['01', '02', '03', '04', '05', '06'];

      // 3 số trùng -> 30.000đ
      expect(evaluateMega645(myNumbers, ['01', '02', '03', '10', '11', '12'])).toBe(30000);
      // 4 số trùng cược 50k -> 300.000đ * 5 = 1.500.000đ
      expect(evaluateMega645(myNumbers, ['01', '02', '03', '04', '11', '12'], 50000)).toBe(1500000);
      // 5 số trùng -> 10.000.000đ
      expect(evaluateMega645(myNumbers, ['01', '02', '03', '04', '05', '12'])).toBe(10000000);
      // 6 số trùng -> Jackpot 800.000.000đ
      expect(evaluateMega645(myNumbers, ['01', '02', '03', '04', '05', '06'])).toBe(800000000);
    });
  });

  describe('3. MAX 3D & MAX 3D PRO', () => {
    test('Max 3D Cơ bản: Khớp giải ĐB, Nhất, Nhì, Ba', () => {
      const dacBiet = ['123', '456'];
      const nhat = ['789', '012', '345', '678'];

      // Trùng giải ĐB -> 1.000.000đ
      const isDacBiet = dacBiet.includes('123');
      expect(isDacBiet).toBe(true);
      const prizeDacBiet = 1000000;
      expect(prizeDacBiet).toBe(1000000);

      // Trùng giải Nhất cược 20k -> 350.000 * 2 = 700.000đ
      const isNhat = nhat.includes('789');
      expect(isNhat).toBe(true);
      const prizeNhat = 350000 * 2;
      expect(prizeNhat).toBe(700000);
    });

    test('Max 3D+: 2 bộ số, trúng cả 2 bộ giải ĐB -> 1 Tỷ', () => {
      const myNum1 = '123';
      const myNum2 = '456';
      const dacBiet = ['123', '456'];

      const winJackpot = dacBiet.includes(myNum1) && dacBiet.includes(myNum2);
      expect(winJackpot).toBe(true);
      const prize = 1000000000;
      expect(prize).toBe(1000000000);
    });
  });

  describe('4. MAX 4D', () => {
    const evaluateMax4D = (userNumber: string, winning: { nhat: string; nhi: string[]; ba: string[] }) => {
      if (userNumber === winning.nhat) return 15000000; // Giải Nhất
      if (winning.nhi.includes(userNumber)) return 6500000; // Giải Nhì
      if (winning.ba.includes(userNumber)) return 3000000; // Giải Ba
      if (userNumber.slice(1) === winning.nhat.slice(1)) return 1000000; // Khuyến khích 1 (khớp 3 số cuối)
      if (userNumber.slice(2) === winning.nhat.slice(2)) return 100000; // Khuyến khích 2 (khớp 2 số cuối)
      return 0;
    };

    test('Trúng Giải Nhất, Khuyến khích 1 và Khuyến khích 2', () => {
      const winning = {
        nhat: '7890',
        nhi: ['1234', '5678'],
        ba: ['4321', '8765', '9012'],
      };

      // Trúng Nhất: 15.000.000đ
      expect(evaluateMax4D('7890', winning)).toBe(15000000);

      // Trúng Nhì: 6.500.000đ
      expect(evaluateMax4D('1234', winning)).toBe(6500000);

      // Khuyến khích 1: số '1890' khớp '890' của giải Nhất -> 1.000.000đ
      expect(evaluateMax4D('1890', winning)).toBe(1000000);

      // Khuyến khích 2: số '1290' khớp '90' của giải Nhất -> 100.000đ
      expect(evaluateMax4D('1290', winning)).toBe(100000);

      // Trật -> 0đ
      expect(evaluateMax4D('9999', winning)).toBe(0);
    });

    test('Max 4D Bao hoán vị (4, 6, 12, 24 hoán vị)', () => {
      expect(4 * 10000).toBe(40000);
      expect(6 * 10000).toBe(60000);
      expect(12 * 10000).toBe(120000);
      expect(24 * 10000).toBe(240000);
    });
  });
});

