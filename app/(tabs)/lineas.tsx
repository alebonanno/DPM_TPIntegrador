import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { obtenerLineas } from '../../src/servicios/linea';
import { Linea } from '../../src/tipos/linea';

import { useFavoritos } from '../../src/contexto/FavoritosContexto'; // <-- 1. Importar el contexto global
import { useTema } from '../../src/contexto/TemaContexto';
import { colores } from '../../src/tema/colores';

export default function LineasScreen() {
    const [lineas, setLineas] = useState<Linea[]>([]);
    const { temaReal } = useTema();
    const coloresActuales = colores[temaReal];

    // 2. Extraer las líneas favoritas y la función para alternarlas
    const { lineasFavoritas, toggleLineaFavorita } = useFavoritos();

    useEffect(() => {
        async function cargarLineas() {
            const datos = await obtenerLineas();
            setLineas(datos);
        }

        cargarLineas();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: coloresActuales.fondo }]}>
            <Text style={[styles.title, { color: coloresActuales.texto }]}>
                Lineas
            </Text>

            <Text style={[styles.subtitulo, { color: coloresActuales.texto }]}>
                Aca aparecen las 14 Lineas
            </Text>

            <FlatList
                data={lineas}
                keyExtractor={(linea) => linea.id.toString()}
                renderItem={({ item: linea }) => {
                    const esFavorita = lineasFavoritas.includes(linea.id);

                    return (
                        <View style={[styles.tarjetaLinea, { backgroundColor: coloresActuales.tarjeta }]}>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.nombre, { color: coloresActuales.texto, flex: 1 }]}>
                                    {linea.nombre}
                                </Text>

                                <TouchableOpacity
                                    onPress={() => toggleLineaFavorita(linea.id)}
                                    style={styles.botonCorazon}
                                >
                                    <Text style={{ fontSize: 22 }}>
                                        {esFavorita ? '❤️' : '🤍'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={{ color: coloresActuales.textoItem }}>
                                Línea: {linea.id}
                            </Text>

                            <Text style={{ color: coloresActuales.textoItem }}>
                                Empresa: {linea.empresa}
                            </Text>

                            <Text style={{ color: coloresActuales.textoItem }}>
                                Color: <Text style={{ color: linea.color }}>●</Text>
                            </Text>

                            <Text style={linea.activa ? styles.activa : styles.inactiva}>
                                {linea.activa
                                    ? '🟢 Funcionando normalmente'
                                    : '🔴 Fuera de servicio'}
                            </Text>

                            <View style={styles.contenedorBotones}>
                                <TouchableOpacity
                                    style={styles.botonMapa}
                                    onPress={() => router.push(`/lineas/${linea.id}`)}
                                >
                                    <Text style={styles.textoBoton}>📍 Ver en el mapa</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.botonAvisos}
                                    onPress={() => {
                                        router.push({
                                            pathname: '/(tabs)/avisos',
                                            params: { lineaFiltro: linea.id }
                                        });
                                    }}
                                >
                                    <Text style={styles.textoBoton}>📢 Avisos</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
}

// Estilos
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
    subtitulo: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 16,
    },
    tarjetaLinea: {
        padding: 16,
        marginBottom: 14,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    botonCorazon: {
        padding: 4,
    },
    nombre: {
        fontSize: 18,
        fontWeight: '600',
    },
    activa: {
        color: '#2E7D32',
        fontWeight: '600',
        marginTop: 6,
        marginBottom: 10,
    },
    inactiva: {
        color: '#C62828',
        fontWeight: '600',
        marginTop: 6,
        marginBottom: 10,
    },
    contenedorBotones: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    botonMapa: {
        flex: 1,
        backgroundColor: '#1B6CA8',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 6,
    },
    botonAvisos: {
        flex: 1,
        backgroundColor: '#E67E22',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginLeft: 6,
    },
    textoBoton: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 13,
    },
});