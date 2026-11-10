
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linea } from '../tipos/linea';
import { api } from '../api/cliente';

const STORAGE_KEY_LINEAS = 'app_lineas_transporte';

/**
 * Obtiene todas las líneas desde la API.
 * Si no hay conexión, utiliza la caché local.
 */
export async function obtenerLineas(): Promise<Linea[]> {
  try {
    console.log('[ServicioLineas] Consultando líneas a la API...');

    const respuesta = await api.get('/lineas');

    // La API responde: { datos: [...], meta: {...} }
    const lineas: Linea[] = respuesta.data.datos;

    // Guardamos una copia en AsyncStorage para modo offline
    await AsyncStorage.setItem(STORAGE_KEY_LINEAS, JSON.stringify(lineas));

    return lineas;

  } catch (error) {
    console.warn('[ServicioLineas] Sin conexión a la API, usando caché local...', error);

    const guardadas = await AsyncStorage.getItem(STORAGE_KEY_LINEAS);

    if (guardadas) {
      return JSON.parse(guardadas);
    }

    return [];
  }
}

/**
 * Busca una línea específica por su ID.
 */
export async function obtenerLineaPorId(id: string): Promise<Linea | null> {
  try {
    const respuesta = await api.get(`/lineas/${id}`);

    return respuesta.data.datos;

  } catch (error: any) {

    if (error.response?.status === 404) {
      return null;
    }

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
