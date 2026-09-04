import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, Stack, router } from 'expo-router'

import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import MapView, {
    Marker,
    Polyline,
} from 'react-native-maps';

import {
    Linea,
    Coordenadas,
} from '@/src/tipos/linea';

import { Parada } from '@/src/tipos/parada';

import { obtenerLineaPorId } from '@/src/servicios/linea';
import { obtenerParadas } from '@/src/servicios/parada';

export default function LineaMapaScreen() {
    const { id } =
        useLocalSearchParams<{ id: string }>();

    const mapRef = useRef<MapView>(null);

    const [linea, setLinea] =
        useState<Linea | null>(null);

    const [paradas, setParadas] =
        useState<Parada[]>([]);

    const [paradaSeleccionada, setParadaSeleccionada] =
        useState<Parada | null>(null);

    const [cargando, setCargando] =
        useState(true);

    useEffect(() => {
        async function cargarDatos() {
            if (!id) return;

            try {
                const lineaEncontrada =
                    await obtenerLineaPorId(id);

                const todasLasParadas =
                    await obtenerParadas();

                setLinea(lineaEncontrada);

                if (lineaEncontrada) {
                    const idsParadas = new Set(
                        lineaEncontrada.recorridos.flatMap(
                            (recorrido) =>
                                recorrido.paradaIds
                        )
                    );

                    const paradasDeLaLinea =
                        todasLasParadas.filter(
                            (parada) =>
                                idsParadas.has(parada.id)
                        );

                    setParadas(paradasDeLaLinea);
                }
            } finally {
                setCargando(false);
            }
        }

        cargarDatos();
    }, [id]);

    if (cargando) {
        return (
            <View style={styles.cargando}>
                <ActivityIndicator size="large" />

                <Text>
                    Cargando recorrido...
                </Text>
            </View>
        );
    }

    if (!linea) {
        return (
            <View style={styles.cargando}>
                <Text>
                    No se encontró la línea.
                </Text>
            </View>
        );
    }

    const recorridoIda =
        linea.recorridos.find(
            (recorrido) =>
                recorrido.sentido === 'ida'
        );

    const recorridoVuelta =
        linea.recorridos.find(
            (recorrido) =>
                recorrido.sentido === 'vuelta'
        );

    if (!recorridoIda || !recorridoVuelta) {
        return (
            <View style={styles.cargando}>
                <Text>
                    La línea no tiene ambos sentidos.
                </Text>
            </View>
        );
    }

    const coordenadasIda =
        convertirCoordenadas(
            recorridoIda.trazado
        );

    const coordenadasVuelta =
        convertirCoordenadas(
            recorridoVuelta.trazado
        );

    const todasLasCoordenadas = [
        ...coordenadasIda,
        ...coordenadasVuelta,
    ];

    const puntoInicial = coordenadasIda[0];

    if (!puntoInicial) {
        return (
            <View style={styles.cargando}>
                <Text>
                    No hay coordenadas para mostrar.
                </Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            <View style={styles.container}>

                {/* HEADER */}

                <View style={styles.header}>

                    <Pressable
                        style={styles.botonVolver}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.flecha}>
                            ←
                        </Text>
                    </Pressable>

                    <View
                        style={[
                            styles.colorLinea,
                            {
                                backgroundColor:
                                    linea.color,
                            },
                        ]}
                    />

                    <View style={styles.headerTexto}>

                        <Text style={styles.numero}>
                            Línea {linea.numero}
                        </Text>

                        <Text style={styles.nombre}>
                            {linea.nombre}
                        </Text>

                        <Text style={styles.empresa}>
                            {linea.empresa}
                        </Text>

                        <Text
                            style={[
                                styles.estado,
                                {
                                    color: linea.activa
                                        ? '#2E7D32'
                                        : '#C62828',
                                },
                            ]}
                        >
                            {linea.activa
                                ? '🟢 Funcionando normalmente'
                                : '🔴 Fuera de servicio'}
                        </Text>

                    </View>

                </View>

                {/* MAPA */}

                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude:
                            puntoInicial.latitude,

                        longitude:
                            puntoInicial.longitude,

                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                    }}
                    onMapReady={() => {
                        mapRef.current?.fitToCoordinates(
                            todasLasCoordenadas,
                            {
                                edgePadding: {
                                    top: 70,
                                    right: 50,
                                    bottom: 70,
                                    left: 50,
                                },
                                animated: false,
                            }
                        );
                    }}
                    onPress={() =>
                        setParadaSeleccionada(null)
                    }
                >

                    {/* IDA */}

                    <Polyline
                        coordinates={
                            coordenadasIda
                        }
                        strokeColor={
                            linea.color
                        }
                        strokeWidth={6}
                    />

                    {/* VUELTA */}

                    <Polyline
                        coordinates={
                            coordenadasVuelta
                        }
                        strokeColor="#555555"
                        strokeWidth={5}
                    />

                    {/* PARADAS */}

                    {paradas.map((parada) => {

                        const estaEnIda =
                            recorridoIda.paradaIds.includes(
                                parada.id
                            );

                        const estaEnVuelta =
                            recorridoVuelta.paradaIds.includes(
                                parada.id
                            );

                        if (
                            !estaEnIda &&
                            !estaEnVuelta
                        ) {
                            return null;
                        }

                        const color =
                            parada.sentido === 'ida'
                                ? linea.color
                                : '#555555';

                        return (
                            <Marker
                                key={parada.id}
                                coordinate={{
                                    latitude:
                                        parada.coordenadas
                                            .latitud,

                                    longitude:
                                        parada.coordenadas
                                            .longitud,
                                }}
                                onPress={(evento) => {
                                    evento.stopPropagation();
                                    setParadaSeleccionada(
                                        parada
                                    );
                                }}
                            >
                                <View
                                    style={[
                                        styles.marker,
                                        {
                                            borderColor:
                                                color,
                                        },
                                    ]}
                                >
                                    <Text>
                                        🚏
                                    </Text>
                                </View>
                            </Marker>
                        );
                    })}

                </MapView>

                {/* TARJETA DE PARADA */}

                {paradaSeleccionada && (
                    <View style={styles.tarjeta}>

                        <View style={styles.tarjetaTitulo}>

                            <Text style={styles.icono}>
                                🚏
                            </Text>

                            <View style={styles.tarjetaTexto}>

                                <Text style={styles.paradaNombre}>
                                    {paradaSeleccionada.nombre}
                                </Text>

                                <Text style={styles.paradaSentido}>
                                    {paradaSeleccionada.sentido === 'ida'
                                        ? `➡️ Ida · ${recorridoIda.destino}`
                                        : `⬅️ Vuelta · ${recorridoVuelta.destino}`}
                                </Text>

                            </View>

                            <Pressable
                                onPress={() =>
                                    setParadaSeleccionada(null)
                                }
                            >
                                <Text style={styles.cerrar}>
                                    ✕
                                </Text>
                            </Pressable>

                        </View>

                        <View style={styles.info}>

                            <Text>
                                {paradaSeleccionada.refugio
                                    ? '🛖 Tiene refugio'
                                    : '🚏 Sin refugio'}
                            </Text>

                            {paradaSeleccionada.codigoQr && (
                                <>
                                    <View style={styles.qrBox}>

                                        <Text style={styles.qrIcon}>
                                            ▣
                                        </Text>

                                        <View>
                                            <Text style={styles.qrTitulo}>
                                                Código QR
                                            </Text>

                                            <Text style={styles.qrCodigo}>
                                                {paradaSeleccionada.codigoQr}
                                            </Text>
                                        </View>

                                    </View>

                                    <Pressable
                                        style={styles.botonQr}
                                        onPress={() => {
                                            console.log(
                                                'Escanear QR de:',
                                                paradaSeleccionada.codigoQr
                                            );
                                        }}
                                    >
                                        <Text style={styles.botonQrTexto}>
                                            📷 Escanear QR
                                        </Text>
                                    </Pressable>
                                </>
                            )}

                            {!paradaSeleccionada.codigoQr && (
                                <Text style={styles.sinQr}>
                                    Esta parada no tiene código QR.
                                </Text>
                            )}

                        </View>

                    </View>
                )}

                {/* LEYENDA */}

                {!paradaSeleccionada && (
                    <View style={styles.leyenda}>

                        <View
                            style={
                                styles.leyendaItem
                            }
                        >
                            <View
                                style={[
                                    styles.lineaLeyenda,
                                    {
                                        backgroundColor:
                                            linea.color,
                                    },
                                ]}
                            />

                            <Text>
                                Ida →{' '}
                                {
                                    recorridoIda.destino
                                }
                            </Text>
                        </View>

                        <View
                            style={
                                styles.leyendaItem
                            }
                        >
                            <View
                                style={[
                                    styles.lineaLeyenda,
                                    {
                                        backgroundColor:
                                            '#555555',
                                    },
                                ]}
                            />

                            <Text>
                                Vuelta →{' '}
                                {
                                    recorridoVuelta.destino
                                }
                            </Text>
                        </View>

                        <Text style={styles.instruccion}>
                            Tocá una parada para ver
                            información.
                        </Text>

                    </View>
                )}

            </View >
        </>
    );
}

