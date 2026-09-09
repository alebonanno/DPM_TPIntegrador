import { Ionicons } from '@expo/vector-icons'; // <-- 1. Importamos los íconos
import { Tabs } from 'expo-router';
import React from 'react';

// Importamos los dos proveedores
import { FavoritosProvider } from '../../src/contexto/FavoritosContexto';
import { ReportesProvider } from '../../src/contexto/ReportesContext';

export default function TabLayout() {
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