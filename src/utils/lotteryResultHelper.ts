export interface ComboEvalResult {
  isWinning: boolean;
  hitNumbers: Set<string>;
  subNumbers: string[];
}

/**
 * Chuẩn hóa 3 con xúc xắc / quả bóng của kỳ quay Bingo 18.
 * Kết quả có thể là: ['6', '6', '6'], ['666'], '6,6,6', '6 6 6'...
 */
export const parseBingo18Dice = (rawWinningNumbers: string[]): number[] => {
  if (!rawWinningNumbers || rawWinningNumbers.length === 0) return [];

  // Trường hợp mảng >= 3 phần tử đơn số (ví dụ ['6', '6', '6'])
  if (rawWinningNumbers.length >= 3 && rawWinningNumbers.slice(0, 3).every(n => String(n).trim().length === 1)) {
    const dice = rawWinningNumbers.slice(0, 3).map(n => parseInt(String(n).trim(), 10)).filter(n => !isNaN(n) && n >= 1 && n <= 6);
    if (dice.length === 3) return dice;
  }

  const joined = rawWinningNumbers.join(' ').replace(/[,;]/g, ' ').trim();
  const parts = joined.split(/\s+/).filter(Boolean);
  if (parts.length >= 3) {
    const dice = parts.slice(0, 3).map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n >= 1 && n <= 6);
    if (dice.length === 3) return dice;
  }

  // Nếu là chuỗi liền kề 3 chữ số, ví dụ "666" hay "123"
  const digits = joined.replace(/\D/g, '');
  if (digits.length === 3) {
    return digits.split('').map(n => parseInt(n, 10)).filter(n => n >= 1 && n <= 6);
  }

  if (rawWinningNumbers.length > 0) {
    const first = String(rawWinningNumbers[0]).trim();
    if (first.length === 3 && /^[1-6]{3}$/.test(first)) {
      return first.split('').map(n => parseInt(n, 10));
    }
  }

  return [];
};

export interface Bingo18EvalResult {
  isWinning: boolean;
  multiplier: number;
  hitNumbers: Set<string>;
}

export const evaluateBingo18 = (
  comboStr: string,
  playType: string | undefined,
  rawWinningNumbers: string[]
): Bingo18EvalResult => {
  const dice = parseBingo18Dice(rawWinningNumbers);
  if (dice.length < 3) {
    return { isWinning: false, multiplier: 0, hitNumbers: new Set() };
  }

  const cleanCombo = String(comboStr).trim();
  const pType = (playType || '').toLowerCase();
  const hitNumbers = new Set<string>();

  const sum = dice[0] + dice[1] + dice[2];
  const isTriple = dice[0] === dice[1] && dice[1] === dice[2];
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  dice.forEach(d => { counts[d] = (counts[d] || 0) + 1; });

  // 1. CỘNG TỔNG
  if (
    pType.includes('tổng') ||
    pType.includes('tong') ||
    (!isNaN(Number(cleanCombo)) && Number(cleanCombo) >= 3 && Number(cleanCombo) <= 18 && (pType.includes('cộng') || pType.includes('cong')))
  ) {
    const targetSum = parseInt(cleanCombo, 10);
    if (sum === targetSum) {
      hitNumbers.add(cleanCombo);
      const sumRates: Record<number, number> = {
        3: 120,
        4: 40,
        5: 20,
        6: 12,
        7: 8,
        8: 6,
        9: 5,
        10: 5,
        11: 5,
        12: 5,
        13: 6,
        14: 8,
        15: 12,
        16: 20,
        17: 40,
        18: 120
      };
      return { isWinning: true, multiplier: sumRates[sum] || 5, hitNumbers };
    }
    return { isWinning: false, multiplier: 0, hitNumbers };
  }

  // 2. TÀI XỈU HOÀ (LỚN - NHỎ - HOÀ)
  const isTai = cleanCombo.toLowerCase() === 'tài' || cleanCombo.toLowerCase() === 'tai' || cleanCombo.toLowerCase() === 'lớn' || cleanCombo.toLowerCase() === 'lon';
  const isXiu = cleanCombo.toLowerCase() === 'xỉu' || cleanCombo.toLowerCase() === 'xiu' || cleanCombo.toLowerCase() === 'nhỏ' || cleanCombo.toLowerCase() === 'nho';
  const isHoa = cleanCombo.toLowerCase() === 'hoà' || cleanCombo.toLowerCase() === 'hoa';

  if (isTai) {
    const isWin = sum >= 12 || (sum >= 11 && !isTriple);
    if (isWin) {
      hitNumbers.add(cleanCombo);
      return { isWinning: true, multiplier: 2, hitNumbers };
    }
    return { isWinning: false, multiplier: 0, hitNumbers };
  }

  if (isXiu) {
    const isWin = sum <= 9 || (sum <= 10 && !isTriple);
    if (isWin) {
      hitNumbers.add(cleanCombo);
      return { isWinning: true, multiplier: 2, hitNumbers };
    }
    return { isWinning: false, multiplier: 0, hitNumbers };
  }

  if (isHoa) {
    const isWin = sum === 10 || sum === 11 || (sum >= 10 && sum <= 11) || isTriple;
    if (isWin) {
      hitNumbers.add(cleanCombo);
      return { isWinning: true, multiplier: 3, hitNumbers };
    }
    return { isWinning: false, multiplier: 0, hitNumbers };
  }

  // 3. CƠ BẢN:
  // 3.1. Ba số trùng (111, 222, 333, 444, 555, 666): Tỉ lệ 4 (Trúng 3 giống nhau)
  if (/^[1-6]{3}$/.test(cleanCombo) && cleanCombo[0] === cleanCombo[1] && cleanCombo[1] === cleanCombo[2]) {
    const digit = parseInt(cleanCombo[0], 10);
    if (isTriple && dice[0] === digit) {
      hitNumbers.add(cleanCombo);
      hitNumbers.add(String(digit));
      return { isWinning: true, multiplier: 4, hitNumbers };
    }
    return { isWinning: false, multiplier: 0, hitNumbers };
  }

  // 3.2. Hai số trùng (11, 22, 33, 44, 55, 66): Tỉ lệ 3 (Trúng 2 giống nhau)
  if (/^[1-6]{2}$/.test(cleanCombo) && cleanCombo[0] === cleanCombo[1]) {
    const digit = parseInt(cleanCombo[0], 10);
    if ((counts[digit] || 0) >= 2) {
      hitNumbers.add(cleanCombo);
      hitNumbers.add(String(digit));
      return { isWinning: true, multiplier: 3, hitNumbers };
    }
    return { isWinning: false, multiplier: 0, hitNumbers };
  }

  // 3.3. Một số (1, 2, 3, 4, 5, 6): Tỉ lệ 2 (Trúng 1 số)
  if (/^[1-6]$/.test(cleanCombo)) {
    const digit = parseInt(cleanCombo, 10);
    const cnt = counts[digit] || 0;
    if (cnt >= 1) {
      hitNumbers.add(cleanCombo);
      return { isWinning: true, multiplier: 2, hitNumbers };
    }
    return { isWinning: false, multiplier: 0, hitNumbers };
  }

  // 3.4. Kiểm tra fallback nếu cược số dạng tổng
  if (!isNaN(Number(cleanCombo))) {
    const targetSum = parseInt(cleanCombo, 10);
    if (targetSum >= 3 && targetSum <= 18 && sum === targetSum) {
      hitNumbers.add(cleanCombo);
      return { isWinning: true, multiplier: 5, hitNumbers };
    }
  }

  return { isWinning: false, multiplier: 0, hitNumbers };
};

export const parseWinningNumbers = (raw: any): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).map(s => s.trim()).filter(s => s && s !== '|' && s !== '+' && s !== '-');
  if (typeof raw === 'string') {
    return raw.split(/[,;\s]+/).map(s => s.trim()).filter(s => s && s !== '|' && s !== '+' && s !== '-');
  }
  return [];
};

