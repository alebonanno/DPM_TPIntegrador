import { reportesMock } from '../mocks/reporte';
export async function obtenerReportes() {
  return reportesMock;
}

export async function obtenerReportesPorParada(paradaId: string) {
  return reportesMock.filter(
    (reporte) => reporte.paradaId === paradaId
  );
}

export async function obtenerReportesPorLinea(lineaId: string) {
  return reportesMock.filter(
    (reporte) => reporte.lineaId === lineaId
  );
}
