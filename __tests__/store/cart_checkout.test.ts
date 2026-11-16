/**
 * E2E & Business Logic Test Suite: CART & BATCH CHECKOUT PAYLOAD
 * Tests cart items aggregation, total calculation, boards unpacking,
 * targetGameType resolution for Lô Đề, and balance check.
 */

interface CartItem {
  id: string;
  gameId: string;
  gameName: string;
  numbers: string[];
  cost: number;
  quantity: number;
  playType?: string;
  provinceName?: string;
  drawDate?: string;
  drawId?: string;
  drawCode?: string;
  region?: string;
  category?: string;
  subCategory?: string;
  multiplier?: number;
  baseCost?: number;
  unitAmount?: number;
  boards?: any[];
}

describe('Cart & Batch Checkout Logic', () => {
  // Hàm tạo payload chuẩn như useAppStore.checkout
  const prepareCheckoutPayload = (cart: CartItem[], userBalance: number) => {
    const totalCost = cart.reduce((acc, item) => acc + item.cost * item.quantity, 0);

    if (totalCost === 0) {
      return { success: false, error: 'Giỏ hàng trống!' };
    }
    if (userBalance < totalCost) {
      return { success: false, error: 'Số dư không đủ! Vui lòng nạp thêm tiền.' };
    }

    const ordersPayload = cart.map((item) => {
      let itemBoards: any[] = [];
      const itemPlayType = item.playType || item.subCategory || item.category || 'Cơ bản';

      if (item.boards && item.boards.length > 0) {
        itemBoards = item.boards.map((b: any, bIdx: number) => ({
          id: b.id || String.fromCharCode(65 + bIdx),
          playType: itemPlayType,
          numbers: Array.isArray(b.numbers) ? b.numbers : [b.numbers],
          specialNumbers: b.specialNumbers,
          cost: (b.cost || 10000) * (item.quantity || 1),
          baseCost: b.baseCost || b.cost || 10000,
          unitAmount: b.unitAmount || b.cost || 10000,
          multiplier: b.multiplier || 10000,
        }));
      } else {
        itemBoards = [
          {
            id: 'A',
            playType: itemPlayType,
            numbers: Array.isArray(item.numbers) ? item.numbers : [item.numbers],
            cost: (item.cost || 10000) * (item.quantity || 1),
            baseCost: item.baseCost || item.cost || 10000,
            unitAmount: item.unitAmount || item.baseCost || item.cost || 10000,
            multiplier: item.multiplier || 10000,
          },
        ];
      }

      const targetGameType =
        item.gameId === 'xoso_3mien'
          ? item.region
            ? item.region.toUpperCase()
            : 'MB'
          : item.gameId;

      return {
        gameType: targetGameType,
        playType: itemPlayType,
        drawId: item.drawId || 'DUMMY_DRAW_ID',
        drawCode: item.drawCode,
        provinceName: item.provinceName,
        drawDate: item.drawDate,
        items: itemBoards,
      };
    });

    return {
      success: true,
      totalCost,
      ordersPayload,
    };
  };

  test('Kiểm tra lỗi khi số dư người dùng không đủ', () => {
    const cart: CartItem[] = [
      {
        id: '1',
        gameId: 'power_655',
        gameName: 'POWER 6/55',
        numbers: ['01 02 03 04 05 06'],
        cost: 100000,
        quantity: 1,
      },
    ];
    const userBalance = 50000; // Thiếu 50k
    const res = prepareCheckoutPayload(cart, userBalance);

    expect(res.success).toBe(false);
    expect(res.error).toBe('Số dư không đủ! Vui lòng nạp thêm tiền.');
  });

  test('Kiểm tra chuyển đổi targetGameType cho Lô Đề 3 Miền', () => {
    const cart: CartItem[] = [
      {
        id: 'c1',
        gameId: 'xoso_3mien',
        region: 'mb',
        gameName: 'LÔ ĐỀ 3 MIỀN',
        numbers: ['88'],
        cost: 27000,
        quantity: 1,
        playType: 'Lô 2 số',
      },
      {
        id: 'c2',
        gameId: 'xoso_3mien',
        region: 'mn',
        gameName: 'LÔ ĐỀ 3 MIỀN',
        numbers: ['99'],
        cost: 18000,
        quantity: 1,
        playType: 'Lô 2 số',
        provinceName: 'Tiền Giang',
      },
      {
        id: 'c3',
        gameId: 'keno',
        gameName: 'KENO',
        numbers: ['01 02'],
        cost: 20000,
        quantity: 2, // 2 kỳ
        boards: [
          { id: 'A', numbers: ['01', '02'], cost: 10000 },
        ],
      },
    ];

    const userBalance = 500000;
    const res = prepareCheckoutPayload(cart, userBalance);

    expect(res.success).toBe(true);
    expect(res.totalCost).toBe(27000 + 18000 + 20000 * 2); // 85.000đ

    const orders = res.ordersPayload!;
    expect(orders.length).toBe(3);

    // item 1: region mb -> gameType: MB
    expect(orders[0].gameType).toBe('MB');
    expect(orders[0].playType).toBe('Lô 2 số');

    // item 2: region mn -> gameType: MN
    expect(orders[1].gameType).toBe('MN');
    expect(orders[1].provinceName).toBe('Tiền Giang');

    // item 3: gameId: keno
    expect(orders[2].gameType).toBe('keno');
    expect(orders[2].items[0].cost).toBe(10000 * 2); // nhân số kỳ quantity = 2
  });

  test('Bóc tách mảng boards phức tạp (nhiều bảng A, B, C)', () => {
    const cart: CartItem[] = [
      {
        id: 'cart_complex',
        gameId: 'mega_645',
        gameName: 'MEGA 6/45',
        numbers: ['Dãy A', 'Dãy B', 'Dãy C'],
        cost: 30000,
        quantity: 1,
        boards: [
          { id: 'A', numbers: ['01', '02', '03', '04', '05', '06'], cost: 10000 },
          { id: 'B', numbers: ['07', '08', '09', '10', '11', '12'], cost: 10000 },
          { id: 'C', numbers: ['13', '14', '15', '16', '17', '18'], cost: 10000 },
        ],
      },
    ];

    const res = prepareCheckoutPayload(cart, 100000);
    expect(res.success).toBe(true);

    const order = res.ordersPayload![0];
    expect(order.items.length).toBe(3);
    expect(order.items[0].id).toBe('A');
    expect(order.items[1].id).toBe('B');
    expect(order.items[2].id).toBe('C');
    expect(order.items[2].numbers).toEqual(['13', '14', '15', '16', '17', '18']);
  });
});

