import type { ReporteDeDemora } from '@/src/tipos/reporte';

export const reportesMock: ReporteDeDemora[] = [
  {
    id: 'rep-3390',
    lineaId: 'lin-05',
    paradaId: 'par-101',
    usuarioId: 'usr-320',
    motivo: 'no_paso',
    comentario: 'Hace 25 minutos que espero',
    fotoUri: null,
    confirmaciones: 2,
    fechaHora: '2026-09-16T10:35:00-03:00',
    sincronizado: true,
  },
  {
    id: 'rep-3391',
    lineaId: 'lin-05',
    paradaId: 'par-101',
    usuarioId: 'usr-321',
    motivo: 'demorado',
    comentario: null,
    fotoUri: null,
    confirmaciones: 1,
    fechaHora: '2026-09-16T10:40:00-03:00',
    sincronizado: false,
  },
];
