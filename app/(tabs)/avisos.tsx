import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { Aviso } from '@/src/tipos/aviso';
import { obtenerAvisos } from '../../src/servicios/aviso';

export default function AvisosScreen() {

    const [Avisos, setAvisos] = useState<Aviso[]>([]);

    useEffect(() => {
        async function cargarAvisos() {
            const datos = await obtenerAvisos();
            setAvisos(datos);
        }

        cargarAvisos();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Avisos
            </Text>

            <FlatList
                data={Avisos}
                keyExtractor={(aviso) => aviso.id.toString()}
                renderItem={
                    ({ item: aviso }) => (
                        <View style={styles.parada}>
                            <Text style={styles.tituloAviso}>
                                {aviso.titulo}
                            </Text>

                            <text>
                                {aviso.detalle}
                            </text>

                            <Text>
                                Lineas comprometidas: {aviso.id}
                            </Text>

                            <Text>
                                Desde: {aviso.desde} - 
                                Hasta: {aviso.hasta}
                            </Text>

                            <Text>
                                Gravedad: {aviso.gravedad}
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

    tituloAviso: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
});