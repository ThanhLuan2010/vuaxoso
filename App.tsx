import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';

import { useAppStore } from './src/store/useAppStore';
import { initPushNotification } from './src/services/notificationService';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const restoreSession = useAppStore(state => state.restoreSession);

  React.useEffect(() => {
    restoreSession();

    let unsubscribe: (() => void) | undefined;
    initPushNotification().then(cleanup => {
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
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
}

export default App;

