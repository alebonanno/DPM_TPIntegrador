import AsyncStorage from '@react-native-async-storage/async-storage';
import { avisosMock } from '../mocks/aviso';
import { Aviso } from '../tipos/aviso';

const STORAGE_KEY_AVISOS = 'app_avisos_transporte';

/**
 * Obtiene todos los avisos almacenados localmente o inicializa
 * con los mocks si el almacenamiento está vacío.
 */
export async function obtenerAvisos(): Promise<Aviso[]> {
  try {
    console.log('[ServicioAvisos] Leyendo avisos desde AsyncStorage...');
    const guardados = await AsyncStorage.getItem(STORAGE_KEY_AVISOS);

    if (!guardados) {
      console.log('[ServicioAvisos] No hay avisos previos. Inicializando con los mocks...');
      await AsyncStorage.setItem(STORAGE_KEY_AVISOS, JSON.stringify(avisosMock));
      return avisosMock;
    }

    return JSON.parse(guardados);
  } catch (error) {
    console.error('Error al obtener los avisos:', error);
    return avisosMock; // Fallback seguro
  }
}

/**
 * Busca un aviso específico por su ID.
 */
export async function obtenerAvisoPorId(id: string): Promise<Aviso | null> {
  try {
    const avisos = await obtenerAvisos();
    return avisos.find((aviso) => aviso.id === id) ?? null;
  } catch (error) {
    console.error(`Error al buscar el aviso con ID ${id}:`, error);
    return null;
  }
}

/**
 * Filtra los avisos asociados a una línea específica.
 */
export async function obtenerAvisosPorLinea(lineaId: string): Promise<Aviso[]> {
  try {
    const avisos = await obtenerAvisos();
    return avisos.filter((aviso) => aviso.lineaIds.includes(lineaId));
  } catch (error) {
    console.error(`Error al filtrar avisos para la línea ${lineaId}:`, error);
    return [];
  }
}