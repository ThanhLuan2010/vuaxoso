import { useAppStore } from '../src/store/useAppStore';

describe('App Environment & Store Initialization', () => {
  test('App store initializes with default states', () => {
    const state = useAppStore.getState();
    expect(state.cart).toEqual([]);
    expect(state.purchaseHistory).toEqual([]);
    expect(state.unreadNotifications).toBe(0);
    expect(typeof state.addToCart).toBe('function');
    expect(typeof state.checkout).toBe('function');
  });

  test('Cart manipulation works in store', () => {
    const store = useAppStore.getState();
    store.addToCart({
      gameId: 'keno',
      gameName: 'KENO',
      numbers: ['01', '02'],
      cost: 10000,
      quantity: 1,
      playType: 'Bậc 2',
    });

    const updated = useAppStore.getState();
    expect(updated.cart.length).toBeGreaterThanOrEqual(1);

    store.clearCart();
    expect(useAppStore.getState().cart.length).toBe(0);
  });
});
