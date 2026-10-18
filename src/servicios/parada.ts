import AsyncStorage from '@react-native-async-storage/async-storage';
import { paradasMock } from '../mocks/parada';
import { Parada } from '../tipos/parada';

const STORAGE_KEY_PARADAS = 'app_paradas_transporte';

/**
 * Obtiene todas las paradas almacenadas localmente o inicializa
 * el AsyncStorage con los mocks si se encuentra vacío.
 */
export async function obtenerParadas(): Promise<Parada[]> {
  try {
    console.log('[ServicioParadas] Leyendo paradas desde AsyncStorage...');
    const guardadas = await AsyncStorage.getItem(STORAGE_KEY_PARADAS);

    if (!guardadas) {
      console.log('[ServicioParadas] No hay paradas previas. Inicializando con los mocks...');
      await AsyncStorage.setItem(STORAGE_KEY_PARADAS, JSON.stringify(paradasMock));
      return paradasMock;
    }

    return JSON.parse(guardadas);
  } catch (error) {
    console.error('Error al obtener las paradas:', error);
    return paradasMock; // Fallback seguro en caso de error
  }
}

/**
 * Busca una parada específica por su ID utilizando el servicio local.
 */
export async function obtenerParadaPorId(id: string): Promise<Parada | null> {
  try {
    const paradas = await obtenerParadas();
    return paradas.find((parada) => parada.id === id) ?? null;
  } catch (error) {
    console.error(`Error al buscar la parada con ID ${id}:`, error);
    return null;
  }
}