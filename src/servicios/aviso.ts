import AsyncStorage from '@react-native-async-storage/async-storage';
import { Aviso } from '../tipos/aviso';

const API_URL = 'http://192.168.1.2:3000';
const STORAGE_KEY_AVISOS = 'app_avisos_transporte';

/**
 * Obtiene todos los avisos desde la API real de Docker.
 * Si falla la red, usa AsyncStorage como respaldo offline.
 */
export async function obtenerAvisos(): Promise<Aviso[]> {
  try {
    console.log('[ServicioAvisos] Consultando avisos a la API...');
    const respuesta = await fetch(`${API_URL}/avisos`);

    if (!respuesta.ok) {
      throw new Error(`Error en la API: ${respuesta.status}`);
    }

    const resultado = await respuesta.json();
    const avisos: Aviso[] = resultado.datos; // Extraemos el array de "datos"

    // Guardamos copia local para modo offline
    await AsyncStorage.setItem(STORAGE_KEY_AVISOS, JSON.stringify(avisos));

    return avisos;
  } catch (error) {
    console.warn('[ServicioAvisos] Sin conexión a la API, usando caché local...', error);
    
    const guardadas = await AsyncStorage.getItem(STORAGE_KEY_AVISOS);
    if (guardadas) {
      return JSON.parse(guardadas);
    }

    return [];
  }
}

/**
 * Busca un aviso específico por su ID consultando directamente a la API.
 */
export async function obtenerAvisoPorId(id: string): Promise<Aviso | null> {
  try {
    const respuesta = await fetch(`${API_URL}/avisos/${id}`);

    if (!respuesta.ok) {
      if (respuesta.status === 404) return null;
      throw new Error(`Error en la API: ${respuesta.status}`);
    }

    const resultado = await respuesta.json();
    return resultado.datos;
  } catch (error) {
    console.error(`Error al buscar el aviso con ID ${id} desde la API:`, error);
    
    // Fallback buscando en la lista local
    try {
      const avisos = await obtenerAvisos();
      return avisos.find((aviso) => aviso.id === id) ?? null;
    } catch {
      return null;
    }
  }
}

/**
 * Filtra los avisos asociados a una línea específica usando la API.
 */
export async function obtenerAvisosPorLinea(lineaId: string): Promise<Aviso[]> {
  try {
    const respuesta = await fetch(`${API_URL}/avisos?lineaId=${lineaId}`);

    if (!respuesta.ok) {
      throw new Error(`Error en la API: ${respuesta.status}`);
    }

    const resultado = await respuesta.json();
    return resultado.datos;
  } catch (error) {
    console.error(`Error al filtrar avisos para la línea ${lineaId} desde la API:`, error);
    
    // Fallback filtrando de la lista local
    try {
      const avisos = await obtenerAvisos();
      return avisos.filter((aviso) => aviso.lineaIds.includes(lineaId));
    } catch {
      return [];
    }
  }
}