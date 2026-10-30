import { API_URL } from '../config';
import { Aviso } from '../tipos/aviso';

/**
 * Obtiene todos los avisos de la Dirección de Transporte desde la API real.
 * @param estado 'vigentes' (default) | 'proximos' | 'todos'
 * @param lineaId Opcional, para filtrar por línea
 */
export async function obtenerAvisos(
  estado: 'vigentes' | 'proximos' | 'todos' = 'vigentes',
  lineaId?: string
): Promise<Aviso[]> {
  try {
    let url = `${API_URL}/avisos?estado=${estado}`;
    if (lineaId) {
      url += `&lineaId=${lineaId}`;
    }

    const respuesta = await fetch(url);
    const json = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(json.error?.mensaje || 'Error al obtener los avisos');
    }

    // La API devuelve los datos dentro de json.datos
    return json.datos;
  } catch (error) {
    console.error('[ServicioAvisos] Error al obtener avisos desde la API:', error);
    throw error;
  }
}

/**
 * Busca un aviso específico por su ID en la API.
 */
export async function obtenerAvisoPorId(id: string): Promise<Aviso | null> {
  try {
    const respuesta = await fetch(`${API_URL}/avisos/${id}`);
    const json = await respuesta.json();

    if (!respuesta.ok) {
      if (respuesta.status === 404) return null;
      throw new Error(json.error?.mensaje || 'Error al buscar el aviso');
    }

    return json.datos;
  } catch (error) {
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