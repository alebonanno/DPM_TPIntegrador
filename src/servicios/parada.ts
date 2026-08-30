import { paradasMock } from '../mocks/parada';

export async function obtenerParadas() {
  return paradasMock;
}

export async function obtenerParadaPorId(id: string) {
  return paradasMock.find((parada) => parada.id === id) ?? null;
}
