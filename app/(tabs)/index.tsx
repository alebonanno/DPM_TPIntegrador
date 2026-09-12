import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import FlechaDireccion from '../../src/componentes/FlechaDireccion';
import { useFavoritos } from '../../src/contexto/FavoritosContexto';
import { obtenerParadas } from '../../src/servicios/parada';
import { abrirMapaNativo } from '../../src/servicios/ubicacion';
import { Coordenadas } from '../../src/tipos/linea';
import { Parada } from '../../src/tipos/parada';

import { useTema } from '../../src/contexto/TemaContexto';
import { colores } from '../../src/tema/colores';

export default function HomeScreen() {
  // Lógica para las paradas
  const [paradas, setParadas] = useState<Parada[]>([]);

  // Nuevos estados para mapa, búsqueda y selección
  const [busqueda, setBusqueda] = useState('');
  const [paradaSeleccionada, setParadaSeleccionada] = useState<Parada | null>(null);
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);
  
  // Estado para manejar el selector de minutos de la alarma de recordatorio
  const [horarioSeleccionadoParaAlarma, setHorarioSeleccionadoParaAlarma] = useState<{ parada: string; horario: string } | null>(null);

  const { temaReal } = useTema();
  const coloresActuales = colores[temaReal];
  const { paradasFavoritas, toggleParadaFavorita } = useFavoritos();

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

  // Función para confirmar el recordatorio con alerta simulada (Compatible con Expo Go)
  const confirmarRecordatorio = (minutosAntes: number) => {
    if (!horarioSeleccionadoParaAlarma) return;
    const { parada: nombreParada, horario: horarioStr } = horarioSeleccionadoParaAlarma;

    setHorarioSeleccionadoParaAlarma(null);
    
    Alert.alert(
      '🔔 ¡Recordatorio Programado!', 
      `Te avisaremos ${minutosAntes} minutos antes de que el colectivo pase por "${nombreParada}" a las ${horarioStr}.`
    );
  };

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
        {paradasFiltradas.map((parada) => {
          const esFavorita = paradasFavoritas.includes(parada.id) || false;

          return (
            <Marker
              key={parada.id}
              coordinate={{
                latitude: parada.coordenadas.latitud,
                longitude: parada.coordenadas.longitud,
              }}
              title={parada.nombre}
              description={`Líneas: ${parada.lineaIds.join(', ')}`}
              onPress={() => setParadaSeleccionada(parada)}
            >
              {/* ACÁ CREAMOS EL MARCADOR PERSONALIZADO */}
              <View style={styles.marcadorCustom}>
                <View style={[
                  styles.circuloMarcador,
                  { backgroundColor: esFavorita ? '#FFD700' : '#E53935' } // Dorado si es favorito, rojo si no
                ]}>
                  <Text style={{ fontSize: 14 }}>
                    {esFavorita ? '❤️' : '🚌'}
                  </Text>
                </View>
                {/* El triangulito de abajo para que parezca un pin */}
                <View style={[
                  styles.trianguloMarcador,
                  { borderTopColor: esFavorita ? '#FFD700' : '#E53935' }
                ]} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Tarjeta flotante con la información de la parada */}
      {paradaSeleccionada && (
        <View style={styles.cardDetalle}>
          <View style={styles.headerCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nombreParada}>{paradaSeleccionada.nombre}</Text>
              <Text style={styles.lineasParada}>
                Líneas que pasan: {paradaSeleccionada.lineaIds.join(', ')}
              </Text>
            </View>

            {/* BOTÓN DE FAVORITO */}
            <TouchableOpacity 
              style={styles.botonCorazon} 
              onPress={() => toggleParadaFavorita(paradaSeleccionada.id)}
            >
              <Text style={{ fontSize: 24 }}>
                {paradasFavoritas.includes(paradaSeleccionada.id) ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* HORARIOS PRÓXIMOS PARA RECORDATORIOS */}
          {paradaSeleccionada.horariosProximos && paradaSeleccionada.horariosProximos.length > 0 && (
            <View style={styles.horariosContainer}>
              <Text style={styles.horariosTitulo}>Toque un horario para programar recordatorio 🔔:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horariosList}>
                {paradaSeleccionada.horariosProximos.map((horario, index) => (
                  <TouchableOpacity 
                    key={index} 
                    onPress={() => setHorarioSeleccionadoParaAlarma({ parada: paradaSeleccionada.nombre, horario })}
                  >
                    <Text style={styles.horarioChip}>{horario} ⏰</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

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

      {/* Modal para elegir con cuántos minutos de anticipación avisar */}
      <Modal visible={!!horarioSeleccionadoParaAlarma} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.selectorContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>¿Cuánto antes te avisamos?</Text>
              <TouchableOpacity onPress={() => setHorarioSeleccionadoParaAlarma(null)}>
                <Text style={styles.cerrarModal}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.selectorSub}>
              Horario seleccionado: <Text style={styles.bold}>{horarioSeleccionadoParaAlarma?.horario}</Text>
            </Text>

            <View style={styles.opcionesMinutosContainer}>
              {[3, 5, 10, 15].map((min) => (
                <TouchableOpacity 
                  key={min} 
                  style={styles.minutoBoton}
                  onPress={() => confirmarRecordatorio(min)}
                >
                  <Text style={styles.minutoBotonTexto}>{min} min antes</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  horariosContainer: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
  horariosTitulo: { fontSize: 12, color: '#777', marginBottom: 6 },
  horariosList: { gap: 6 },
  horarioChip: { backgroundColor: '#e2e8f0', color: '#1e293b', fontSize: 13, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, overflow: 'hidden', fontWeight: '500' },
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
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  botonCorazon: {
    padding: 8,
  },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  selectorContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  selectorSub: { fontSize: 14, color: '#475569', marginBottom: 16 },
  opcionesMinutosContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', marginBottom: 20 },
  minutoBoton: { backgroundColor: '#f1f5f9', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', width: '48%', alignItems: 'center' },
  minutoBotonTexto: { fontSize: 15, fontWeight: '600', color: '#334155' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cerrarModal: { fontSize: 18, color: '#64748b', fontWeight: 'bold', paddingHorizontal: 6 },
  bold: { fontWeight: '600' }
});