import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import FlechaDireccion from '@/src/componentes/FlechaDireccion';
import { abrirMapaNativo } from '@/src/servicios/ubicacion';
import { Coordenadas } from '@/src/tipos/linea';
import { Parada } from '@/src/tipos/parada';
import { obtenerParadas } from '../../src/servicios/parada';


import { useTema } from '@/src/contexto/TemaContexto';
import { colores } from '@/src/tema/colores';

export default function HomeScreen() {
  // Lógica para las paradas
  const [paradas, setParadas] = useState<Parada[]>([]);

  // Nuevos estados para mapa, búsqueda y selección
  const [busqueda, setBusqueda] = useState('');
  const [paradaSeleccionada, setParadaSeleccionada] = useState<Parada | null>(null);
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);
  const { temaReal } = useTema();
  const coloresActuales = colores[temaReal];

  useEffect(() => {
    async function cargarParadas() {
      const datos = await obtenerParadas();
      setParadas(datos);
    }

    async function obtenerUbicacion() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUbicacion({
          latitud: loc.coords.latitude,
          longitud: loc.coords.longitude,
        });
      }
    }

    cargarParadas();
    obtenerUbicacion();
  }, []);

  // Filtrado de la lista por nombre o calle
  const paradasFiltradas = paradas.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <View style={[
      styles.container,
      { backgroundColor: coloresActuales.fondo },
    ]}>
      {/* Buscador de paradas */}
      <TextInput
        style={styles.buscador}
        placeholder="Buscar parada por nombre o calle..."
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {/* Mapa interactivo de Paraná con marcadores */}
      <MapView
        style={styles.mapa}
        initialRegion={{
          latitude: ubicacion?.latitud || -31.7333,
          longitude: ubicacion?.longitud || -60.5241,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
        showsUserLocation={true}
      >
        {paradasFiltradas.map((parada) => (
          <Marker
            key={parada.id}
            coordinate={{
              latitude: parada.coordenadas.latitud,
              longitude: parada.coordenadas.longitud,
            }}
            title={parada.nombre}
            description={`Líneas: ${parada.lineaIds.join(', ')}`}
            onPress={() => setParadaSeleccionada(parada)}
          />
        ))}
      </MapView>

      {/* Tarjeta flotante con la información de la parada */}
      {paradaSeleccionada && (
        <View style={styles.cardDetalle}>
          <Text style={styles.nombreParada}>{paradaSeleccionada.nombre}</Text>
          <Text style={styles.lineasParada}>
            Líneas que pasan: {paradaSeleccionada.lineaIds.join(', ')}
          </Text>

          {/* Brújula y distancia */}
          <FlechaDireccion
            ubicacionUsuario={ubicacion}
            coordenadasParada={paradaSeleccionada.coordenadas}
          />

          {/* Botón integrado dentro de la tarjeta */}
          <TouchableOpacity
            style={styles.botonCaminar}
            onPress={() => abrirMapaNativo(paradaSeleccionada.coordenadas, paradaSeleccionada.nombre)}
          >
            <Text style={styles.textoBoton}>📍 Cómo llegar caminando</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, },
  buscador: {
    height: 48,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    margin: 12,
    marginTop: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  mapa: { flex: 1 },
  cardDetalle: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    // Sombra para destacar la tarjeta sobre el mapa
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  nombreParada: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B6CA8',
  },
  lineasParada: {
    fontSize: 14,
    color: '#555555',
    marginTop: 4,
  },
  botonCaminar: {
    backgroundColor: '#1B6CA8',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  textoBoton: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});