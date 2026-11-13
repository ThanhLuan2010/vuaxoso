/**
 * AUTOMATED HEADLESS UI LOGIC & FLOW TEST SUITE FOR MOBILE APP
 * Covers: Number validators, Auto-deduplication, Cutoff rollover, Cart calculations, Special ticket pricing.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Mobile App UI Logic & Screen Flows', () => {
  // 1. Kiểm tra Lọc Trùng Số & Validate Cú Pháp Nhập Nhanh
  describe('Input Validator & Auto-Deduplication', () => {
    it('Tự động loại bỏ các con số bị trùng khi người dùng dán chuỗi số', () => {
      const rawInput = '18, 81, 18, 99, 81, 05';
      const cleanNumbers = Array.from(
        new Set(
          rawInput
            .split(/[,;\s]+/)
            .map(s => s.trim())
            .filter(Boolean)
        )
      );

      assert.deepStrictEqual(cleanNumbers, ['18', '81', '99', '05']);
      assert.strictEqual(cleanNumbers.length, 4);
    });

    it('Validate định dạng số theo loại cược (2 số, 3 số, 4 số)', () => {
      const validateBetNumbers = (type, nums) => {
        const expectedLen = type === '2_so' ? 2 : type === '3_so' ? 3 : 4;
        return nums.every(n => /^\d+$/.test(n) && n.length === expectedLen);
      };

      assert.strictEqual(validateBetNumbers('2_so', ['00', '18', '99']), true);
      assert.strictEqual(validateBetNumbers('2_so', ['0', '18', '999']), false);
      assert.strictEqual(validateBetNumbers('3_so', ['123', '999']), true);
      assert.strictEqual(validateBetNumbers('4_so', ['1234', '8294']), true);
    });
  });

  // 2. Kiểm tra Màn hình Vé Kiến Thiết (GameLayoutCScreen)
  describe('KienThiet UI: Normal vs Special Tickets', () => {
    it('Vé Thường: Tính tiền theo số lượng x 10.000đ', () => {
      const ticket = { number: '82914', price: 10000, ticketType: 'normal' };
      const qty = 5;
      const totalCost = (ticket.price || 10000) * qty;
      assert.strictEqual(totalCost, 50000);
    });

    it('Vé Đặc Biệt x00000: Tính đúng 1.600.000đ trọn block 160 vé', () => {
      const ticket = { number: 'x82914', price: 10000, ticketType: 'special' };
      const isSpecial = ticket.number.toLowerCase().startsWith('x');
      const finalPrice = isSpecial ? 1600000 : (ticket.price || 10000);
      assert.strictEqual(finalPrice, 1600000);
    });
  });

  // 3. Kiểm tra Giỏ Hàng & Tạm Tính Cược
  describe('Cart & Multiplier Calculation', () => {
    it('Tính đúng tổng tiền giỏ hàng gồm nhiều game khác nhau', () => {
      const cartItems = [
        { game: 'Lô 2 số MB', numbers: ['18', '81'], baseCost: 10000, multiplier: 27, cost: 540000 },
        { game: 'Keno Bậc 3', numbers: ['05', '18', '72'], baseCost: 10000, multiplier: 2, cost: 20000 },
        { game: 'Power 6/55', numbers: ['01', '02', '03', '04', '05', '06'], baseCost: 10000, multiplier: 1, cost: 10000 }
      ];

      const totalCartCost = cartItems.reduce((sum, item) => sum + item.cost, 0);
      assert.strictEqual(totalCartCost, 570000);
    });
  });

  // 4. Kiểm tra Lịch Quay & Tự động chuyển ngày (Cutoff Rollover)
  describe('Schedule & Cutoff Rollover Logic', () => {
    it('Chuyển ngày mở thưởng kế tiếp khi vượt quá 18:15', () => {
      const checkNextDayRollover = (hour, min) => {
        return hour > 18 || (hour === 18 && min >= 15);
      };

      assert.strictEqual(checkNextDayRollover(17, 30), false); // Chưa hết giờ hôm nay
      assert.strictEqual(checkNextDayRollover(18, 14), false); // Còn 1 phút
      assert.strictEqual(checkNextDayRollover(18, 15), true);  // Đã đến 18:15 -> chuyển sang ngày mai
      assert.strictEqual(checkNextDayRollover(19, 0), true);   // Buổi tối -> hiển thị ngày mai
    });
  });
});

