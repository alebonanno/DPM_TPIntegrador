
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Aviso } from '../tipos/aviso';
import { api } from '../api/cliente';

const STORAGE_KEY_AVISOS = 'app_avisos_transporte';

export async function obtenerAvisos(): Promise<Aviso[]> {
  try {
    const respuesta = await api.get('/avisos');

    const avisos: Aviso[] = respuesta.data.datos;

    await AsyncStorage.setItem(
      STORAGE_KEY_AVISOS,
      JSON.stringify(avisos)
    );

    return avisos;

  } catch (error) {
    console.warn('[ServicioAvisos] Usando caché local...', error);

    const guardadas = await AsyncStorage.getItem(STORAGE_KEY_AVISOS);

    return guardadas ? JSON.parse(guardadas) : [];
  }
}

export async function obtenerAvisoPorId(id: string): Promise<Aviso | null> {
  try {
    const respuesta = await api.get(`/avisos/${id}`);

    return respuesta.data.datos;

  } catch (error: any) {
    if (error.response?.status === 404) return null;

    console.error('[ServicioAvisos] Error al buscar aviso:', error);

    const avisos = await obtenerAvisos();

    return avisos.find((aviso) => aviso.id === id) ?? null;
  }
}

export async function obtenerAvisosPorLinea(lineaId: string): Promise<Aviso[]> {
  try {
    const respuesta = await api.get('/avisos', {
      params: { lineaId },
    });

    return respuesta.data.datos;

  } catch (error) {
    console.error('[ServicioAvisos] Error al filtrar avisos:', error);

    const avisos = await obtenerAvisos();

    return avisos.filter((aviso) =>
      aviso.lineaIds.includes(lineaId)
    );
  }
}
