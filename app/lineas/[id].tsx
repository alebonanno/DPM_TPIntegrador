// import { useEffect, useRef, useState } from 'react';
// import { useLocalSearchParams, Stack, router } from 'expo-router'

// import {
//     ActivityIndicator,
//     Pressable,
//     StyleSheet,
//     Text,
//     View,
// } from 'react-native';

// import MapView, {
//     Marker,
//     Polyline,
// } from 'react-native-maps';

// import {
//     Linea,
//     Coordenadas,
// } from '@/src/tipos/linea';

// import { Parada } from '@/src/tipos/parada';

// import { obtenerLineaPorId } from '@/src/servicios/linea';
// import { obtenerParadas } from '@/src/servicios/parada';

// export default function LineaMapaScreen() {
//     const { id } =
//         useLocalSearchParams<{ id: string }>();

//     const mapRef = useRef<MapView>(null);

//     const [linea, setLinea] =
//         useState<Linea | null>(null);

//     const [paradas, setParadas] =
//         useState<Parada[]>([]);

//     const [paradaSeleccionada, setParadaSeleccionada] =
//         useState<Parada | null>(null);

//     const [cargando, setCargando] =
//         useState(true);

//     useEffect(() => {
//         async function cargarDatos() {
//             if (!id) return;

//             try {
//                 const lineaEncontrada =
//                     await obtenerLineaPorId(id);

//                 const todasLasParadas =
//                     await obtenerParadas();

//                 setLinea(lineaEncontrada);

//                 if (lineaEncontrada) {
//                     const idsParadas = new Set(
//                         lineaEncontrada.recorridos.flatMap(
//                             (recorrido) =>
//                                 recorrido.paradaIds
//                         )
//                     );

//                     const paradasDeLaLinea =
//                         todasLasParadas.filter(
//                             (parada) =>
//                                 idsParadas.has(parada.id)
//                         );

//                     setParadas(paradasDeLaLinea);
//                 }
//             } finally {
//                 setCargando(false);
//             }
//         }

//         cargarDatos();
//     }, [id]);

//     if (cargando) {
//         return (
//             <View style={styles.cargando}>
//                 <ActivityIndicator size="large" />

//                 <Text>
//                     Cargando recorrido...
//                 </Text>
//             </View>
//         );
//     }

//     if (!linea) {
//         return (
//             <View style={styles.cargando}>
//                 <Text>
//                     No se encontró la línea.
//                 </Text>
//             </View>
//         );
//     }

//     const recorridoIda =
//         linea.recorridos.find(
//             (recorrido) =>
//                 recorrido.sentido === 'ida'
//         );

//     const recorridoVuelta =
//         linea.recorridos.find(
//             (recorrido) =>
//                 recorrido.sentido === 'vuelta'
//         );

//     if (!recorridoIda || !recorridoVuelta) {
//         return (
//             <View style={styles.cargando}>
//                 <Text>
//                     La línea no tiene ambos sentidos.
//                 </Text>
//             </View>
//         );
//     }

//     const coordenadasIda =
//         convertirCoordenadas(
//             recorridoIda.trazado
//         );

//     const coordenadasVuelta =
//         convertirCoordenadas(
//             recorridoVuelta.trazado
//         );

//     const todasLasCoordenadas = [
//         ...coordenadasIda,
//         ...coordenadasVuelta,
//     ];

//     const puntoInicial = coordenadasIda[0];

//     if (!puntoInicial) {
//         return (
//             <View style={styles.cargando}>
//                 <Text>
//                     No hay coordenadas para mostrar.
//                 </Text>
//             </View>
//         );
//     }

//     return (
//         <>
//             <Stack.Screen
//                 options={{
//                     headerShown: false,
//                 }}
//             />
//             <View style={styles.container}>

//                 {/* HEADER */}

//                 <View style={styles.header}>

