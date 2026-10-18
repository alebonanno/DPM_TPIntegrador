import AsyncStorage from '@react-native-async-storage/async-storage';
import { horariosMock } from '../mocks/horario';
import type { Horario } from '../tipos/horario';

const STORAGE_KEY_HORARIOS = 'app_horarios_transporte';

/**
 * Obtiene todos los horarios almacenados localmente o inicializa
 * con los mocks si el almacenamiento está vacío.
 */
export async function obtenerHorarios(): Promise<Horario[]> {
  try {
    console.log('[ServicioHorarios] Leyendo horarios desde AsyncStorage...');
    const guardados = await AsyncStorage.getItem(STORAGE_KEY_HORARIOS);

    if (!guardados) {
      console.log('[ServicioHorarios] No hay horarios previos. Inicializando con los mocks...');
      await AsyncStorage.setItem(STORAGE_KEY_HORARIOS, JSON.stringify(horariosMock));
      return horariosMock;
    }

    return JSON.parse(guardados);
  } catch (error) {
    console.error('Error al obtener los horarios:', error);
    return horariosMock; // Fallback seguro
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