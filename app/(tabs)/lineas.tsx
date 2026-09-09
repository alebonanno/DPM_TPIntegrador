import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { obtenerLineas } from '../../src/servicios/linea';
import { Linea } from '../../src/tipos/linea';

import { useTema } from '../../src/contexto/TemaContexto';
import { colores } from '../../src/tema/colores';

export default function LineasScreen() {

    const [lineas, setLineas] = useState<Linea[]>([]);
    const { temaReal } = useTema();
    const coloresActuales = colores[temaReal];

    useEffect(() => {
        async function cargarLineas() {
            const datos = await obtenerLineas();
            setLineas(datos);
        }

        cargarLineas();
    }, []);

    return (
        <View style={[
            styles.container,
            { backgroundColor: coloresActuales.fondo },
        ]}>
            <Text style={[
                styles.title,
                { color: coloresActuales.texto },
            ]}>
                Lineas
            </Text>

            <Text style={[
                styles.subtitulo,
                { color: coloresActuales.texto },
            ]}>
                Aca aparecen las 14 Lineas
            </Text>

            <FlatList
                data={lineas}
                keyExtractor={(linea) => linea.id.toString()}
                renderItem={({ item: linea }) => (
                    <Pressable
                        style={[
                            styles.parada,
                            { backgroundColor: coloresActuales.tarjeta },
                        ]}
                        onPress={() => router.push(`/lineas/${linea.id}`)}
                    >
                        <Text style={[
                            styles.nombre,
                            { color: coloresActuales.texto },
                        ]}>
                            {linea.nombre}
                        </Text>

                        <Text style={{ color: coloresActuales.textoItem }}>
                            Línea: {linea.id}
                        </Text>

                        <Text style={{ color: coloresActuales.textoItem }}>
                            Empresa: {linea.empresa}
                        </Text>

                        <Text style={linea.activa ? styles.activa : styles.inactiva}>
                            {linea.activa
                                ? '🟢 Funcionando normalmente'
                                : '🔴 Fuera de servicio'}
                        </Text>
                    </Pressable>
                )}
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
        backgroundColor: '#F5F7FA'
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
    parada: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        backgroundColor: '#f1f1f1',
    },

    nombre: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
    activa: {
        color: '#2E7D32',
        fontWeight: '600',
        marginTop: 6,
    },

    inactiva: {
        color: '#C62828',
        fontWeight: '600',
        marginTop: 6,
    },
});