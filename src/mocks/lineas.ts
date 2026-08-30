import type { Linea } from '../tipos/linea';

export const lineasMock: Linea[] = [
  {
    id: 'lin-05',
    numero: '5',
    nombre: 'Puerto Viejo — San Agustín',
    color: '#1B6CA8',
    empresa: 'Transporte Mariano Moreno',
    recorridos: [
      {
        sentido: 'ida',
        destino: 'hacia Puerto Viejo',
        trazado: [
          { latitud: -31.7333, longitud: -60.5241 },
          { latitud: -31.732, longitud: -60.526 },
          { latitud: -31.730, longitud: -60.529 },
        ],
        paradaIds: ['par-101', 'par-102', 'par-103'],
      },
      {
        sentido: 'vuelta',
        destino: 'hacia San Agustín',
        trazado: [
          { latitud: -31.730, longitud: -60.529 },
          { latitud: -31.732, longitud: -60.526 },
          { latitud: -31.7333, longitud: -60.5241 },
        ],
        paradaIds: ['par-103', 'par-102', 'par-101'],
      },
    ],
    activa: true,
  },
  {
    id: 'lin-14',
    numero: '14',
    nombre: 'Bajada Grande — Centro',
    color: '#E67E22',
    empresa: 'Transporte Mariano Moreno',
    recorridos: [
      {
        sentido: 'ida',
        destino: 'hacia Bajada Grande',
        trazado: [
          { latitud: -31.7333, longitud: -60.5241 },
          { latitud: -31.735, longitud: -60.522 },
        ],
        paradaIds: ['par-101', 'par-104'],
      },
      {
        sentido: 'vuelta',
        destino: 'hacia Centro',
        trazado: [
          { latitud: -31.735, longitud: -60.522 },
          { latitud: -31.7333, longitud: -60.5241 },
        ],
        paradaIds: ['par-104', 'par-101'],
      },
    ],
    activa: true,
  },
];
