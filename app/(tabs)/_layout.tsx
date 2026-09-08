import { Tabs } from 'expo-router';
import React from 'react';

// Importamos los dos proveedores
import { FavoritosProvider } from '@/src/contexto/FavoritosContext';
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
            }}
          />

          <Tabs.Screen
            name="lineas"
            options={{
              title: 'Líneas',
            }}
          />

          <Tabs.Screen
            name="paradas"
            options={{
              title: 'Paradas',
            }}
          />

          <Tabs.Screen
            name="avisos"
            options={{
              title: 'Avisos',
            }}
          />

          <Tabs.Screen
            name="yo"
            options={{
              title: 'Yo',
            }}
          />
        </Tabs>
      </FavoritosProvider>
    </ReportesProvider>
  );
}