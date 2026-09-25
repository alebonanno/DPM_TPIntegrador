export interface Parada {
  id: string;
  nombre: string;
  coordenadas: Coordenadas;
  lineaIds: string[];
  horariosProximos?: string[];
  horariosHabiles?: string[];          // <--- Agrégalo aquí
  horariosSabados?: string[];          // <--- Agrégalo aquí
  horariosDomingosFeriados?: string[]; // <--- Agrégalo aquí
}