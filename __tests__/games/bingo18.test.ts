/**
 * E2E & Business Logic Test Suite: BINGO 18
 * Cơ bản, Cộng tổng (3-18), Tài Xỉu Hoà
 */

describe('BINGO 18 Logic & Cost Calculations', () => {
  const evaluateBingo18 = (playType: string, selection: string, drawNumbers: number[], cost: number = 10000) => {
    const sum = drawNumbers.reduce((a, b) => a + b, 0);
    const countOccurrences = (val: number) => drawNumbers.filter((n) => n === val).length;
    const isTriple = drawNumbers[0] === drawNumbers[1] && drawNumbers[1] === drawNumbers[2];

    let isWin = false;
    let rate = 0;

    if (playType === 'Cơ bản') {
      const num = parseInt(selection, 10);
      if (!isNaN(num) && num >= 1 && num <= 6) {
        // Đơn số
        const c = countOccurrences(num);
        if (c === 1) { isWin = true; rate = 1.2; }
        else if (c === 2) { isWin = true; rate = 2.0; }
        else if (c === 3) { isWin = true; rate = 3.0; }
      } else if (selection.length === 2 && selection[0] === selection[1]) {
        // Đôi (11..66)
        const d = parseInt(selection[0], 10);
        if (countOccurrences(d) >= 2) { isWin = true; rate = 7.5; }
      } else if (selection.length === 3 && selection[0] === selection[1] && selection[1] === selection[2]) {
        // Bộ ba cụ thể (111..666)
        const d = parseInt(selection[0], 10);
        if (countOccurrences(d) === 3) { isWin = true; rate = 120; }
      } else if (selection === 'Ba số bất kỳ') {
        if (isTriple) { isWin = true; rate = 20; }
      }
    } else if (playType === 'Cộng tổng') {
      const targetSum = parseInt(selection.replace(/[^0-9]/g, ''), 10);
      if (sum === targetSum) {
        isWin = true;
        const rateMap: Record<number, number> = {
          3: 120, 4: 40, 5: 20, 6: 13, 7: 8.5, 8: 6.5, 9: 5.5, 10: 5.0,
          11: 5.0, 12: 5.5, 13: 6.5, 14: 8.5, 15: 13, 16: 20, 17: 40, 18: 120,
        };
        rate = rateMap[sum] || 0;
      }
    } else if (playType === 'Tài Xỉu Hoà') {
      if (selection === 'Lớn') {
        // Tổng 11-18 và KHÔNG PHẢI BỘ BA
        if (sum >= 11 && sum <= 18 && !isTriple) { isWin = true; rate = 2.0; }
      } else if (selection === 'Nhỏ') {
        // Tổng 3-10 và KHÔNG PHẢI BỘ BA
        if (sum >= 3 && sum <= 10 && !isTriple) { isWin = true; rate = 2.0; }
      } else if (selection === 'Hòa') {
        // Ra bất kỳ bộ ba nào
        if (isTriple) { isWin = true; rate = 8.0; }
      }
    }

    const prize = isWin ? Math.round(cost * rate) : 0;
    return { isWin, prize, rate };
  };

  test('Cơ bản: Đơn số 1-6 với 1, 2, 3 nháy', () => {
    // Đoán số 3
    expect(evaluateBingo18('Cơ bản', '3', [3, 1, 2], 10000).prize).toBe(12000); // 1.2x
    expect(evaluateBingo18('Cơ bản', '3', [3, 3, 2], 10000).prize).toBe(20000); // 2.0x
    expect(evaluateBingo18('Cơ bản', '3', [3, 3, 3], 10000).prize).toBe(30000); // 3.0x
    expect(evaluateBingo18('Cơ bản', '3', [1, 2, 4], 10000).prize).toBe(0); // Thua
  });

  test('Cơ bản: Đôi và Bộ ba', () => {
    // Đôi 22 cược 20k -> 20k * 7.5 = 150.000đ
    expect(evaluateBingo18('Cơ bản', '22', [2, 2, 5], 20000).prize).toBe(150000);

    // Bộ ba 555 cược 10k -> 10k * 120 = 1.200.000đ
    expect(evaluateBingo18('Cơ bản', '555', [5, 5, 5], 10000).prize).toBe(1200000);

    // Ba số bất kỳ cược 10k -> 10k * 20 = 200.000đ
    expect(evaluateBingo18('Cơ bản', 'Ba số bất kỳ', [6, 6, 6], 10000).prize).toBe(200000);
  });

  test('Cộng tổng: Tổng 3 và Tổng 18 (120x)', () => {
    expect(evaluateBingo18('Cộng tổng', 'Tổng 3', [1, 1, 1], 10000).prize).toBe(1200000);
    expect(evaluateBingo18('Cộng tổng', 'Tổng 18', [6, 6, 6], 10000).prize).toBe(1200000);
    expect(evaluateBingo18('Cộng tổng', 'Tổng 10', [3, 3, 4], 10000).prize).toBe(50000); // 5.0x
  });

  test('Tài Xỉu Hoà: Lớn, Nhỏ và Bộ ba Hòa', () => {
    // Lớn thắng khi tổng 15 (4, 5, 6)
    expect(evaluateBingo18('Tài Xỉu Hoà', 'Lớn', [4, 5, 6], 50000).prize).toBe(100000);

    // Nhỏ thắng khi tổng 8 (2, 3, 3)
    expect(evaluateBingo18('Tài Xỉu Hoà', 'Nhỏ', [2, 3, 3], 50000).prize).toBe(100000);

    // Khi ra bộ ba (4, 4, 4) -> Cửa Lớn thua vì dính luật bộ ba!
    expect(evaluateBingo18('Tài Xỉu Hoà', 'Lớn', [4, 4, 4], 50000).prize).toBe(0);

    // Nhưng cửa Hòa thắng 8x!
    expect(evaluateBingo18('Tài Xỉu Hoà', 'Hòa', [4, 4, 4], 10000).prize).toBe(80000);
  });
});