/**
 * Đánh giá một bộ số hoặc số cược có trúng thưởng hay không.
 * Hỗ trợ tất cả các thể loại: Lô Xiên (Xiên 2, 3, 4), Lô Trượt (Trượt 4, 6, 8, 10),
 * Bao Lô, Đề, 3 Càng, 4 Càng, Vietlott, Keno.
 */
export const evaluateWinningCombo = (
  comboStr: string,
  ticket: any,
  rawWinningNumbers: string[]
): ComboEvalResult => {
  if (!comboStr) {
    return { isWinning: false, hitNumbers: new Set(), subNumbers: [] };
  }

  // Tách các số trong bộ số (combo) theo dấu &, phẩy, chấm phẩy, khoảng trắng, gạch ngang
  const subNumbers = String(comboStr)
    .split(/[&,;\s-]+/)
    .map(s => s.trim())
    .filter(Boolean);

  if (subNumbers.length === 0) {
    return { isWinning: false, hitNumbers: new Set(), subNumbers: [] };
  }

  if (!rawWinningNumbers || rawWinningNumbers.length === 0) {
    return { isWinning: false, hitNumbers: new Set(), subNumbers };
  }

  const pType = (ticket?.playType || '').toLowerCase();
  const gType = (ticket?.gameType || '').toLowerCase();

  // 1. Thu thập tất cả các đuôi số từ kết quả xổ số kiến thiết 3 miền / lô đề
  // allLast2: Tập hợp 2 số cuối của toàn bộ các giải trong kỳ quay
  const allLast2 = new Set(
    rawWinningNumbers
      .map(n => String(n).trim().padStart(2, '0').slice(-2))
      .filter(s => s.length === 2)
  );

  const allLast3 = new Set(
    rawWinningNumbers
      .map(n => String(n).trim().slice(-3))
      .filter(s => s.length === 3)
  );

  const allLast4 = new Set(
    rawWinningNumbers
      .map(n => String(n).trim().slice(-4))
      .filter(s => s.length === 4)
  );

  const gdb = String(rawWinningNumbers[0] || '').trim();
  const g1 = String(rawWinningNumbers[1] || '').trim();
  const rawWinSet = new Set(rawWinningNumbers.map(n => String(n).trim()));
  const rawWinPaddedSet = new Set(rawWinningNumbers.map(n => String(n).trim().padStart(2, '0')));

  const isBingo18 = gType === 'bingo18' || gType === 'bingo_18';
  if (isBingo18) {
    const res = evaluateBingo18(comboStr, ticket?.playType, rawWinningNumbers);
    return { isWinning: res.isWinning, hitNumbers: res.hitNumbers, subNumbers };
  }

  const isKenoOrVietlott = [
    'keno', 'bao_keno', 'clln_keno',
    'power_655', 'mega_645', 'max_3d', 'max_3d_pro', 'max_3d_plus', 'max_4d',
    'lotto_535', 'lotto_570', 'dientoan_636', 'bao_636'
  ].includes(gType);

  // CASE 1: LÔ TRƯỢT / TRƯỢT XIÊN (Trượt 4, Trượt 6, Trượt 8, Trượt 10, truot_loto)
  // Quy luật: Vé/bộ số TRÚNG khi TẤT CẢ các con số trong bộ ĐỀU TRƯỢT (không con nào xuất hiện trong allLast2)
  const isTruot = !isKenoOrVietlott && (pType.includes('trượt') || pType.includes('truot') || gType === 'truot_loto');
  if (isTruot) {
    const paddedSubNumbers = subNumbers.map(n => n.padStart(2, '0'));
    const hitNumbers = new Set(paddedSubNumbers.filter(n => allLast2.has(n)));
    // Trúng khi: có ít nhất 2 số và KHÔNG CÓ con nào về trong bảng kết quả
    const isWinning = paddedSubNumbers.length >= 2 && hitNumbers.size === 0 && allLast2.size > 0;
    return { isWinning, hitNumbers, subNumbers: paddedSubNumbers };
  }

  // CASE 2: LÔ XIÊN (Xiên 2, Xiên 3, Xiên 4) hoặc LÔ TÔ CẶP (loto_cap)
  // Quy luật: Vé/bộ số TRÚNG khi TẤT CẢ các con số trong bộ ĐỀU VỀ (đều có trong allLast2)
  const isXienLoto =
    !isKenoOrVietlott &&
    (pType.includes('xiên') ||
      pType.includes('xien') ||
      pType.includes('cặp') ||
      pType.includes('cap') ||
      gType === 'loto_cap' ||
      (subNumbers.length >= 2 && String(comboStr).includes('&')));
  if (isXienLoto) {
    // 2.1. Xiên ĐB: Các số phải về ở 2 số cuối giải đặc biệt
    if (pType.includes('đb') || pType.includes('db')) {
      const gdb2 = gdb.slice(-2);
      const hitNumbers = new Set(subNumbers.filter(n => gdb2.includes(n)));
      const isWinning = subNumbers.length > 0 && hitNumbers.size > 0 && Boolean(gdb2);
      return { isWinning, hitNumbers, subNumbers };
    }

    // 2.2. Xiên Giải 1: Các số phải về ở 2 số cuối giải 1
    if (pType.includes('giải 1') || pType.includes('giai 1') || pType.includes('g1')) {
      const g1_2 = g1.slice(-2);
      const hitNumbers = new Set(subNumbers.filter(n => g1_2.includes(n)));
      const isWinning = subNumbers.length > 0 && hitNumbers.size > 0 && Boolean(g1_2);
      return { isWinning, hitNumbers, subNumbers };
    }

    // 2.3. Lô xiên 2, 3, 4 hoặc Lô tô 2, 3, 4 cặp thông thường
    const paddedSubNumbers = subNumbers.map(n => n.padStart(2, '0'));
    const hitNumbers = new Set(paddedSubNumbers.filter(n => allLast2.has(n)));
    const isWinning = paddedSubNumbers.length >= 2 && hitNumbers.size === paddedSubNumbers.length && allLast2.size > 0;
    return { isWinning, hitNumbers, subNumbers: paddedSubNumbers };
  }

  // CASE 3: ĐỀ ĐẶC BIỆT / ĐỀ GIẢI 1 / 3 CÀNG / 4 CÀNG / BAO LÔ
  if (subNumbers.length === 1) {
    const num = subNumbers[0];

    // 3 Càng
    if (pType.includes('3 càng') || pType.includes('3 cang')) {
      const isWinning = Boolean(gdb) && gdb.endsWith(num) && num.length === 3;
      return { isWinning, hitNumbers: isWinning ? new Set([num]) : new Set(), subNumbers };
    }

    // 4 Càng
    if (pType.includes('4 càng') || pType.includes('4 cang')) {
      const isWinning = Boolean(gdb) && gdb.endsWith(num) && num.length === 4;
      return { isWinning, hitNumbers: isWinning ? new Set([num]) : new Set(), subNumbers };
    }

    // Đề ĐB
    if (pType.includes('đề') || pType.includes('de') || pType.includes('đặc biệt')) {
      const isWinning = Boolean(gdb) && gdb.endsWith(num);
      return { isWinning, hitNumbers: isWinning ? new Set([num]) : new Set(), subNumbers };
    }

    // Đề Giải 1
    if (pType.includes('giải 1') || pType.includes('giai 1')) {
      const isWinning = Boolean(g1) && g1.endsWith(num);
      return { isWinning, hitNumbers: isWinning ? new Set([num]) : new Set(), subNumbers };
    }

    // Bao lô 2 số (hoặc dàn lô)
    if (num.length === 2 && allLast2.has(num)) {
      return { isWinning: true, hitNumbers: new Set([num]), subNumbers };
    }

    // Bao lô 3 số
    if (num.length === 3 && allLast3.has(num)) {
      return { isWinning: true, hitNumbers: new Set([num]), subNumbers };
    }

    // Bao lô 4 số
    if (num.length === 4 && allLast4.has(num)) {
      return { isWinning: true, hitNumbers: new Set([num]), subNumbers };
    }
  }

  // CASE 4: KENO / VIETLOTT (Power, Mega, Max 3D, Lotto 5/35, Bingo 18)
  if (isKenoOrVietlott) {
    const hitNumbers = new Set(
      subNumbers.filter(n => rawWinPaddedSet.has(n.padStart(2, '0')) || rawWinSet.has(n))
    );

    // Đối với số đơn lẻ (ví dụ kiểm tra từng con số riêng rẽ):
    if (subNumbers.length === 1) {
      // DUY NHẤT Keno Bậc 1 mới trúng khi trùng 1 số đơn lẻ
      // Power 6/55, Mega 6/45, Điện toán 6/36, Lotto, Keno bậc 2-10... trùng 1 số TUYỆT ĐỐI KHÔNG TRÚNG!
      const isKenoBac1 = gType === 'keno' && (pType.includes('bậc 1') || pType.includes('bac 1'));
      const isWinning = isKenoBac1 && hitNumbers.size === 1;
      return { isWinning, hitNumbers, subNumbers };
    }

    // Power 6/55
    if (gType === 'power_655') {
      const drawMain = rawWinningNumbers.slice(0, 6).map(n => String(n).trim().padStart(2, '0'));
      const drawSpecial = rawWinningNumbers.length > 6 ? String(rawWinningNumbers[6]).trim().padStart(2, '0') : null;
      const matchedMain = subNumbers.map(n => n.padStart(2, '0')).filter(n => drawMain.includes(n));
      const hasSpecial = drawSpecial ? subNumbers.map(n => n.padStart(2, '0')).includes(drawSpecial) : false;
      let isWin = false;
      if (subNumbers.length === 5) {
        isWin = matchedMain.length >= 2 || (matchedMain.length >= 1 && hasSpecial);
      } else if (subNumbers.length === 6) {
        isWin = matchedMain.length >= 3 || (matchedMain.length === 5 && hasSpecial);
      } else if (subNumbers.length > 6) {
        isWin = matchedMain.length >= 3 || (matchedMain.length >= 2 && hasSpecial);
      }
      return { isWinning: isWin, hitNumbers, subNumbers };
    }

    // Mega 6/45
    if (gType === 'mega_645') {
      const drawMain = rawWinningNumbers.slice(0, 6).map(n => String(n).trim().padStart(2, '0'));
      const matchedMain = subNumbers.map(n => n.padStart(2, '0')).filter(n => drawMain.includes(n));
      const isWin = subNumbers.length === 5 ? matchedMain.length >= 2 : matchedMain.length >= 3;
      return { isWinning: isWin, hitNumbers, subNumbers };
    }

    // Điện toán 6/36
    if (gType === 'dientoan_636' || gType === 'bao_636') {
      const drawMain = rawWinningNumbers.slice(0, 6).map(n => String(n).trim().padStart(2, '0'));
      const matchedMain = subNumbers.map(n => n.padStart(2, '0')).filter(n => drawMain.includes(n));
      const isWin = (subNumbers.length === 4 || subNumbers.length === 5) ? matchedMain.length >= 2 : matchedMain.length >= 3;
      return { isWinning: isWin, hitNumbers, subNumbers };
    }

    // Lotto 5/35 & Lotto 5/70
    if (gType === 'lotto_535' || gType === 'lotto_570') {
      const drawMain = rawWinningNumbers.slice(0, 5).map(n => String(n).trim().padStart(2, '0'));
      const drawSpecial = rawWinningNumbers.length > 5 ? String(rawWinningNumbers[5]).trim().padStart(2, '0') : null;
      const matchedMain = subNumbers.map(n => n.padStart(2, '0')).filter(n => drawMain.includes(n));
      const hasSpecial = drawSpecial ? subNumbers.map(n => n.padStart(2, '0')).includes(drawSpecial) : false;
      const isWin = hasSpecial || matchedMain.length >= 3;
      return { isWinning: isWin, hitNumbers, subNumbers };
    }

    // Keno
    if (gType === 'keno' || gType === 'bao_keno') {
      const m = hitNumbers.size;
      const bac = subNumbers.length;
      let isWin = false;
      if (gType === 'bao_keno' || pType.includes('bao')) {
        const match = pType.match(/bậc\s+(\d+)/i);
        const baoBac = match ? parseInt(match[1], 10) : 2;
        isWin = m >= baoBac;
      } else {
        if (bac === 1) isWin = (m === 1);
        else if (bac === 2) isWin = (m === 2);
        else if (bac === 3) isWin = (m >= 2);
        else if (bac === 4) isWin = (m >= 2);
        else if (bac === 5) isWin = (m >= 3);
        else if (bac === 6) isWin = (m >= 3);
        else if (bac === 7) isWin = (m >= 4);
        else if (bac === 8) isWin = (m === 0 || m >= 5);
        else if (bac === 9) isWin = (m === 0 || m >= 5);
        else if (bac === 10) isWin = (m === 0 || m >= 5);
        else isWin = (m >= Math.min(bac, 4));
      }
      return { isWinning: isWin, hitNumbers, subNumbers };
    }

    // Đối với bộ số đầy đủ khác (Max 3D, Max 4D...):
    const isWinning = hitNumbers.size === subNumbers.length && subNumbers.length > 0;
    return { isWinning, hitNumbers, subNumbers };
  }

  // CASE 5: THẦN TÀI 4 & ĐIỆN TOÁN 1-2-3 (than_tai_4)
  if (gType === 'than_tai_4') {
    const is123 = pType.includes('1-2-3') || pType.includes('123');
    const cleanCombo = String(comboStr).trim();

    if (!is123) {
      // Thần tài 4: So khớp 4 chữ số
      const betDigits = cleanCombo.replace(/\D/g, '');
      let winDigits = '';
      if (rawWinningNumbers.length === 1 && rawWinningNumbers[0].length >= 4) {
        winDigits = rawWinningNumbers[0].trim().slice(-4);
      } else if (rawWinningNumbers.length >= 4 && rawWinningNumbers.slice(0, 4).every(w => w.length === 1)) {
        winDigits = rawWinningNumbers.slice(0, 4).join('');
      } else {
        const joined = rawWinningNumbers.join('').replace(/\D/g, '');
        if (joined.length >= 4) winDigits = joined.slice(0, 4);
        else if (rawWinningNumbers.length > 0) winDigits = rawWinningNumbers[0].trim();
      }

      if (betDigits.length === 4 && winDigits.length === 4) {
        const isG1 = betDigits === winDigits;
        const isG2 = betDigits.slice(0, 3) === winDigits.slice(0, 3);
        const isG3 = betDigits.slice(1, 4) === winDigits.slice(1, 4);
        const isGK1 = betDigits.slice(0, 2) === winDigits.slice(0, 2);
        const isGK2 = betDigits.slice(2, 4) === winDigits.slice(2, 4);
        const isWinning = isG1 || isG2 || isG3 || isGK1 || isGK2;

        const hitNumbers = new Set<string>();
        if (isWinning) {
          hitNumbers.add(cleanCombo);
          if (isG1) hitNumbers.add(betDigits);
          if (isG2) hitNumbers.add(betDigits.slice(0, 3));
          if (isG3) hitNumbers.add(betDigits.slice(1, 4));
          if (isGK1) hitNumbers.add(betDigits.slice(0, 2));
          if (isGK2) hitNumbers.add(betDigits.slice(2, 4));
        }
        return { isWinning, hitNumbers, subNumbers };
      }

      const hitNumbers = new Set(subNumbers.filter(n => winDigits.includes(n) || rawWinSet.has(n)));
      const isWinning = Boolean(winDigits && winDigits === betDigits);
      return { isWinning, hitNumbers, subNumbers };
    } else {
      // Điện toán 1-2-3
      let betB1 = '', betB2 = '', betB3 = '';
      if (subNumbers.length === 3) {
        betB1 = subNumbers[0];
        betB2 = subNumbers[1];
        betB3 = subNumbers[2];
      } else if (subNumbers.length === 6) {
        betB1 = subNumbers[0];
        betB2 = subNumbers[1] + subNumbers[2];
        betB3 = subNumbers[3] + subNumbers[4] + subNumbers[5];
      } else {
        const digits = cleanCombo.replace(/\D/g, '');
        if (digits.length >= 6) {
          betB1 = digits.slice(0, 1);
          betB2 = digits.slice(1, 3);
          betB3 = digits.slice(3, 6);
        }
      }

      let winB1 = '', winB2 = '', winB3 = '';
      if (rawWinningNumbers.length === 3) {
        winB1 = rawWinningNumbers[0].trim();
        winB2 = rawWinningNumbers[1].trim();
        winB3 = rawWinningNumbers[2].trim();
      } else if (rawWinningNumbers.length >= 6) {
        winB1 = rawWinningNumbers[0].trim();
        winB2 = rawWinningNumbers[1].trim() + rawWinningNumbers[2].trim();
        winB3 = rawWinningNumbers[3].trim() + rawWinningNumbers[4].trim() + rawWinningNumbers[5].trim();
      }

      const matchB3 = Boolean(betB3 && winB3 && betB3 === winB3);
      const isWinning = matchB3;
      const hitNumbers = new Set<string>();
      if (isWinning) {
        hitNumbers.add(betB3);
        if (betB2 && winB2 && betB2 === winB2) hitNumbers.add(betB2);
        if (betB1 && winB1 && betB1 === winB1) hitNumbers.add(betB1);
      }
      return { isWinning, hitNumbers, subNumbers };
    }
  }

  // FALLBACK CHUNG
  const hitNumbers = new Set(
    subNumbers.filter(n => rawWinSet.has(n) || allLast2.has(n))
  );
  const isWinning = hitNumbers.size === subNumbers.length && subNumbers.length > 0;
  return { isWinning, hitNumbers, subNumbers };
};

