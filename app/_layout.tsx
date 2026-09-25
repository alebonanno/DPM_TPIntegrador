import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Stack, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { TemaProvider } from '@/src/contexto/TemaContexto';

// Evita que la splash screen se oculte automáticamente antes de tiempo
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [verificando, setVerificando] = useState(true);

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
              setVerificando(false);
              await SplashScreen.hideAsync();
              return;
            }
          } else {
            router.replace('/(tabs)/' as any);
            setVerificando(false);
            await SplashScreen.hideAsync();
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
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </TemaProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}