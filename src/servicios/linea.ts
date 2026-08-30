import { lineasMock } from '../mocks/lineas';

export async function obtenerLineas() {
  return lineasMock;
}

export async function obtenerLineaPorId(id: string) {
  return lineasMock.find((linea) => linea.id === id) ?? null;
}