//                     <Pressable
//                         style={styles.botonVolver}
//                         onPress={() => router.back()}
//                     >
//                         <Text style={styles.flecha}>
//                             ←
//                         </Text>
//                     </Pressable>

//                     <View
//                         style={[
//                             styles.colorLinea,
//                             {
//                                 backgroundColor:
//                                     linea.color,
//                             },
//                         ]}
//                     />

//                     <View style={styles.headerTexto}>

//                         <Text style={styles.numero}>
//                             Línea {linea.numero}
//                         </Text>

//                         <Text style={styles.nombre}>
//                             {linea.nombre}
//                         </Text>

//                         <Text style={styles.empresa}>
//                             {linea.empresa}
//                         </Text>

//                         <Text
//                             style={[
//                                 styles.estado,
//                                 {
//                                     color: linea.activa
//                                         ? '#2E7D32'
//                                         : '#C62828',
//                                 },
//                             ]}
//                         >
//                             {linea.activa
//                                 ? '🟢 Funcionando normalmente'
//                                 : '🔴 Fuera de servicio'}
//                         </Text>

//                     </View>

//                 </View>

//                 {/* MAPA */}

//                 <MapView
//                     ref={mapRef}
//                     style={styles.map}
//                     initialRegion={{
//                         latitude:
//                             puntoInicial.latitude,

//                         longitude:
//                             puntoInicial.longitude,

//                         latitudeDelta: 0.02,
//                         longitudeDelta: 0.02,
//                     }}
//                     onMapReady={() => {
//                         mapRef.current?.fitToCoordinates(
//                             todasLasCoordenadas,
//                             {
//                                 edgePadding: {
//                                     top: 70,
//                                     right: 50,
//                                     bottom: 70,
//                                     left: 50,
//                                 },
//                                 animated: false,
//                             }
//                         );
//                     }}
//                     onPress={() =>
//                         setParadaSeleccionada(null)
//                     }
//                 >

//                     {/* IDA */}

//                     <Polyline
//                         coordinates={
//                             coordenadasIda
//                         }
//                         strokeColor={
//                             linea.color
//                         }
//                         strokeWidth={6}
//                     />

//                     {/* VUELTA */}

//                     <Polyline
//                         coordinates={
//                             coordenadasVuelta
//                         }
//                         strokeColor="#555555"
//                         strokeWidth={5}
//                     />

//                     {/* PARADAS */}

//                     {paradas.map((parada) => {

//                         const estaEnIda =
//                             recorridoIda.paradaIds.includes(
//                                 parada.id
//                             );

//                         const estaEnVuelta =
//                             recorridoVuelta.paradaIds.includes(
//                                 parada.id
//                             );

//                         if (
//                             !estaEnIda &&
//                             !estaEnVuelta
//                         ) {
//                             return null;
//                         }

//                         const color =
//                             parada.sentido === 'ida'
//                                 ? linea.color
//                                 : '#555555';

//                         return (
//                             <Marker
//                                 key={parada.id}
//                                 coordinate={{
//                                     latitude:
//                                         parada.coordenadas
//                                             .latitud,

//                                     longitude:
//                                         parada.coordenadas
//                                             .longitud,
//                                 }}
//                                 onPress={(evento) => {
//                                     evento.stopPropagation();
//                                     setParadaSeleccionada(
//                                         parada
//                                     );
//                                 }}
//                             >
//                                 <View
//                                     style={[
//                                         styles.marker,
//                                         {
//                                             borderColor:
//                                                 color,
//                                         },
//                                     ]}
//                                 >
//                                     <Text>
//                                         🚏
//                                     </Text>
//                                 </View>
//                             </Marker>
//                         );
//                     })}

//                 </MapView>

//                 {/* TARJETA DE PARADA */}

//                 {paradaSeleccionada && (
//                     <View style={styles.tarjeta}>

//                         <View style={styles.tarjetaTitulo}>

//                             <Text style={styles.icono}>
//                                 🚏
//                             </Text>

