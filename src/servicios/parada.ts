import AsyncStorage from '@react-native-async-storage/async-storage';
import { Parada } from '../tipos/parada';
import API_URL from './api';

const STORAGE_KEY_PARADAS = 'app_paradas_transporte';

/**
 * Obtiene todas las paradas desde la API real.
 * Si falla la red, recurre al almacenamiento local (AsyncStorage) como fallback offline.
 */
export async function obtenerParadas(filtroBusqueda?: string, lineaId?: string): Promise<Parada[]> {
  try {
    let url = `${API_URL}/paradas`;
    const params = new URLSearchParams();
    
    if (filtroBusqueda) params.append('busqueda', filtroBusqueda);
    if (lineaId) params.append('lineaId', lineaId);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    console.log('[ServicioParadas] Sincronizando paradas desde la API...');
    const respuesta = await fetch(url);
    const json = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(json.error?.mensaje || 'Error al obtener las paradas');
    }

    if (json.datos && Array.isArray(json.datos)) {
      // Guardamos en AsyncStorage solo si es la lista completa para uso offline
      if (!filtroBusqueda && !lineaId) {
        await AsyncStorage.setItem(STORAGE_KEY_PARADAS, JSON.stringify(json.datos));
      }
      return json.datos;
    }

    throw new Error('Formato de datos de paradas inválido');
  } catch (error) {
    console.warn('[ServicioParadas] Sin conexión o error con la API. Usando datos guardados en AsyncStorage...', error);
    
    // Fallback: leer lo que ya está guardado en el teléfono
    const guardadas = await AsyncStorage.getItem(STORAGE_KEY_PARADAS);
    if (guardadas) {
      const paradasLocales: Parada[] = JSON.parse(guardadas);
      
      // Aplicar filtros locales si fueron solicitados y no hay red
      return paradasLocales.filter((parada) => {
        const coincideBusqueda = filtroBusqueda 
          ? parada.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) || parada.id.includes(filtroBusqueda)
          : true;
        return coincideBusqueda;
      });
    }

    console.error('[ServicioParadas] No hay paradas en almacenamiento local.');
    return [];
  }
}

/**
 * Busca una parada específica por su ID consultando directamente a la API.
 */
export async function obtenerParadaPorId(id: string): Promise<Parada | null> {
  try {
    const respuesta = await fetch(`${API_URL}/paradas/${id}`);
    const json = await respuesta.json();

    if (!respuesta.ok) {
      if (respuesta.status === 404) return null;
      throw new Error(json.error?.mensaje || 'Error al buscar la parada');
    }

    return json.datos;
  } catch (error) {
    console.error(`[ServicioParadas] Error al buscar la parada con ID ${id} en la API. Buscando localmente...`, error);
    
    // Fallback local en caso de error de red
    try {
      const guardadas = await AsyncStorage.getItem(STORAGE_KEY_PARADAS);
      if (guardadas) {
        const paradas: Parada[] = JSON.parse(guardadas);
        return paradas.find((parada) => parada.id === id) ?? null;
      }
      return null;
    } catch (localError) {
      console.error(`Error en fallback local para parada ${id}:`, localError);
      return null;
    }
  }
}

/**
 * Resuelve el código QR de una parada específica según la API de la cátedra.
 */
export async function resolverParadaPorQr(codigoQr: string): Promise<Parada | null> {
  try {
    const respuesta = await fetch(`${API_URL}/paradas/qr/${codigoQr}`);
    const json = await respuesta.json();

    if (!respuesta.ok) {
      if (respuesta.status === 404) return null;
      throw new Error(json.error?.mensaje || 'Código QR no reconocido');
    }

    return json.datos;
  } catch (error) {
    console.error(`[ServicioParadas] Error al resolver el QR ${codigoQr}:`, error);
    return null;
  }
}