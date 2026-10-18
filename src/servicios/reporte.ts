import AsyncStorage from '@react-native-async-storage/async-storage';
import { reportesMock } from '../mocks/reporte';
import type { ReporteDeDemora } from '../tipos/reporte';

const STORAGE_KEY_REPORTES = 'app_reportes_demora';
const STORAGE_KEY_COLA = 'app_cola_reportes_pendientes';

/**
 * Obtiene todos los reportes almacenados localmente o inicializa
 * con los mocks si está vacío.
 */
export async function obtenerReportes(): Promise<ReporteDeDemora[]> {
  try {
    console.log('[ServicioReportes] Leyendo reportes desde AsyncStorage...');
    const guardados = await AsyncStorage.getItem(STORAGE_KEY_REPORTES);
    
    if (!guardados) {
      console.log('[ServicioReportes] No hay datos previos. Inicializando con los mocks...');
      const iniciales: ReporteDeDemora[] = reportesMock.map(r => ({
        ...r,
        sincronizado: true,
      }));
      await AsyncStorage.setItem(STORAGE_KEY_REPORTES, JSON.stringify(iniciales));
      return iniciales;
    }

    console.log('[ServicioReportes] Reportes encontrados en la memoria local.');
    return JSON.parse(guardados);
  } catch (error) {
    console.error('Error al obtener los reportes:', error);
    return reportesMock.map(r => ({ ...r, sincronizado: true }));
  }
}

/**
 * Filtra los reportes por parada específica.
 */
export async function obtenerReportesPorParada(paradaId: string): Promise<ReporteDeDemora[]> {
  const reportes = await obtenerReportes();
  return reportes.filter((reporte) => reporte.paradaId === paradaId);
}

/**
 * Filtra los reportes por línea específica.
 */
export async function obtenerReportesPorLinea(lineaId: string): Promise<ReporteDeDemora[]> {
  const reportes = await obtenerReportes();
  return reportes.filter((reporte) => reporte.lineaId === lineaId);
}

/**
 * Crea un nuevo reporte offline, lo guarda localmente y lo añade a la cola de sincronización.
 */
export async function crearReporte(
  nuevoReporte: Omit<ReporteDeDemora, 'id' | 'fechaHora' | 'sincronizado' | 'confirmaciones'>
): Promise<ReporteDeDemora> {
  console.log('[ServicioReportes] Creando nuevo reporte (modo offline)...');
  const reportes = await obtenerReportes();

  const reporteCreado: ReporteDeDemora = {
    ...nuevoReporte,
    id: `rep-${Date.now()}`,
    fechaHora: new Date().toISOString(),
    confirmaciones: 0,
    sincronizado: false, // Nace como no sincronizado para la cola offline
  };

  // 1. Guardar en la lista principal local
  reportes.unshift(reporteCreado);
  await AsyncStorage.setItem(STORAGE_KEY_REPORTES, JSON.stringify(reportes));
  console.log('[ServicioReportes] Reporte guardado en la lista general con sincronizado: false');

  // 2. Agregar a la cola de sincronización pendiente
  await agregarAColaSincronizacion(reporteCreado);

  return reporteCreado;
}

/**
 * Agrega un reporte a la cola de elementos pendientes de enviar al servidor.
 */
async function agregarAColaSincronizacion(reporte: ReporteDeDemora): Promise<void> {
  try {
    console.log('[ServicioReportes] Añadiendo reporte a la cola de pendientes...');
    const colaStr = await AsyncStorage.getItem(STORAGE_KEY_COLA);
    const cola: ReporteDeDemora[] = colaStr ? JSON.parse(colaStr) : [];
    
    cola.push(reporte);
    await AsyncStorage.setItem(STORAGE_KEY_COLA, JSON.stringify(cola));
    console.log(`[ServicioReportes] Cola de pendientes actualizada. Total pendientes: ${cola.length}`);
  } catch (error) {
    console.error('Error al agregar a la cola de sincronización:', error);
  }
}

/**
 * Procesa la cola de sincronización cuando se recupera la conexión a internet.
 */
export async function sincronizarReportesPendientes(): Promise<number> {
  try {
    console.log('[ServicioReportes] Verificando si hay reportes para sincronizar...');
    const colaStr = await AsyncStorage.getItem(STORAGE_KEY_COLA);
    if (!colaStr) {
      console.log('[ServicioReportes] No hay cola de sincronización registrada.');
      return 0;
    }

    const cola: ReporteDeDemora[] = JSON.parse(colaStr);
    if (cola.length === 0) {
      console.log('[ServicioReportes] La cola de pendientes está vacía.');
      return 0;
    }

    console.log(`[ServicioReportes] ¡Conexión restablecida! Sincronizando ${cola.length} reportes pendientes...`);

    // TODO: Realiza aquí tu petición HTTP a tu backend (ej: fetch POST /api/reportes)
    // const response = await fetch('https://tu-api.com/reportes', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(cola),
    // });
    // if (!response.ok) throw new Error('Error al sincronizar con el servidor');

    console.log(`[Sync] Se sincronizaron ${cola.length} reportes con éxito.`);

    // 1. Marcar como sincronizados en la lista general
    const reportes = await obtenerReportes();
    const idsSincronizados = new Set(cola.map(r => r.id));

    const reportesActualizados = reportes.map(r =>
      idsSincronizados.has(r.id) ? { ...r, sincronizado: true } : r
    );

    await AsyncStorage.setItem(STORAGE_KEY_REPORTES, JSON.stringify(reportesActualizados));
    console.log('[ServicioReportes] Lista general actualizada: los reportes ahora tienen sincronizado: true');

    // 2. Vaciar la cola de sincronización
    await AsyncStorage.setItem(STORAGE_KEY_COLA, JSON.stringify([]));
    console.log('[ServicioReportes] Cola de sincronización vaciada exitosamente.');

    return cola.length;
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