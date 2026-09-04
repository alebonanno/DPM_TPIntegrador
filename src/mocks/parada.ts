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
  {
    id: 'par-105',
    nombre: 'Alameda y Corrientes',
    coordenadas: {
      latitud: -31.7310,
      longitud: -60.5275,
    },
    lineaIds: ['lin-05'],
    sentido: 'vuelta',
    refugio: false,
    codigoQr: 'PARANA:par-105',
  },

  {
    id: 'par-106',
    nombre: 'Alameda y Entre Ríos',
    coordenadas: {
      latitud: -31.7325,
      longitud: -60.5250,
    },
    lineaIds: ['lin-05'],
    sentido: 'vuelta',
    refugio: true,
    codigoQr: 'PARANA:par-106',
  },
  {
    id: 'par-201',
    nombre: 'Terminal y Gualeguaychú',
    coordenadas: {
      latitud: -31.7410,
      longitud: -60.5170,
    },
    lineaIds: ['lin-21'],
    sentido: 'ida',
    refugio: true,
    codigoQr: 'PARANA:par-201',
  },

  {
    id: 'par-202',
    nombre: 'Gualeguaychú y Paraná',
    coordenadas: {
      latitud: -31.7395,
      longitud: -60.5190,
    },
    lineaIds: ['lin-21'],
    sentido: 'ida',
    refugio: false,
    codigoQr: 'PARANA:par-202',
  },

  {
    id: 'par-203',
    nombre: 'Paraná y Nogoyá',
    coordenadas: {
      latitud: -31.7375,
      longitud: -60.5215,
    },
    lineaIds: ['lin-21'],
    sentido: 'ida',
    refugio: true,
    codigoQr: 'PARANA:par-203',
  },

  {
    id: 'par-204',
    nombre: 'Nogoyá y Almafuerte',
    coordenadas: {
      latitud: -31.7355,
      longitud: -60.5240,
    },
    lineaIds: ['lin-21'],
    sentido: 'ida',
    refugio: true,
    codigoQr: null,
  },

  {
    id: 'par-205',
    nombre: 'Almafuerte y Racedo',
    coordenadas: {
      latitud: -31.7345,
      longitud: -60.5250,
    },
    lineaIds: ['lin-21'],
    sentido: 'vuelta',
    refugio: false,
    codigoQr: 'PARANA:par-205',
  },

  {
    id: 'par-206',
    nombre: 'Racedo y Belgrano',
    coordenadas: {
      latitud: -31.7360,
      longitud: -60.5225,
    },
    lineaIds: ['lin-21'],
    sentido: 'vuelta',
    refugio: true,
    codigoQr: 'PARANA:par-206',
  },

  {
    id: 'par-207',
    nombre: 'Belgrano y Echagüe',
    coordenadas: {
      latitud: -31.7385,
      longitud: -60.5200,
    },
    lineaIds: ['lin-21'],
    sentido: 'vuelta',
    refugio: false,
    codigoQr: null,
  },

  {
    id: 'par-208',
    nombre: 'Echagüe y Terminal',
    coordenadas: {
      latitud: -31.7410,
      longitud: -60.5170,
    },
    lineaIds: ['lin-21'],
    sentido: 'vuelta',
    refugio: true,
    codigoQr: 'PARANA:par-208',
  },
];
