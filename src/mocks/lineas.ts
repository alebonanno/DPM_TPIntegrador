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
          {
            latitud: -31.7333,
            longitud: -60.5241,
          },
          {
            latitud: -31.7320,
            longitud: -60.5260,
          },
          {
            latitud: -31.7300,
            longitud: -60.5290,
          },
          {
            latitud: -31.7285,
            longitud: -60.5315,
          },
        ],

        paradaIds: [
          'par-101',
          'par-102',
        ],
      },

      {
        sentido: 'vuelta',
        destino: 'hacia San Agustín',

        trazado: [
          {
            latitud: -31.7285,
            longitud: -60.5315,
          },
          {
            latitud: -31.7295,
            longitud: -60.5300,
          },
          {
            latitud: -31.7300,
            longitud: -60.5290,
          },
          {
            latitud: -31.7310,
            longitud: -60.5275,
          },
          {
            latitud: -31.7325,
            longitud: -60.5250,
          },
          {
            latitud: -31.7340,
            longitud: -60.5230,
          },
        ],

        paradaIds: [
          'par-103',
          'par-105',
          'par-106',
        ],
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
  {
    id: 'lin-21',
    numero: '21',
    nombre: 'Terminal — Parque Industrial',
    color: '#8E44AD',
    empresa: 'Transporte Paraná',

    recorridos: [
      {
        sentido: 'ida',
        destino: 'hacia Parque Industrial',

        trazado: [
          {
            latitud: -31.7410,
            longitud: -60.5170,
          },
          {
            latitud: -31.7395,
            longitud: -60.5190,
          },
          {
            latitud: -31.7375,
            longitud: -60.5215,
          },
          {
            latitud: -31.7355,
            longitud: -60.5240,
          },
          {
            latitud: -31.7335,
            longitud: -60.5270,
          },
        ],

        paradaIds: [
          'par-201',
          'par-202',
          'par-203',
          'par-204',
        ],
      },

      {
        sentido: 'vuelta',
        destino: 'hacia Terminal',

        trazado: [
          {
            latitud: -31.7335,
            longitud: -60.5270,
          },
          {
            latitud: -31.7345,
            longitud: -60.5250,
          },
          {
            latitud: -31.7360,
            longitud: -60.5225,
          },
          {
            latitud: -31.7385,
            longitud: -60.5200,
          },
          {
            latitud: -31.7410,
            longitud: -60.5170,
          },
        ],

        paradaIds: [
          'par-204',
          'par-205',
          'par-206',
          'par-207',
          'par-208',
        ],
      },
    ],

    activa: false,
  },

];
