import AsyncStorage from '@react-native-async-storage/async-storage';
import { Parada } from '../tipos/parada';

// Usamos la misma IP de tu Wi-Fi conectada a Docker
const API_URL = 'http://192.168.1.2:3000';
const STORAGE_KEY_PARADAS = 'app_paradas_transporte';

/**
 * Obtiene todas las paradas desde la API real de Docker.
 */
export async function obtenerParadas(): Promise<Parada[]> {
  try {
    console.log('[ServicioParadas] Consultando paradas a la API...');
    const respuesta = await fetch(`${API_URL}/paradas`);

    if (!respuesta.ok) {
      throw new Error(`Error en la API: ${respuesta.status}`);
    }

    const resultado = await respuesta.json();
    const paradas: Parada[] = resultado.datos;

    await AsyncStorage.setItem(STORAGE_KEY_PARADAS, JSON.stringify(paradas));
    return paradas;
  } catch (error) {
    console.warn('[ServicioParadas] Sin conexión a la API, usando caché local...', error);
    const guardadas = await AsyncStorage.getItem(STORAGE_KEY_PARADAS);
    return guardadas ? JSON.parse(guardadas) : [];
  }
}

/**
 * 🌟 NUEVO/CLAVE: Obtiene las paradas específicas de una línea consultando a la API.
 * Esto es lo que necesita tu mapa al hacer click en una línea.
 */
export async function obtenerParadasPorLinea(lineaId: string): Promise<Parada[]> {
  try {
    console.log(`[ServicioParadas] Consultando paradas para la línea ${lineaId}...`);
    const respuesta = await fetch(`${API_URL}/paradas?lineaId=${lineaId}`);

    if (!respuesta.ok) {
      throw new Error(`Error en la API: ${respuesta.status}`);
    }

    const resultado = await respuesta.json();
    return resultado.datos;
  } catch (error) {
    console.error(`Error al obtener paradas para la línea ${lineaId}:`, error);
    return [];
  }
}

/**
 * Busca una parada específica por su ID consultando directamente a la API.
 */
export async function obtenerParadaPorId(id: string): Promise<Parada | null> {
  try {
    const respuesta = await fetch(`${API_URL}/paradas/${id}`);

    if (!respuesta.ok) {
      if (respuesta.status === 404) return null;
      throw new Error(`Error en la API: ${respuesta.status}`);
    }

    const resultado = await respuesta.json();
    return resultado.datos;
  } catch (error) {
    console.error(`Error al buscar la parada con ID ${id} desde la API:`, error);
    try {
      const paradas = await obtenerParadas();
      return paradas.find((parada) => parada.id === id) ?? null;
    } catch {
      return null;
    }
  }
}