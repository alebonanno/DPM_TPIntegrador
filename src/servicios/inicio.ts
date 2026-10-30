import AsyncStorage from '@react-native-async-storage/async-storage';
import { inicioMock } from '../mocks/inicio';

const STORAGE_KEY_INICIO = 'app_inicio_datos';

/**
 * Obtiene los datos de inicio almacenados localmente o inicializa
 * con los mocks si el almacenamiento está vacío.
 */
export async function obtenerInicio() {
  try {
    console.log('[ServicioInicio] Leyendo datos de inicio desde AsyncStorage...');
    const guardados = await AsyncStorage.getItem(STORAGE_KEY_INICIO);

    if (!guardados) {
      console.log('[ServicioInicio] No hay datos previos. Inicializando con los mocks...');
      await AsyncStorage.setItem(STORAGE_KEY_INICIO, JSON.stringify(inicioMock));
      return inicioMock;
    }

    console.log('[ServicioInicio] Datos de inicio encontrados en la memoria local.');
    return JSON.parse(guardados);
  } catch (error) {
    console.error('Error al obtener los datos de inicio:', error);
    return inicioMock; // Fallback seguro en caso de error de lectura
  }
}

/**
 * Permite actualizar los datos de inicio guardados localmente.
 */
export async function guardarInicio(datos: any) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_INICIO, JSON.stringify(datos));
  } catch (error) {
    console.error('Error al guardar los datos de inicio:', error);
  }
}