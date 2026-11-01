import BotonVolver from '@/src/componentes/BotonVolver';
import { obtenerLineaPorId } from '@/src/servicios/linea';
import { obtenerParadasPorLinea } from '@/src/servicios/parada';
import { Parada } from '@/src/tipos/parada';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function LineaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log("ID que llegó por la URL desde el botón:", id, typeof id);
  const [paradaSeleccionada, setParadaSeleccionada] = useState<Parada | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [horarioSeleccionadoParaAlarma, setHorarioSeleccionadoParaAlarma] = useState<{ parada: string; horario: string } | null>(null);
  const [esFavorita, setEsFavorita] = useState(false);

  // Estados para datos reales de la API
  const [linea, setLinea] = useState<any | null>(null);
  const [paradasDeLinea, setParadasDeLinea] = useState<Parada[]>([]);

  useEffect(() => {
    if (!id) return;
    
    // Cargamos la línea y sus paradas desde la API de Docker
    obtenerLineaPorId(id).then(setLinea);
    obtenerParadasPorLinea(id).then(setParadasDeLinea);
    
    verificarFavorito();
  }, [id]);

  const verificarFavorito = async () => {
    try {
      const favoritosStorage = await AsyncStorage.getItem('lineas_favoritas');
      const favoritos: string[] = favoritosStorage ? JSON.parse(favoritosStorage) : [];
      setEsFavorita(favoritos.includes(id!));
    } catch (error) {
      console.log('Error al verificar favorito', error);
    }
  };

  const toggleFavorito = async () => {
    try {
      const favoritosStorage = await AsyncStorage.getItem('lineas_favoritas');
      let favoritos: string[] = favoritosStorage ? JSON.parse(favoritosStorage) : [];

      if (esFavorita) {
        favoritos = favoritos.filter((favId) => favId !== id);
      } else {
        favoritos.push(id!);
      }

      await AsyncStorage.setItem('lineas_favoritas', JSON.stringify(favoritos));
      setEsFavorita(!esFavorita);
    } catch (error) {
      console.log('Error al actualizar favorito', error);
    }
  };

  const recorridoVuelta = linea?.recorridos?.find(
    (recorrido: any) => recorrido.sentido === 'vuelta'
  );

  if (!id) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Identificador de línea no proporcionado.</Text>
      </View>
    );
  }

  const latCentro = paradasDeLinea.length > 0 ? paradasDeLinea[0].coordenadas.latitud : -31.7333;
  const lngCentro = paradasDeLinea.length > 0 ? paradasDeLinea[0].coordenadas.longitud : -60.5241;

  const enfocarParadaEnMapa = (parada: Parada) => {
    setModalVisible(false);
    setParadaSeleccionada(parada);
  };

  const confirmarRecordatorio = (minutosAntes: number) => {
    if (!horarioSeleccionadoParaAlarma) return;
    const { parada: nombreParada, horario: horarioStr } = horarioSeleccionadoParaAlarma;

    setHorarioSeleccionadoParaAlarma(null);

    Alert.alert(
      '🔔 ¡Recordatorio Programado!',
      `Te avisaremos ${minutosAntes} minutos antes de que el colectivo pase por "${nombreParada}" a las ${horarioStr}.`
    );
  };

  // HTML embebido con Leaflet para OpenStreetMap
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
        var map = L.map('map').setView([${latCentro}, ${lngCentro}], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);

        // Trazado de la línea (Polyline)
        var trazado = ${JSON.stringify(recorridoVuelta?.trazado || [])};
        if (trazado.length > 0) {
          var latLngs = trazado.map(function(p) { return [p.latitud, p.longitud]; });
          var polyline = L.polyline(latLngs, {color: '#555555', weight: 5}).addTo(map);
          map.fitBounds(polyline.getBounds());
        }

        // Marcadores de paradas
        var paradas = ${JSON.stringify(paradasDeLinea)};
        paradas.forEach(function(p) {
          if (!p.coordenadas) return;

          var htmlIcon = '<div style="background-color:#1B6CA8; width:28px; height:28px; border-radius:14px; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size:12px;">🚏</div>';

          var customIcon = L.divIcon({
            html: htmlIcon,
            className: 'custom-marker',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          var marker = L.marker([p.coordenadas.latitud, p.coordenadas.longitud], { icon: customIcon }).addTo(map);
          
          marker.on('click', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ id: p.id }));
          });
        });

        // Si hay una parada seleccionada, enfocarla
        var paradaSeleccionadaId = "${paradaSeleccionada ? paradaSeleccionada.id : ''}";
        if (paradaSeleccionadaId) {
          var seleccionada = paradas.find(function(p) { return p.id === paradaSeleccionadaId; });
          if (seleccionada) {
            map.setView([seleccionada.coordenadas.latitud, seleccionada.coordenadas.longitud], 16);
          }
        }
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- HEADER PERSONALIZADO --- */}
      <View style={styles.headerPersonalizado}>
        <BotonVolver color="#333" />
        <Text style={styles.tituloHeader}>Línea {id}</Text>
        <View style={{ width: 40 }} />
      </View>

      <WebView
        style={styles.map}
        originWhitelist={['*']}
        source={{ html: mapHTML }}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            const paradaEncontrada = paradasDeLinea.find((p) => p.id === data.id);
            if (paradaEncontrada) {
              setParadaSeleccionada(paradaEncontrada);
            }
          } catch (e) {
            console.error(e);
          }
        }}
      />

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

      {/* Modal para elegir minutos de anticipación */}
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
                  <Text style={styles.cardModalSub}>
                    Refugio: {item.refugio ? 'Sí' : 'No'}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerPersonalizado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tituloHeader: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#d9534f', textAlign: 'center' },
  bottomBar: { position: 'absolute', bottom: 30, left: 20, right: 20, alignItems: 'center', zIndex: 5 },
  botonListado: { backgroundColor: '#0275d8', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, elevation: 5 },
  botonListadoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  fichaFlotante: { position: 'absolute', bottom: 90, left: 20, right: 20, backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 6, zIndex: 10 },
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