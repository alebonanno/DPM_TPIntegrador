import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Image, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import FlechaDireccion from '../../src/componentes/FlechaDireccion';
import MapaPersonalizado from '../../src/componentes/MapaPersonalizado';
import { obtenerParadas } from '../../src/servicios/parada';
import { abrirMapaNativo } from '../../src/servicios/ubicacion';
import { Coordenadas } from '../../src/tipos/linea';
import { Parada } from '../../src/tipos/parada';
import { MotivoDemora } from '../../src/tipos/reporte';

import * as SecureStore from 'expo-secure-store';
import { useFavoritos } from '../../src/contexto/FavoritosContexto';
import { useReportes } from '../../src/contexto/ReportesContext';
import { useTema } from '../../src/contexto/TemaContexto';
import { colores } from '../../src/tema/colores';

const MOTIVOS: { valor: MotivoDemora; etiqueta: string }[] = [
    { valor: 'no_paso', etiqueta: 'No pasó' },
    { valor: 'paso_lleno', etiqueta: 'Pasó lleno y no paró' },
    { valor: 'demorado', etiqueta: 'Viene demorado' },
    { valor: 'unidad_rota', etiqueta: 'Unidad rota' },
    { valor: 'calle_cortada', etiqueta: 'Calle cortada' },
];

