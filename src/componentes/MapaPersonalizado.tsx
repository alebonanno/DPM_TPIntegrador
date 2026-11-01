import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Coordenadas } from '../tipos/linea';
import { Parada } from '../tipos/parada';

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface Props {
  initialRegion?: Region;
  ubicacionUsuario?: Coordenadas | null;
  showsUserLocation?: boolean;
  paradas: Parada[];
  paradasFavoritas?: string[];
  onPressMarker: (parada: Parada) => void;
  style?: any;
}

const MapaPersonalizado = forwardRef<any, Props>(({
  initialRegion,
  ubicacionUsuario,
  paradas,
  paradasFavoritas = [],
  onPressMarker,
  style
}, ref) => {
  // Exponemos un método simulado por si las pantallas llaman a animateToRegion
  useImperativeHandle(ref, () => ({
    animateToRegion: (region: Region) => {
      // El WebView manejará la nueva región si es necesario
    },
  }));

  const regionPorDefecto = initialRegion || {
    latitude: ubicacionUsuario?.latitud || -31.7333,
    longitude: ubicacionUsuario?.longitud || -60.5241,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  };

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; }
        #map { width: 100%; height: 100%; }
        .custom-marker { background: transparent; text-align: center; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${regionPorDefecto.latitude}, ${regionPorDefecto.longitude}], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);

        var paradas = ${JSON.stringify(paradas)};
        var favoritos = ${JSON.stringify(paradasFavoritas)};

        paradas.forEach(function(p) {
          if (!p.coordenadas) return;
          var esFav = favoritos.includes(p.id);
          var emoji = esFav ? '❤️' : '🚌';
          var bgColor = esFav ? '#FFD700' : '#E53935';

          // Recreamos exactamente tu diseño visual de marcador personalizado
          var htmlIcon = \`
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <div style="background-color: \${bgColor}; width: 32px; height: 32px; border-radius: 16px; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 14px;">
                \${emoji}
              </div>
              <div style="width: 0; height: 0; background-color: transparent; border-style: solid; border-left-width: 6px; border-right-width: 6px; border-top-width: 10px; border-left-color: transparent; border-right-color: transparent; border-top-color: \${bgColor}; margin-top: -2px;"></div>
            </div>
          \`;

          var customIcon = L.divIcon({
            html: htmlIcon,
            className: 'custom-marker',
            iconSize: [32, 44],
            iconAnchor: [16, 42]
          });

          var marker = L.marker([p.coordenadas.latitud, p.coordenadas.longitud], { icon: customIcon }).addTo(map);
          
          marker.on('click', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ id: p.id }));
          });
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.mapaContainer, style]}>
      <WebView
        style={styles.mapa}
        originWhitelist={['*']}
        source={{ html: mapHTML }}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            const paradaEncontrada = paradas.find((p) => p.id === data.id);
            if (paradaEncontrada) {
              onPressMarker(paradaEncontrada);
            }
          } catch (e) {
            console.error(e);
          }
        }}
      />
    </View>
  );
});

export default MapaPersonalizado;

const styles = StyleSheet.create({
  mapaContainer: { flex: 1, overflow: 'hidden' },
  mapa: { flex: 1 },
});