/**
 * Kiểm tra xem một số trong bảng kết quả mở thưởng (theo từng giải/hàng)
 * có trúng thưởng theo loại cược (playType) của vé hay không.
 *
 * @param winNum Số mở thưởng trong giải (VD: "010031", "01433", "81833", "7747", "31")
 * @param rowLabel Tên giải (VD: "Đặc biệt", "Giải Nhất", "Giải Tám", v.v.)
 * @param ticket Thông tin vé cược (playType, gameType, region, v.v.)
 * @param userBetNumbers Tập hợp các số người chơi đã cược
 */
export const isPrizeRowMatch = (
  winNum: string,
  rowLabel: string | undefined,
  ticket: any,
  userBetNumbers: Set<string>
): boolean => {
  if (!winNum || typeof winNum !== 'string') return false;
  const cleanWin = winNum.trim();
  if (!cleanWin) return false;

  const pType = (ticket?.playType || '').toLowerCase();
  const gType = (ticket?.gameType || '').toLowerCase();
  const label = (rowLabel || '').toLowerCase().trim();

  // 1. Đề đầu đuôi
  if (pType.includes('đầu đuôi') || pType.includes('dau duoi')) {
    const isMB = gType.includes('mb') || (ticket?.region || '').toLowerCase().includes('mb');

    // 3 Càng đầu đuôi (3 số)
    if (pType.includes('3 càng') || pType.includes('3 cang')) {
      const isTargetRow = label.includes('đặc biệt') || (isMB ? label.includes('sáu') : label.includes('bảy'));
      if (!isTargetRow) return false;
      return Array.from(userBetNumbers).some(bet => bet && bet.length === 3 && cleanWin.endsWith(bet));
    }

    // Đề đầu đuôi (2 số):
    // Miền Nam (MN) & Miền Trung (MT): CHỈ xét Giải Đặc Biệt và Giải Tám
    // Miền Bắc (MB): CHỈ xét Giải Đặc Biệt và Giải Bảy
    const isTargetRow = label.includes('đặc biệt') || (isMB ? label.includes('bảy') : label.includes('tám'));
    if (!isTargetRow) return false;

    return Array.from(userBetNumbers).some(bet => {
      if (!bet) return false;
      const sub = bet.includes('&') ? bet.split('&').map(s => s.trim()) : [bet.trim()];
      return sub.some(s => s && s.length === 2 && cleanWin.endsWith(s));
    });
  }

  // 2. Đề giải 8 (MN/MT)
  if (pType.includes('giải 8') || pType.includes('giai 8')) {
    if (!label.includes('tám')) return false;
    return Array.from(userBetNumbers).some(bet => bet && cleanWin.endsWith(bet));
  }

  // 3. Đề giải 7 (MB)
  if (pType.includes('giải 7') || pType.includes('giai 7')) {
    if (!label.includes('bảy')) return false;
    return Array.from(userBetNumbers).some(bet => bet && cleanWin.endsWith(bet));
  }

  // 4. Đề giải 1 / 3 Càng giải 1 / 4 Càng giải 1 / Đề đầu giải 1
  if (pType.includes('giải 1') || pType.includes('giai 1') || pType.includes('g1')) {
    if (!label.includes('nhất')) return false;
    const isDau = pType.includes('đầu');
    return Array.from(userBetNumbers).some(bet => {
      if (!bet) return false;
      if (isDau && cleanWin.startsWith(bet)) return true;
      return cleanWin.endsWith(bet);
    });
  }

  // 5. Đề ĐB / Đề đầu ĐB / Đề đuôi / 3 Càng ĐB / 4 Càng ĐB
  if (
    pType.includes('đề') || pType.includes('de') ||
    pType.includes('3 càng') || pType.includes('4 càng') ||
    pType.includes('đặc biệt')
  ) {
    if (!label.includes('đặc biệt')) return false;

    // Đề đầu ĐB (2 số đầu của giải ĐB)
    if (pType.includes('đầu đb')) {
      return Array.from(userBetNumbers).some(bet => bet && cleanWin.startsWith(bet));
    }
    // Đề đầu (chữ số hàng chục của giải ĐB)
    if (pType.includes('đề đầu') && !pType.includes('đuôi')) {
      const specialChuc = cleanWin.slice(-2, -1);
      return userBetNumbers.has(specialChuc);
    }
    // Đề đuôi (chữ số hàng đơn vị của giải ĐB)
    if (pType.includes('đề đuôi') && !pType.includes('đầu')) {
      const specialDonVi = cleanWin.slice(-1);
      return userBetNumbers.has(specialDonVi);
    }

    return Array.from(userBetNumbers).some(bet => bet && cleanWin.endsWith(bet));
  }

  // 6. Lô các giải cụ thể: Lô giải 3, giải 4, giải 5, giải 6
  if (pType.includes('giải 3')) {
    if (!label.includes('ba')) return false;
    return Array.from(userBetNumbers).some(bet => bet && cleanWin.endsWith(bet));
  }
  if (pType.includes('giải 4')) {
    if (!label.includes('tư')) return false;
    return Array.from(userBetNumbers).some(bet => bet && cleanWin.endsWith(bet));
  }
  if (pType.includes('giải 5')) {
    if (!label.includes('năm')) return false;
    return Array.from(userBetNumbers).some(bet => bet && cleanWin.endsWith(bet));
  }
  if (pType.includes('giải 6')) {
    if (!label.includes('sáu')) return false;
    return Array.from(userBetNumbers).some(bet => bet && cleanWin.endsWith(bet));
  }

  // 7. Lô Trượt: Không tô xanh trúng trên bảng giải (vì lô trượt ăn khi không về)
  if (pType.includes('trượt') || pType.includes('truot') || gType === 'truot_loto') {
    return false;
  }

  // 8. Lô 2 số đầu: Áp dụng mọi giải nhưng so startsWith
  if (pType.includes('2 số đầu') || pType.includes('2 so dau')) {
    return Array.from(userBetNumbers).some(bet => bet && cleanWin.startsWith(bet));
  }

  // 9. THẦN TÀI 4 & ĐIỆN TOÁN 1-2-3 (than_tai_4)
  if (gType === 'than_tai_4') {
    if (ticket?.status === 'completed' && !ticket?.isWinner) return false;
    if (userBetNumbers.has(cleanWin)) return true;

    for (const bet of userBetNumbers) {
      if (!bet) continue;
      if (cleanWin.length === 4 && bet.length === 4) {
        if (
          cleanWin === bet ||
          cleanWin.slice(0, 3) === bet.slice(0, 3) ||
          cleanWin.slice(1, 4) === bet.slice(1, 4) ||
          cleanWin.slice(0, 2) === bet.slice(0, 2) ||
          cleanWin.slice(2, 4) === bet.slice(2, 4)
        ) {
          return true;
        }
      }
    }

    if (ticket?.isWinner && (ticket?.status === 'completed' || (ticket?.winningNumbers && ticket?.winningNumbers.length > 0))) {
      return true;
    }
    return false;
  }

  // 10. BINGO 18
  if (gType === 'bingo18' || gType === 'bingo_18') {
    if (userBetNumbers.has(cleanWin)) return true;
    for (const bet of userBetNumbers) {
      if (!bet) continue;
      const cleanBet = String(bet).replace(/^dãy\s+[a-z]:\s*/i, '').trim();
      if (cleanBet === cleanWin) return true;
      if (cleanBet.includes(cleanWin) && cleanWin.length === 1) return true;
      if (cleanWin.includes(cleanBet) && cleanBet.length === 1) return true;
    }
    return false;
  }

  // 11. Bao Lô 2, 3, 4 số / Lô Xiên / Vé số truyền thống (áp dụng cho tất cả các giải)
  if (userBetNumbers.has(cleanWin)) return true;
  for (const bet of userBetNumbers) {
    if (!bet) continue;
    if (bet.includes('&')) {
      const sub = bet.split('&').map(s => s.trim());
      if (sub.some(s => s && cleanWin.endsWith(s))) return true;
    } else {
      if (bet.length >= 2 && cleanWin.endsWith(bet)) return true;
    }
  }
  return false;
};

