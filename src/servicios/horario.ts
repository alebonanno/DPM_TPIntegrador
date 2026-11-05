import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/cliente'; // 👈 Cliente centralizado de Axios
import { horariosMock } from '../mocks/horario';
import type { Horario } from '../tipos/horario';

const STORAGE_KEY_HORARIOS = 'app_horarios_transporte';

/**
 * Obtiene los horarios sincronizando desde la API (con porPagina=5000 como pide la cátedra)
 * utilizando Axios. Si falla la red, lee del almacenamiento local o de los mocks.
 */
export async function obtenerHorarios(): Promise<Horario[]> {
  try {
    console.log('[ServicioHorarios] Sincronizando horarios desde la API con Axios...');
    
    // Petición GET con Axios usando el parámetro solicitado por la cátedra
    const respuesta = await api.get('/horarios', {
      params: { porPagina: 5000 }
    });

    const json = respuesta.data;

    // La API devuelve los datos en json.datos, los guardamos en AsyncStorage para uso offline
    if (json.datos && Array.isArray(json.datos)) {
      await AsyncStorage.setItem(STORAGE_KEY_HORARIOS, JSON.stringify(json.datos));
      return json.datos;
    }

    throw new Error('Formato de datos de horarios inválido');
  } catch (error) {
    console.warn('[ServicioHorarios] Sin conexión o error con la API. Usando datos guardados en AsyncStorage...', error);
    
    // Fallback 1: leer lo que ya está guardado en el teléfono
    const guardados = await AsyncStorage.getItem(STORAGE_KEY_HORARIOS);
    if (guardados) {
      return JSON.parse(guardados);
    }

    // Fallback 2: si no hay nada guardado, inicializamos con los mocks
    console.warn('[ServicioHorarios] No hay horarios en almacenamiento local. Usando mocks...');
    await AsyncStorage.setItem(STORAGE_KEY_HORARIOS, JSON.stringify(horariosMock));
    return horariosMock;
  }
}

/**
 * Filtra los horarios por parada específica.
 */
export async function obtenerHorariosPorParada(paradaId: string): Promise<Horario[]> {
  try {
    const horarios = await obtenerHorarios();
    return horarios.filter((horario) => horario.paradaId === paradaId);
  } catch (error) {
    console.error(`Error al filtrar horarios para la parada ${paradaId}:`, error);
    return [];
  }
}

/**
 * Filtra los horarios por línea específica.
 */
export async function obtenerHorariosPorLinea(lineaId: string): Promise<Horario[]> {
  try {
    const horarios = await obtenerHorarios();
    return horarios.filter((horario) => horario.lineaId === lineaId);
  } catch (error) {
    console.error(`Error al filtrar horarios para la línea ${lineaId}:`, error);
    return [];
  }
}

// ==========================================
// FUNCIONES DE UTILIDAD PARA EL CÁLCULO
// ==========================================

export interface HorarioConCalculo extends Horario {
  faltanMinutos: number;
}

export type ResultadoProximos = 
  | { estado: 'activo'; proximos: HorarioConCalculo[] }
  | { estado: 'finalizado'; mensaje: string };

/**
 * Calcula los próximos tres horarios de una parada/línea para un tipo de día dado,
 * calculando cuántos minutos faltan o devolviendo el mensaje amigable si ya finalizó el servicio.
 */
export function calcularProximosHorarios(
  horarios: Horario[], 
  tipoDiaActual: 'habil' | 'sabado' | 'domingo' | 'feriado'
): ResultadoProximos {
  const ahora = new Date();
  const horaActualStr = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

  // Filtramos por el tipo de día actual (ej: 'habil')
  const delDia = horarios.filter((h) => h.tipoDeDia === tipoDiaActual);

  // Ordenamos cronológicamente
  delDia.sort((a, b) => a.hora.localeCompare(b.hora));

  // Buscamos los que son mayores o iguales a la hora actual
  const futuros = delDia.filter((h) => h.hora >= horaActualStr);

  if (futuros.length > 0) {
    const proximos = futuros.slice(0, 3);
    return {
      estado: 'activo',
      proximos: proximos.map((h) => {
        const [hH, hM] = h.hora.split(':').map(Number);
        const minutosTotalesHorario = hH * 60 + hM;
        const minutosTotalesActuales = ahora.getHours() * 60 + ahora.getMinutes();
        const diffMinutos = minutosTotalesHorario - minutosTotalesActuales;

        return {
          ...h,
          faltanMinutos: diffMinutos,
        };
      }),
    };
  } else {
    // Ya pasó el último del día, buscamos el primer horario de referencia para mañana
    const primerHorarioMañana = delDia[0]?.hora || '05:20';
    return {
      estado: 'finalizado',
      mensaje: `No hay más servicio hasta mañana a las ${primerHorarioMañana}`,
    };
  }
}