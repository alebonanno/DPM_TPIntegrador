import type { Coordenadas, Sentido } from './linea';

export interface Parada {
  horariosHabiles: string[] | undefined;
  horariosSabados: string[];
  horariosDomingosFeriados: string[];
  id: string;
  nombre: string;
  coordenadas: Coordenadas;
  lineaIds: string[];
  sentido: Sentido;
  refugio: boolean;
  codigoQr: string | null;
  horariosProximos?: string[]; // Formato "HH:MM"
}