/**
 * Kiểm tra xem một vé có phải là loại cược ghép (Xiên, Cặp, Trượt) hay không.
 */
export const isCombinationBet = (ticket: any): boolean => {
  const pType = (ticket?.playType || '').toLowerCase();
  const gType = (ticket?.gameType || '').toLowerCase();
  return (
    pType.includes('xiên') ||
    pType.includes('xien') ||
    pType.includes('cặp') ||
    pType.includes('cap') ||
    pType.includes('trượt') ||
    pType.includes('truot') ||
    gType === 'loto_cap' ||
    gType === 'truot_loto'
  );
};

export interface ItemComboResult {
  isComboBet: boolean;
  isWinning: boolean;
  hitNumbers: Set<string>;
  displayNumbers: string[];
  comboStr: string;
  hitIndices?: Set<number>;
  prizeMultiplier?: number;
}

/**
 * Đánh giá một item trong vé cược (A, B, C, D, E...) xem có trúng thưởng hay không.
 * Nếu là cược ghép (Lô tô cặp, Lô xiên, Lô trượt) hoặc các game ma trận (Power 6/55, Mega 6/45,
 * Điện toán 6/36, Keno, Lotto 5/35, Lotto 5/70, Bingo 18...) thì đánh giá toàn bộ dãy số theo đúng luật chơi chuẩn.
 */
