import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

import FlechaDireccion from '../../src/componentes/FlechaDireccion';
import { useFavoritos } from '../../src/contexto/FavoritosContexto';
import { obtenerParadas } from '../../src/servicios/parada';
import { abrirMapaNativo } from '../../src/servicios/ubicacion';
import { Coordenadas } from '../../src/tipos/linea';
import { Parada } from '../../src/tipos/parada';

import * as SecureStore from 'expo-secure-store';
import { useTema } from '../../src/contexto/TemaContexto';
import { colores } from '../../src/tema/colores';

export default function HomeScreen() {
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [paradaSeleccionada, setParadaSeleccionada] = useState<Parada | null>(null);
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);

  // Capturamos el parámetro si venimos desde el escáner QR
  const params = useLocalSearchParams<{ paradaId?: string }>();

  // Estado para controlar el acordeón del cronograma completo de horarios
  const [horariosExpandidos, setHorariosExpandidos] = useState(false);

  // Estado para manejar el selector de minutos de la alarma de recordatorio
  const [horarioSeleccionadoParaAlarma, setHorarioSeleccionadoParaAlarma] = useState<{ parada: string; horario: string } | null>(null);

  const { temaReal } = useTema();
  const coloresActuales = colores[temaReal];
  const { paradasFavoritas, toggleParadaFavorita } = useFavoritos();

  // Validación de inicio de sesión antes de agregar a favoritos
  const manejarFavorito = async () => {
    if (!paradaSeleccionada) return;

    try {
      const token = await SecureStore.getItemAsync('userToken');

      if (!token) {
        Alert.alert(
          '🔒 Inicio de sesión requerido',
          'Para agregar a favoritos esta parada debes iniciar sesión.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Iniciar sesión', 
              onPress: () => router.push('/login' as any) 
            }
          ]
        );
        return;
      }

      toggleParadaFavorita(paradaSeleccionada.id);
    } catch (error) {
      console.error('Error al verificar sesión para favoritos:', error);
    }
  };

  useEffect(() => {
    async function cargarParadas() {
      const datos = await obtenerParadas();
      setParadas(datos);

      if (params?.paradaId) {
        const paradaEncontrada = datos.find((p) => p.id === params.paradaId);
        if (paradaEncontrada) {
          setParadaSeleccionada(paradaEncontrada);
        }
      }
    }

    async function obtenerUbicacion() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUbicacion({
            latitud: loc.coords.latitude,
            longitud: loc.coords.longitude,
          });
        }
      } catch (error) {
        console.log('No se pudo obtener la ubicación actual, usando coordenadas por defecto.');
        setUbicacion({
          latitud: -31.7333,
          longitud: -60.5241,
        });
      }
    }

    cargarParadas();
    obtenerUbicacion();
  }, [params?.paradaId]);

  const paradasFiltradas = paradas.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const confirmarRecordatorio = (minutosAntes: number) => {
    if (!horarioSeleccionadoParaAlarma) return;
    const { parada: nombreParada, horario: horarioStr } = horarioSeleccionadoParaAlarma;

    setHorarioSeleccionadoParaAlarma(null);

    Alert.alert(
      '🔔 ¡Recordatorio Programado!',
      `Te avisaremos ${minutosAntes} minutos antes de que el colectivo pase por "${nombreParada}" a las ${horarioStr}.`
    );
  };

  // Coordenadas actuales para el mapa Web (Leaflet)
  const latCentro = paradaSeleccionada ? paradaSeleccionada.coordenadas.latitud : (ubicacion?.latitud || -31.7333);
  const lngCentro = paradaSeleccionada ? paradaSeleccionada.coordenadas.longitud : (ubicacion?.longitud || -60.5241);

  // HTML y JS para Leaflet en el WebView
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
        .custom-marker {
          background: transparent;
          text-align: center;
        }
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

        var paradas = ${JSON.stringify(paradasFiltradas)};
        var paradaSeleccionadaId = "${paradaSeleccionada ? paradaSeleccionada.id : ''}";
        var favoritos = ${JSON.stringify(paradasFavoritas)};

        paradas.forEach(function(p) {
          var esFav = favoritos.includes(p.id);
          var emoji = esFav ? '❤️' : '🚌';
          var bgColor = esFav ? '#FFD700' : '#E53935';

          var htmlIcon = '<div style="background-color:' + bgColor + '; width:32px; height:32px; border-radius:16px; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size:14px;">' + emoji + '</div>';

          var customIcon = L.divIcon({
            html: htmlIcon,
            className: 'custom-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
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
    <View style={[styles.container, { backgroundColor: coloresActuales.fondo }]}>
      {/* Contenedor Fila: Buscador + Botón QR */}
      <View style={styles.busquedaFilaContainer}>
        <TextInput
          style={styles.buscadorInputEnFila}
          placeholder="Buscar parada por nombre o calle..."
          placeholderTextColor="#888"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        <TouchableOpacity
          style={[styles.botonQr, { backgroundColor: coloresActuales.tarjeta, borderColor: '#ddd' }]}
          onPress={() => router.push('/escaner' as any)}
        >
          <Image
            source={require('../../assets/iconos/qr.png')}
            style={styles.imagenQrCustom}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Mapa interactivo con WebView y Leaflet (100% Gratis, Sin Tarjeta ni Google Maps) */}
      <WebView
        style={styles.mapa}
        originWhitelist={['*']}
        source={{ html: mapHTML }}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            const paradaEncontrada = paradas.find((p) => p.id === data.id);
            if (paradaEncontrada) {
              setParadaSeleccionada(paradaEncontrada);
              setHorariosExpandidos(false);
            }
          } catch (e) {
            console.error(e);
          }
        }}
      />

      {/* Tarjeta flotante con la información de la parada */}
      {paradaSeleccionada && (
        <View style={styles.cardDetalle}>
          <TouchableOpacity
            style={styles.botonCerrarCard}
            onPress={() => setParadaSeleccionada(null)}
          >
            <Text style={styles.textoBotonCerrar}>✕</Text>
          </TouchableOpacity>

          <View style={styles.headerCard}>
            <View style={{ flex: 1, paddingRight: 35 }}>
              <Text style={styles.nombreParada}>{paradaSeleccionada.nombre}</Text>
              <Text style={styles.lineasParada}>
                Líneas que pasan: {paradaSeleccionada.lineaIds.join(', ')}
              </Text>
            </View>

            <View style={styles.accionesHeader}>
              <TouchableOpacity
                style={styles.botonCorazon}
                onPress={manejarFavorito}
              >
                <Text style={{ fontSize: 24 }}>
                  {paradasFavoritas.includes(paradaSeleccionada.id) ? '❤️' : '🤍'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* PRÓXIMOS 3 HORARIOS */}
          <View style={styles.horariosContainer}>
            <Text style={styles.horariosTitulo}>Próximos horarios (toque para recordar 🔔):</Text>
            {paradaSeleccionada.horariosProximos && paradaSeleccionada.horariosProximos.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horariosList}>
                {paradaSeleccionada.horariosProximos.slice(0, 3).map((horario, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setHorarioSeleccionadoParaAlarma({ parada: paradaSeleccionada.nombre, horario })}
                  >
                    <Text style={styles.horarioChip}>{horario} ⏰</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.textoAvisoFin}>No hay más servicios próximos.</Text>
            )}
          </View>

          {/* RENGLÓN COMPARTIDO: Brújula y Botón HORARIOS */}
          <View style={styles.filaDireccionYHorarios}>
            <View style={{ flex: 1 }}>
              <FlechaDireccion
                ubicacionUsuario={ubicacion}
                coordenadasParada={paradaSeleccionada.coordenadas}
              />
            </View>

            <TouchableOpacity
              style={styles.botonHorariosAcordeon}
              onPress={() => setHorariosExpandidos(!horariosExpandidos)}
            >
              <Text style={styles.textoBotonHorariosAcordeon}>
                HORARIOS {horariosExpandidos ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ACORDEÓN: CRONOGRAMA COMPLETO */}
          {horariosExpandidos && (
            <ScrollView style={styles.seccionHorariosExpandida} showsVerticalScrollIndicator={false}>
              <Text style={styles.tituloSeccionDia}>📅 Días Hábiles</Text>
              <View style={styles.chipGrilla}>
                {((paradaSeleccionada as any).horariosHabiles || paradaSeleccionada.horariosProximos || []).map((h: string, i: number) => (
                  <TouchableOpacity key={i} onPress={() => setHorarioSeleccionadoParaAlarma({ parada: paradaSeleccionada.nombre, horario: h })}>
                    <Text style={styles.horarioChipSecundario}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.tituloSeccionDia}>🗓️ Sábados</Text>
              <View style={styles.chipGrilla}>
                {((paradaSeleccionada as any).horariosSabados || ['06:30', '08:00', '10:00', '12:30', '15:00', '18:00']).map((h: string, i: number) => (
                  <TouchableOpacity key={i} onPress={() => setHorarioSeleccionadoParaAlarma({ parada: paradaSeleccionada.nombre, horario: h })}>
                    <Text style={styles.horarioChipSecundario}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.tituloSeccionDia}>Domingos y Feriados</Text>
              <View style={styles.chipGrilla}>
                {((paradaSeleccionada as any).horariosDomingosFeriados || ['08:00', '11:00', '14:00', '17:00', '20:00']).map((h: string, i: number) => (
                  <TouchableOpacity key={i} onPress={() => setHorarioSeleccionadoParaAlarma({ parada: paradaSeleccionada.nombre, horario: h })}>
                    <Text style={styles.horarioChipSecundario}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Botón Cómo llegar caminando */}
          <TouchableOpacity
            style={styles.botonCaminar}
            onPress={() => abrirMapaNativo(paradaSeleccionada.coordenadas, paradaSeleccionada.nombre)}
          >
            <Text style={styles.textoBoton}>📍 Cómo llegar caminando</Text>
          </TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    maxHeight: '75%',
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
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  selectorContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  selectorSub: { fontSize: 14, color: '#475569', marginBottom: 16 },
  opcionesMinutosContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', marginBottom: 20 },
  minutoBoton: { backgroundColor: '#f1f5f9', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', width: '48%', alignItems: 'center' },
  minutoBotonTexto: { fontSize: 15, fontWeight: '600', color: '#334155' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cerrarModal: { fontSize: 18, color: '#64748b', fontWeight: 'bold', paddingHorizontal: 6 },
  bold: { fontWeight: '600' },
  filaDireccionYHorarios: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  botonHorariosAcordeon: {
    backgroundColor: '#1B6CA8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoBotonHorariosAcordeon: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  seccionHorariosExpandida: {
    maxHeight: 180,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  tituloSeccionDia: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1B6CA8',
    marginTop: 6,
    marginBottom: 4,
  },
  chipGrilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  horarioChipSecundario: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  textoAvisoFin: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '500',
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingRight: 25,
  },
  accionesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botonCorazon: {
    padding: 4,
    marginLeft: 8,
  },
  botonCerrarCard: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 10,
    padding: 8,
  },
  textoBotonCerrar: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
  },
  busquedaFilaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 50,
    zIndex: 10,
    gap: 8,
  },
  buscadorInputEnFila: {
    flex: 1,
    height: 48,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  botonQr: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imagenQrCustom: {
    width: 24,
    height: 24,
  }
});