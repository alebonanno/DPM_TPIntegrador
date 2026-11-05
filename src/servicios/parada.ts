import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/cliente'; // 👈 Importamos nuestro cliente configurado con Axios y la baseURL
import { Parada } from '../tipos/parada';

const STORAGE_KEY_PARADAS = 'app_paradas_transporte';

/**
 * Normaliza una parada cruda de la API (con lat/lng y tiene_refugio) 
 * a la estructura interna que usan los componentes de la app.
 */
function normalizarParada(p: any): Parada {
  return {
    id: p.id,
    nombre: p.nombre,
    direccion: p.direccion,
    // Convertimos las propiedades planas lat y lng del servidor al objeto coordenadas
    coordenadas: {
      latitud: p.coordenadas?.latitud !== undefined ? Number(p.coordenadas.latitud) : (parseFloat(p.lat) || -31.7333),
      longitud: p.coordenadas?.longitud !== undefined ? Number(p.coordenadas.longitud) : (parseFloat(p.lng) || -60.5241),
    },
    // Adaptamos tiene_refugio (1/0 o boolean) a booleano
    refugio: p.refugio !== undefined ? p.refugio : (p.tiene_refugio === 1 || p.tiene_refugio === true),
    lineaIds: p.lineaIds || ['lin-1', 'lin-11', 'lin-13'],
    sentido: p.sentido || 'ida',
    horariosProximos: p.horariosProximos || ['08:00', '09:30', '11:15'],
  };
}

/**
 * Obtiene todas las paradas desde la API real usando Axios.
 * Si falla la red, recurre al almacenamiento local (AsyncStorage) como fallback offline.
 */
export async function obtenerParadas(filtroBusqueda?: string, lineaId?: string): Promise<Parada[]> {
  try {
    const params: Record<string, string> = {};
    if (filtroBusqueda) params.busqueda = filtroBusqueda;
    if (lineaId) params.lineaId = lineaId;

    console.log('[ServicioParadas] Sincronizando paradas desde la API con Axios...');
    
    const respuesta = await api.get('/paradas', { params });
    const json = respuesta.data;

    if (json.datos && Array.isArray(json.datos)) {
      // 🗺️ Normalizamos cada parada para que tenga la estructura 'coordenadas' correcta
      const paradasNormalizadas: Parada[] = json.datos.map(normalizarParada);

      // Guardamos en AsyncStorage solo si es la lista completa para uso offline
      if (!filtroBusqueda && !lineaId) {
        await AsyncStorage.setItem(STORAGE_KEY_PARADAS, JSON.stringify(paradasNormalizadas));
      }
      return paradasNormalizadas;
    }

    throw new Error('Formato de datos de paradas inválido');
  } catch (error) {
    console.warn('[ServicioParadas] Sin conexión o error con la API. Usando datos guardados en AsyncStorage...', error);
    
    // Fallback: leer lo que ya está guardado en el teléfono
    const guardadas = await AsyncStorage.getItem(STORAGE_KEY_PARADAS);
    if (guardadas) {
      const paradasLocales: Parada[] = JSON.parse(guardadas);
      
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
 * Busca una parada específica por su ID consultando directamente a la API con Axios.
 */
export async function obtenerParadaPorId(id: string): Promise<Parada | null> {
  try {
    const respuesta = await api.get(`/paradas/${id}`);
    const dato = respuesta.data.datos;
    return dato ? normalizarParada(dato) : null;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }

    console.error(`[ServicioParadas] Error al buscar la parada con ID ${id} en la API. Buscando localmente...`, error);
    
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
 * Resuelve el código QR de una parada específica según la API de la cátedra usando Axios.
 */
export async function resolverParadaPorQr(codigoQr: string): Promise<Parada | null> {
  try {
    const respuesta = await api.get(`/paradas/qr/${codigoQr}`);
    const dato = respuesta.data.datos;
    return dato ? normalizarParada(dato) : null;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error(`[ServicioParadas] Error al resolver el QR ${codigoQr}:`, error);
    return null;
  }
}