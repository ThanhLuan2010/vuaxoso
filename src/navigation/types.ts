import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  StatsMenu: undefined;
  StatsKeno: undefined;
  StatsDienToan: undefined;
  StatsTruyenThong: undefined;
  VietlottDetail: { type: string };
  HistoryDetail: { orderId: string };
  GameLayoutA: { gameId: string; initialTab?: string };
  GameLayoutB: { gameId: string };
  GameLayoutC: { provinceId: string; provinceName: string; drawDate: string };
  GameLayoutLode: { gameId: string };
  Wallet: undefined;
  DepositBinance: undefined;
  AccountInfo: undefined;
  PaymentMethods: undefined;
  WithdrawPassword: undefined;
  ChangePassword: undefined;
  Terms: undefined;
  TransactionHistory: undefined;
  GuideDetail: { title: string; content?: string };
  Notifications: undefined;
  Cart: undefined;
  CoBuy: undefined;
  CoBuyCompleted: undefined;
  CoBuyDetail: { 
    roomId: string; 
    roomNum: string; 
    baoType: number; 
    totalCost: number; 
    isCompleted?: boolean;
    progress?: number;
    minGop?: number;
  };
  CoBuyHistory: undefined;
  CoBuyPayment: {
    baoType: number;
    roomNum: string;
    cost: number;
    percent: number;
    gameType: string;
  };
  GamePayment: {
    gameId: string;
    gameName: string;
    playType: string;
    boards: Array<{ id: string; numbers: string[]; isTC: boolean }>;
    totalCost: number;
  };
  Guide: undefined;
  Login: undefined;
};

export type TabParamList = {
  HomeStack: undefined;
  Stats: undefined;
  Live: undefined;
  Results: undefined;
  History: undefined;
};
