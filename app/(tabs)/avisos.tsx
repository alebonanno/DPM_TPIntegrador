import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Modal, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { obtenerAvisos } from '../../src/servicios/aviso';
import { Aviso } from '../../src/tipos/aviso';

import { useTema } from '../../src/contexto/TemaContexto';
import { colores } from '../../src/tema/colores';

import { WebView } from 'react-native-webview';
import MapView, { Polyline } from 'react-native-maps';

// Componente interno para manejar el reproductor y sus controles
function ModalVideo({ url, visible, onClose }: { url: string | null; visible: boolean; onClose: () => void }) {
    if (!url) return null;

    const videoUrlSegura = url.startsWith('http://') ? url.replace('http://', 'https://') : url;

    const htmlContent = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;background-color:black;display:flex;justify-content:center;align-items:center;height:100vh;">
                <video controls autoplay playsinline style="width:100%;max-height:100%;">
                    <source src="${videoUrlSegura}" type="video/mp4">
                    Tu navegador no soporta la reproducción de video.
                </video>
            </body>
        </html>
    `;

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContentVideo}>
                    <Text style={styles.modalVideoTitle}>🎥 Video Informativo de Desvío</Text>
                    
                    <View style={styles.videoPlayer}>
                        <WebView
                            source={{ html: htmlContent }}
                            style={{ backgroundColor: 'black', flex: 1, borderRadius: 10 }}
                            allowsInlineMediaPlayback={true}
                            mediaPlaybackRequiresUserAction={false}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                        />
                    </View>

                    <TouchableOpacity style={styles.botonCerrarVideo} onPress={onClose}>
                        <Text style={styles.textoCerrarVideo}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

export default function AvisosScreen() {
    const [avisos, setAvisos] = useState<Aviso[]>([]);
    const [mapaExpandidoId, setMapaExpandidoId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Estados para el Modal de Video Multimedia
    const [videoUrlActiva, setVideoUrlActiva] = useState<string | null>(null);
    const [modalVideoVisible, setModalVideoVisible] = useState(false);

    const { temaReal } = useTema();
    const coloresActuales = colores[temaReal];

    const params = useLocalSearchParams();
    const lineaFiltro = params.lineaFiltro ? String(params.lineaFiltro) : null;

    async function cargarAvisos() {
        try {
            const datos: Aviso[] = await obtenerAvisos();

            if (lineaFiltro) {
                const avisosOrdenados = [...datos].sort((a, b) => {
                    const aIncluye = a.lineaIds.some(id => id.includes(lineaFiltro)) ? -1 : 1;
                    const bIncluye = b.lineaIds.some(id => id.includes(lineaFiltro)) ? -1 : 1;
                    return aIncluye - bIncluye;
                });
                setAvisos(avisosOrdenados);
            } else {
                setAvisos(datos);
            }
        } catch (error) {
            console.error('Error al cargar avisos:', error);
        }
    }

    useEffect(() => {
        cargarAvisos();
    }, [lineaFiltro]);

    const onRefresh = async () => {
        setRefreshing(true);
        await cargarAvisos();
        setRefreshing(false);
    };

    const formatearFechaAmigable = (fechaIso: string) => {
        const fecha = new Date(fechaIso);
        if (isNaN(fecha.getTime())) return fechaIso;

        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        const horas = String(fecha.getHours()).padStart(2, '0');
        const minutos = String(fecha.getMinutes()).padStart(2, '0');

        return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
    };

    const toggleMapa = (id: string) => {
        setMapaExpandidoId(mapaExpandidoId === id ? null : id);
    };

    const abrirVideoInterno = (url: string | null) => {
        if (!url) {
            alert('No hay video informativo disponible para este aviso.');
            return;
        }
        setVideoUrlActiva(url);
        setModalVideoVisible(true);
    };

    return (
        <View style={[styles.container, { backgroundColor: coloresActuales.fondo }]}>
            <Text style={[styles.title, { color: coloresActuales.texto }]}>
                Avisos y Desvíos
            </Text>

            <FlatList
                data={avisos}
                keyExtractor={(aviso) => aviso.id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={coloresActuales.texto}
                        colors={['#1B6CA8']}
                    />
                }
                renderItem={({ item: aviso }) => {
                    const esMapaAbierto = mapaExpandidoId === aviso.id;
                    const esDestacado = lineaFiltro && aviso.lineaIds.some(id => id.includes(lineaFiltro));

                    return (
                        <View style={[
                            styles.tarjetaAviso,
                            { backgroundColor: coloresActuales.tarjeta },
                            esDestacado && styles.tarjetaDestacada
                        ]}>
                            <Text style={[styles.tituloAviso, { color: coloresActuales.texto }]}>
                                {aviso.titulo}
                            </Text>

                            <Text style={[styles.detalle, { color: coloresActuales.textoItem }]}>
                                {aviso.detalle}
                            </Text>

                            <Text style={[styles.lineas, { color: coloresActuales.textoItem }]}>
                                Líneas comprometidas: {aviso.lineaIds.join(', ')}
                            </Text>

                            <View style={styles.contenedorFechas}>
                                <Text style={[styles.textoFecha, { color: coloresActuales.textoItem }]}>
                                    🕒 Desde: {formatearFechaAmigable(aviso.desde)}
                                </Text>
                                <Text style={[styles.textoFecha, { color: coloresActuales.textoItem }]}>
                                    🕒 Hasta: {formatearFechaAmigable(aviso.hasta)}
                                </Text>
                            </View>

                            <View style={styles.gravedadContainer}>
                                <Text style={styles.gravedadTexto}>
                                    Gravedad: {aviso.gravedad}
                                </Text>
                            </View>

                            <View style={styles.contenedorBotones}>
                                <TouchableOpacity
                                    style={[styles.botonAccion, styles.botonMapa]}
                                    onPress={() => toggleMapa(aviso.id)}
                                >
                                    <Text style={styles.textoBoton}>
                                        {esMapaAbierto ? '🗺️ Ocultar mapa' : '🗺️ Ver desvío en mapa'}
                                    </Text>
                                </TouchableOpacity>

                                {aviso.videoUrl && (
                                    <TouchableOpacity
                                        style={[styles.botonAccion, styles.botonVideo]}
                                        onPress={() => abrirVideoInterno(aviso.videoUrl)}
                                    >
                                        <Text style={styles.textoBoton}>▶️ Ver video</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {esMapaAbierto && (
                                <View style={styles.contenedorMapaMock}>
                                    <Text style={styles.etiquetaMapaMock}>Trazado del desvío alternativo</Text>
                                    
                                    {aviso.trazadoAlternativo && aviso.trazadoAlternativo.length > 0 ? (
                                        <MapView
                                            style={styles.imagenMapa}
                                            initialRegion={{
                                                latitude: aviso.trazadoAlternativo[0].latitud,
                                                longitude: aviso.trazadoAlternativo[0].longitud,
                                                latitudeDelta: 0.01,
                                                longitudeDelta: 0.01,
                                            }}
                                        >
                                            <Polyline
                                                coordinates={aviso.trazadoAlternativo.map((punto: any) => ({
                                                    latitude: punto.latitud,
                                                    longitude: punto.longitud,
                                                }))}
                                                strokeColor="#E67E22"
                                                strokeWidth={5}
                                            />
                                        </MapView>
                                    ) : (
                                        <Text style={styles.sinTrazadoTexto}>
                                            Este aviso no cuenta con un trazado gráfico alternativo.
                                        </Text>
                                    )}
                                </View>
                            )}
                        </View>
                    );
                }}
            />

            {/* Modal Multimedia con video interno */}
            <ModalVideo
                url={videoUrlActiva}
                visible={modalVideoVisible}
                onClose={() => {
                    setModalVideoVisible(false);
                    setVideoUrlActiva(null);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 18, paddingTop: 55 },
    title: { fontSize: 30, fontWeight: '800', marginBottom: 20, textAlign: 'center', textDecorationLine: 'underline' },
    tarjetaAviso: { padding: 18, marginBottom: 14, borderRadius: 18, elevation: 3 },
    tarjetaDestacada: { borderWidth: 2, borderColor: '#1B6CA8' },
    tituloAviso: { fontSize: 19, fontWeight: '700', marginBottom: 8 },
    detalle: { fontSize: 15, lineHeight: 21, marginBottom: 10 },
    lineas: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    contenedorFechas: { backgroundColor: 'rgba(0,0,0,0.03)', padding: 10, borderRadius: 8, marginBottom: 10 },
    textoFecha: { fontSize: 13, marginVertical: 2 },
    gravedadContainer: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: '#FFF3E0', marginBottom: 12 },
    gravedadTexto: { fontSize: 12, fontWeight: '700', color: '#E67E22' },
    contenedorBotones: { flexDirection: 'row', gap: 10 },
    botonAccion: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    botonMapa: { backgroundColor: '#1B6CA8' },
    botonVideo: { backgroundColor: '#8E44AD' },
    textoBoton: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
    contenedorMapaMock: { marginTop: 12, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#ddd', backgroundColor: '#f9f9f9' },
    etiquetaMapaMock: { textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#555', paddingVertical: 4, backgroundColor: '#eee' },
    imagenMapa: { width: '100%', height: 160 },
    sinTrazadoTexto: { padding: 15, textAlign: 'center', color: '#666', fontSize: 13 },
    // Estilos del Modal Multimedia
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    modalContentVideo: { width: '90%', backgroundColor: '#FFF', borderRadius: 16, padding: 16, alignItems: 'center' },
    modalVideoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
    videoPlayer: { width: '100%', height: 220, borderRadius: 10, backgroundColor: '#000' },
    botonCerrarVideo: { marginTop: 14, backgroundColor: '#D32F2F', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    textoCerrarVideo: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});