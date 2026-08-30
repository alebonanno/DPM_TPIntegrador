import type { Horario } from '../tipos/horario';

export const horariosMock: Horario[] = [
  {
    id: 'hor-4410',
    lineaId: 'lin-05',
    paradaId: 'par-101',
    sentido: 'ida',
    tipoDeDia: 'habil',
    hora: '10:42',
  },
  {
    id: 'hor-4411',
    lineaId: 'lin-05',
    paradaId: 'par-101',
    sentido: 'ida',
    tipoDeDia: 'habil',
    hora: '11:02',
  },
  {
    id: 'hor-4412',
    lineaId: 'lin-05',
    paradaId: 'par-101',
    sentido: 'ida',
    tipoDeDia: 'habil',
    hora: '11:22',
  },
  {
    id: 'hor-4420',
    lineaId: 'lin-14',
    paradaId: 'par-101',
    sentido: 'ida',
    tipoDeDia: 'habil',
    hora: '10:51',
  },
  {
    id: 'hor-4421',
    lineaId: 'lin-14',
    paradaId: 'par-101',
    sentido: 'ida',
    tipoDeDia: 'habil',
    hora: '11:21',
  },
  {
    id: 'hor-4422',
    lineaId: 'lin-14',
    paradaId: 'par-101',
    sentido: 'ida',
    tipoDeDia: 'habil',
    hora: '11:51',
  },

  {
    id: 'hor-4500',
    lineaId: 'lin-05',
    paradaId: 'par-102',
    sentido: 'ida',
    tipoDeDia: 'habil',
    hora: '10:48',
  },
  {
    id: 'hor-4501',
    lineaId: 'lin-05',
    paradaId: 'par-102',
    sentido: 'ida',
    tipoDeDia: 'habil',
    hora: '11:08',
  },

  // Sábados
  {
    id: 'hor-4600',
    lineaId: 'lin-05',
    paradaId: 'par-101',
    sentido: 'ida',
    tipoDeDia: 'sabado',
    hora: '08:30',
  },

  // Domingos
  {
    id: 'hor-4700',
    lineaId: 'lin-05',
    paradaId: 'par-101',
    sentido: 'ida',
    tipoDeDia: 'domingo',
    hora: '09:00',
  },

  // Feriados
  {
    id: 'hor-4800',
    lineaId: 'lin-05',
    paradaId: 'par-101',
    sentido: 'ida',
    tipoDeDia: 'feriado',
    hora: '09:30',
  },
];
