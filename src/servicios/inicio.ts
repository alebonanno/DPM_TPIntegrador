import AsyncStorage from '@react-native-async-storage/async-storage';
import { obtenerParadas } from './parada'; // 👈 Importamos el servicio real de paradas

const STORAGE_KEY_INICIO = 'app_inicio_datos';

/**
 * Obtiene los datos de inicio combinando la información local 
 * y asegurando que las paradas provengan del servicio real normalizado.
 */
export async function obtenerInicio() {
  try {
    console.log('[ServicioInicio] Obteniendo datos y paradas actualizadas...');
    
    // Obtenemos las paradas reales normalizadas desde la API
    const paradasReales = await obtenerParadas();

    const datosInicio = {
      paradas: paradasReales,
      // ... cualquier otro dato inicial que necesite tu pantalla de inicio
    };

    await AsyncStorage.setItem(STORAGE_KEY_INICIO, JSON.stringify(datosInicio));
    return datosInicio;
  } catch (error) {
    console.error('Error al obtener los datos de inicio:', error);
    
    // Fallback al almacenamiento local si falla la red
    const guardados = await AsyncStorage.getItem(STORAGE_KEY_INICIO);
    if (guardados) {
      return JSON.parse(guardados);
    }
    
    return { paradas: [] };
  }
}

export async function guardarInicio(datos: any) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_INICIO, JSON.stringify(datos));
  } catch (error) {
    console.error('Error al guardar los datos de inicio:', error);
  }
}