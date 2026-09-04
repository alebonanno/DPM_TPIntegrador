import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { Parada } from '@/src/tipos/parada';
import { obtenerParadas } from '../../src/servicios/parada';

export default function ParadasScreen() {

    const [paradas, setParadas] = useState<Parada[]>([]);

    useEffect(() => {
        async function cargarParadas() {
            const datos = await obtenerParadas();
            setParadas(datos);
        }

        cargarParadas()
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Paradas</Text>

            <FlatList
                data={paradas}
                keyExtractor={(parada) => parada.id.toString()}
                renderItem={
                    ({ item: parada }) => (
                        <View style={styles.parada}>
                            <Text style={styles.nombre}>
                                {parada.nombre}
                            </Text>

                            <Text>
                                Paradas: {parada.id}
                            </Text>
                        </View>
                    )
                }
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
        backgroundColor: '#f1f1f1',
    },

    nombre: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
});