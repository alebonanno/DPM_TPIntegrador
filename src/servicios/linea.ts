import AsyncStorage from '@react-native-async-storage/async-storage';
import { lineasMock } from '../mocks/lineas';
import { Linea } from '../tipos/linea';

const STORAGE_KEY_LINEAS = 'app_lineas_transporte';

/**
 * Obtiene todas las líneas almacenadas localmente o inicializa
 * con los datos mock si el almacenamiento está vacío.
 */
export async function obtenerLineas(): Promise<Linea[]> {
  try {
    console.log('[ServicioLineas] Leyendo líneas desde AsyncStorage...');
    const guardadas = await AsyncStorage.getItem(STORAGE_KEY_LINEAS);

    if (!guardadas) {
      console.log('[ServicioLineas] No hay líneas previas. Inicializando con los mocks...');
      await AsyncStorage.setItem(STORAGE_KEY_LINEAS, JSON.stringify(lineasMock));
      return lineasMock;
    }

    return JSON.parse(guardadas);
  } catch (error) {
    console.error('Error al obtener las líneas:', error);
    return lineasMock; // Fallback seguro en caso de error
  }
}

/**
 * Busca una línea específica por su ID.
 */
export async function obtenerLineaPorId(id: string): Promise<Linea | null> {
  try {
    const lineas = await obtenerLineas();
    return lineas.find((linea) => linea.id === id) ?? null;
  } catch (error) {
    console.error(`Error al buscar la línea con ID ${id}:`, error);
    return null;
  }
}