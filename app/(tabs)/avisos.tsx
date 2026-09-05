import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { Aviso } from '@/src/tipos/aviso';
import { obtenerAvisos } from '../../src/servicios/aviso';

import { useTema } from '@/src/contexto/TemaContexto';
import { colores } from '@/src/tema/colores';

export default function AvisosScreen() {

    const [Avisos, setAvisos] = useState<Aviso[]>([]);
    const { temaReal } = useTema();
    const coloresActuales = colores[temaReal];

    useEffect(() => {
        async function cargarAvisos() {
            const datos = await obtenerAvisos();
            setAvisos(datos);
        }

        cargarAvisos();
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
                Avisos
            </Text>

            <FlatList
                data={Avisos}
                keyExtractor={(aviso) => aviso.id.toString()}
                renderItem={({ item: aviso }) => (
                    <View style={[
                        styles.parada,
                        { backgroundColor: coloresActuales.tarjeta },
                    ]}>
                        <Text style={[
                            styles.tituloAviso,
                            { color: coloresActuales.texto },
                        ]}>
                            {aviso.titulo}
                        </Text>

                        <Text style={[
                            styles.detalle,
                            { color: coloresActuales.textoItem },
                        ]}>
                            {aviso.detalle}
                        </Text>

                        <Text style={[
                            styles.lineas,
                            { color: coloresActuales.textoItem },
                        ]}>
                            Lineas comprometidas: {aviso.id}
                        </Text>

                        <Text style={[
                            styles.fecha,
                            { color: coloresActuales.textoSecundario },
                        ]}>
                            Desde: {aviso.desde} - Hasta: {aviso.hasta}
                        </Text>

                        <View style={styles.gravedad}>
                            <Text style={styles.gravedadTexto}>
                                Gravedad: {aviso.gravedad}
                            </Text>
                        </View>
                    </View>
                )}
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
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 20,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },

    parada: {
        padding: 18,
        marginBottom: 14,
        borderRadius: 18,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,

        elevation: 3,
    },

    tituloAviso: {
        fontSize: 19,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
    },

    detalle: {
        fontSize: 15,
        lineHeight: 21,
        color: '#555555',
        marginBottom: 14,
    },

    lineas: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 8,
    },

    fecha: {
        fontSize: 13,
        color: '#777777',
        marginBottom: 8,
    },

    gravedad: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        backgroundColor: '#FFF3E0',
    },

    gravedadTexto: {
        fontSize: 12,
        fontWeight: '700',
        color: '#E67E22',
    },
});