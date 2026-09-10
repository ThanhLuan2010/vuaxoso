import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../store/useAppStore';

// const API_URL = 'https://api-vuaxoso.vipmarts.com/api';
const MAIN_API_URL = 'https://api-vuaxoso.vipmarts.com/api';
// Android Emulator requires 10.0.2.2 instead of localhost
import { Platform } from 'react-native';
const LOCAL_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5001/api' : 'http://localhost:5001/api';

const api = axios.create({
  baseURL: __DEV__ ? LOCAL_API_URL : MAIN_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAppStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Error:', error.message, error.response?.data);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAppStore.getState().logout();
    }
    if (error.response?.status === 403 && error.response?.data?.requirePasswordChange) {
      useAppStore.getState().setForcePasswordChange(true);
    }
    return Promise.reject(error);
  }
);

export default api;
