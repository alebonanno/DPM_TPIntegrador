import { paradasMock } from '@/src/mocks/parada';
import { Parada } from '@/src/tipos/parada';
import { useLocalSearchParams, Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { obtenerLineaPorId } from '@/src/servicios/linea';
import { Linea } from '@/src/tipos/linea';

export default function LineaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [paradaSeleccionada, setParadaSeleccionada] = useState<Parada | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [horarioSeleccionadoParaAlarma, setHorarioSeleccionadoParaAlarma] = useState<{ parada: string; horario: string } | null>(null);

  const [linea, setLinea] = useState<Linea | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!id) return;

    obtenerLineaPorId(id).then(setLinea);
  }, [id]);

  const paradasDeLinea = paradasMock.filter((parada) =>
    parada.lineaIds.includes(id || '')
  );

  const recorridoIda = linea?.recorridos.find(
    (recorrido) => recorrido.sentido === 'ida'
  );

  const recorridoVuelta = linea?.recorridos.find(
    (recorrido) => recorrido.sentido === 'vuelta'
  );

  if (!id) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Identificador de línea no proporcionado.</Text>
      </View>
    );
  }

  const regionInicial = paradasDeLinea.length > 0 ? {
    latitude: paradasDeLinea[0].coordenadas.latitud,
    longitude: paradasDeLinea[0].coordenadas.longitud,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  } : {
    latitude: -31.7333,
    longitude: -60.5241,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const enfocarParadaEnMapa = (parada: Parada) => {
    setModalVisible(false);
    setParadaSeleccionada(parada);

    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: parada.coordenadas.latitud,
        longitude: parada.coordenadas.longitud,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  };

  // Simulación interactiva de programación de recordatorio compatible al 100% con Expo Go
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
    <>
      <Stack.Screen
        options={{
          title: '',
        }}
      />
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={regionInicial}
        >
          {recorridoIda && (
            <Polyline
              coordinates={recorridoIda.trazado.map((punto) => ({
                latitude: punto.latitud,
                longitude: punto.longitud,
              }))}
              strokeColor={linea?.color || '#1B6CA8'}
              strokeWidth={5}
            />
          )}

          {recorridoVuelta && (
            <Polyline
              coordinates={recorridoVuelta.trazado.map((punto) => ({
                latitude: punto.latitud,
                longitude: punto.longitud,
              }))}
              strokeColor="#555555"
              strokeWidth={5}
            />
          )}

          {paradasDeLinea.map((parada) => (
            <Marker
              key={parada.id}
              coordinate={{
                latitude: parada.coordenadas.latitud,
                longitude: parada.coordenadas.longitud,
              }}
              title={parada.nombre}
              description={`Sentido: ${parada.sentido.toUpperCase()}`}
              onPress={() => setParadaSeleccionada(parada)}
            />
          ))}
        </MapView>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.botonListado} onPress={() => setModalVisible(true)}>
            <Text style={styles.botonListadoTexto}>Ver Listado de Paradas ({paradasDeLinea.length})</Text>
          </TouchableOpacity>
        </View>

        {/* Ficha flotante de la parada seleccionada */}
        {paradaSeleccionada && (
          <View style={styles.fichaFlotante}>
            <View style={styles.fichaHeader}>
              <Text style={styles.fichaTitulo}>{paradaSeleccionada.nombre}</Text>
              <TouchableOpacity onPress={() => setParadaSeleccionada(null)}>
                <Text style={styles.cerrarFicha}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.detalleText}>Sentido: <Text style={styles.bold}>{paradaSeleccionada.sentido.toUpperCase()}</Text></Text>
            <Text style={styles.detalleText}>Refugio: {paradaSeleccionada.refugio ? 'Sí' : 'No'}</Text>

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

        {/* Modal con listado completo */}
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Paradas de la Línea {id}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.cerrarModal}>Cerrar</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={paradasDeLinea}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.cardModal}
                    onPress={() => enfocarParadaEnMapa(item)}
                  >
                    <Text style={styles.cardModalNombre}>{item.nombre}</Text>
                    <Text style={styles.cardModalSub}>Sentido: {item.sentido} | Refugio: {item.refugio ? 'Sí' : 'No'}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#d9534f', textAlign: 'center' },
  bottomBar: { position: 'absolute', bottom: 30, left: 20, right: 20, alignItems: 'center' },
  botonListado: { backgroundColor: '#0275d8', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, elevation: 5 },
  botonListadoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  fichaFlotante: { position: 'absolute', bottom: 90, left: 20, right: 20, backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 6 },
  fichaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  fichaTitulo: { fontSize: 16, fontWeight: 'bold', color: '#222', flex: 1 },
  cerrarFicha: { fontSize: 18, color: '#888', paddingHorizontal: 6 },
  detalleText: { fontSize: 14, color: '#555', marginBottom: 4 },
  bold: { fontWeight: '600' },
  horariosContainer: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
  horariosTitulo: { fontSize: 12, color: '#777', marginBottom: 6 },
  horariosList: { gap: 6 },
  horarioChip: { backgroundColor: '#e2e8f0', color: '#1e293b', fontSize: 13, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, overflow: 'hidden', fontWeight: '500' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  selectorContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  selectorSub: { fontSize: 14, color: '#475569', marginBottom: 16 },
  opcionesMinutosContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', marginBottom: 20 },
  minutoBoton: { backgroundColor: '#f1f5f9', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', width: '48%', alignItems: 'center' },
  minutoBotonTexto: { fontSize: 15, fontWeight: '600', color: '#334155' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cerrarModal: { fontSize: 18, color: '#64748b', fontWeight: 'bold', paddingHorizontal: 6 },
  cardModal: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  cardModalNombre: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  cardModalSub: { fontSize: 12, color: '#64748b' },
});