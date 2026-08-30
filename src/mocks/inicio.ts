import { avisosMock } from './aviso';
import { horariosMock } from './horario';
import { lineasMock } from './lineas';
import { paradasMock } from './parada';
import { reportesMock } from './reporte';
import { usuarioMock } from './usuario';

export const inicioMock = {
  usuario: usuarioMock,

  paradaCercana: paradasMock[0],

  lineas: lineasMock,

  horarios: horariosMock,

  avisos: avisosMock,

  reportes: reportesMock,
};
