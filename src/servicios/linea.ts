import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linea } from '../tipos/linea';
import API_URL from './api';

const STORAGE_KEY_LINEAS = 'app_lineas_transporte';

/**
 * Obtiene todas las líneas desde la API real. 
 * Si falla la red, recurre al almacenamiento local (AsyncStorage) como fallback offline.
 */
export async function obtenerLineas(): Promise<Linea[]> {
  try {
    console.log('[ServicioLineas] Sincronizando líneas desde la API...');
    const respuesta = await fetch(`${API_URL}/lineas`);
    const json = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(json.error?.mensaje || 'Error al obtener las líneas');
    }

    // La API devuelve los datos en json.datos, los guardamos en AsyncStorage para uso offline
    if (json.datos && Array.isArray(json.datos)) {
      await AsyncStorage.setItem(STORAGE_KEY_LINEAS, JSON.stringify(json.datos));
      return json.datos;
    }

    throw new Error('Formato de datos de líneas inválido');
  } catch (error) {
    console.warn('[ServicioLineas] Sin conexión o error con la API. Usando datos guardados en AsyncStorage...', error);
    
    // Fallback: leer lo que ya está guardado en el teléfono
    const guardadas = await AsyncStorage.getItem(STORAGE_KEY_LINEAS);
    if (guardadas) {
      return JSON.parse(guardadas);
    }

    console.error('[ServicioLineas] No hay líneas en almacenamiento local.');
    return [];
  }
}

/**
 * Busca una línea específica por su ID consultando directamente a la API (o buscando en el listado si prefieres).
 */
export async function obtenerLineaPorId(id: string): Promise<Linea | null> {
  try {
    const respuesta = await fetch(`${API_URL}/lineas/${id}`);
    const json = await respuesta.json();

    if (!respuesta.ok) {
      if (respuesta.status === 404) return null;
      throw new Error(json.error?.mensaje || 'Error al buscar la línea');
    }

    return json.datos;
  } catch (error) {
    console.error(`[ServicioLineas] Error al buscar la línea con ID ${id} en la API. Buscando localmente...`, error);
    
    // Fallback local en caso de error de red
    try {
      const lineas = await obtenerLineas();
      return lineas.find((linea) => linea.id === id) ?? null;
    } catch (localError) {
      console.error(`Error en fallback local para línea ${id}:`, localError);
      return null;
    }
  }
}