import { api } from '../api/cliente'; // 👈 Usamos el cliente centralizado de Axios
import { Aviso } from '../tipos/aviso';

/**
 * Normaliza un aviso recibido de la API para adaptarlo a las propiedades que usa avisos.tsx
 */
function normalizarAviso(a: any): Aviso {
  return {
    id: a.id,
    titulo: a.titulo,
    // Mapeamos 'descripcion' del backend a 'detalle' que usa tu UI
    detalle: a.descripcion || a.detalle || 'Sin detalles disponibles.',
    // Mapeamos 'video_url' a 'videoUrl'
    videoUrl: a.video_url !== undefined ? a.video_url : a.videoUrl,
    // Simulamos o asignamos las líneas comprometidas si la API no las trae directamente
    lineaIds: a.lineaIds || ['lin-1', 'lin-11', 'lin-13'],
    // Usamos la fecha de creación como base si 'desde' o 'hasta' no vienen definidas
    desde: a.desde || a.fecha_creacion || new Date().toISOString(),
    hasta: a.hasta || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    gravedad: a.gravedad || (a.tipo === 'desvio' ? 'alta' : 'media'),
  };
}

/**
 * Obtiene todos los avisos de la Dirección de Transporte desde la API real usando Axios.
 */
export async function obtenerAvisos(
  estado: 'vigentes' | 'proximos' | 'todos' = 'vigentes',
  lineaId?: string
): Promise<Aviso[]> {
  try {
    const params: Record<string, string> = { estado };
    if (lineaId) {
      params.lineaId = lineaId;
    }

    console.log('[ServicioAvisos] Sincronizando avisos desde la API con Axios...');
    
    const respuesta = await api.get('/avisos', { params });
    const json = respuesta.data;

    if (json.datos && Array.isArray(json.datos)) {
      // 🔄 Normalizamos cada aviso para que encaje con la interfaz de la app
      return json.datos.map(normalizarAviso);
    }

    throw new Error('Formato de datos de avisos inválido');
  } catch (error: any) {
    console.error('[ServicioAvisos] Error al obtener avisos desde la API:', error);
    
    if (error.response && error.response.data?.error?.mensaje) {
      throw new Error(error.response.data.error.mensaje);
    }
    
    throw error;
  }
}

/**
 * Busca un aviso específico por su ID en la API usando Axios.
 */
export async function obtenerAvisoPorId(id: string): Promise<Aviso | null> {
  try {
    const respuesta = await api.get(`/avisos/${id}`);
    const dato = respuesta.data.datos;
    return dato ? normalizarAviso(dato) : null;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }

    console.error(`[ServicioAvisos] Error al buscar aviso ${id}:`, error);
    return null;
  }
}

/**
 * Filtra los avisos asociados a una línea específica directamente desde la API.
 */
export async function obtenerAvisosPorLinea(lineaId: string): Promise<Aviso[]> {
  return obtenerAvisos('vigentes', lineaId);
}