import {
  evaluateWinningCombo,
  parseWinningNumbers,
  isPrizeRowMatch,
  isCombinationBet,
  evaluateItemCombo,
  parseBingo18Dice,
  evaluateBingo18,
  calculateTicketWinningStatus
} from '../../src/utils/lotteryResultHelper';

describe('lotteryResultHelper E2E & Unit Tests', () => {
  // Bảng kết quả XSKT giả lập với 27 giải Miền Bắc
  // Giải ĐB: 849123 -> đuôi 23, 3 càng 123, 4 càng 9123
  // Giải Nhất: 74829 -> đuôi 29
  // Các giải khác có các đuôi: 04, 15, 63, 72, 88, 91, 50, 05, 34
  const mockWinningNumbers = [
    '849123', '74829', '12804', '93815', '00263',
    '44572', '89188', '11291', '67350', '22405',
    '33434', '55611', '99846', '77228', '12994'
  ];

  describe('1. Lô Xiên (Xiên 2, 3, 4)', () => {
    const xienTicket = {
      gameType: 'xoso_3mien',
      playType: 'Xiên 2'
    };

    it('Combo trúng: tất cả các số trong combo đều về', () => {
      // 04 và 15 đều có trong mockWinningNumbers
      const res = evaluateWinningCombo('04&15', xienTicket, mockWinningNumbers);
      expect(res.isWinning).toBe(true);
      expect(res.hitNumbers.has('04')).toBe(true);
      expect(res.hitNumbers.has('15')).toBe(true);
    });

    it('Combo trượt một phần: có số về và có số không về', () => {
      // 04 có về, 99 không về
      const res = evaluateWinningCombo('04&99', xienTicket, mockWinningNumbers);
      expect(res.isWinning).toBe(false);
      expect(res.hitNumbers.has('04')).toBe(true);
      expect(res.hitNumbers.has('99')).toBe(false);
    });

    it('Xiên 3 trúng khi cả 3 số về', () => {
      const xien3Ticket = { gameType: 'xoso_3mien', playType: 'Xiên 3' };
      const res = evaluateWinningCombo('04&15&63', xien3Ticket, mockWinningNumbers);
      expect(res.isWinning).toBe(true);
      expect(res.hitNumbers.size).toBe(3);
    });

    it('Lô tô 2 cặp (loto_cap): đánh giá cặp số trúng và trượt', () => {
      const lotoCapTicket = { gameType: 'loto_cap', playType: 'Lô tô 2 cặp' };
      const winsWith32And59 = ['97403', '12832', '93859', '00263'];
      
      // Dãy B: 32 59 -> cả 32 và 59 đều về -> TRÚNG
      const resWin = evaluateWinningCombo('32&59', lotoCapTicket, winsWith32And59);
      expect(resWin.isWinning).toBe(true);
      expect(resWin.hitNumbers.has('32')).toBe(true);
      expect(resWin.hitNumbers.has('59')).toBe(true);

      // Dãy A: 33 52 -> 33 và 52 không về -> TRƯỢT
      const resLose = evaluateWinningCombo('33&52', lotoCapTicket, winsWith32And59);
      expect(resLose.isWinning).toBe(false);

      // evaluateItemCombo với item dạng mảng ['32', '59']
      const itemB = { id: 'B', numbers: ['32', '59'], cost: 20000 };
      const evalB = evaluateItemCombo(itemB, lotoCapTicket, winsWith32And59);
      expect(evalB.isComboBet).toBe(true);
      expect(evalB.isWinning).toBe(true);

      const itemA = { id: 'A', numbers: ['33', '52'], cost: 10000 };
      const evalA = evaluateItemCombo(itemA, lotoCapTicket, winsWith32And59);
      expect(evalA.isComboBet).toBe(true);
      expect(evalA.isWinning).toBe(false);
    });
  });

  describe('2. Lô Trượt (Trượt xiên 4, 6, 8, 10)', () => {
    const truotTicket = {
      gameType: 'xoso_3mien',
      playType: 'Trượt xiên 4'
    };

    it('Combo trúng lô trượt: TẤT CẢ các số đều KHÔNG VỀ trong bảng kết quả', () => {
      // Các số 70, 71, 73, 74 đều KHÔNG xuất hiện trong mockWinningNumbers
      const res = evaluateWinningCombo('70&71&73&74', truotTicket, mockWinningNumbers);
      expect(res.isWinning).toBe(true);
      expect(res.hitNumbers.size).toBe(0);
    });

    it('Combo trượt lô trượt: có ít nhất 1 số về trong bảng kết quả', () => {
      // 04 có về -> người chơi TRƯỢT cược lô trượt
      const res = evaluateWinningCombo('70&71&73&04', truotTicket, mockWinningNumbers);
      expect(res.isWinning).toBe(false);
      expect(res.hitNumbers.has('04')).toBe(true);
    });
  });

  describe('3. Đề ĐB & 3 Càng & Bao Lô', () => {
    it('Đề ĐB trúng khi trùng 2 số cuối giải ĐB', () => {
      const deTicket = { gameType: 'xoso_3mien', playType: 'Đề ĐB' };
      expect(evaluateWinningCombo('23', deTicket, mockWinningNumbers).isWinning).toBe(true);
      expect(evaluateWinningCombo('99', deTicket, mockWinningNumbers).isWinning).toBe(false);
    });

    it('3 Càng trúng khi trùng 3 số cuối giải ĐB', () => {
      const baCangTicket = { gameType: 'xoso_3mien', playType: '3 Càng' };
      expect(evaluateWinningCombo('123', baCangTicket, mockWinningNumbers).isWinning).toBe(true);
      expect(evaluateWinningCombo('923', baCangTicket, mockWinningNumbers).isWinning).toBe(false);
    });

    it('Bao lô trúng khi số xuất hiện trong bất kỳ giải nào', () => {
      const loTicket = { gameType: 'xoso_3mien', playType: 'Bao lô 2 số' };
      expect(evaluateWinningCombo('04', loTicket, mockWinningNumbers).isWinning).toBe(true);
      expect(evaluateWinningCombo('88', loTicket, mockWinningNumbers).isWinning).toBe(true);
      expect(evaluateWinningCombo('99', loTicket, mockWinningNumbers).isWinning).toBe(false);
    });
  });

  describe('4. Keno & Vietlott & Điện Toán 6/36', () => {
    it('Keno: số trúng khi xuất hiện trong 20 số kết quả', () => {
      const kenoTicket = { gameType: 'keno', playType: 'Keno Bậc 1' };
      const kenoWins = ['01', '05', '12', '25', '36', '48', '60'];
      expect(evaluateWinningCombo('05', kenoTicket, kenoWins).isWinning).toBe(true);
      expect(evaluateWinningCombo('99', kenoTicket, kenoWins).isWinning).toBe(false);
    });

    it('Điện toán 6/36: trúng khi khớp >= 3 số trong bộ 6 số', () => {
      const dt636Ticket = { gameType: 'dientoan_636', playType: 'Cơ bản' };
      const dt636Wins = ['04', '34', '24', '20', '23', '36'];

      // Khớp đủ 6/6 số -> TRÚNG (Jackpot)
      const res6 = evaluateWinningCombo('04&20&23&24&34&36', dt636Ticket, dt636Wins);
      expect(res6.isWinning).toBe(true);
      expect(res6.hitNumbers.size).toBe(6);

      // Khớp 3/6 số -> TRÚNG (Giải Ba)
      const res3 = evaluateWinningCombo('04&20&23&01&02&03', dt636Ticket, dt636Wins);
      expect(res3.isWinning).toBe(true);
      expect(res3.hitNumbers.size).toBe(3);

      // Khớp 2/6 số -> KHÔNG TRÚNG
      const res2 = evaluateWinningCombo('04&20&01&02&03&05', dt636Ticket, dt636Wins);
      expect(res2.isWinning).toBe(false);
      expect(res2.hitNumbers.size).toBe(2);

      // Khớp 1/6 số -> KHÔNG TRÚNG
      const res1 = evaluateWinningCombo('04&01&02&03&05&06', dt636Ticket, dt636Wins);
      expect(res1.isWinning).toBe(false);
      expect(res1.hitNumbers.size).toBe(1);
    });
  });

  describe('5. parseWinningNumbers', () => {
    it('Tách chuỗi các số cách nhau bởi phẩy hoặc khoảng trắng', () => {
      expect(parseWinningNumbers('01, 02, 03')).toEqual(['01', '02', '03']);
      expect(parseWinningNumbers(['01', '02'])).toEqual(['01', '02']);
      expect(parseWinningNumbers(null)).toEqual([]);
    });
  });

  describe('6. isPrizeRowMatch - Tô xanh giải trúng trên bảng kết quả', () => {
    // Khách đánh dàn 100 số từ 00 đến 99
    const dan100Bets = new Set<string>();
    for (let i = 0; i <= 99; i++) {
      dan100Bets.add(String(i).padStart(2, '0'));
    }

    it('Đề đầu đuôi Miền Nam: CHỈ tô xanh Giải Đặc Biệt và Giải Tám, KHÔNG tô xanh các giải khác', () => {
      const mnTicket = {
        gameType: 'MN',
        playType: 'Đề đầu đuôi (Đà Lạt)',
        region: 'MN'
      };

      // 1. Giải Đặc Biệt: Phải trúng và tô xanh
      expect(isPrizeRowMatch('010031', 'Đặc biệt', mnTicket, dan100Bets)).toBe(true);

      // 2. Giải Tám: Phải trúng và tô xanh
      expect(isPrizeRowMatch('31', 'Giải Tám', mnTicket, dan100Bets)).toBe(true);

      // 3. Các giải khác (Nhất, Nhì, Ba, Tư, Năm, Sáu, Bảy): TUYỆT ĐỐI KHÔNG TÔ XANH
      expect(isPrizeRowMatch('01433', 'Giải Nhất', mnTicket, dan100Bets)).toBe(false);
      expect(isPrizeRowMatch('00247', 'Giải Nhì', mnTicket, dan100Bets)).toBe(false);
      expect(isPrizeRowMatch('81833', 'Giải Ba', mnTicket, dan100Bets)).toBe(false);
      expect(isPrizeRowMatch('21658', 'Giải Tư', mnTicket, dan100Bets)).toBe(false);
      expect(isPrizeRowMatch('7747', 'Giải Năm', mnTicket, dan100Bets)).toBe(false);
      expect(isPrizeRowMatch('8507', 'Giải Sáu', mnTicket, dan100Bets)).toBe(false);
      expect(isPrizeRowMatch('567', 'Giải Bảy', mnTicket, dan100Bets)).toBe(false);
    });

    it('Đề đầu đuôi Miền Bắc: CHỈ tô xanh Giải Đặc Biệt và Giải Bảy', () => {
      const mbTicket = {
        gameType: 'MB',
        playType: 'Đề đầu đuôi',
        region: 'MB'
      };

      expect(isPrizeRowMatch('849123', 'Đặc biệt', mbTicket, dan100Bets)).toBe(true);
      expect(isPrizeRowMatch('12804', 'Giải Bảy', mbTicket, dan100Bets)).toBe(true);
      expect(isPrizeRowMatch('74829', 'Giải Nhất', mbTicket, dan100Bets)).toBe(false);
      expect(isPrizeRowMatch('33434', 'Giải Năm', mbTicket, dan100Bets)).toBe(false);
    });

    it('Đề ĐB: CHỈ tô xanh Giải Đặc Biệt', () => {
      const deTicket = { gameType: 'MN', playType: 'Đề ĐB' };
      expect(isPrizeRowMatch('010031', 'Đặc biệt', deTicket, new Set(['31']))).toBe(true);
      expect(isPrizeRowMatch('31', 'Giải Tám', deTicket, new Set(['31']))).toBe(false);
      expect(isPrizeRowMatch('01433', 'Giải Nhất', deTicket, new Set(['31']))).toBe(false);
    });

    it('Bao Lô 2 số: Bất kỳ giải nào trùng 2 số cuối đều được tô xanh', () => {
      const baoLoTicket = { gameType: 'MN', playType: 'Lô 2 số' };
      expect(isPrizeRowMatch('010031', 'Đặc biệt', baoLoTicket, new Set(['31']))).toBe(true);
      expect(isPrizeRowMatch('01433', 'Giải Nhất', baoLoTicket, new Set(['33']))).toBe(true);
      expect(isPrizeRowMatch('00247', 'Giải Nhì', baoLoTicket, new Set(['47']))).toBe(true);
      expect(isPrizeRowMatch('7747', 'Giải Năm', baoLoTicket, new Set(['99']))).toBe(false);
    });
  });

  describe('7. Giới hạn hiển thị 10 số trên thẻ vé và chi tiết vé khi cược nhiều số / dàn số', () => {
    it('Vé Lô Trượt Xiên 6 với 110 bộ số: Chỉ hiển thị 10 bộ đầu tiên, còn 100 bộ ẩn sau nút Xem thêm', () => {
      const combos110: string[] = [];
      for (let i = 1; i <= 110; i++) {
        combos110.push(`01&02&03&04&05&${String(i).padStart(2, '0')}`);
      }

      const rawTicketNums = combos110;
      const hasMoreNumbers = rawTicketNums.length > 10;
      const displayNumbers = hasMoreNumbers ? rawTicketNums.slice(0, 10) : rawTicketNums;

      expect(hasMoreNumbers).toBe(true);
      expect(displayNumbers.length).toBe(10);
      expect(rawTicketNums.length - 10).toBe(100);
      expect(displayNumbers[0]).toBe('01&02&03&04&05&01');
      expect(displayNumbers[9]).toBe('01&02&03&04&05&10');
    });

    it('Vé có đúng 10 số: Hiển thị đủ 10 số, không hiển thị nút Xem thêm', () => {
      const nums10 = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];
      const hasMore = nums10.length > 10;
      const display = hasMore ? nums10.slice(0, 10) : nums10;

      expect(hasMore).toBe(false);
      expect(display.length).toBe(10);
    });

    it('Vé có ít hơn 10 số: Hiển thị đầy đủ', () => {
      const nums4 = ['01', '02', '03', '04'];
      const hasMore = nums4.length > 10;
      const display = hasMore ? nums4.slice(0, 10) : nums4;

      expect(hasMore).toBe(false);
      expect(display.length).toBe(4);
    });
  });

  describe('8. THẦN TÀI 4 & ĐIỆN TOÁN 1-2-3 (than_tai_4)', () => {
    const thanTaiTicket = {
      gameType: 'than_tai_4',
      playType: 'Thần tài 4'
    };

    it('Thần Tài 4 Giải Nhất: Trùng cả 4 chữ số -> highlight tất cả 4 vị trí', () => {
      const item = { id: 'A', numbers: ['1', '9', '8', '9'], cost: 10000 };
      const wins = ['1', '9', '8', '9'];

      const evalRes = evaluateItemCombo(item, thanTaiTicket, wins);
      expect(evalRes.isWinning).toBe(true);
      expect(evalRes.hitIndices?.has(0)).toBe(true);
      expect(evalRes.hitIndices?.has(1)).toBe(true);
      expect(evalRes.hitIndices?.has(2)).toBe(true);
      expect(evalRes.hitIndices?.has(3)).toBe(true);

      // Khi kết quả là dạng chuỗi 4 số ['1989']
      const evalResStr = evaluateItemCombo(item, thanTaiTicket, ['1989']);
      expect(evalResStr.isWinning).toBe(true);
      expect(evalResStr.hitIndices?.size).toBe(4);
    });

    it('Thần Tài 4 Giải Nhì: Trùng 3 chữ số đầu -> highlight 3 vị trí đầu (0, 1, 2)', () => {
      const item = { id: 'A', numbers: ['1', '9', '8', '9'], cost: 10000 };
      const wins = ['1', '9', '8', '0']; // Số đuôi là 0, trùng '198' đầu

      const evalRes = evaluateItemCombo(item, thanTaiTicket, wins);
      expect(evalRes.isWinning).toBe(true);
      expect(evalRes.hitIndices?.has(0)).toBe(true);
      expect(evalRes.hitIndices?.has(1)).toBe(true);
      expect(evalRes.hitIndices?.has(2)).toBe(true);
      expect(evalRes.hitIndices?.has(3)).toBe(false);
    });

    it('Thần Tài 4 Giải Ba: Trùng 3 chữ số cuối -> highlight 3 vị trí cuối (1, 2, 3)', () => {
      const item = { id: 'A', numbers: ['1', '9', '8', '9'], cost: 10000 };
      const wins = ['0', '9', '8', '9']; // Số đầu là 0, trùng '989' cuối

      const evalRes = evaluateItemCombo(item, thanTaiTicket, wins);
      expect(evalRes.isWinning).toBe(true);
      expect(evalRes.hitIndices?.has(0)).toBe(false);
      expect(evalRes.hitIndices?.has(1)).toBe(true);
      expect(evalRes.hitIndices?.has(2)).toBe(true);
      expect(evalRes.hitIndices?.has(3)).toBe(true);
    });

    it('Thần Tài 4 Giải Khuyến khích: Trùng 2 chữ số đầu -> highlight vị trí 0, 1', () => {
      const item = { id: 'A', numbers: ['1', '9', '8', '9'], cost: 10000 };
      const wins = ['1', '9', '0', '0']; // Trùng 19 đầu

      const evalRes = evaluateItemCombo(item, thanTaiTicket, wins);
      expect(evalRes.isWinning).toBe(true);
      expect(evalRes.hitIndices?.has(0)).toBe(true);
      expect(evalRes.hitIndices?.has(1)).toBe(true);
      expect(evalRes.hitIndices?.has(2)).toBe(false);
      expect(evalRes.hitIndices?.has(3)).toBe(false);
    });

    it('Thần Tài 4 Giải Khuyến khích: Trùng 2 chữ số cuối -> highlight vị trí 2, 3', () => {
      const item = { id: 'A', numbers: ['1', '9', '8', '9'], cost: 10000 };
      const wins = ['0', '0', '8', '9']; // Trùng 89 cuối

      const evalRes = evaluateItemCombo(item, thanTaiTicket, wins);
      expect(evalRes.isWinning).toBe(true);
      expect(evalRes.hitIndices?.has(0)).toBe(false);
      expect(evalRes.hitIndices?.has(1)).toBe(false);
      expect(evalRes.hitIndices?.has(2)).toBe(true);
      expect(evalRes.hitIndices?.has(3)).toBe(true);
    });

    it('Thần Tài 4 Không trúng: Không có số nào được highlight', () => {
      const item = { id: 'A', numbers: ['1', '9', '8', '9'], cost: 10000 };
      const wins = ['2', '0', '7', '1'];

      const evalRes = evaluateItemCombo(item, thanTaiTicket, wins);
      expect(evalRes.isWinning).toBe(false);
      expect(evalRes.hitIndices?.size).toBe(0);
    });

    it('Điện toán 1-2-3: Trùng cả 3 bộ số -> highlight toàn bộ', () => {
      const dt123Ticket = { gameType: 'than_tai_4', playType: 'Điện toán 1-2-3' };
      const item = { id: 'A', numbers: ['5', '2', '8', '7', '8', '9'], cost: 10000 };
      const wins = ['5', '28', '789'];

      const evalRes = evaluateItemCombo(item, dt123Ticket, wins);
      expect(evalRes.isWinning).toBe(true);
      expect(evalRes.hitIndices?.size).toBe(6);
    });

    it('Điện toán 1-2-3: Trùng Bộ 3 và Bộ 2 (Giải Nhì)', () => {
      const dt123Ticket = { gameType: 'than_tai_4', playType: 'Điện toán 1-2-3' };
      const item = { id: 'A', numbers: ['5', '2', '8', '7', '8', '9'], cost: 10000 };
      const wins = ['1', '28', '789']; // Bộ 1 lệch ('1' !== '5')

      const evalRes = evaluateItemCombo(item, dt123Ticket, wins);
      expect(evalRes.isWinning).toBe(true);
      expect(evalRes.hitIndices?.has(0)).toBe(false); // Bộ 1 trượt
      expect(evalRes.hitIndices?.has(1)).toBe(true);  // Bộ 2 trúng
      expect(evalRes.hitIndices?.has(2)).toBe(true);
      expect(evalRes.hitIndices?.has(3)).toBe(true);  // Bộ 3 trúng
      expect(evalRes.hitIndices?.has(4)).toBe(true);
      expect(evalRes.hitIndices?.has(5)).toBe(true);
    });

    it('Điện toán 1-2-3: Trượt Bộ 3 -> Vé trượt', () => {
      const dt123Ticket = { gameType: 'than_tai_4', playType: 'Điện toán 1-2-3' };
      const item = { id: 'A', numbers: ['5', '2', '8', '7', '8', '9'], cost: 10000 };
      const wins = ['5', '28', '000']; // Trùng bộ 1 và 2 nhưng trượt bộ 3

      const evalRes = evaluateItemCombo(item, dt123Ticket, wins);
      expect(evalRes.isWinning).toBe(false);
      expect(evalRes.hitIndices?.size).toBe(0);
    });

    it('isPrizeRowMatch: Tô xanh kết quả mở thưởng Thần tài 4 khi trúng', () => {
      const userBets = new Set(['1989']);
      expect(isPrizeRowMatch('1989', undefined, thanTaiTicket, userBets)).toBe(true);
      expect(isPrizeRowMatch('1980', undefined, thanTaiTicket, userBets)).toBe(true); // Trùng 3 số đầu
      expect(isPrizeRowMatch('0989', undefined, thanTaiTicket, userBets)).toBe(true); // Trùng 3 số cuối
      expect(isPrizeRowMatch('2071', undefined, thanTaiTicket, userBets)).toBe(false);
    });
  });

  describe('9. BINGO 18 (bingo18)', () => {
    it('parseBingo18Dice: chuẩn hóa xúc xắc từ các định dạng kết quả khác nhau', () => {
      expect(parseBingo18Dice(['6', '6', '6'])).toEqual([6, 6, 6]);
      expect(parseBingo18Dice(['666'])).toEqual([6, 6, 6]);
      expect(parseBingo18Dice(['1, 2, 3'])).toEqual([1, 2, 3]);
      expect(parseBingo18Dice(['4 5 6'])).toEqual([4, 5, 6]);
    });

    describe('9.1. Đặt vé Ba số trùng (666) - đúng trường hợp của người dùng', () => {
      const bingoTicket = {
        gameType: 'bingo18',
        playType: 'Cơ bản',
        totalCost: 10000,
        items: [{ id: 'A', numbers: ['666'], cost: 10000 }]
      };

      it('Kết quả chuỗi "666": evaluateWinningCombo phải trúng và trả về hitNumbers chứa 666', () => {
        const res = evaluateWinningCombo('666', bingoTicket, ['666']);
        expect(res.isWinning).toBe(true);
        expect(res.hitNumbers.has('666')).toBe(true);
      });

      it('Kết quả mảng ["6", "6", "6"]: evaluateWinningCombo phải trúng', () => {
        const res = evaluateWinningCombo('666', bingoTicket, ['6', '6', '6']);
        expect(res.isWinning).toBe(true);
        expect(res.hitNumbers.has('666')).toBe(true);
      });

      it('evaluateItemCombo với Dãy A "666": phải trúng thưởng với multiplier = 4', () => {
        const item = { id: 'A', numbers: ['666'], cost: 10000 };
        const evalRes = evaluateItemCombo(item, bingoTicket, ['666']);
        expect(evalRes.isWinning).toBe(true);
        expect(evalRes.hitIndices?.has(0)).toBe(true);
        expect(evalRes.prizeMultiplier).toBe(4);
      });

      it('calculateTicketWinningStatus: Lấy kết quả thắng thưởng 40.000đ chuẩn xác từ backend', () => {
        const ticketFromServer = {
          ...bingoTicket,
          status: 'completed',
          isWinner: true,
          prizeAmount: 40000
        };
        const status = calculateTicketWinningStatus(ticketFromServer, ['666']);
        expect(status.isWinning).toBe(true);
        expect(status.prizeAmount).toBe(40000);
      });

      it('calculateTicketWinningStatus: Khi vé đang pending (chờ in) thì KHÔNG tự tính thắng thua, luôn trả về false', () => {
        const pendingTicket = {
          ...bingoTicket,
          status: 'pending',
          isWinner: false,
          prizeAmount: 0
        };
        const status = calculateTicketWinningStatus(pendingTicket, ['666']);
        expect(status.isWinning).toBe(false);
        expect(status.prizeAmount).toBe(0);
      });

      it('Cược 555 mà kết quả là 666 -> phải thua (không trúng)', () => {
        const res = evaluateWinningCombo('555', bingoTicket, ['666']);
        expect(res.isWinning).toBe(false);
      });
    });

    describe('9.2. Hai số trùng & Một số (theo bảng tỉ lệ hệ thống)', () => {
      const bingoTicket = { gameType: 'bingo18', playType: 'Cơ bản' };

      it('Hai số trùng 66: Kết quả có 2 con 6 (6, 6, 2) -> trúng thưởng x3', () => {
        const res = evaluateBingo18('66', 'Cơ bản', ['6', '6', '2']);
        expect(res.isWinning).toBe(true);
        expect(res.multiplier).toBe(3);
      });

      it('Hai số trùng 66: Kết quả chỉ có 1 con 6 (6, 2, 3) -> không trúng', () => {
        const res = evaluateBingo18('66', 'Cơ bản', ['6', '2', '3']);
        expect(res.isWinning).toBe(false);
      });

      it('Một số 6: Xuất hiện số 6 -> trúng thưởng x2', () => {
        expect(evaluateBingo18('6', 'Cơ bản', ['6', '1', '2']).multiplier).toBe(2);
        expect(evaluateBingo18('6', 'Cơ bản', ['6', '6', '2']).multiplier).toBe(2);
        expect(evaluateBingo18('6', 'Cơ bản', ['6', '6', '6']).multiplier).toBe(2);
      });
    });

    describe('9.3. Cộng tổng & Tài Xỉu Hoà (theo bảng tỉ lệ hệ thống)', () => {
      it('Cộng tổng: Kiểm tra các mức tỉ lệ theo đúng bảng quy định', () => {
        expect(evaluateBingo18('3', 'Cộng tổng', ['1', '1', '1']).multiplier).toBe(120);
        expect(evaluateBingo18('4', 'Cộng tổng', ['1', '1', '2']).multiplier).toBe(40);
        expect(evaluateBingo18('5', 'Cộng tổng', ['1', '2', '2']).multiplier).toBe(20);
        expect(evaluateBingo18('6', 'Cộng tổng', ['1', '2', '3']).multiplier).toBe(12);
        expect(evaluateBingo18('7', 'Cộng tổng', ['2', '2', '3']).multiplier).toBe(8);
        expect(evaluateBingo18('8', 'Cộng tổng', ['2', '3', '3']).multiplier).toBe(6);
        expect(evaluateBingo18('9', 'Cộng tổng', ['3', '3', '3']).multiplier).toBe(5);
        expect(evaluateBingo18('10', 'Cộng tổng', ['2', '3', '5']).multiplier).toBe(5);
        expect(evaluateBingo18('11', 'Cộng tổng', ['3', '3', '5']).multiplier).toBe(5);
        expect(evaluateBingo18('12', 'Cộng tổng', ['3', '4', '5']).multiplier).toBe(5);
        expect(evaluateBingo18('13', 'Cộng tổng', ['4', '4', '5']).multiplier).toBe(6);
        expect(evaluateBingo18('14', 'Cộng tổng', ['4', '5', '5']).multiplier).toBe(8);
        expect(evaluateBingo18('15', 'Cộng tổng', ['5', '5', '5']).multiplier).toBe(12);
        expect(evaluateBingo18('16', 'Cộng tổng', ['5', '5', '6']).multiplier).toBe(20);
        expect(evaluateBingo18('17', 'Cộng tổng', ['5', '6', '6']).multiplier).toBe(40);
        expect(evaluateBingo18('18', 'Cộng tổng', ['6', '6', '6']).multiplier).toBe(120);
      });

      it('Tài: Kết quả 4-5-6 (tổng 15) -> trúng x2', () => {
        const res = evaluateBingo18('Tài', 'Tài Xỉu Hoà', ['4', '5', '6']);
        expect(res.isWinning).toBe(true);
        expect(res.multiplier).toBe(2);
      });

      it('Xỉu: Kết quả 1-2-3 (tổng 6) -> trúng x2', () => {
        const res = evaluateBingo18('Xỉu', 'Tài Xỉu Hoà', ['1', '2', '3']);
        expect(res.isWinning).toBe(true);
        expect(res.multiplier).toBe(2);
      });

      it('Hoà: Kết quả 10 hoặc 11 -> trúng thưởng x3', () => {
        const res10 = evaluateBingo18('Hoà', 'Tài Xỉu Hoà', ['2', '3', '5']);
        expect(res10.isWinning).toBe(true);
        expect(res10.multiplier).toBe(3);

        const res11 = evaluateBingo18('Hoà', 'Tài Xỉu Hoà', ['3', '3', '5']);
        expect(res11.isWinning).toBe(true);
        expect(res11.multiplier).toBe(3);
      });
    });

    describe('9.4. isPrizeRowMatch - Tô xanh bóng số kết quả', () => {
      const bingoTicket = { gameType: 'bingo18', playType: 'Cơ bản' };

      it('Người chơi cược 666: Khớp với kết quả chuỗi "666"', () => {
        const userBets = new Set(['666']);
        expect(isPrizeRowMatch('666', undefined, bingoTicket, userBets)).toBe(true);
      });

      it('Người chơi cược 666: Khớp với từng quả bóng số "6"', () => {
        const userBets = new Set(['666']);
        expect(isPrizeRowMatch('6', undefined, bingoTicket, userBets)).toBe(true);
        expect(isPrizeRowMatch('5', undefined, bingoTicket, userBets)).toBe(false);
      });
    });
  });
});
