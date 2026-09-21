import { horariosMock } from '../mocks/horario';
import type { Horario } from '../tipos/horario';

export async function obtenerHorarios() {
  return horariosMock;
}

export async function obtenerHorariosPorParada(paradaId: string) {
  return horariosMock.filter(
    (horario) => horario.paradaId === paradaId
  );
}

export async function obtenerHorariosPorLinea(lineaId: string) {
  return horariosMock.filter(
    (horario) => horario.lineaId === lineaId
  );
}

// ==========================================
// NUEVAS FUNCIONES DE UTILIDAD PARA EL PUNTO 3
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