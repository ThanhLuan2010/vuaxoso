/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import { displayLocalNotification } from './src/services/notificationService';

// Register background handler for FCM
const messagingInstance = getMessaging();
setBackgroundMessageHandler(messagingInstance, async remoteMessage => {
  console.log('[FCM] Message handled in background:', remoteMessage);
  if (!remoteMessage.notification && (remoteMessage.data?.title || remoteMessage.data?.body)) {
    const title = remoteMessage.data.title || '🔔 Thông báo';
    const body = remoteMessage.data.body || '';
    await displayLocalNotification(title, body, remoteMessage.data);
  }
});

// Register background handler for Notifee
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('[Notifee] Background event press:', detail.notification);
  }
});

AppRegistry.registerComponent(appName, () => App);
