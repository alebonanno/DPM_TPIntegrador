import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/cliente'; // 👈 Cliente centralizado de Axios
import { reportesMock } from '../mocks/reporte';
import type { ReporteDeDemora } from '../tipos/reporte';

const STORAGE_KEY_REPORTES = 'app_reportes_demora';
const STORAGE_KEY_COLA = 'app_cola_reportes_pendientes';

/**
 * Obtiene todos los reportes desde la API o desde AsyncStorage si no hay red.
 */
export async function obtenerReportes(lineaId?: string, paradaId?: string): Promise<ReporteDeDemora[]> {
  try {
    const params: Record<string, string> = {};
    if (lineaId) params.lineaId = lineaId;
    if (paradaId) params.paradaId = paradaId;

    console.log('[ServicioReportes] Sincronizando reportes desde la API con Axios...');
    
    // Petición GET con Axios
    const respuesta = await api.get('/reportes-demora', { params });
    const json = respuesta.data;

    if (json.datos && Array.isArray(json.datos)) {
      const reportesConSync = json.datos.map((r: any) => ({ ...r, sincronizado: true }));
      // Guardar en almacenamiento local para uso offline
      await AsyncStorage.setItem(STORAGE_KEY_REPORTES, JSON.stringify(reportesConSync));
      return reportesConSync;
    }

    throw new Error('Formato de datos de reportes inválido');
  } catch (error) {
    console.warn('[ServicioReportes] Sin conexión o error con la API. Usando datos locales...', error);
    const guardados = await AsyncStorage.getItem(STORAGE_KEY_REPORTES);
    
    if (!guardados) {
      const iniciales: ReporteDeDemora[] = reportesMock.map(r => ({ ...r, sincronizado: true }));
      await AsyncStorage.setItem(STORAGE_KEY_REPORTES, JSON.stringify(iniciales));
      return iniciales;
    }

    const reportes: ReporteDeDemora[] = JSON.parse(guardados);
    return reportes.filter(r => {
      if (lineaId && r.lineaId !== lineaId) return false;
      if (paradaId && r.paradaId !== paradaId) return false;
      return true;
    });
  }
}

/**
 * Filtra los reportes por parada específica.
 */
export async function obtenerReportesPorParada(paradaId: string): Promise<ReporteDeDemora[]> {
  return obtenerReportes(undefined, paradaId);
}

/**
 * Filtra los reportes por línea específica.
 */
export async function obtenerReportesPorLinea(lineaId: string): Promise<ReporteDeDemora[]> {
  return obtenerReportes(lineaId, undefined);
}

/**
 * Crea un nuevo reporte. Si hay red, lo envía directo a la API con Axios; si no, lo guarda en la cola offline.
 */
export async function crearReporte(
  nuevoReporte: Omit<ReporteDeDemora, 'id' | 'fechaHora' | 'sincronizado' | 'confirmaciones'>
): Promise<ReporteDeDemora> {
  try {
    console.log('[ServicioReportes] Intentando enviar reporte a la API con Axios...');
    
    // El interceptor de Axios ya adjunta el token automáticamente si existe en SecureStore
    const respuesta = await api.post('/reportes-demora', nuevoReporte);
    const json = respuesta.data;

    const reporteCreado: ReporteDeDemora = {
      ...json.datos,
      sincronizado: true,
    };

    // Guardar en la lista local
    const reportes = await obtenerReportes();
    reportes.unshift(reporteCreado);
    await AsyncStorage.setItem(STORAGE_KEY_REPORTES, JSON.stringify(reportes));

    return reporteCreado;
  } catch (error) {
    console.warn('[ServicioReportes] Sin red o error al enviar. Guardando en modo offline...', error);
    
    const reporteOffline: ReporteDeDemora = {
      ...nuevoReporte,
      id: `rep-${Date.now()}`,
      fechaHora: new Date().toISOString(),
      confirmaciones: 0,
      sincronizado: false,
    };

    const reportes = await obtenerReportes();
    reportes.unshift(reporteOffline);
    await AsyncStorage.setItem(STORAGE_KEY_REPORTES, JSON.stringify(reportes));

    await agregarAColaSincronizacion(reporteOffline);
    return reporteOffline;
  }
}

/**
 * Confirma un reporte de demora existente usando Axios.
 */
export async function confirmarReporte(reporteId: string): Promise<void> {
  try {
    await api.post(`/reportes-demora/${reporteId}/confirmaciones`);
  } catch (error: any) {
    const mensaje = error.response?.data?.error?.mensaje || 'Error al confirmar el reporte';
    throw new Error(mensaje);
  }
}

/**
 * Agrega un reporte a la cola de elementos pendientes de enviar al servidor.
 */
async function agregarAColaSincronizacion(reporte: ReporteDeDemora): Promise<void> {
  try {
    const colaStr = await AsyncStorage.getItem(STORAGE_KEY_COLA);
    const cola: ReporteDeDemora[] = colaStr ? JSON.parse(colaStr) : [];
    cola.push(reporte);
    await AsyncStorage.setItem(STORAGE_KEY_COLA, JSON.stringify(cola));
  } catch (error) {
    console.error('Error al agregar a la cola de sincronización:', error);
  }
}

/**
 * Procesa la cola de sincronización cuando se recupera la conexión a internet usando Axios.
 */
export async function sincronizarReportesPendientes(): Promise<number> {
  try {
    const colaStr = await AsyncStorage.getItem(STORAGE_KEY_COLA);
    if (!colaStr) return 0;

    const cola: ReporteDeDemora[] = JSON.parse(colaStr);
    if (cola.length === 0) return 0;

    let sincronizadosCount = 0;

    for (const reporte of cola) {
      try {
        await api.post('/reportes-demora', {
          lineaId: reporte.lineaId,
          paradaId: reporte.paradaId,
          motivo: reporte.motivo,
          fotoUri: reporte.fotoUri,
        });
        sincronizadosCount++;
      } catch (err) {
        console.error(`Fallo al sincronizar reporte individual ${reporte.id}:`, err);
      }
    }

    if (sincronizadosCount > 0) {
      const reportes = await obtenerReportes();
      const reportesActualizados = reportes.map(r => ({ ...r, sincronizado: true }));
      await AsyncStorage.setItem(STORAGE_KEY_REPORTES, JSON.stringify(reportesActualizados));
      await AsyncStorage.setItem(STORAGE_KEY_COLA, JSON.stringify([]));
    }

    return sincronizadosCount;
  } catch (error) {
    console.error('Fallo la sincronización offline:', error);
    throw error;
  }
}

/**
 * Devuelve la cantidad de reportes pendientes de sincronizar.
 */
export async function obtenerCantidadPendientes(): Promise<number> {
  try {
    const colaStr = await AsyncStorage.getItem(STORAGE_KEY_COLA);
    if (!colaStr) return 0;
    const cola: ReporteDeDemora[] = JSON.parse(colaStr);
    return cola.length;
  } catch (error) {
    return 0;
  }
}