export const evaluateItemCombo = (
  item: any,
  ticket: any,
  rawWinningNumbers: string[]
): ItemComboResult => {
  const pType = (item?.playType || ticket?.playType || '').toLowerCase();
  const gType = (ticket?.gameType || '').toLowerCase();

  const rawNums: string[] = Array.isArray(item?.numbers)
    ? item.numbers.map(String)
    : (typeof item?.numbers === 'string' ? [item.numbers] : []);

  if (rawNums.length === 0 || !rawWinningNumbers || rawWinningNumbers.length === 0) {
    return {
      isComboBet: false,
      isWinning: false,
      hitNumbers: new Set(),
      displayNumbers: rawNums,
      comboStr: rawNums.join(', ')
    };
  }

  // BINGO 18
  if (gType === 'bingo18' || gType === 'bingo_18') {
    let isWin = false;
    let maxMultiplier = 0;
    const hitNumbers = new Set<string>();
    const hitIndices = new Set<number>();

    rawNums.forEach((n, idx) => {
      const cleanN = String(n).replace(/^dãy\s+[a-z]:\s*/i, '').trim();
      const res = evaluateBingo18(cleanN, item?.playType || ticket?.playType, rawWinningNumbers);
      if (res.isWinning) {
        isWin = true;
        hitIndices.add(idx);
        if (res.multiplier > maxMultiplier) maxMultiplier = res.multiplier;
        res.hitNumbers.forEach(hn => hitNumbers.add(hn));
      }
    });

    return {
      isComboBet: false,
      isWinning: isWin,
      hitNumbers,
      hitIndices,
      displayNumbers: rawNums,
      comboStr: rawNums.join(', '),
      prizeMultiplier: maxMultiplier
    };
  }

  // 1. NGUYÊN TẮC TỐI CAO: Nếu vé đã có kết quả và hệ thống backend chấm THUA (tiền thưởng = 0)
  // Chắc chắn 100% không có dãy số nào trong vé này trúng thưởng
  const isTicketCompletedAndLost = ticket?.status === 'completed' && !ticket?.isWinner;

  // 2. POWER 6/55
  if (gType === 'power_655') {
    const drawMain = rawWinningNumbers.slice(0, 6).map(n => String(n).trim().padStart(2, '0'));
    const drawSpecial = rawWinningNumbers.length > 6 ? String(rawWinningNumbers[6]).trim().padStart(2, '0') : null;
    const boardNums = rawNums.map(n => String(n).trim().padStart(2, '0'));

    const matchedMain = boardNums.filter(n => drawMain.includes(n));
    const hasSpecial = drawSpecial ? boardNums.includes(drawSpecial) : false;
    const hitNumbers = new Set<string>([...matchedMain, ...(hasSpecial && drawSpecial ? [drawSpecial] : [])]);

    let isWin = false;
    if (boardNums.length === 5) {
      // Bao 5: Trùng >= 2 số chính hoặc (1 số chính + ĐB)
      isWin = matchedMain.length >= 2 || (matchedMain.length >= 1 && hasSpecial);
    } else if (boardNums.length === 6) {
      // Cơ bản: Phải trùng từ 3 số chính trở lên mới trúng! (3: Giải Ba, 4: Giải Nhì, 5: Giải Nhất, 5+ĐB: Jackpot 2, 6: Jackpot 1)
      // Trùng 0, 1 hoặc 2 số: TUYỆT ĐỐI KHÔNG TRÚNG!
      isWin = matchedMain.length >= 3 || (matchedMain.length === 5 && hasSpecial);
    } else if (boardNums.length > 6) {
      // Bao 7-18: Trùng >= 3 số chính hoặc (>= 2 số chính + ĐB)
      isWin = matchedMain.length >= 3 || (matchedMain.length >= 2 && hasSpecial);
    }

    return {
      isComboBet: false,
      isWinning: isTicketCompletedAndLost ? false : isWin,
      hitNumbers,
      displayNumbers: rawNums,
      comboStr: rawNums.join(' ')
    };
  }

  // 3. MEGA 6/45
  if (gType === 'mega_645') {
    const drawMain = rawWinningNumbers.slice(0, 6).map(n => String(n).trim().padStart(2, '0'));
    const boardNums = rawNums.map(n => String(n).trim().padStart(2, '0'));
    const matchedMain = boardNums.filter(n => drawMain.includes(n));
    const hitNumbers = new Set(matchedMain);

    let isWin = false;
    if (boardNums.length === 5) {
      isWin = matchedMain.length >= 2;
    } else {
      // Cơ bản (6 số) & Bao 7-18: Trùng từ 3 số trở lên mới trúng! (3: Giải Ba, 4: Giải Nhì, 5: Giải Nhất, 6: Jackpot)
      // Trùng 0, 1 hoặc 2 số: TUYỆT ĐỐI KHÔNG TRÚNG!
      isWin = matchedMain.length >= 3;
    }

    return {
      isComboBet: false,
      isWinning: isTicketCompletedAndLost ? false : isWin,
      hitNumbers,
      displayNumbers: rawNums,
      comboStr: rawNums.join(' ')
    };
  }

  // 4. ĐIỆN TOÁN 6/36
  if (gType === 'dientoan_636' || gType === 'bao_636') {
    const drawMain = rawWinningNumbers.slice(0, 6).map(n => String(n).trim().padStart(2, '0'));
    const boardNums = rawNums.map(n => String(n).trim().padStart(2, '0'));
    const matchedMain = boardNums.filter(n => drawMain.includes(n));
    const hitNumbers = new Set(matchedMain);

    let isWin = false;
    if (boardNums.length === 4 || boardNums.length === 5) {
      isWin = matchedMain.length >= 2;
    } else {
      // Cơ bản & Bao 7-18: Trùng từ 3 số trở lên mới trúng!
      isWin = matchedMain.length >= 3;
    }

    return {
      isComboBet: false,
      isWinning: isTicketCompletedAndLost ? false : isWin,
      hitNumbers,
      displayNumbers: rawNums,
      comboStr: rawNums.join(' ')
    };
  }

  // 5. LOTTO 5/35 & LOTTO 5/70
  if (gType === 'lotto_535' || gType === 'lotto_570') {
    const drawMain = rawWinningNumbers.slice(0, 5).map(n => String(n).trim().padStart(2, '0'));
    const drawSpecial = rawWinningNumbers.length > 5 ? String(rawWinningNumbers[5]).trim().padStart(2, '0') : null;
    const boardNums = rawNums.map(n => String(n).trim().padStart(2, '0'));
    const specialNums = ((item?.specialNumbers || ticket?.specialNumbers) || []).map((n: any) => String(n).trim().padStart(2, '0'));

    const matchedMain = boardNums.filter(n => drawMain.includes(n));
    const hasSpecial = drawSpecial ? specialNums.includes(drawSpecial) : false;
    const hitNumbers = new Set<string>([...matchedMain, ...(hasSpecial && drawSpecial ? [drawSpecial] : [])]);

    const isWin = hasSpecial || matchedMain.length >= 3;

    return {
      isComboBet: false,
      isWinning: isTicketCompletedAndLost ? false : isWin,
      hitNumbers,
      displayNumbers: rawNums,
      comboStr: rawNums.join(' ')
    };
  }

  // 6. KENO / BAO KENO / CHẴN LẺ LỚN NHỎ
  if (gType === 'keno' || gType === 'bao_keno' || gType === 'clln_keno') {
    const drawNumbers = new Set(rawWinningNumbers.map(n => String(n).trim().padStart(2, '0')));
    const boardNums = rawNums.map(n => String(n).trim().padStart(2, '0'));
    const matched = boardNums.filter(n => drawNumbers.has(n));
    const hitNumbers = new Set(matched);

    let isWin = false;
    if (gType === 'clln_keno' || (boardNums.length === 1 && isNaN(parseInt(boardNums[0], 10)))) {
      let lonCount = 0, nhoCount = 0, chanCount = 0, leCount = 0;
      rawWinningNumbers.forEach(n => {
        const num = parseInt(n, 10);
        if (num >= 41 && num <= 80) lonCount++;
        if (num >= 1 && num <= 40) nhoCount++;
        if (num % 2 === 0) chanCount++;
        if (num % 2 !== 0) leCount++;
      });
      const betType = boardNums[0];
      if (betType === 'Lớn' && lonCount >= 13) isWin = true;
      else if (betType === 'Hòa LN' && lonCount === 10 && nhoCount === 10) isWin = true;
      else if (betType === 'Nhỏ' && nhoCount >= 13) isWin = true;
      else if (betType === 'Lớn 11-12' && (lonCount === 11 || lonCount === 12)) isWin = true;
      else if (betType === 'Nhỏ 11-12' && (nhoCount === 11 || nhoCount === 12)) isWin = true;
      else if (betType === 'Chẵn' && chanCount >= 13) isWin = true;
      else if (betType === 'Hòa CL' && chanCount === 10 && leCount === 10) isWin = true;
      else if (betType === 'Lẻ' && leCount >= 13) isWin = true;
      else if (betType === 'Chẵn 11-12' && (chanCount === 11 || chanCount === 12)) isWin = true;
      else if (betType === 'Lẻ 11-12' && (leCount === 11 || leCount === 12)) isWin = true;
    } else if (gType === 'bao_keno' || pType.includes('bao')) {
      const match = pType.match(/bậc\s+(\d+)/i);
      const baoBac = match ? parseInt(match[1], 10) : 2;
      isWin = matched.length >= baoBac;
    } else {
      const bac = boardNums.length;
      const m = matched.length;
      if (bac === 1) isWin = (m === 1);
      else if (bac === 2) isWin = (m === 2);
      else if (bac === 3) isWin = (m >= 2);
      else if (bac === 4) isWin = (m >= 2);
      else if (bac === 5) isWin = (m >= 3);
      else if (bac === 6) isWin = (m >= 3);
      else if (bac === 7) isWin = (m >= 4);
      else if (bac === 8) isWin = (m === 0 || m >= 5);
      else if (bac === 9) isWin = (m === 0 || m >= 5);
      else if (bac === 10) isWin = (m === 0 || m >= 5);
      else isWin = (m >= Math.min(bac, 4));
    }

    return {
      isComboBet: false,
      isWinning: isTicketCompletedAndLost ? false : isWin,
      hitNumbers,
      displayNumbers: rawNums,
      comboStr: rawNums.join(' ')
    };
  }

  // 7. LÔ TÔ CẶP / LÔ XIÊN (loto_cap)
  const isXienOrCap = gType === 'loto_cap' || pType.includes('xiên') || pType.includes('xien') || pType.includes('cặp') || pType.includes('cap');
  if (isXienOrCap) {
    const allLast2 = new Set(
      rawWinningNumbers
        .map(n => String(n).trim().padStart(2, '0').slice(-2))
        .filter(s => s.length === 2)
    );
    const flatNums = rawNums
      .flatMap(s => String(s).split(/[&,;\s-]+/))
      .map(s => s.trim().padStart(2, '0'))
      .filter(s => /^\d{2}$/.test(s));

    let reqCount = 2;
    if (pType.includes('4') || (!pType.includes('2') && !pType.includes('3') && flatNums.length >= 4)) reqCount = 4;
    else if (pType.includes('3') || (!pType.includes('2') && flatNums.length === 3)) reqCount = 3;
    else reqCount = 2;

    const matched = flatNums.filter(n => allLast2.has(n));
    const isWin = flatNums.length >= reqCount && flatNums.every(n => allLast2.has(n));

    return {
      isComboBet: true,
      isWinning: isTicketCompletedAndLost ? false : isWin,
      hitNumbers: new Set(matched),
      displayNumbers: rawNums,
      comboStr: rawNums.join(' & ')
    };
  }

  // 8. TRƯỢT LÔ TÔ (truot_loto)
  const isTruot = gType === 'truot_loto' || pType.includes('trượt') || pType.includes('truot');
  if (isTruot) {
    const allLast2 = new Set(
      rawWinningNumbers
        .map(n => String(n).trim().padStart(2, '0').slice(-2))
        .filter(s => s.length === 2)
    );
    const flatNums = rawNums
      .flatMap(s => String(s).split(/[&,;\s-]+/))
      .map(s => s.trim().padStart(2, '0'))
      .filter(s => /^\d{2}$/.test(s));

    let reqCount = 4;
    if (pType.includes('10')) reqCount = 10;
    else if (pType.includes('8')) reqCount = 8;
    else reqCount = 4;

    const hitInResult = flatNums.filter(n => allLast2.has(n));
    const isWin = flatNums.length >= reqCount && hitInResult.length === 0 && allLast2.size > 0;

    return {
      isComboBet: true,
      isWinning: isTicketCompletedAndLost ? false : isWin,
      hitNumbers: new Set(),
      displayNumbers: rawNums,
      comboStr: rawNums.join(' & ')
    };
  }

  // 9. THẦN TÀI 4 & ĐIỆN TOÁN 1-2-3 (than_tai_4)
  if (gType === 'than_tai_4') {
    const is123 = pType.includes('1-2-3') || pType.includes('123');

    if (!is123) {
      // Thần tài 4: Người chơi chọn 4 chữ số (0000 - 9999)
      let betStr = '';
      if (rawNums.length === 4 && rawNums.every(n => n.length === 1)) {
        betStr = rawNums.join('');
      } else if (rawNums.length === 1) {
        betStr = rawNums[0].replace(/\D/g, '');
      } else {
        betStr = rawNums.join('').replace(/\D/g, '');
      }

      let winStr = '';
      if (rawWinningNumbers.length === 1 && rawWinningNumbers[0].length >= 4) {
        winStr = rawWinningNumbers[0].trim().slice(-4);
      } else if (rawWinningNumbers.length >= 4 && rawWinningNumbers.slice(0, 4).every(w => w.length === 1)) {
        winStr = rawWinningNumbers.slice(0, 4).join('');
      } else {
        const joined = rawWinningNumbers.join('').replace(/\D/g, '');
        if (joined.length >= 4) {
          winStr = joined.slice(0, 4);
        } else if (rawWinningNumbers.length > 0) {
          winStr = rawWinningNumbers[0].trim();
        }
      }

      let isWin = false;
      const hitIndices = new Set<number>();
      const hitNumbers = new Set<string>();

      if (betStr.length === 4 && winStr.length === 4) {
        const isG1 = betStr === winStr;
        const isG2 = betStr.slice(0, 3) === winStr.slice(0, 3);
        const isG3 = betStr.slice(1, 4) === winStr.slice(1, 4);
        const isGK1 = betStr.slice(0, 2) === winStr.slice(0, 2);
        const isGK2 = betStr.slice(2, 4) === winStr.slice(2, 4);

        if (isG1 || isG2 || isG3 || isGK1 || isGK2) {
          isWin = true;
          if (isG1) {
            [0, 1, 2, 3].forEach(idx => hitIndices.add(idx));
            hitNumbers.add(betStr);
            rawNums.forEach(n => hitNumbers.add(n));
          } else {
            if (isG2) {
              [0, 1, 2].forEach(idx => hitIndices.add(idx));
              hitNumbers.add(betStr.slice(0, 3));
            }
            if (isG3) {
              [1, 2, 3].forEach(idx => hitIndices.add(idx));
              hitNumbers.add(betStr.slice(1, 4));
            }
            if (isGK1) {
              [0, 1].forEach(idx => hitIndices.add(idx));
              hitNumbers.add(betStr.slice(0, 2));
            }
            if (isGK2) {
              [2, 3].forEach(idx => hitIndices.add(idx));
              hitNumbers.add(betStr.slice(2, 4));
            }
            hitIndices.forEach(idx => {
              if (rawNums[idx]) hitNumbers.add(rawNums[idx]);
            });
          }
        }
      } else if (betStr && winStr && betStr === winStr) {
        isWin = true;
        hitNumbers.add(betStr);
        if (rawNums.length === 1) hitIndices.add(0);
        else rawNums.forEach((_, idx) => hitIndices.add(idx));
      }

      return {
        isComboBet: false,
        isWinning: isTicketCompletedAndLost ? false : isWin,
        hitNumbers,
        hitIndices,
        displayNumbers: rawNums,
        comboStr: rawNums.join(' ')
      };
    } else {
      // Điện toán 1-2-3: 3 bộ số (Bộ 1: 1 số, Bộ 2: 2 số, Bộ 3: 3 số)
      let betB1 = '', betB2 = '', betB3 = '';
      if (rawNums.length === 6) {
        betB1 = rawNums[0];
        betB2 = rawNums[1] + rawNums[2];
        betB3 = rawNums[3] + rawNums[4] + rawNums[5];
      } else if (rawNums.length === 3) {
        betB1 = rawNums[0];
        betB2 = rawNums[1];
        betB3 = rawNums[2];
      } else {
        const digits = rawNums.join('').replace(/\D/g, '');
        if (digits.length >= 6) {
          betB1 = digits.slice(0, 1);
          betB2 = digits.slice(1, 3);
          betB3 = digits.slice(3, 6);
        }
      }

      let winB1 = '', winB2 = '', winB3 = '';
      if (rawWinningNumbers.length === 3) {
        winB1 = rawWinningNumbers[0].trim();
        winB2 = rawWinningNumbers[1].trim();
        winB3 = rawWinningNumbers[2].trim();
      } else if (rawWinningNumbers.length >= 6) {
        winB1 = rawWinningNumbers[0].trim();
        winB2 = rawWinningNumbers[1].trim() + rawWinningNumbers[2].trim();
        winB3 = rawWinningNumbers[3].trim() + rawWinningNumbers[4].trim() + rawWinningNumbers[5].trim();
      } else if (rawWinningNumbers.length === 1) {
        const digits = rawWinningNumbers[0].trim().replace(/\D/g, '');
        if (digits.length >= 6) {
          winB1 = digits.slice(0, 1);
          winB2 = digits.slice(1, 3);
          winB3 = digits.slice(3, 6);
        }
      }

      const matchB1 = Boolean(betB1 && winB1 && betB1 === winB1);
      const matchB2 = Boolean(betB2 && winB2 && betB2 === winB2);
      const matchB3 = Boolean(betB3 && winB3 && betB3 === winB3);

      // Giải 1, 2, 3, 4 đều yêu cầu trùng Bộ 3
      const isWin = matchB3;
      const hitIndices = new Set<number>();
      const hitNumbers = new Set<string>();

      if (isWin) {
        hitNumbers.add(betB3);
        if (rawNums.length === 6) {
          [3, 4, 5].forEach(idx => hitIndices.add(idx));
        } else if (rawNums.length === 3) {
          hitIndices.add(2);
        }

        if (matchB2) {
          hitNumbers.add(betB2);
          if (rawNums.length === 6) {
            [1, 2].forEach(idx => hitIndices.add(idx));
          } else if (rawNums.length === 3) {
            hitIndices.add(1);
          }
        }

        if (matchB1) {
          hitNumbers.add(betB1);
          hitIndices.add(0);
        }
      }

      return {
        isComboBet: false,
        isWinning: isTicketCompletedAndLost ? false : isWin,
        hitNumbers,
        hitIndices,
        displayNumbers: rawNums,
        comboStr: rawNums.join(' ')
      };
    }
  }

  // 9.5. MAX 3D, MAX 3D+, MAX 3D PRO, MAX 4D
  const isMax3d = gType === 'max_3d' || gType === 'max_3d_plus';
  const isMax3dPro = gType === 'max_3d_pro';
  const isMax4d = gType === 'max_4d';

  if (isMax3d || isMax3dPro || isMax4d) {
    const isSplit = isMax3dPro || gType === 'max_3d_plus' || pType.includes('+') || pType.includes('pro') || (isMax3d && (rawNums.length === 6 || (rawNums.length === 2 && rawNums.every(n => String(n).length === 3))));
    const winSet = new Set(rawWinningNumbers.map(n => String(n).trim()));
    const hitNumbers = new Set<string>();
    const hitIndices = new Set<number>();
    let isWin = false;

    if (isMax4d) {
      let betNum = '';
      if (rawNums.length === 4) {
        betNum = rawNums.join('');
      } else if (rawNums.length === 1) {
        betNum = String(rawNums[0]).trim().padStart(4, '0');
      } else {
        betNum = rawNums.join('').slice(0, 4);
      }

      const allWin4 = rawWinningNumbers.slice(0, 6).map(n => String(n).trim().padStart(4, '0'));
      const g1 = allWin4[0];
      const directMatch = allWin4.includes(betNum);
      const kk1 = Boolean(g1 && betNum.length === 4 && g1.length === 4 && betNum.slice(-3) === g1.slice(-3));
      const kk2 = Boolean(g1 && betNum.length === 4 && g1.length === 4 && betNum.slice(-2) === g1.slice(-2));

      if (directMatch || kk1 || kk2) {
        isWin = true;
        hitNumbers.add(betNum);
        if (rawNums.length === 4) {
          [0, 1, 2, 3].forEach(idx => hitIndices.add(idx));
        } else {
          hitIndices.add(0);
        }
      }

      return {
        isComboBet: false,
        isWinning: isTicketCompletedAndLost ? false : isWin,
        hitNumbers,
        hitIndices,
        displayNumbers: rawNums,
        comboStr: betNum
      };
    } else if (isSplit) {
      let numA = '', numB = '';
      if (rawNums.length === 6) {
        numA = rawNums.slice(0, 3).join('');
        numB = rawNums.slice(3, 6).join('');
      } else if (rawNums.length === 2) {
        numA = String(rawNums[0]).trim().padStart(3, '0');
        numB = String(rawNums[1]).trim().padStart(3, '0');
      } else if (rawNums.length === 1 && String(rawNums[0]).length >= 6) {
        const s = String(rawNums[0]).replace(/\D/g, '');
        numA = s.slice(0, 3);
        numB = s.slice(3, 6);
      }

      const matchA = Boolean(numA && winSet.has(numA));
      const matchB = Boolean(numB && winSet.has(numB));

      if (matchA) {
        hitNumbers.add(numA);
        if (rawNums.length === 6) [0, 1, 2].forEach(i => hitIndices.add(i));
        else hitIndices.add(0);
      }
      if (matchB) {
        hitNumbers.add(numB);
        if (rawNums.length === 6) [3, 4, 5].forEach(i => hitIndices.add(i));
        else hitIndices.add(1);
      }

      isWin = matchA || matchB;

      return {
        isComboBet: false,
        isWinning: isTicketCompletedAndLost ? false : isWin,
        hitNumbers,
        hitIndices,
        displayNumbers: rawNums,
        comboStr: `${numA} | ${numB}`
      };
    } else {
      let betNum = '';
      if (rawNums.length === 3) {
        betNum = rawNums.join('');
      } else if (rawNums.length === 1) {
        betNum = String(rawNums[0]).trim().padStart(3, '0');
      } else {
        betNum = rawNums.join('').slice(0, 3);
      }

      if (betNum && winSet.has(betNum)) {
        isWin = true;
        hitNumbers.add(betNum);
        if (rawNums.length === 3) [0, 1, 2].forEach(i => hitIndices.add(i));
        else hitIndices.add(0);
      }

      return {
        isComboBet: false,
        isWinning: isTicketCompletedAndLost ? false : isWin,
        hitNumbers,
        hitIndices,
        displayNumbers: rawNums,
        comboStr: betNum
      };
    }
  }

  // 10. CÁC GAME KHÁC (Dàn số, lô đề 3 miền, loto 2,3,5...)
  const isCombo = isCombinationBet(ticket);
  const hasEmbeddedAmp = rawNums.some(n => n.includes('&'));

  let anyWinning = false;
  const combinedHitNumbers = new Set<string>();

  for (const numStr of rawNums) {
    const evalRes = evaluateWinningCombo(numStr, ticket, rawWinningNumbers);
    if (evalRes.isWinning) {
      anyWinning = true;
      evalRes.hitNumbers.forEach(n => combinedHitNumbers.add(n));
    }
  }

  return {
    isComboBet: isCombo || hasEmbeddedAmp,
    isWinning: isTicketCompletedAndLost ? false : anyWinning,
    hitNumbers: combinedHitNumbers,
    displayNumbers: rawNums,
    comboStr: rawNums.join(', ')
  };
};

