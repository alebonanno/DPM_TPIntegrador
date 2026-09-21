import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Coordenadas } from '../tipos/linea';
import { Parada } from '../tipos/parada';

interface Props {
  initialRegion?: Region;
  ubicacionUsuario?: Coordenadas | null;
  showsUserLocation?: boolean;
  paradas: Parada[];
  paradasFavoritas?: string[];
  onPressMarker: (parada: Parada) => void;
  style?: any;
}

const MapaPersonalizado = forwardRef<MapView, Props>(({
  initialRegion,
  ubicacionUsuario,
  showsUserLocation = false,
  paradas,
  paradasFavoritas = [],
  onPressMarker,
  style
}, ref) => {
  const regionPorDefecto = initialRegion || {
    latitude: ubicacionUsuario?.latitud || -31.7333,
    longitude: ubicacionUsuario?.longitud || -60.5241,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  };

  return (
    <MapView
      ref={ref}
      style={[styles.mapa, style]}
      initialRegion={regionPorDefecto}
      showsUserLocation={showsUserLocation}
    >
      {paradas.map((parada) => {
        const esFavorita = paradasFavoritas.includes(parada.id);

        return (
          <Marker
            key={parada.id}
            coordinate={{
              latitude: parada.coordenadas.latitud,
              longitude: parada.coordenadas.longitud,
            }}
            title={parada.nombre}
            description={`Sentido: ${parada.sentido.toUpperCase()}`}
            onPress={() => onPressMarker(parada)}
          >
            {/* Marcador personalizado reutilizado */}
            <View style={styles.marcadorCustom}>
              <View style={[
                styles.circuloMarcador,
                { backgroundColor: esFavorita ? '#FFD700' : '#E53935' }
              ]}>
                <Text style={{ fontSize: 14 }}>
                  {esFavorita ? '❤️' : '🚌'}
                </Text>
              </View>
              <View style={[
                styles.trianguloMarcador,
                { borderTopColor: esFavorita ? '#FFD700' : '#E53935' }
              ]} />
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
});

export default MapaPersonalizado;

const styles = StyleSheet.create({
  mapa: { flex: 1 },
  marcadorCustom: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloMarcador: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  trianguloMarcador: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});