import { Linking, Platform } from 'react-native';
import { Coordenadas } from '../tipos/linea';

// Abre la app de mapas por defecto en modo caminata
export function abrirMapaNativo(destino: Coordenadas, nombreParada: string) {
  const scheme = Platform.select({
    ios: `maps:0,0?q=${nombreParada}@${destino.latitud},${destino.longitud}`,
    android: `google.navigation:q=${destino.latitud},${destino.longitud}&mode=w`,
  });

  const url = Platform.select({
    ios: scheme,
    android: scheme,
    default: `https://www.google.com/maps/dir/?api=1&destination=${destino.latitud},${destino.longitud}&travelmode=walking`,
  });

  if (url) {
    Linking.openURL(url);
  }
}

// Calcula la distancia en metros entre dos puntos GPS (Fórmula Haversine)
export function calcularDistancia(origen: Coordenadas, destino: Coordenadas): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const rad = Math.PI / 180;
  const dLat = (destino.latitud - origen.latitud) * rad;
  const dLon = (destino.longitud - origen.longitud) * rad;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(origen.latitud * rad) *
      Math.cos(destino.latitud * rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Calcula el ángulo de orientación hacia la parada (Bearing)
export function calcularAngulo(origen: Coordenadas, destino: Coordenadas): number {
  const rad = Math.PI / 180;
  const dLon = (destino.longitud - origen.longitud) * rad;
  const lat1 = origen.latitud * rad;
  const lat2 = destino.latitud * rad;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}