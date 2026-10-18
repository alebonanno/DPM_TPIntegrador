import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
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
    async function verificarRed() {
      const estado = await Network.getNetworkStateAsync();
      setIsOnline(estado.isConnected ?? true);
    }
    verificarRed();
    
    
  }, []);

  if (isOnline) return null;

  return (
    <View style={styles.bannerOffline}>
      <Text style={styles.textoOffline}>⚠️ Sin conexión a internet. Trabajando en modo offline.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerOffline: { backgroundColor: '#D32F2F', padding: 6, alignItems: 'center', justifyContent: 'center' },
  textoOffline: { color: '#FFF', fontSize: 12, fontWeight: 'bold' }
});

// Configuración global del manejador de notificaciones según la cátedra
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // El cartel que baja arriba
    shouldShowList: true,   // Queda en el centro de notificaciones
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Evita que la splash screen se oculte automáticamente antes de tiempo
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [verificando, setVerificando] = useState(true);

  // Activamos el monitoreo de red y la sincronización automática en segundo plano
  useNetworkSync();

  useEffect(() => {
    async function verificarSesionYBiometria() {
      try {
        const token = await SecureStore.getItemAsync('userToken');

        if (token) {
          const compatible = await LocalAuthentication.hasHardwareAsync();
          const enrolled = await LocalAuthentication.isEnrolledAsync();

          if (compatible && enrolled) {
            // Este bloque pide la contraseña "real" del dispositivo.
            const resultado = await LocalAuthentication.authenticateAsync({
              promptMessage: 'Autenticación requerida para ingresar',
              fallbackLabel: 'Usar contraseña',
            });

            if (resultado.success) {
              router.replace('/(tabs)/' as any);
              return; // <--- Evita que siga bajando
            } else {
              // Si cancela o falla la biometría, lo mandamos al login
              router.replace('/login' as any);
              return; // <--- Evita que siga bajando
            }
          } else {
            router.replace('/(tabs)/' as any);
            return; // <--- Evita que siga bajando
          }
        }

        // Si no hay token guardado, entra directamente acá
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
        {/* Agregamos el banner de conectividad aquí para que sea visible globalmente */}
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