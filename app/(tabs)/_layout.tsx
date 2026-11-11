import { Ionicons } from '@expo/vector-icons'; // <-- 1. Importamos los íconos
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { verificarBiometria } from '../../src/servicios/auth'; // Asegúrate de ajustar esta ruta si es necesario

// Importamos los dos proveedores
import { FavoritosProvider } from '../../src/contexto/FavoritosContexto';
import { ReportesProvider } from '../../src/contexto/ReportesContext';

export default function TabLayout() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      // Si la app vuelve de segundo plano a primer plano
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        try {
          // Solo si hay token (sesión iniciada), pedimos la huella
          const token = await SecureStore.getItemAsync('userToken');
          if (token) {
            await verificarBiometria();
          }
        } catch (error) {
          console.error('Error al verificar biometría:', error);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <ReportesProvider>
      <FavoritosProvider>
        <Tabs screenOptions={{ headerShown: false }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Inicio',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="lineas"
            options={{
              title: 'Líneas',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="bus" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="paradas"
            options={{
              title: 'Paradas',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="location" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="avisos"
            options={{
              title: 'Avisos',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="notifications" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="yo"
            options={{
              title: 'Yo',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </FavoritosProvider>
    </ReportesProvider>
  );
}