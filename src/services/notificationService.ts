import {
  getMessaging,
  requestPermission,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  subscribeToTopic,
  AuthorizationStatus,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import api from './api';
import { useAppStore } from '../store/useAppStore';

export const requestUserPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('[FCM] POST_NOTIFICATIONS permission denied on Android');
        return false;
      }
    }

    const messagingInstance = getMessaging();
    const authStatus = await requestPermission(messagingInstance);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('[FCM] Notification authorization status:', authStatus);
    }
    return enabled;
  } catch (error) {
    console.error('[FCM] Error requesting permission:', error);
    return false;
  }
};

export const getFCMToken = async (): Promise<string | null> => {
  try {
    const messagingInstance = getMessaging();

    if (Platform.OS === 'ios') {
      await registerDeviceForRemoteMessages(messagingInstance);
    }

    // Always fetch fresh token from Firebase SDK to avoid stale/revoked tokens
    const token = await getToken(messagingInstance);
    if (token) {
      await AsyncStorage.setItem('fcm_token', token);
    }

    console.log('====================================');
    console.log('[FCM] Device Token:', token);
    console.log('====================================');

    return token;
  } catch (error) {
    console.error('[FCM] Error getting FCM token:', error);
    return null;
  }
};

export const registerFCMTokenWithBackend = async (fcmToken?: string | null) => {
  try {
    const token = fcmToken || (await AsyncStorage.getItem('fcm_token'));
    if (!token) return;

    await api.post('/notifications/register-token', { token });
    console.log('[FCM] Token registered with backend successfully');
  } catch (error) {
    // Normal when user is not logged in yet (unauthenticated)
    console.log('[FCM] Note: Register token with backend skipped or unauthenticated');
  }
};

export const createNotificationChannel = async () => {
  return await notifee.createChannel({
    id: 'default',
    name: 'Thông báo',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
};

export const displayLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>
) => {
  try {
    const channelId = await createNotificationChannel();

    await notifee.displayNotification({
      title,
      body,
      data,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_launcher',
        pressAction: {
          id: 'default',
        },
      },
    });
  } catch (error) {
    console.error('[Notification] Error displaying local notification:', error);
  }
};

export const setupNotificationListeners = (
  onNotificationClick?: (remoteMessage: RemoteMessage) => void
) => {
  const messagingInstance = getMessaging();

  // 1. Foreground message listener (App is open) -> Show in-app Toast & System Notification
  const unsubscribeOnMessage = onMessage(
    messagingInstance,
    async (remoteMessage: RemoteMessage) => {
      console.log('[FCM] Received foreground message:', remoteMessage);

      const title =
        remoteMessage.notification?.title ||
        (remoteMessage.data?.title as string) ||
        '🔔 Thông báo';
      const body =
        remoteMessage.notification?.body ||
        (remoteMessage.data?.body as string) ||
        '';

      // 1.1 Show In-App Toast
      Toast.show({
        type: 'info',
        text1: title,
        text2: body,
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
        topOffset: 50,
        onPress: () => {
          Toast.hide();
          if (onNotificationClick) {
            onNotificationClick(remoteMessage);
          }
        },
      });

      // 1.2 Push System Notification (thông báo trên thanh status bar của máy)
      await displayLocalNotification(title, body, remoteMessage.data);

      // 1.3 Refresh unread notifications count in store
      useAppStore.getState().fetchUnreadNotificationsCount();
    }
  );

  // 2. Notification opened listener (App was in background)
  const unsubscribeOnNotificationOpenedApp = onNotificationOpenedApp(
    messagingInstance,
    (remoteMessage: RemoteMessage) => {
      console.log(
        '[FCM] Notification caused app to open from background state:',
        remoteMessage
      );
      if (onNotificationClick) {
        onNotificationClick(remoteMessage);
      }
    }
  );

  // 3. Initial notification (App was completely closed / killed)
  getInitialNotification(messagingInstance).then(
    (remoteMessage: RemoteMessage | null) => {
      if (remoteMessage) {
        console.log(
          '[FCM] Notification caused app to open from quit state:',
          remoteMessage
        );
        if (onNotificationClick) {
          onNotificationClick(remoteMessage);
        }
      }
    }
  );

  // 4. Token refresh listener
  const unsubscribeOnTokenRefresh = onTokenRefresh(
    messagingInstance,
    async (newToken: string) => {
      console.log('[FCM] Token refreshed:', newToken);
      await AsyncStorage.setItem('fcm_token', newToken);
      await registerFCMTokenWithBackend(newToken);
    }
  );

  // 5. Notifee Foreground click listener
  const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS && detail.notification) {
      console.log('[Notifee] Notification clicked:', detail.notification);
      if (onNotificationClick) {
        onNotificationClick({
          notification: {
            title: detail.notification.title,
            body: detail.notification.body,
          },
          data: detail.notification.data,
        } as any);
      }
    }
  });

  return () => {
    unsubscribeOnMessage();
    unsubscribeOnNotificationOpenedApp();
    unsubscribeOnTokenRefresh();
    unsubscribeNotifee();
  };
};

export const initPushNotification = async (
  onNotificationClick?: (remoteMessage: RemoteMessage) => void
) => {
  await requestUserPermission();
  await createNotificationChannel();
  const token = await getFCMToken();

  // Subscribe to topic 'all' so broadcast notifications sent from CMS reach this device
  try {
    const messagingInstance = getMessaging();
    await subscribeToTopic(messagingInstance, 'all');
    console.log('[FCM] Subscribed to topic "all"');
  } catch (err) {
    console.error('[FCM] Error subscribing to topic "all":', err);
  }

  // Register token with backend (if user session exists)
  if (token) {
    registerFCMTokenWithBackend(token);
  }

  return setupNotificationListeners(onNotificationClick);
};
