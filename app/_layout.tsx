import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Stack, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [verificando, setVerificando] = useState(true);

  useNetworkSync();

  useEffect(() => {
    async function verificarSesionYBiometria() {
      try {
        const token = await SecureStore.getItemAsync('userToken');

        if (token) {
          const compatible = await LocalAuthentication.hasHardwareAsync();
          const enrolled = await LocalAuthentication.isEnrolledAsync();

          if (compatible && enrolled) {
            const resultado = await LocalAuthentication.authenticateAsync({
              promptMessage: 'Autenticación requerida para ingresar',
              fallbackLabel: 'Usar contraseña',
            });

            if (resultado.success) {
              router.replace('/(tabs)/' as any);
              return;
            } else {
              router.replace('/login' as any);
              return;
            }
          } else {
            router.replace('/(tabs)/' as any);
            return;
          }
        }

        router.replace('/login' as any);
      } catch (error) {
        console.error('Error al verificar sesión:', error);
        router.replace('/login' as any);
      } finally {
        setVerificando(false);
        await SplashScreen.hideAsync();
      }
    }

    verificarSesionYBiometria();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <TemaProvider>
        <BannerConectividad />
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </TemaProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}