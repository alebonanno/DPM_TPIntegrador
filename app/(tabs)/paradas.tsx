import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Coordenadas } from '@/src/tipos/linea';
import { Parada } from '@/src/tipos/parada';
import FlechaDireccion from '../../src/componentes/FlechaDireccion';
import { obtenerParadas } from '../../src/servicios/parada';
import { abrirMapaNativo } from '../../src/servicios/ubicacion';

import { useTema } from '@/src/contexto/TemaContexto';
import { colores } from '@/src/tema/colores';

export default function ParadasScreen() {
    const { lineaId } = useLocalSearchParams<{ lineaId?: string }>();

    const [paradas, setParadas] = useState<Parada[]>([]);
    const [filtroTexto, setFiltroTexto] = useState<string>('');
    const [lineaFiltro, setLineaFiltro] = useState<string | null>(null);
    const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);

    const { temaReal } = useTema();
    const coloresActuales = colores[temaReal];

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

    // Actualiza el filtro de línea cuando cambia el parámetro de navegación
    useEffect(() => {
        if (lineaId) {
            setLineaFiltro(lineaId);
        }
    }, [lineaId]);

    // Aplicar ambos filtros (línea específica + búsqueda por texto)
    const paradasFiltradas = paradas.filter((parada) => {
        const coincideLinea = lineaFiltro ? parada.lineaIds.includes(lineaFiltro) : true;
        const coincideTexto = parada.nombre.toLowerCase().includes(filtroTexto.toLowerCase());
        return coincideLinea && coincideTexto;
    });

    return (
        <View style={[
            styles.container,
            { backgroundColor: coloresActuales.fondo },
        ]}>
            <Text style={[
                styles.title,
                { color: coloresActuales.texto },
            ]}>Paradas</Text>

            {/* Indicador de filtro por línea activa */}
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

            {/* Buscador de paradas */}
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
                ListEmptyComponent={
                    <Text style={styles.sinResultados}>No se encontraron paradas coincidentes.</Text>
                }
                renderItem={({ item: parada }) => (
                    <View style={[
                        styles.parada,
                        { backgroundColor: coloresActuales.tarjeta },
                    ]}>
                        <Text style={styles.nombre}>{parada.nombre}</Text>

                        <Text style={styles.detalle}>ID Parada: {parada.id}</Text>

                        <Text style={styles.detalle}>
                            Líneas que pasan: {parada.lineaIds.join(', ')}
                        </Text>

                        <Text style={styles.detalle}>
                            Sentido: {parada.sentido.toUpperCase()} {parada.refugio ? '• 🏣 Garita' : ''}
                        </Text>

                        {/* Indicador de flecha magnética y distancia */}
                        <FlechaDireccion
                            ubicacionUsuario={ubicacion}
                            coordenadasParada={parada.coordenadas}
                        />

                        {/* Botón directo para abrir app de mapas externa */}
                        <TouchableOpacity
                            style={styles.botonCaminar}
                            onPress={() => abrirMapaNativo(parada.coordenadas, parada.nombre)}
                        >
                            <Text style={styles.textoBoton}>📍 Cómo llegar caminando</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#F5F7FA',
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
        marginBottom: 10,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    parada: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    nombre: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
        color: '#1B6CA8',
    },
    buscadorInput: {
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DDD',
        fontSize: 16,
        marginBottom: 16,
    },
    badgeFiltroContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E3F2FD',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    textoFiltro: {
        fontSize: 14,
        color: '#0D47A1',
    },
    lineaFiltroBold: {
        fontWeight: 'bold',
    },
    botonQuitarFiltro: {
        backgroundColor: '#1976D2',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    textoQuitarFiltro: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    detalle: {
        fontSize: 14,
        color: '#555',
        marginTop: 2,
    },
    sinResultados: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#777',
    },
    botonCaminar: {
        backgroundColor: '#1B6CA8',
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    textoBoton: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
});