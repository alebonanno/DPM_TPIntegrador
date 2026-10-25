import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linea } from '../tipos/linea';

const API_URL = 'http://192.168.1.2:3000';

const STORAGE_KEY_LINEAS = 'app_lineas_transporte';

/**
 * Obtiene todas las líneas almacenadas localmente o inicializa
 * con los datos mock si el almacenamiento está vacío.
 */
export async function obtenerLineas(): Promise<Linea[]> {
  try {
    console.log('[ServicioLineas] Consultando líneas a la API...');
    const respuesta = await fetch(`${API_URL}/lineas`);

    if (!respuesta.ok) {
      throw new Error(`Error en la API: ${respuesta.status}`);
    }

    const resultado = await respuesta.json();
    
    // La API responde con un sobre: { datos: [...], meta: {...} }
    const lineas: Linea[] = resultado.datos;

    // Guardamos una copia en AsyncStorage para modo offline
    await AsyncStorage.setItem(STORAGE_KEY_LINEAS, JSON.stringify(lineas));

    return lineas;
  } catch (error) {
    console.warn('[ServicioLineas] Sin conexión a la API, usando caché local...', error);
    
    // Fallback por si no hay red
    const guardadas = await AsyncStorage.getItem(STORAGE_KEY_LINEAS);
    if (guardadas) {
      return JSON.parse(guardadas);
    }

    return [];
  }
}

/**
 * Busca una línea específica por su ID consultando directamente a la API.
 */
export async function obtenerLineaPorId(id: string): Promise<Linea | null> {
  try {
    const respuesta = await fetch(`${API_URL}/lineas/${id}`);

    if (!respuesta.ok) {
      if (respuesta.status === 404) return null;
      throw new Error(`Error en la API: ${respuesta.status}`);
    }

    const resultado = await respuesta.json();
    
    // Un solo recurso también viene dentro de .datos
    return resultado.datos;
  } catch (error) {
    console.error(`Error al buscar la línea con ID ${id} desde la API:`, error);
    
    // Fallback buscando en la lista local si falla la red
    try {
      const lineas = await obtenerLineas();
      return lineas.find((linea) => linea.id === id) ?? null;
    } catch {
      return null;
    }
  }
}