//                             <View style={styles.tarjetaTexto}>

//                                 <Text style={styles.paradaNombre}>
//                                     {paradaSeleccionada.nombre}
//                                 </Text>

//                                 <Text style={styles.paradaSentido}>
//                                     {paradaSeleccionada.sentido === 'ida'
//                                         ? `➡️ Ida · ${recorridoIda.destino}`
//                                         : `⬅️ Vuelta · ${recorridoVuelta.destino}`}
//                                 </Text>

//                             </View>

//                             <Pressable
//                                 onPress={() =>
//                                     setParadaSeleccionada(null)
//                                 }
//                             >
//                                 <Text style={styles.cerrar}>
//                                     ✕
//                                 </Text>
//                             </Pressable>

//                         </View>

//                         <View style={styles.info}>

//                             <Text>
//                                 {paradaSeleccionada.refugio
//                                     ? '🛖 Tiene refugio'
//                                     : '🚏 Sin refugio'}
//                             </Text>

//                             {paradaSeleccionada.codigoQr && (
//                                 <>
//                                     <View style={styles.qrBox}>

//                                         <Text style={styles.qrIcon}>
//                                             ▣
//                                         </Text>

//                                         <View>
//                                             <Text style={styles.qrTitulo}>
//                                                 Código QR
//                                             </Text>

//                                             <Text style={styles.qrCodigo}>
//                                                 {paradaSeleccionada.codigoQr}
//                                             </Text>
//                                         </View>

//                                     </View>

//                                     <Pressable
//                                         style={styles.botonQr}
//                                         onPress={() => {
//                                             console.log(
//                                                 'Escanear QR de:',
//                                                 paradaSeleccionada.codigoQr
//                                             );
//                                         }}
//                                     >
//                                         <Text style={styles.botonQrTexto}>
//                                             📷 Escanear QR
//                                         </Text>
//                                     </Pressable>
//                                 </>
//                             )}

//                             {!paradaSeleccionada.codigoQr && (
//                                 <Text style={styles.sinQr}>
//                                     Esta parada no tiene código QR.
//                                 </Text>
//                             )}

//                         </View>

//                     </View>
//                 )}

//                 {/* LEYENDA */}

//                 {!paradaSeleccionada && (
//                     <View style={styles.leyenda}>

//                         <View
//                             style={
//                                 styles.leyendaItem
//                             }
//                         >
//                             <View
//                                 style={[
//                                     styles.lineaLeyenda,
//                                     {
//                                         backgroundColor:
//                                             linea.color,
//                                     },
//                                 ]}
//                             />

//                             <Text>
//                                 Ida →{' '}
//                                 {
//                                     recorridoIda.destino
//                                 }
//                             </Text>
//                         </View>

//                         <View
//                             style={
//                                 styles.leyendaItem
//                             }
//                         >
//                             <View
//                                 style={[
//                                     styles.lineaLeyenda,
//                                     {
//                                         backgroundColor:
//                                             '#555555',
//                                     },
//                                 ]}
//                             />

//                             <Text>
//                                 Vuelta →{' '}
//                                 {
//                                     recorridoVuelta.destino
//                                 }
//                             </Text>
//                         </View>

//                         <Text style={styles.instruccion}>
//                             Tocá una parada para ver
//                             información.
//                         </Text>

//                     </View>
//                 )}

//             </View >
//         </>
//     );
// }

// function convertirCoordenadas(
//     coordenadas: Coordenadas[]
// ) {
//     return coordenadas.map(
//         (coordenada) => ({
//             latitude:
//                 coordenada.latitud,

//             longitude:
//                 coordenada.longitud,
//         })
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#F5F7FA',
//     },

//     cargando: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         gap: 10,
//     },

//     header: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         padding: 16,
//         backgroundColor: '#FFFFFF',
//     },

//     colorLinea: {
//         width: 8,
//         height: 60,
//         borderRadius: 4,
//         marginRight: 12,
//     },

