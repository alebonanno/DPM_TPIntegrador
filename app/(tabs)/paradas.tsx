import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { Parada } from '@/src/tipos/parada';
import { obtenerParadas } from '../../src/servicios/parada';
import { useLocalSearchParams } from 'expo-router';

import { useTema } from '@/src/contexto/TemaContexto';
import { colores } from '@/src/tema/colores';

export default function ParadasScreen() {
    const { lineaId } = useLocalSearchParams<{ lineaId?: string }>();

    const [paradas, setParadas] = useState<Parada[]>([]);
    const [filtroTexto, setFiltroTexto] = useState<string>('');
    const [lineaFiltro, setLineaFiltro] = useState<string | null>(null);

    const { temaReal } = useTema();
    const coloresActuales = colores[temaReal];

    useEffect(() => {
        async function cargarParadas() {
            const datos = await obtenerParadas();
            setParadas(datos);
        }

        cargarParadas();
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
            ]}>
                Paradas
            </Text>

            {lineaFiltro && (
                <View style={styles.badgeFiltroContainer}>
                    <Text style={[
                        styles.textoFiltro,
                        { color: coloresActuales.texto },
                    ]}>
                        Filtrado por línea:{' '}
                        <Text style={styles.lineaFiltroBold}>
                            {lineaFiltro}
                        </Text>
                    </Text>

                    <TouchableOpacity
                        onPress={() => setLineaFiltro(null)}
                        style={styles.botonQuitarFiltro}
                    >
                        <Text style={styles.textoQuitarFiltro}>
                            Ver todas
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <TextInput
                style={[
                    styles.buscadorInput,
                    {
                        backgroundColor: coloresActuales.tarjeta,
                        color: coloresActuales.texto,
                    },
                ]}
                placeholder="Buscar por nombre o calle..."
                value={filtroTexto}
                onChangeText={setFiltroTexto}
                placeholderTextColor={coloresActuales.textoSecundario}
            />

            <FlatList
                data={paradasFiltradas}
                keyExtractor={(parada) => parada.id}
                ListEmptyComponent={
                    <Text style={[
                        styles.sinResultados,
                        { color: coloresActuales.textoSecundario },
                    ]}>
                        No se encontraron paradas coincidentes.
                    </Text>
                }
                renderItem={({ item: parada }) => (
                    <View style={[
                        styles.parada,
                        { backgroundColor: coloresActuales.tarjeta },
                    ]}>
                        <Text style={[
                            styles.nombre,
                            { color: coloresActuales.texto },
                        ]}>
                            {parada.nombre}
                        </Text>

                        <Text style={[
                            styles.detalle,
                            { color: coloresActuales.textoItem },
                        ]}>
                            ID Parada: {parada.id}
                        </Text>

                        <Text style={[
                            styles.detalle,
                            { color: coloresActuales.textoItem },
                        ]}>
                            Líneas que pasan: {parada.lineaIds.join(', ')}
                        </Text>

                        <Text style={[
                            styles.detalle,
                            { color: coloresActuales.textoItem },
                        ]}>
                            Sentido: {parada.sentido.toUpperCase()}{' '}
                            {parada.refugio ? '• 🏣 Garita' : ''}
                        </Text>
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
    },

    nombre: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
    buscadorInput: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        fontSize: 16,
        marginBottom: 16,
    },
    badgeFiltroContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
});