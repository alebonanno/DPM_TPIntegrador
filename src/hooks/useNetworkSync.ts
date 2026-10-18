import * as Network from 'expo-network';
import { useEffect } from 'react';
import { sincronizarReportesPendientes } from '../servicios/reporte';

export function useNetworkSync() {
  useEffect(() => {
    const verificarConexionYSincronizar = async () => {
      try {
        const estadoRed = await Network.getNetworkStateAsync();
        
        // Si hay internet y es alcanzable, disparamos la sincronización de la cola
        if (estadoRed.isConnected && estadoRed.isInternetReachable) {
          console.log('[Red] Conexión restablecida. Sincronizando reportes pendientes...');
          const cantidad = await sincronizarReportesPendientes();
          if (cantidad > 0) {
            console.log(`[Red] Se sincronizaron ${cantidad} reportes con éxito.`);
          }
        }
      } catch (error) {
        console.error('[Red] Error al verificar el estado de la red:', error);
      }
    };

    // Ejecutar al iniciar la aplicación
    verificarConexionYSincronizar();
  }, []);
}