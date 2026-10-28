import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerFCMTokenWithBackend } from '../services/notificationService';

export interface Wallet {
  network: 'BEP20' | 'TRC20';
  address: string;
  qrCode?: string;
}

export interface GameModel {
  _id: string;
  code: string;
  name: string;
  type: string;
  brandColor?: string;
  bgColor?: string;
  badge?: string;
  subtext?: string;
  drawDurationMinutes?: number;
  isActive?: boolean;
}

export interface DrawModel {
  _id: string;
  game: GameModel;
  drawCode: string;
  openTime: string;
  closeTime: string;
  status: 'open' | 'closed' | 'completed';
  winningNumbers?: string[];
  jackpotPrize?: number;
}

export interface CartItem {
  id: string;
  gameId: string;
  gameName: string;
  numbers: string[];
  cost: number;
  quantity: number;
  playType?: string;
  provinceName?: string;
  drawDate?: string;
  winAmount?: number;
  region?: string;
  provinceId?: string;
  category?: string;
  subCategory?: string;
  multiplier?: number;
  rate?: number;
  baseCost?: number;
  unitAmount?: number;
  boards?: any[];
}

export interface PurchaseRecord {
  id: string;
  gameName: string;
  numbers: string[];
  cost: number;
  quantity: number;
  date: string;
  status: 'pending' | 'success' | 'failed';
  provinceName?: string;
}

interface AppState {
  user: {
    name: string;
    balance: number;
    phone: string;
    address?: string;
    email?: string;
    emailVerified?: boolean;
    cccdNumber?: string;
    cccdImage?: string;
    isInfoUpdated?: boolean;
    hasWithdrawPassword?: boolean;
    banks?: any[];
    wallets?: any[];
  } | null;
  token: string | null;
  cart: CartItem[];
  purchaseHistory: PurchaseRecord[];
  unreadNotifications: number;
  forcePasswordChange: boolean;

  games: GameModel[];
  activeDraws: DrawModel[];
  drawResults: DrawModel[];
  banners: any[];
  kienThietSchedule: any[];

  fetchGames: () => Promise<void>;
  fetchActiveDraws: () => Promise<void>;
  fetchDrawResults: () => Promise<void>;
  fetchBanners: () => Promise<void>;
  fetchKienThietSchedule: () => Promise<void>;
  setForcePasswordChange: (val: boolean) => void;

  // Auth
  login: (phone: string, password: string) => Promise<{ success: boolean, message?: string, code?: string }>;
  register: (phone: string, name: string, password: string) => Promise<{ success: boolean, message?: string }>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: { name?: string; address?: string; email?: string; cccdNumber?: string; cccdImage?: string; banks?: any[]; wallets?: any[] }) => Promise<{ success: boolean, message?: string }>;
  restoreSession: () => Promise<void>;
  sendEmailOtp: (email: string) => Promise<{ success: boolean, message?: string }>;
  verifyEmailOtp: (otp: string) => Promise<{ success: boolean, message?: string }>;

  // Wallet
  requestDeposit: (amount: number, receiptImage?: string, txId?: string, paymentMethod?: string, destinationInfo?: any) => Promise<{ success: boolean, message?: string }>;
  requestWithdraw: (amount: number, withdrawPassword?: string, destinationInfo?: any) => Promise<{ success: boolean; message?: string }>;

  // Cart
  fetchCart: () => Promise<void>;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void> | void;
  removeFromCart: (itemId: string) => Promise<void> | void;
  clearCart: () => Promise<void> | void;
  checkout: () => Promise<{ success: boolean; message: string }>;
  clearNotifications: () => void;
  fetchUnreadNotificationsCount: () => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  addPurchaseHistory: (records: Omit<PurchaseRecord, 'id' | 'date' | 'status'>[]) => void;
}