function calcularDistanciaEnMetros(coord1: Coordenadas, coord2: Coordenadas): number {
    const R = 6371e3;
    const phi1 = (coord1.latitud * Math.PI) / 180;
    const phi2 = (coord2.latitud * Math.PI) / 180;
    const deltaPhi = ((coord2.latitud - coord1.latitud) * Math.PI) / 180;
    const deltaLambda = ((coord2.longitud - coord1.longitud) * Math.PI) / 180;

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export default function ParadasScreen() {
    const mapRef = useRef<any>(null);
    const flatListRef = useRef<FlatList>(null);
    const { lineaId } = useLocalSearchParams<{ lineaId?: string }>();
    const { temaReal } = useTema();
    const coloresActuales = colores[temaReal];

    const { reportes, agregarReporte, confirmarReporte } = useReportes();
    const { paradasFavoritas, toggleParadaFavorita } = useFavoritos();

    const [paradas, setParadas] = useState<Parada[]>([]);
    const [filtroTexto, setFiltroTexto] = useState<string>('');
    const [lineaFiltro, setLineaFiltro] = useState<string | null>(null);
    const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const [modoMapaActivo, setModoMapaActivo] = useState<boolean>(false);
    const [paradaSeleccionadaId, setParadaSeleccionadaId] = useState<string | null>(null);

    // Modal Reportes
    const [modalVisible, setModalVisible] = useState(false);
    const [paradaReporte, setParadaReporte] = useState<Parada | null>(null);
    const [lineaReporte, setLineaReporte] = useState<string>('');
    const [motivoReporte, setMotivoReporte] = useState<MotivoDemora>('demorado');
    const [fotoUri, setFotoUri] = useState<string | null>(null);

    // ORDENAMIENTO ÚNICO Y CENTRALIZADO: Las favoritas van siempre al tope superior
    const paradasFiltradas = paradas
        .filter((parada) => {
            const coincideLinea = lineaFiltro ? parada.lineaIds.includes(lineaFiltro) : true;
            const coincideTexto = parada.nombre.toLowerCase().includes(filtroTexto.toLowerCase());
            return coincideLinea && coincideTexto;
        })
        .sort((a, b) => {
            const aEsFavorita = paradasFavoritas.includes(a.id);
            const bEsFavorita = paradasFavoritas.includes(b.id);

            if (aEsFavorita && !bEsFavorita) return -1;
            if (!aEsFavorita && bEsFavorita) return 1;

            if (!ubicacion) return 0;
            const distanciaA = calcularDistanciaEnMetros(ubicacion, a.coordenadas);
            const distanciaB = calcularDistanciaEnMetros(ubicacion, b.coordenadas);
            return distanciaA - distanciaB;
        });

    // Función para manejar el scroll hacia la parada seleccionada o al inicio
    const hacerScrollHaciaParada = (paradaId: string, alInicio: boolean = false) => {
        setParadaSeleccionadaId(paradaId);
        setTimeout(() => {
            if (!flatListRef.current) return;
            try {
                if (alInicio) {
                    flatListRef.current.scrollToOffset({ offset: 0, animated: true });
                } else {
                    const index = paradasFiltradas.findIndex(p => p.id === paradaId);
                    if (index !== -1) {
                        flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0 });
                    }
                }
            } catch (err) {
                console.log('Scroll warning:', err);
            }
        }, 150);
    };

    // Validación de sesión, cambio de favorito y desplazamiento automático al inicio
    const manejarFavoritoYDesplazar = async (paradaId: string) => {
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

            // Cambiamos el estado de favorito
            await toggleParadaFavorita(paradaId);

            // Resaltamos la parada y subimos el scroll al tope superior de la lista de forma garantizada
            setParadaSeleccionadaId(paradaId);
            setTimeout(() => {
                if (flatListRef.current) {
                    flatListRef.current.scrollToOffset({ offset: 0, animated: true });
                }
            }, 250);

        } catch (error) {
            console.error('Error al verificar sesión para favoritos:', error);
        }
    };

    const enviarReporte = async () => {
        if (!paradaReporte) return;

        agregarReporte({
            lineaId: lineaReporte,
            paradaId: paradaReporte.id,
            usuarioId: 'usuario_local_123',
            motivo: motivoReporte,
            comentario: null,
            fotoUri: fotoUri,
        });

        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '⚠️ Reporte registrado con éxito',
                    body: `Informaste una incidencia en la parada "${paradaReporte.nombre}" para la Línea ${lineaReporte}.`,
                    sound: true,
                },
                trigger: null,
            });
        } catch (error) {
            console.warn('No se pudo emitir la notificación local:', error);
        }

        setModalVisible(false);
        Alert.alert("Éxito", "Reporte enviado correctamente.");
    };

    async function cargarParadas() {
        try {
            const datos = await obtenerParadas();
            setParadas(datos);
        } catch (error) {
            console.error('Error al cargar paradas:', error);
        }
    }

    async function obtenerUbicacion() {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setUbicacion({
                    latitud: loc.coords.latitude,
                    longitud: loc.coords.longitude,
                });
            }
        } catch (error) {
            console.warn('No se pudo obtener la ubicación actual:', error);
        }
    }

    useEffect(() => {
        cargarParadas();
        obtenerUbicacion();
    }, []);

    useEffect(() => {
        if (lineaId) {
            setLineaFiltro(lineaId);
        }
    }, [lineaId]);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([cargarParadas(), obtenerUbicacion()]);
        setRefreshing(false);
    };

    const seleccionarYVerEnMapa = (parada: Parada) => {
        setModoMapaActivo(true);
        hacerScrollHaciaParada(parada.id, false);

        setTimeout(() => {
            if (mapRef.current && typeof mapRef.current.animateToRegion === 'function') {
                mapRef.current.animateToRegion({
                    latitude: parada.coordenadas.latitud,
                    longitude: parada.coordenadas.longitud,
                    latitudeDelta: 0.009,
                    longitudeDelta: 0.009,
                }, 800);
            }
        }, 100);
    };

    const abrirModalReporte = (parada: Parada) => {
        setParadaReporte(parada);
        setLineaReporte(parada.lineaIds?.[0] || '');
        setMotivoReporte('demorado');
        setFotoUri(null);
        setModalVisible(true);
    };

    const tomarFoto = async () => {
        const permiso = await ImagePicker.requestCameraPermissionsAsync();
        if (permiso.granted) {
            let resultado = await ImagePicker.launchCameraAsync({ quality: 0.5 });
            if (!resultado.canceled) {
                setFotoUri(resultado.assets[0].uri);
            }
        } else {
            Alert.alert("Permiso denegado", "Se necesita acceso a la cámara.");
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: coloresActuales.fondo }]}>

            {/* Encabezado con buscador */}
            <View style={styles.encabezadoSuperior}>
                <View style={styles.filaTitulo}>
                    <Text style={[styles.title, { color: coloresActuales.texto }]}>Paradas</Text>
                    {modoMapaActivo && (
                        <TouchableOpacity
                            style={styles.botonOcultarMapa}
                            onPress={() => {
                                setModoMapaActivo(false);
                                setParadaSeleccionadaId(null);
                            }}
                        >
                            <Text style={styles.textoOcultarMapa}>✕ Cerrar Mapa</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {lineaFiltro && (
                    <View style={styles.badgeFiltroContainer}>
                        <Text style={styles.textoFiltro}>
                            Filtrado por línea: <Text style={styles.lineaFiltroBold}>{lineaFiltro}</Text>
                        </Text>
                        <TouchableOpacity onPress={() => setLineaFiltro(null)} style={styles.botonQuitarFiltro}>
                            <Text style={styles.textoQuitarFiltro}>Ver todas</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <TextInput
                    style={styles.buscadorInput}
                    placeholder="Buscar por nombre o calle..."
                    value={filtroTexto}
                    onChangeText={setFiltroTexto}
                    placeholderTextColor="#888"
                />
            </View>

            {/* Mapa: Se renderiza únicamente cuando modoMapaActivo es TRUE */}
            {modoMapaActivo && (
                <View style={styles.contenedorMapaMetad}>
                    <MapaPersonalizado
                        ref={mapRef}
                        paradas={paradas}
                        paradasFavoritas={paradasFavoritas}
                        ubicacionUsuario={ubicacion}
                        showsUserLocation={true}
                        onPressMarker={(parada: Parada) => seleccionarYVerEnMapa(parada)}
                    />
                </View>
            )}

            {/* Lista de Paradas */}
            <View style={modoMapaActivo ? styles.contenedorListaMitad : styles.contenedorListaCompleta}>
                <FlatList
                    ref={flatListRef}
                    data={paradasFiltradas}
                    keyExtractor={(parada) => parada.id}
                    contentContainerStyle={styles.listaPadding}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={coloresActuales.texto}
                            colors={['#1B6CA8']}
                        />
                    }
                    ListEmptyComponent={<Text style={styles.sinResultados}>No se encontraron paradas coincidentes.</Text>}
                    renderItem={({ item: parada }) => {
                        const reportesDeEstaParada = reportes.filter(r => r.paradaId === parada.id);
                        const esFavorita = paradasFavoritas.includes(parada.id);
                        const esSeleccionada = parada.id === paradaSeleccionadaId;

                        return (
                            <View style={[
                                styles.parada,
                                { backgroundColor: coloresActuales.tarjeta },
                                esSeleccionada && styles.paradaResaltada
                            ]}>
                                <View style={styles.encabezadoTarjeta}>
                                    <Text style={[styles.nombre, { color: coloresActuales.texto }]} numberOfLines={1}>
                                        {parada.nombre}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => manejarFavoritoYDesplazar(parada.id)}
                                        style={styles.botonCorazon}
                                    >
                                        <Text style={styles.iconoCorazon}>
                                            {esFavorita ? '❤️' : '🤍'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={[styles.detalle, { color: coloresActuales.texto }]}>
                                    Líneas: {parada.lineaIds.join(', ')} {parada.sentido.toUpperCase()} {parada.refugio ? '• 🏣 Garita' : ''}
                                </Text>

                                {modoMapaActivo ? (
                                    <View style={styles.filaAccionesCompacta}>
                                        <View style={styles.contenedorFlecha}>
                                            <FlechaDireccion ubicacionUsuario={ubicacion} coordenadasParada={parada.coordenadas} />
                                        </View>

                                        <View style={styles.grupoBotonesIcono}>
                                            <TouchableOpacity
                                                style={[styles.botonIcono, { backgroundColor: '#4CAF50' }]}
                                                onPress={() => seleccionarYVerEnMapa(parada)}
                                            >
                                                <Text style={styles.textoIcono}>🗺️</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.botonIcono, { backgroundColor: '#1B6CA8' }]}
                                                onPress={() => abrirMapaNativo(parada.coordenadas, parada.nombre)}
                                            >
                                                <Text style={styles.textoIcono}>📍</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.botonIcono, { backgroundColor: '#FF9800' }]}
                                                onPress={() => abrirModalReporte(parada)}
                                            >
                                                <Text style={styles.textoIcono}>⚠️</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.contenedorBotonesCompletos}>
                                        <FlechaDireccion ubicacionUsuario={ubicacion} coordenadasParada={parada.coordenadas} />

                                        <TouchableOpacity
                                            style={styles.botonVerEnMapa}
                                            onPress={() => seleccionarYVerEnMapa(parada)}
                                        >
                                            <Text style={styles.textoBotonMapa}>🗺️ Ver en el mapa</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.botonCaminar}
                                            onPress={() => abrirMapaNativo(parada.coordenadas, parada.nombre)}
                                        >
                                            <Text style={styles.textoBoton}>📍 Cómo llegar caminando</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.botonReportar}
                                            onPress={() => abrirModalReporte(parada)}
                                        >
                                            <Text style={styles.textoBotonReportar}>⚠️ Informar problema de colectivo</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {reportesDeEstaParada.length > 0 && (
                                    <View style={styles.contenedorReportesActivos}>
                                        {reportesDeEstaParada.map((reporte) => (
                                            <View key={reporte.id} style={styles.tarjetaReporteActivo}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.textoReporteLinea}>
                                                        - Línea {reporte.lineaId}: {MOTIVOS.find(m => m.valor === reporte.motivo)?.etiqueta}
                                                    </Text>
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.botonConfirmar}
                                                    onPress={() => confirmarReporte(reporte.id)}
                                                >
                                                    <Text style={styles.textoConfirmar}>👍 ({reporte.confirmaciones})</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        );
                    }}
                />
            </View>

            {/* Modal de Reporte */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Reportar Problema</Text>
                        <Text style={styles.modalSubtitle}>{paradaReporte?.nombre}</Text>

                        <Text style={styles.labelFormulario}>¿Qué línea esperabas?</Text>
                        <View style={styles.opcionesFila}>
                            {paradaReporte?.lineaIds.map(linea => (
                                <TouchableOpacity
                                    key={linea}
                                    style={[styles.botonOpcion, lineaReporte === linea && styles.botonOpcionActiva]}
                                    onPress={() => setLineaReporte(linea)}
                                >
                                    <Text style={lineaReporte === linea ? styles.textoOpcionActiva : styles.textoOpcion}>
                                        Línea {linea}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.labelFormulario}>¿Qué pasó?</Text>
                        <ScrollView style={styles.scrollMotivos} horizontal showsHorizontalScrollIndicator={false}>
                            {MOTIVOS.map(motivo => (
                                <TouchableOpacity
                                    key={motivo.valor}
                                    style={[styles.botonOpcion, motivoReporte === motivo.valor && styles.botonOpcionActiva]}
                                    onPress={() => setMotivoReporte(motivo.valor)}
                                >
                                    <Text style={motivoReporte === motivo.valor ? styles.textoOpcionActiva : styles.textoOpcion}>
                                        {motivo.etiqueta}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.labelFormulario}>Adjuntar Foto (Opcional)</Text>
                        {fotoUri ? (
                            <Image source={{ uri: fotoUri }} style={styles.fotoPreview} />
                        ) : (
                            <TouchableOpacity style={styles.botonFoto} onPress={tomarFoto}>
                                <Text style={styles.textoBotonFoto}>📷 Tomar Foto</Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.botonesAccion}>
                            <TouchableOpacity style={styles.botonCancelar} onPress={() => setModalVisible(false)}>
                                <Text style={styles.textoCancelar}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.botonEnviar} onPress={enviarReporte}>
                                <Text style={styles.textoBotonModal}>Enviar Reporte</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    encabezadoSuperior: { paddingHorizontal: 16, paddingTop: 50, paddingBottom: 8 },
    filaTitulo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    title: { fontSize: 26, fontWeight: '700' },
    botonOcultarMapa: { backgroundColor: '#E0E0E0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    textoOcultarMapa: { fontSize: 14, fontWeight: 'bold', color: '#333' },

    buscadorInput: { backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', fontSize: 16 },
    badgeFiltroContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#E3F2FD', padding: 8, borderRadius: 6, marginBottom: 8 },
    textoFiltro: { fontSize: 14, color: '#0D47A1' },
    lineaFiltroBold: { fontWeight: 'bold' },
    botonQuitarFiltro: { backgroundColor: '#1976D2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
    textoQuitarFiltro: { color: '#FFF', fontSize: 12, fontWeight: '600' },

    contenedorMapaMetad: { height: '48%', width: '100%' },
    contenedorListaMitad: { height: '42%', width: '100%' },
    contenedorListaCompleta: { flex: 1, width: '100%' },

    listaPadding: { paddingHorizontal: 12, paddingVertical: 8 },
    parada: { padding: 14, marginBottom: 12, borderRadius: 12, backgroundColor: '#ffffff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    paradaResaltada: { borderWidth: 2, borderColor: '#1976D2' },
    encabezadoTarjeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    nombre: { fontSize: 24, fontWeight: '700', color: '#1B6CA8', flex: 1 },
    botonCorazon: { paddingLeft: 8 },
    iconoCorazon: { fontSize: 24 },
    detalle: { fontSize: 20, color: '#555', marginTop: 4, lineHeight: 28 },

    filaAccionesCompacta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    contenedorFlecha: { flex: 1 },
    grupoBotonesIcono: { flexDirection: 'row', gap: 10 },
    botonIcono: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    textoIcono: { fontSize: 22 },

    contenedorBotonesCompletos: { marginTop: 8 },
    botonVerEnMapa: { backgroundColor: '#4CAF50', paddingVertical: 12, borderRadius: 8, marginTop: 8, alignItems: 'center' },
    textoBotonMapa: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
    botonCaminar: { backgroundColor: '#1B6CA8', paddingVertical: 12, borderRadius: 8, marginTop: 8, alignItems: 'center' },
    textoBoton: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
    botonReportar: { backgroundColor: '#FF9800', paddingVertical: 12, borderRadius: 8, marginTop: 8, alignItems: 'center' },
    textoBotonReportar: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

    sinResultados: { textAlign: 'center', marginTop: 10, fontSize: 16, color: '#777' },

    contenedorReportesActivos: { marginTop: 10, padding: 8, backgroundColor: '#FFF3E0', borderRadius: 8 },
    tarjetaReporteActivo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 8, borderRadius: 6, marginBottom: 4 },
    textoReporteLinea: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    botonConfirmar: { backgroundColor: '#4CAF50', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
    textoConfirmar: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: 380 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center' },
    modalSubtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 16 },
    labelFormulario: { fontSize: 15, fontWeight: 'bold', color: '#444', marginTop: 10, marginBottom: 6 },
    opcionesFila: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    scrollMotivos: { maxHeight: 45 },
    botonOpcion: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F0F0F0', marginRight: 6, borderWidth: 1, borderColor: '#DDD' },
    botonOpcionActiva: { backgroundColor: '#E3F2FD', borderColor: '#1976D2' },
    textoOpcion: { color: '#555', fontSize: 13 },
    textoOpcionActiva: { color: '#1976D2', fontWeight: 'bold', fontSize: 13 },
    botonFoto: { backgroundColor: '#ECEFF1', padding: 12, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#B0BEC5', borderStyle: 'dashed' },
    textoBotonFoto: { color: '#455A64', fontWeight: 'bold', fontSize: 14 },
    fotoPreview: { width: '100%', height: 120, borderRadius: 6, resizeMode: 'cover' },
    botonesAccion: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
    botonCancelar: { flex: 1, padding: 12, backgroundColor: '#E0E0E0', borderRadius: 6, alignItems: 'center', marginRight: 6 },
    botonEnviar: { flex: 1, padding: 12, backgroundColor: '#1B6CA8', borderRadius: 6, alignItems: 'center', marginLeft: 6 },
    textoCancelar: { color: '#333', fontWeight: 'bold', fontSize: 14 },
    textoBotonModal: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});