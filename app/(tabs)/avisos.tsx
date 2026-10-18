import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, Linking, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { obtenerAvisos } from '../../src/servicios/aviso';
import { Aviso } from '../../src/tipos/aviso';

import { useTema } from '../../src/contexto/TemaContexto';
import { colores } from '../../src/tema/colores';

export default function AvisosScreen() {
    const [avisos, setAvisos] = useState<Aviso[]>([]);
    const [mapaExpandidoId, setMapaExpandidoId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false); // Estado para el Pull-to-Refresh

    const { temaReal } = useTema();
    const coloresActuales = colores[temaReal];

    // Capturamos el parámetro enviado desde la pantalla de líneas (ej. 'lin-02' o '2')
    const params = useLocalSearchParams();
    const lineaFiltro = params.lineaFiltro ? String(params.lineaFiltro) : null;

    async function cargarAvisos() {
        try {
            const datos: Aviso[] = await obtenerAvisos();

            if (lineaFiltro) {
                // Ordenamos para que los avisos que incluyan la línea seleccionada aparezcan primero
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

    // Función que se ejecuta al hacer Pull-to-Refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await cargarAvisos();
        setRefreshing(false);
    };

    // Función para formatear fechas ISO (ej. '2026-09-14T00:00:00-03:00' a '14/09/2026 00:00')
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

    // Alternar la visibilidad de la foto del mapa mockeado
    const toggleMapa = (id: string) => {
        setMapaExpandidoId(mapaExpandidoId === id ? null : id);
    };

    // Abrir video informativo si existe
    const abrirVideo = async (url: string | null) => {
        if (!url) {
            alert('No hay video informativo disponible para este aviso.');
            return;
        }
        const soportado = await Linking.canOpenURL(url);
        if (soportado) {
            await Linking.openURL(url);
        } else {
            alert('No se pudo abrir el enlace del video.');
        }
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
                        tintColor={coloresActuales.texto} // Color del indicador en iOS
                        colors={['#1B6CA8']} // Color del indicador en Android
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

                            {/* Horarios formateados de forma amigable */}
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

                            {/* CONTENEDOR DE BOTONES (Mapa y Video) */}
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
                                        onPress={() => abrirVideo(aviso.videoUrl)}
                                    >
                                        <Text style={styles.textoBoton}>▶️ Ver video</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* IMAGEN DEL MAPA MOCKESADA (Se despliega/oculta al presionar el botón) */}
                            {esMapaAbierto && (
                                <View style={styles.contenedorMapaMock}>
                                    <Text style={styles.etiquetaMapaMock}>Trazado del desvío (Mock)</Text>
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=600&auto=format&fit=crop' }}
                                        style={styles.imagenMapa}
                                        resizeMode="cover"
                                    />
                                </View>
                            )}
                        </View>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 18,
        paddingTop: 55,
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        marginBottom: 20,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    tarjetaAviso: {
        padding: 18,
        marginBottom: 14,
        borderRadius: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    tarjetaDestacada: {
        borderWidth: 2,
        borderColor: '#1B6CA8',
    },
    tituloAviso: {
        fontSize: 19,
        fontWeight: '700',
        marginBottom: 8,
    },
    detalle: {
        fontSize: 15,
        lineHeight: 21,
        marginBottom: 10,
    },
    lineas: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    contenedorFechas: {
        backgroundColor: 'rgba(0,0,0,0.03)',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    textoFecha: {
        fontSize: 13,
        marginVertical: 2,
    },
    gravedadContainer: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        backgroundColor: '#FFF3E0',
        marginBottom: 12,
    },
    gravedadTexto: {
        fontSize: 12,
        fontWeight: '700',
        color: '#E67E22',
    },
    contenedorBotones: {
        flexDirection: 'row',
        gap: 10,
    },
    botonAccion: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    botonMapa: {
        backgroundColor: '#1B6CA8',
    },
    botonVideo: {
        backgroundColor: '#8E44AD',
    },
    textoBoton: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    contenedorMapaMock: {
        marginTop: 12,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
    },
    etiquetaMapaMock: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#555',
        paddingVertical: 4,
        backgroundColor: '#eee',
    },
    imagenMapa: {
        width: '100%',
        height: 160,
    },
});