function convertirCoordenadas(
    coordenadas: Coordenadas[]
) {
    return coordenadas.map(
        (coordenada) => ({
            latitude:
                coordenada.latitud,

            longitude:
                coordenada.longitud,
        })
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },

    cargando: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        backgroundColor: '#FFFFFF',
    },

    colorLinea: {
        width: 8,
        height: 60,
        borderRadius: 4,
        marginRight: 12,
    },

    headerTexto: {
        flex: 1,
    },

    numero: {
        fontSize: 22,
        fontWeight: '700',
    },

    nombre: {
        fontSize: 15,
        color: '#555',
        marginTop: 3,
    },

    empresa: {
        fontSize: 13,
        color: '#888',
        marginTop: 3,
    },

    map: {
        flex: 1,
    },

    marker: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },

    tarjeta: {
        position: 'absolute',
        left: 15,
        right: 15,
        bottom: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,

        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 3,
        },

        elevation: 5,
    },

    tarjetaTitulo: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    icono: {
        fontSize: 28,
        marginRight: 10,
    },

    tarjetaTexto: {
        flex: 1,
    },

    paradaNombre: {
        fontSize: 18,
        fontWeight: '700',
    },

    paradaSentido: {
        fontSize: 14,
        color: '#555',
        marginTop: 3,
    },

    cerrar: {
        fontSize: 20,
        color: '#777',
        padding: 5,
    },

    info: {
        marginTop: 12,
        gap: 6,
    },

    leyenda: {
        padding: 14,
        paddingBottom: 35,
        backgroundColor: '#FFFFFF',
    },

    leyendaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },

    lineaLeyenda: {
        width: 35,
        height: 5,
        borderRadius: 3,
        marginRight: 10,
    },

    instruccion: {
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 15,
        color: '#777',
        fontSize: 13,
    },
    qrBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginTop: 8,
        borderRadius: 10,
        backgroundColor: '#F1F4F7',
    },

    qrIcon: {
        fontSize: 35,
        marginRight: 12,
    },

    qrTitulo: {
        fontSize: 14,
        fontWeight: '700',
    },

    qrCodigo: {
        fontSize: 12,
        color: '#666',
        marginTop: 3,
    },

    botonQr: {
        marginTop: 10,
        padding: 13,
        borderRadius: 10,
        backgroundColor: '#1B6CA8',
        alignItems: 'center',
    },

    botonQrTexto: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    sinQr: {
        marginTop: 10,
        color: '#888',
    },
    botonVolver: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        marginTop: 14,
        backgroundColor: '#08fc59',
    },

    flecha: {
        fontSize: 32,
        color: '#333',
        lineHeight: 34,
        marginTop: -14,
    },
    estado: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 5,
    },
});
