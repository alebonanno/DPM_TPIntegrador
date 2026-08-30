import { avisosMock } from '../mocks/aviso';

export async function obtenerAvisos() {
  return avisosMock;
}

export async function obtenerAvisoPorId(id: string) {
  return avisosMock.find((aviso) => aviso.id === id) ?? null;
}

export async function obtenerAvisosPorLinea(lineaId: string) {
  return avisosMock.filter((aviso) =>
    aviso.lineaIds.includes(lineaId)
  );
}