import { Alert } from 'react-native';

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      cart: [],
      purchaseHistory: [],
      unreadNotifications: 0,
      games: [],
      activeDraws: [],
      drawResults: [],
      banners: [],
      kienThietSchedule: [],

      forcePasswordChange: false,
      setForcePasswordChange: (val) => set({ forcePasswordChange: val }),

      fetchGames: async () => {
        try {
          const { data } = await api.get('/games');
          set({ games: data });
        } catch (e: any) {
          console.log('fetchGames error', e);
          Alert.alert('Network Error', e.message + ' - Vui lòng kiểm tra lại IP hoặc mạng.');
        }
      },

      fetchBanners: async () => {
        try {
          const { data } = await api.get('/banners/active');
          set({ banners: data });
        } catch (e: any) {
          console.log('fetchBanners error', e);
        }
      },

      fetchActiveDraws: async () => {
        try {
          const { data } = await api.get('/draws/active');
          set({ activeDraws: data });
        } catch (e) { console.log('fetchActiveDraws error', e); }
      },

      fetchDrawResults: async () => {
        try {
          const { data } = await api.get('/draws/results');
          set({ drawResults: data });
        } catch (e) { console.log('fetchDrawResults error', e); }
      },

      fetchKienThietSchedule: async () => {
        try {
          const { data } = await api.get('/draws/kienthiet-schedule');
          set({ kienThietSchedule: data });
        } catch (e) { console.log('fetchKienThietSchedule error', e); }
      },

      login: async (phone, password) => {
        try {
          const { data } = await api.post('/auth/login', { phone, password });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          set({ 
            user: { name: data.name, balance: data.balance, phone: data.phone, emailVerified: data.emailVerified }, 
            token: data.token,
            cart: []
          });
          registerFCMTokenWithBackend();
          get().fetchUnreadNotificationsCount();
          await get().fetchCart();
          return { success: true };
        } catch (error: any) {
          return { 
            success: false, 
            message: error.response?.data?.message || 'Lỗi kết nối',
            code: error.response?.data?.code
          };
        }
      },

      register: async (phone, name, password) => {
        try {
          const { data } = await api.post('/auth/register', { phone, name, password });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          set({ 
            user: { name: data.name, balance: data.balance, phone: data.phone, emailVerified: data.emailVerified }, 
            token: data.token,
            cart: []
          });
          registerFCMTokenWithBackend();
          get().fetchUnreadNotificationsCount();
          await get().fetchCart();
          return { success: true };
        } catch (error: any) {
          return { success: false, message: error.response?.data?.message || 'Lỗi kết nối' };
        }
      },

      logout: async () => {
        // Remove token from headers instead of AsyncStorage
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null, cart: [], unreadNotifications: 0 });
      },

      fetchProfile: async () => {
        try {
          const { data } = await api.get('/auth/profile');
          set({
            user: {
              name: data.name,
              balance: data.balance,
              phone: data.phone,
              address: data.address,
              email: data.email,
              emailVerified: data.emailVerified,
              cccdNumber: data.cccdNumber,
              cccdImage: data.cccdImage,
              isInfoUpdated: data.isInfoUpdated,
              hasWithdrawPassword: data.hasWithdrawPassword,
              banks: data.banks,
              wallets: data.wallets
            }
          });
          get().fetchUnreadNotificationsCount();
          get().fetchCart();
        } catch (error) {
          console.log('Failed to fetch profile', error);
          get().logout();
        }
      },

      updateProfile: async (payload) => {
        try {
          const { data } = await api.put('/auth/profile', payload);
          set({
            user: {
              name: data.name,
              balance: data.balance,
              phone: data.phone,
              address: data.address,
              email: data.email,
              emailVerified: data.emailVerified,
              cccdNumber: data.cccdNumber,
              cccdImage: data.cccdImage,
              isInfoUpdated: data.isInfoUpdated,
              hasWithdrawPassword: data.hasWithdrawPassword,
              banks: data.banks,
              wallets: data.wallets
            }
          });
          return { success: true, message: 'Cập nhật thành công' };
        } catch (error: any) {
          return { success: false, message: error.response?.data?.message || 'Cập nhật thất bại' };
        }
      },

      restoreSession: async () => {
        // Session is no longer restored from AsyncStorage for security
        set({ token: null, user: null, cart: [] });
      },

      requestDeposit: async (amount: number = 0, receiptImage?: string, txId?: string, paymentMethod?: string, destinationInfo?: any) => {
        try {
          const res = await api.post('/wallet/deposit', { amount, receiptImage, txId, paymentMethod, destinationInfo });
          return { success: true, message: 'Yêu cầu nạp tiền đã được gửi. Vui lòng chờ Admin xác nhận.' };
        } catch (error: any) {
          return { success: false, message: error.response?.data?.message || 'Có lỗi xảy ra' };
        }
      },

      sendEmailOtp: async (email: string) => {
        try {
          const { data } = await api.post('/auth/send-email-otp', { email });
          return { success: true, message: data.message };
        } catch (error: any) {
          return { success: false, message: error.response?.data?.message || 'Có lỗi xảy ra' };
        }
      },

      verifyEmailOtp: async (otp: string) => {
        try {
          const { data } = await api.post('/auth/verify-email-otp', { otp });
          set({
            user: {
              ...get().user,
              emailVerified: data.emailVerified,
            } as any
          });
          return { success: true, message: 'Xác thực email thành công' };
        } catch (error: any) {
          return { success: false, message: error.response?.data?.message || 'Có lỗi xảy ra' };
        }
      },

      requestWithdraw: async (amount: number, withdrawPassword?: string, destinationInfo?: any) => {
        try {
          await api.post('/wallet/withdraw', { amount, withdrawPassword, destinationInfo });
          await get().fetchProfile(); // Cập nhật lại số dư
          return { success: true, message: 'Yêu cầu rút tiền thành công, đang chờ duyệt.' };
        } catch (error: any) {
          return { success: false, message: error.response?.data?.message || 'Lỗi kết nối' };
        }
      },

      fetchCart: async () => {
        try {
          const token = get().token;
          if (!token) return;
          const { data } = await api.get('/cart');
          if (data && Array.isArray(data.items)) {
            set({ cart: data.items });
          }
        } catch (e) {
          console.log('fetchCart error', e);
        }
      },

      addToCart: async (newItem) => {
        const id = Math.random().toString(36).substring(2, 9);
        const itemWithId: CartItem = { ...newItem, id };
        // Optimistic UI update
        set((state) => ({ cart: [...state.cart, itemWithId] }));

        const token = get().token;
        if (token) {
          try {
            const { data } = await api.post('/cart/add', itemWithId);
            if (data && Array.isArray(data.items)) {
              set({ cart: data.items });
            }
          } catch (e) {
            console.log('addToCart api error', e);
          }
        }
      },

      removeFromCart: async (itemId) => {
        // Optimistic UI update
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== itemId),
        }));

        const token = get().token;
        if (token) {
          try {
            const { data } = await api.delete(`/cart/item/${itemId}`);
            if (data && Array.isArray(data.items)) {
              set({ cart: data.items });
            }
          } catch (e) {
            console.log('removeFromCart api error', e);
          }
        }
      },

      clearCart: async () => {
        set({ cart: [] });

        const token = get().token;
        if (token) {
          try {
            await api.delete('/cart/clear');
          } catch (e) {
            console.log('clearCart api error', e);
          }
        }
      },

      checkout: async () => {
        const { cart, user } = get();
        const totalCost = cart.reduce((acc, item) => acc + (item.cost * item.quantity), 0);

        if (totalCost === 0) return { success: false, message: 'Giỏ hàng trống!' };
        if (!user || user.balance < totalCost) return { success: false, message: 'Số dư không đủ! Vui lòng nạp thêm tiền.' };

        try {
          // Chuẩn bị toàn bộ danh sách vé trong giỏ hàng để gửi 1 lần (Batch Checkout)
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
              itemBoards = [{
                id: 'A',
                playType: itemPlayType,
                numbers: Array.isArray(item.numbers) ? item.numbers : [item.numbers],
                cost: (item.cost || 10000) * (item.quantity || 1),
                baseCost: item.baseCost || item.cost || 10000,
                unitAmount: item.unitAmount || item.baseCost || item.cost || 10000,
                multiplier: item.multiplier || 10000,
              }];
            }

            const targetGameType = item.gameId === 'xoso_3mien' 
              ? (item.region ? item.region.toUpperCase() : 'MB')
              : item.gameId;

            return {
              gameType: targetGameType,
              playType: itemPlayType,
              drawId: 'DUMMY_DRAW_ID',
              provinceName: item.provinceName,
              drawDate: item.drawDate,
              items: itemBoards
            };
          });

          // Gửi toàn bộ 200+ vé trong 1 request duy nhất cực nhanh
          const res = await api.post('/orders/checkout', { orders: ordersPayload });

          // Cập nhật lại số dư và làm trống giỏ hàng
          await get().fetchProfile();
          await get().clearCart();

          const successMsg = res.data?.message || `Thanh toán thành công ${ordersPayload.length} vé!`;
          return { success: true, message: successMsg };
        } catch (error: any) {
          console.log('Checkout API Error:', error, error.response?.data);
          const errMsg = error.response?.data?.message || error.message || 'Lỗi thanh toán.';
          return { success: false, message: errMsg };
        }
      },

      fetchUnreadNotificationsCount: async () => {
        try {
          const token = get().token;
          if (!token) return;
          const { data } = await api.get('/notifications/unread-count');
          if (data && typeof data.unreadCount === 'number') {
            set({ unreadNotifications: data.unreadCount });
          }
        } catch (e) {
          // Silent error
        }
      },

      markAllNotificationsAsRead: async () => {
        try {
          set({ unreadNotifications: 0 });
          const token = get().token;
          if (!token) return;
          await api.post('/notifications/read-all');
        } catch (e) {
          console.log('markAllNotificationsAsRead error', e);
        }
      },

      clearNotifications: () => set({ unreadNotifications: 0 }),

      addPurchaseHistory: (newItems) => set((state) => {
        const now = new Date();
        const dateStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
        const formattedRecords: PurchaseRecord[] = newItems.map((item, idx) => ({
          id: `order_${now.getTime()}_${idx}`,
          gameName: item.gameName,
          numbers: item.numbers,
          cost: item.cost,
          quantity: item.quantity,
          date: dateStr,
          status: 'success',
          provinceName: item.provinceName
        }));
        return {
          purchaseHistory: [...formattedRecords, ...state.purchaseHistory]
        };
      }),
    }),
    {
      name: 'app-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => AsyncStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({
        purchaseHistory: state.purchaseHistory,
        forcePasswordChange: state.forcePasswordChange
      }), // Only persist these fields - cart is stored per user account in database!
    }
  )
);