//     headerTexto: {
//         flex: 1,
//     },

//     numero: {
//         fontSize: 22,
//         fontWeight: '700',
//     },

//     nombre: {
//         fontSize: 15,
//         color: '#555',
//         marginTop: 3,
//     },

//     empresa: {
//         fontSize: 13,
//         color: '#888',
//         marginTop: 3,
//     },

//     map: {
//         flex: 1,
//     },

//     marker: {
//         width: 36,
//         height: 36,
//         borderRadius: 18,
//         backgroundColor: '#FFFFFF',
//         borderWidth: 3,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },

//     tarjeta: {
//         position: 'absolute',
//         left: 15,
//         right: 15,
//         bottom: 15,
//         backgroundColor: '#FFFFFF',
//         borderRadius: 16,
//         padding: 16,

//         shadowColor: '#000',
//         shadowOpacity: 0.15,
//         shadowRadius: 8,
//         shadowOffset: {
//             width: 0,
//             height: 3,
//         },

//         elevation: 5,
//     },

//     tarjetaTitulo: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },

//     icono: {
//         fontSize: 28,
//         marginRight: 10,
//     },

//     tarjetaTexto: {
//         flex: 1,
//     },

//     paradaNombre: {
//         fontSize: 18,
//         fontWeight: '700',
//     },

//     paradaSentido: {
//         fontSize: 14,
//         color: '#555',
//         marginTop: 3,
//     },

//     cerrar: {
//         fontSize: 20,
//         color: '#777',
//         padding: 5,
//     },

//     info: {
//         marginTop: 12,
//         gap: 6,
//     },

//     leyenda: {
//         padding: 14,
//         paddingBottom: 35,
//         backgroundColor: '#FFFFFF',
//     },

//     leyendaItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 8,
//     },

//     lineaLeyenda: {
//         width: 35,
//         height: 5,
//         borderRadius: 3,
//         marginRight: 10,
//     },

//     instruccion: {
//         textAlign: 'center',
//         marginTop: 4,
//         marginBottom: 15,
//         color: '#777',
//         fontSize: 13,
//     },
//     qrBox: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         padding: 12,
//         marginTop: 8,
//         borderRadius: 10,
//         backgroundColor: '#F1F4F7',
//     },

//     qrIcon: {
//         fontSize: 35,
//         marginRight: 12,
//     },

//     qrTitulo: {
//         fontSize: 14,
//         fontWeight: '700',
//     },

//     qrCodigo: {
//         fontSize: 12,
//         color: '#666',
//         marginTop: 3,
//     },

//     botonQr: {
//         marginTop: 10,
//         padding: 13,
//         borderRadius: 10,
//         backgroundColor: '#1B6CA8',
//         alignItems: 'center',
//     },

//     botonQrTexto: {
//         color: '#FFFFFF',
//         fontSize: 16,
//         fontWeight: '700',
//     },

//     sinQr: {
//         marginTop: 10,
//         color: '#888',
//     },
//     botonVolver: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: 10,
//         marginTop: 14,
//         backgroundColor: '#08fc59',
//     },

//     flecha: {
//         fontSize: 32,
//         color: '#333',
//         lineHeight: 34,
//         marginTop: -14,
//     },
//     estado: {
//         fontSize: 13,
//         fontWeight: '600',
//         marginTop: 5,
//     },
// });
import { paradasMock } from '@/src/mocks/parada';
import { Parada } from '@/src/tipos/parada';
import { useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function LineaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [paradaSeleccionada, setParadaSeleccionada] = useState<Parada | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [horarioSeleccionadoParaAlarma, setHorarioSeleccionadoParaAlarma] = useState<{ parada: string; horario: string } | null>(null);
  
  const mapRef = useRef<MapView>(null);

  const paradasDeLinea = paradasMock.filter((parada) =>
    parada.lineaIds.includes(id || '')
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
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={regionInicial}
      >
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