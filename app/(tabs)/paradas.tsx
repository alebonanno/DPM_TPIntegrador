import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Coordenadas } from '@/src/tipos/linea';
import { Parada } from '@/src/tipos/parada';
import { MotivoDemora } from '@/src/tipos/reporte';
import FlechaDireccion from '../../src/componentes/FlechaDireccion';
import { obtenerParadas } from '../../src/servicios/parada';
import { abrirMapaNativo } from '../../src/servicios/ubicacion';

import { useReportes } from '@/src/contexto/ReportesContext';
import { useTema } from '@/src/contexto/TemaContexto';
import { colores } from '@/src/tema/colores';

const MOTIVOS: { valor: MotivoDemora; etiqueta: string }[] = [
    { valor: 'no_paso', etiqueta: 'No pasó' },
    { valor: 'paso_lleno', etiqueta: 'Pasó lleno y no paró' },
    { valor: 'demorado', etiqueta: 'Viene demorado' },
    { valor: 'unidad_rota', etiqueta: 'Unidad rota' },
    { valor: 'calle_cortada', etiqueta: 'Calle cortada' },
];

export default function ParadasScreen() {
    const { lineaId } = useLocalSearchParams<{ lineaId?: string }>();
    const { temaReal } = useTema();
    const coloresActuales = colores[temaReal];
    
    // Contexto de reportes
    const { reportes, agregarReporte, confirmarReporte } = useReportes();

    const [paradas, setParadas] = useState<Parada[]>([]);
    const [filtroTexto, setFiltroTexto] = useState<string>('');
    const [lineaFiltro, setLineaFiltro] = useState<string | null>(null);
    const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);

    // Estados para el Modal de Reportes
    const [modalVisible, setModalVisible] = useState(false);
    const [paradaSeleccionada, setParadaSeleccionada] = useState<Parada | null>(null);
    const [lineaReporte, setLineaReporte] = useState<string>('');
    const [motivoReporte, setMotivoReporte] = useState<MotivoDemora>('demorado');
    const [fotoUri, setFotoUri] = useState<string | null>(null);

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

    useEffect(() => {
        if (lineaId) {
            setLineaFiltro(lineaId);
        }
    }, [lineaId]);

    const paradasFiltradas = paradas.filter((parada) => {
        const coincideLinea = lineaFiltro ? parada.lineaIds.includes(lineaFiltro) : true;
        const coincideTexto = parada.nombre.toLowerCase().includes(filtroTexto.toLowerCase());
        return coincideLinea && coincideTexto;
    });

    // Funciones del formulario de reportes
    const abrirModalReporte = (parada: Parada) => {
        setParadaSeleccionada(parada);
        setLineaReporte(parada.lineaIds[0]); // Selecciona la primera línea por defecto
        setMotivoReporte('demorado');
        setFotoUri(null);
        setModalVisible(true);
    };

    const tomarFoto = async () => {
        const permiso = await ImagePicker.requestCameraPermissionsAsync();
        if (permiso.granted) {
            let resultado = await ImagePicker.launchCameraAsync({
                quality: 0.5,
            });
            if (!resultado.canceled) {
                setFotoUri(resultado.assets[0].uri);
            }
        } else {
            Alert.alert("Permiso denegado", "Se necesita acceso a la cámara para adjuntar una foto.");
        }
    };

    const enviarReporte = () => {
        if (!paradaSeleccionada) return;

        agregarReporte({
            lineaId: lineaReporte,
            paradaId: paradaSeleccionada.id,
            usuarioId: 'usuario_local_123', // Simulación de ID de usuario
            motivo: motivoReporte,
            comentario: null,
            fotoUri: fotoUri,
        });

        setModalVisible(false);
        Alert.alert("Éxito", "Reporte enviado correctamente.");
    };

    return (
        <View style={[styles.container, { backgroundColor: coloresActuales.fondo }]}>
            <Text style={[styles.title, { color: coloresActuales.texto }]}>Paradas</Text>

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

            <FlatList
                data={paradasFiltradas}
                keyExtractor={(parada) => parada.id}
                ListEmptyComponent={<Text style={styles.sinResultados}>No se encontraron paradas coincidentes.</Text>}
                renderItem={({ item: parada }) => {
                    // Filtrar reportes activos para ESTA parada
                    const reportesDeEstaParada = reportes.filter(r => r.paradaId === parada.id);

                    return (
                        <View style={[styles.parada, { backgroundColor: coloresActuales.tarjeta }]}>
                            <Text style={styles.nombre}>{parada.nombre}</Text>
                            <Text style={styles.detalle}>ID Parada: {parada.id}</Text>
                            <Text style={styles.detalle}>Líneas que pasan: {parada.lineaIds.join(', ')}</Text>
                            <Text style={styles.detalle}>Sentido: {parada.sentido.toUpperCase()} {parada.refugio ? '• 🏣 Garita' : ''}</Text>

                            <FlechaDireccion ubicacionUsuario={ubicacion} coordenadasParada={parada.coordenadas} />

                            <TouchableOpacity style={styles.botonCaminar} onPress={() => abrirMapaNativo(parada.coordenadas, parada.nombre)}>
                                <Text style={styles.textoBoton}>📍 Cómo llegar caminando</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.botonReportar} onPress={() => abrirModalReporte(parada)}>
                                <Text style={styles.textoBotonReportar}>⚠️ Informar problema de colectivo</Text>
                            </TouchableOpacity>

                            {/* Lista de reportes activos en esta parada */}
                            {reportesDeEstaParada.length > 0 && (
                                <View style={styles.contenedorReportesActivos}>
                                    <Text style={styles.tituloReportes}>Reportes de otros pasajeros:</Text>
                                    {reportesDeEstaParada.map((reporte) => (
                                        <View key={reporte.id} style={styles.tarjetaReporteActivo}>
                                            <View>
                                                <Text style={styles.textoReporteLinea}>Línea {reporte.lineaId}</Text>
                                                <Text style={styles.textoReporteMotivo}>
                                                    {MOTIVOS.find(m => m.valor === reporte.motivo)?.etiqueta}
                                                </Text>
                                                <Text style={styles.textoReporteHora}>
                                                    {new Date(reporte.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </View>
                                            <TouchableOpacity 
                                                style={styles.botonConfirmar} 
                                                onPress={() => confirmarReporte(reporte.id)}
                                            >
                                                <Text style={styles.textoConfirmar}>👍 Confirmar ({reporte.confirmaciones})</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    );
                }}
            />

            {/* Modal para crear un nuevo reporte */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Reportar Problema</Text>
                        <Text style={styles.modalSubtitle}>{paradaSeleccionada?.nombre}</Text>

                        <Text style={styles.labelFormulario}>¿Qué línea esperabas?</Text>
                        <View style={styles.opcionesFila}>
                            {paradaSeleccionada?.lineaIds.map(linea => (
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
                                <Text style={styles.textoBoton}>Enviar Reporte</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60 },
    title: { fontSize: 30, fontWeight: '700', marginBottom: 10, textAlign: 'center', textDecorationLine: 'underline' },
    parada: { padding: 16, marginBottom: 12, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
    nombre: { fontSize: 18, fontWeight: '600', marginBottom: 6, color: '#1B6CA8' },
    buscadorInput: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#DDD', fontSize: 16, marginBottom: 16 },
    badgeFiltroContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#E3F2FD', padding: 10, borderRadius: 8, marginBottom: 12 },
    textoFiltro: { fontSize: 14, color: '#0D47A1' },
    lineaFiltroBold: { fontWeight: 'bold' },
    botonQuitarFiltro: { backgroundColor: '#1976D2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    textoQuitarFiltro: { color: '#FFF', fontSize: 12, fontWeight: '600' },
    detalle: { fontSize: 14, color: '#555', marginTop: 2 },
    sinResultados: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#777' },
    botonCaminar: { backgroundColor: '#1B6CA8', paddingVertical: 10, borderRadius: 8, marginTop: 10, alignItems: 'center' },
    textoBoton: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
    
    // Estilos nuevos para reportes
    botonReportar: { backgroundColor: '#FF9800', paddingVertical: 10, borderRadius: 8, marginTop: 8, alignItems: 'center' },
    textoBotonReportar: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
    contenedorReportesActivos: { marginTop: 16, padding: 12, backgroundColor: '#FFF3E0', borderRadius: 8, borderWidth: 1, borderColor: '#FFE0B2' },
    tituloReportes: { fontWeight: 'bold', color: '#E65100', marginBottom: 8 },
    tarjetaReporteActivo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 8, borderRadius: 6, marginBottom: 6 },
    textoReporteLinea: { fontWeight: 'bold', color: '#333' },
    textoReporteMotivo: { color: '#D84315', fontSize: 13 },
    textoReporteHora: { color: '#888', fontSize: 11 },
    botonConfirmar: { backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    textoConfirmar: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    
    // Estilos del Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: 400 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center' },
    modalSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
    labelFormulario: { fontSize: 14, fontWeight: 'bold', color: '#444', marginTop: 12, marginBottom: 8 },
    opcionesFila: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    scrollMotivos: { maxHeight: 50 },
    botonOpcion: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0', marginRight: 8, borderWidth: 1, borderColor: '#DDD' },
    botonOpcionActiva: { backgroundColor: '#E3F2FD', borderColor: '#1976D2' },
    textoOpcion: { color: '#555' },
    textoOpcionActiva: { color: '#1976D2', fontWeight: 'bold' },
    botonFoto: { backgroundColor: '#ECEFF1', padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#B0BEC5', borderStyle: 'dashed' },
    textoBotonFoto: { color: '#455A64', fontWeight: 'bold' },
    fotoPreview: { width: '100%', height: 150, borderRadius: 8, resizeMode: 'cover' },
    botonesAccion: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
    botonCancelar: { flex: 1, padding: 14, backgroundColor: '#E0E0E0', borderRadius: 8, alignItems: 'center', marginRight: 8 },
    botonEnviar: { flex: 1, padding: 14, backgroundColor: '#1B6CA8', borderRadius: 8, alignItems: 'center', marginLeft: 8 },
    textoCancelar: { color: '#333', fontWeight: 'bold' }
});