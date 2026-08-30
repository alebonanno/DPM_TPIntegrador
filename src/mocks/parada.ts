import type { Parada } from '@/src/tipos/parada';

export const paradasMock: Parada[] = [
  {
    id: 'par-101',
    nombre: 'Alameda y Urquiza',
    coordenadas: {
      latitud: -31.7333,
      longitud: -60.5241,
    },
    lineaIds: ['lin-05', 'lin-14'],
    sentido: 'ida',
    refugio: true,
    codigoQr: 'PARANA:par-101',
  },
  {
    id: 'par-102',
    nombre: 'Alameda y Santa Fe',
    coordenadas: {
      latitud: -31.732,
      longitud: -60.526,
    },
    lineaIds: ['lin-05'],
    sentido: 'ida',
    refugio: false,
    codigoQr: 'PARANA:par-102',
  },
  {
    id: 'par-103',
    nombre: 'Alameda y Buenos Aires',
    coordenadas: {
      latitud: -31.730,
      longitud: -60.529,
    },
    lineaIds: ['lin-05'],
    sentido: 'vuelta',
    refugio: true,
    codigoQr: null,
  },
  {
    id: 'par-104',
    nombre: 'Bajada Grande y Almafuerte',
    coordenadas: {
      latitud: -31.735,
      longitud: -60.522,
    },
    lineaIds: ['lin-14'],
    sentido: 'ida',
    refugio: true,
    codigoQr: 'PARANA:par-104',
  },
];