export interface FormattedMaxGameNumbers {
  isMaxGame: boolean;
  isSplit: boolean;
  set1: string[];
  set2?: string[];
  allDigits: string[];
}

export const parseMaxGameDigits = (
  rawNums: any,
  gameType?: string,
  playType?: string
): FormattedMaxGameNumbers | null => {
  const gType = (gameType || '').toLowerCase();
  const pType = (playType || '').toLowerCase();
  const isMax3d = gType === 'max_3d' || gType === 'max_3d_plus';
  const isMax3dPro = gType === 'max_3d_pro';
  const isMax4d = gType === 'max_4d';

  if (!isMax3d && !isMax3dPro && !isMax4d) {
    return null;
  }

  const list: string[] = Array.isArray(rawNums)
    ? rawNums.map(String)
    : (typeof rawNums === 'string' ? [rawNums] : []);

  if (list.length === 0) return null;

  if (isMax4d) {
    let digits: string[] = [];
    if (list.length === 4) {
      digits = list.map(s => s.trim().slice(-1));
    } else if (list.length === 1) {
      const clean = list[0].replace(/\D/g, '').padStart(4, '0').slice(-4);
      digits = clean.split('');
    } else {
      const clean = list.join('').replace(/\D/g, '').slice(0, 4);
      digits = clean.split('');
    }
    return {
      isMaxGame: true,
      isSplit: false,
      set1: digits,
      allDigits: digits
    };
  }

  const isSplit = isMax3dPro || gType === 'max_3d_plus' || pType.includes('+') || pType.includes('pro') || (isMax3d && (list.length === 6 || (list.length === 2 && list.every(s => s.trim().length === 3))));

  if (isSplit) {
    let set1: string[] = [];
    let set2: string[] = [];
    if (list.length === 6) {
      set1 = list.slice(0, 3).map(s => s.trim().slice(-1));
      set2 = list.slice(3, 6).map(s => s.trim().slice(-1));
    } else if (list.length === 2) {
      const s1 = list[0].replace(/\D/g, '').padStart(3, '0').slice(-3);
      const s2 = list[1].replace(/\D/g, '').padStart(3, '0').slice(-3);
      set1 = s1.split('');
      set2 = s2.split('');
    } else if (list.length === 1) {
      const clean = list[0].replace(/\D/g, '').slice(0, 6).padStart(6, '0');
      set1 = clean.slice(0, 3).split('');
      set2 = clean.slice(3, 6).split('');
    } else {
      const clean = list.join('').replace(/\D/g, '').slice(0, 6);
      set1 = clean.slice(0, 3).split('');
      set2 = clean.slice(3, 6).split('');
    }
    return {
      isMaxGame: true,
      isSplit: true,
      set1,
      set2,
      allDigits: [...set1, ...set2]
    };
  }

  // Max 3D basic
  let digits: string[] = [];
  if (list.length === 3) {
    digits = list.map(s => s.trim().slice(-1));
  } else if (list.length === 1) {
    const clean = list[0].replace(/\D/g, '').padStart(3, '0').slice(-3);
    digits = clean.split('');
  } else {
    const clean = list.join('').replace(/\D/g, '').slice(0, 3);
    digits = clean.split('');
  }
  return {
    isMaxGame: true,
    isSplit: false,
    set1: digits,
    allDigits: digits
  };
};

