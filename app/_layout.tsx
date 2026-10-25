import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { TemaProvider } from '@/src/contexto/TemaContexto';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { useNetworkSync } from '@/src/hooks/useNetworkSync';

import * as Network from 'expo-network';
import { StyleSheet, Text, View } from 'react-native';

export function BannerConectividad() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    async function verificarRedInicial() {
      const estado = await Network.getNetworkStateAsync();
      const online = (estado.isConnected ?? true) && estado.type !== Network.NetworkStateType.NONE;
      setIsOnline(online);
    }
    verificarRedInicial();

    const subscription = Network.addNetworkStateListener((estado) => {
      const online = (estado.isConnected ?? true) && estado.type !== Network.NetworkStateType.NONE;
      setIsOnline(online);
    });

    return () => {
      subscription && subscription.remove();
    };
  }, []);

  if (isOnline) return null;

  return (
    <View style={styles.bannerOffline}>
      <Text style={styles.textoOffline}>⚠️ Sin conexión a internet. Trabajando en modo offline.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerOffline: { 
    backgroundColor: '#D32F2F', 
    padding: 10, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingTop: 40 
  },
  textoOffline: { color: '#FFF', fontSize: 12, fontWeight: 'bold' }
});

// Configuración global del manejador de notificaciones según la cátedra
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [verificando, setVerificando] = useState(true);

  useNetworkSync();

  useEffect(() => {
    async function inicializarApp() {
      try {
        // Limpiamos el router.replace imperativo para evitar el fallo de montaje.
        // El Stack nativamente cargará (tabs) por estar primero.
      } catch (error) {
        console.error('Error al inicializar la app:', error);
      } finally {
        setVerificando(false);
        await SplashScreen.hideAsync();
      }
    }

    inicializarApp();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <TemaProvider>
        <BannerConectividad />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="escaner" />
        </Stack>
      </TemaProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}