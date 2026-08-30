import { horariosMock } from '../mocks/horario';

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
