global.__DEV__ = true;

// Mock react-native-toast-message
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock Firebase
jest.mock('@react-native-firebase/app', () => ({}));
jest.mock('@react-native-firebase/messaging', () => () => ({
  getToken: jest.fn().mockResolvedValue('fake-token'),
  requestPermission: jest.fn().mockResolvedValue(1),
  onMessage: jest.fn(),
  setBackgroundMessageHandler: jest.fn(),
}));

// Mock notifee
jest.mock('@notifee/react-native', () => ({
  displayNotification: jest.fn(),
  createChannel: jest.fn(),
}));

// Mock notification service
jest.mock('./src/services/notificationService', () => ({
  registerFCMTokenWithBackend: jest.fn(),
  initPushNotification: jest.fn().mockResolvedValue(jest.fn()),
}));
