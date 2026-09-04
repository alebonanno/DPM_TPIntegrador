import { StyleSheet, Text, View, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { Linea } from '@/src/tipos/linea';
import { obtenerLineas } from '../../src/servicios/linea';


export default function LineasScreen() {

    const [lineas, setLineas] = useState<Linea[]>([]);

    useEffect(() => {
        async function cargarLineas() {
            const datos = await obtenerLineas();
            setLineas(datos);
        }

        cargarLineas();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lineas</Text>
            <Text style={styles.subtitulo}>Aca aparecen las 14 Lineas</Text>

            <FlatList
                data={lineas}
                keyExtractor={(linea) => linea.id.toString()}
                renderItem={
                    ({ item: linea }) => (
                        <View style={styles.parada}>
                            <Text style={styles.nombre}>
                                {linea.nombre}
                            </Text>

                            <Text>
                                Líneas: {linea.id}
                            </Text>
                        </View>
                    )
                }
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
});