import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';

import { useAppStore } from './src/store/useAppStore';
import { initPushNotification } from './src/services/notificationService';
import { navigationRef, navigate } from './src/navigation/navigationRef';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const restoreSession = useAppStore(state => state.restoreSession);

  React.useEffect(() => {
    restoreSession();

    let unsubscribe: (() => void) | undefined;
    const handleNotificationClick = (remoteMessage: any) => {
      const data = remoteMessage?.data || {};
      const title = remoteMessage?.notification?.title || data.title || '';
      const body = remoteMessage?.notification?.body || data.body || '';
      const content = `${title} ${body}`;

      const orderId = data.orderId || data.id || content.match(/ORD_[\w-]+/)?.[0];
      if (orderId) {
        navigate('HistoryDetail', { orderId });
        return;
      }

      const type = data.type;
      if (type === 'win' || type === 'order' || content.toLowerCase().includes('trúng') || content.toLowerCase().includes('vé')) {
        navigate('MainTabs', {
          screen: 'History',
          params: { initialTab: 'Hoàn thành' }
        });
      }
    };

    initPushNotification(handleNotificationClick).then(cleanup => {
      unsubscribe = cleanup;
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [restoreSession]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
}

export default App;