/**
 * Đánh giá toàn bộ vé cược xem có trúng thưởng hay không và số tiền trúng là bao nhiêu.
 * Hỗ trợ tự động tính thưởng cho Bingo 18 và fallback khi backend chưa trả về prizeAmount.
 */
export const calculateTicketWinningStatus = (
  ticket: any,
  _rawWinningNumbers?: string[]
): { isWinning: boolean; prizeAmount: number } => {
  if (!ticket) return { isWinning: false, prizeAmount: 0 };

  // 1. Nếu vé đang ở trạng thái 'pending' (Chờ in / Chờ KQ):
  // Tuyệt đối KHÔNG tự tính toán thắng/thua, KHÔNG tự phán trúng thưởng trên client.
  if (ticket.status === 'pending') {
    return { isWinning: false, prizeAmount: 0 };
  }

  // 2. NGUỒN SỰ THẬT TỪ BACKEND (Source of truth):
  // Kết quả thắng thua và tiền thưởng BẮT BUỘC lấy trực tiếp từ backend (ticket.isWinner & ticket.prizeAmount).
  // Tuyệt đối không hardcode và không tự tính toán từ 1 phía.
  const isWinner = Boolean(ticket.isWinner);
  const prize = Number(ticket.prizeAmount || 0);

  if (isWinner || prize > 0) {
    return { isWinning: true, prizeAmount: prize };
  }

  return { isWinning: false, prizeAmount: 0 };
};
