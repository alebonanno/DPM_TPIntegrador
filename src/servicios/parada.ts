
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Parada } from '../tipos/parada';
import { api } from '../api/cliente';

const STORAGE_KEY_PARADAS = 'app_paradas_transporte';

/**
 * Obtiene todas las paradas desde la API.
 */
export async function obtenerParadas(): Promise<Parada[]> {
  try {
    console.log('[ServicioParadas] Consultando paradas a la API...');

    const respuesta = await api.get('/paradas');
    const paradas: Parada[] = respuesta.data.datos;

    await AsyncStorage.setItem(STORAGE_KEY_PARADAS, JSON.stringify(paradas));

    return paradas;

  } catch (error) {
    console.warn('[ServicioParadas] Sin conexión a la API, usando caché local...', error);

    const guardadas = await AsyncStorage.getItem(STORAGE_KEY_PARADAS);

    return guardadas ? JSON.parse(guardadas) : [];
  }
}

/**
 * Obtiene las paradas específicas de una línea.
 */
export async function obtenerParadasPorLinea(lineaId: string): Promise<Parada[]> {
  try {
    console.log(`[ServicioParadas] Consultando paradas para la línea ${lineaId}...`);

    const respuesta = await api.get('/paradas', {
      params: { lineaId },
    });

    return respuesta.data.datos;

  } catch (error) {
    console.error(`Error al obtener paradas para la línea ${lineaId}:`, error);
    return [];
  }
}

/**
 * Busca una parada específica por su ID.
 */
export async function obtenerParadaPorId(id: string): Promise<Parada | null> {
  try {
    const respuesta = await api.get(`/paradas/${id}`);

    return respuesta.data.datos;

  } catch (error: any) {

    if (error.response?.status === 404) {
      return null;
    }

    console.error(`Error al buscar la parada con ID ${id} desde la API:`, error);

    try {
      const paradas = await obtenerParadas();
      return paradas.find((parada) => parada.id === id) ?? null;
    } catch {
      return null;
    }
  }
}
