import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/cliente'; // 👈 Cliente centralizado de Axios
import { Linea } from '../tipos/linea';

const STORAGE_KEY_LINEAS = 'app_lineas_transporte';

/**
 * Obtiene todas las líneas desde la API real usando Axios.
 * Si falla la red, recurre al almacenamiento local (AsyncStorage) como fallback offline.
 */
export async function obtenerLineas(): Promise<Linea[]> {
  try {
    console.log('[ServicioLineas] Sincronizando líneas desde la API con Axios...');
    
    // Petición GET usando Axios (el .data ya viene parseado automáticamente)
    const respuesta = await api.get('/lineas');
    const json = respuesta.data;

    // La API de la cátedra devuelve los datos en json.datos
    if (json.datos && Array.isArray(json.datos)) {
      // 👇 Normalizamos para asegurar que 'activa' tenga un valor booleano válido
      const lineasNormalizadas = json.datos.map((l: any) => ({
        ...l,
        activa: l.activa !== undefined ? l.activa : (l.enServicio ?? true),
      }));

      await AsyncStorage.setItem(STORAGE_KEY_LINEAS, JSON.stringify(lineasNormalizadas));
      return lineasNormalizadas;
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
 * Busca una línea específica por su ID consultando directamente a la API con Axios.
 */
export async function obtenerLineaPorId(id: string): Promise<Linea | null> {
  try {
    const respuesta = await api.get(`/lineas/${id}`);
    const dato = respuesta.data.datos;
    
    if (!dato) return null;

    // Normalizamos también la línea individual por seguridad
    return {
      ...dato,
      activa: dato.activa !== undefined ? dato.activa : (dato.enServicio ?? true),
    };
  } catch (error: any) {
    // Si el servidor responde un 404, retornamos null limpiamente
    if (error.response && error.response.status === 404) {
      return null;
    }

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