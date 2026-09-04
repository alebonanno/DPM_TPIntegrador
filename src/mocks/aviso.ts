import type { Aviso } from '../tipos/aviso';

export const avisosMock: Aviso[] = [
  {
    id: 'avi-088',
    titulo: 'Desvío por obra en calle Corrientes',
    detalle:
      'Desde el lunes 14 las líneas 2, 7 y 9 desvían por Santa Fe.',
    lineaIds: ['lin-02', 'lin-07', 'lin-09'],
    desde: '2026-09-14T00:00:00-03:00',
    hasta: '2026-10-05T23:59:00-03:00',
    gravedad: 'desvio',
    trazadoAlternativo: [
      {
        latitud: -31.7345,
        longitud: -60.523,
      },
      {
        latitud: -31.735,
        longitud: -60.521,
      },
    ],
    videoUrl: 'https://api.parana.gob.ar/v/desvio-corrientes.mp4',
  },

  {
    id: 'avi-089',
    titulo: 'Información importante',
    detalle: 'La línea 5 circula con normalidad.',
    lineaIds: ['lin-05'],
    desde: '2026-08-30T00:00:00-03:00',
    hasta: '2026-08-30T00:00:00-03:00',
    gravedad: 'informativo',
    trazadoAlternativo: null,
    videoUrl: null,
  },
];
