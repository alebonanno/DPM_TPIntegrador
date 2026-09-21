import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Interruptor from '../../components/Interruptor';
import Selector from '../../components/Selector';
import { useFavoritos } from '../../src/contexto/FavoritosContexto';
import { useTema } from '../../src/contexto/TemaContexto';
import { obtenerLineaPorId } from '../../src/servicios/linea';
import { obtenerParadaPorId } from '../../src/servicios/parada';
import { obtenerUsuario } from '../../src/servicios/usuario';
import { colores } from '../../src/tema/colores';
import type { Linea } from '../../src/tipos/linea';
import type { Parada } from '../../src/tipos/parada';
import { Usuario } from '../../src/tipos/usuario';

export default function YoScreen() {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [lineasFavoritasDetalle, setLineasFavoritasDetalle] = useState<Linea[]>([]);
    const [paradasFavoritasDetalle, setParadasFavoritasDetalle] = useState<Parada[]>([]);

    const { tema, temaReal, cambiarTema } = useTema();
    const coloresActuales = colores[temaReal];

    // Extraemos las listas y funciones del contexto de favoritos
    const { lineasFavoritas, paradasFavoritas, toggleLineaFavorita, toggleParadaFavorita } = useFavoritos();

    // Cargar datos del usuario (nombre, email, tema, avisos)
    useEffect(() => {
        obtenerUsuario().then((datos) => {
            setUsuario(datos);
        });
    }, []);

    // Este useEffect se dispara cada vez que cambian tus favoritos en la app
    useEffect(() => {
        async function cargarDetallesFavoritos() {
            const lineas = await Promise.all(
                lineasFavoritas.map((id) => obtenerLineaPorId(id))
            );
            setLineasFavoritasDetalle(lineas.filter((l): l is Linea => l !== null));

            const paradas = await Promise.all(
                paradasFavoritas.map((id) => obtenerParadaPorId(id))
            );
            setParadasFavoritasDetalle(paradas.filter((p): p is Parada => p !== null));
        }

        cargarDetallesFavoritos();
    }, [lineasFavoritas, paradasFavoritas]);

    if (!usuario) {
        return (
            <View style={styles.container}>
                <Text>Cargando...</Text>
            </View>
        );
    }

    return (
        <View style={[
            styles.container,
            { backgroundColor: coloresActuales.fondo },
        ]}>
            <Text style={[
                styles.title,
                { color: coloresActuales.texto },
            ]}>Yo</Text>

            <View style={[
                styles.card,
                {
                    backgroundColor: coloresActuales.tarjeta,
                },
            ]}>
                <Text style={[
                    styles.nombre,
                    { color: coloresActuales.texto },
                ]}>{usuario.nombre}</Text>
                <Text style={[
                    styles.email,
                    { color: coloresActuales.textoSecundario },
                ]}>{usuario.email}</Text>
            </View>

            {/* SECCIÓN: Líneas favoritas */}
            <View style={styles.section}>
                <Text style={[
                    styles.sectionTitle,
                    { color: coloresActuales.texto },
                ]}>Líneas favoritas</Text>

                {lineasFavoritasDetalle.length > 0 ? (
                    lineasFavoritasDetalle.map((linea) => (
                        <View key={linea.id} style={styles.itemFavoritoRow}>
                            <Text style={[
                                styles.item,
                                { color: coloresActuales.texto, flex: 1 },
                            ]}>
                                Línea {linea.numero} - {linea.nombre}
                            </Text>
                            <TouchableOpacity onPress={() => toggleLineaFavorita(linea.id)}>
                                <Text style={{ fontSize: 20 }}>❤️</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <Text style={[styles.itemVacio, { color: coloresActuales.textoSecundario }]}>
                        No tenés líneas favoritas guardadas.
                    </Text>
                )}
            </View>

            {/* SECCIÓN: Paradas favoritas */}
            <View style={styles.section}>
                <Text style={[
                    styles.sectionTitle,
                    { color: coloresActuales.texto },
                ]}>Paradas favoritas</Text>

                {paradasFavoritasDetalle.length > 0 ? (
                    paradasFavoritasDetalle.map((parada) => (
                        <View key={parada.id} style={styles.itemFavoritoRow}>
                            <Text style={[
                                styles.item,
                                { color: coloresActuales.texto, flex: 1 },
                            ]}>
                                {parada.nombre}
                            </Text>
                            <TouchableOpacity onPress={() => toggleParadaFavorita(parada.id)}>
                                <Text style={{ fontSize: 20 }}>❤️</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <Text style={[styles.itemVacio, { color: coloresActuales.textoSecundario }]}>
                        No tenés paradas favoritas guardadas.
                    </Text>
                )}
            </View>

            <View style={styles.section}>
                <Text style={[
                    styles.sectionTitle,
                    { color: coloresActuales.texto },
                ]}>Avisos</Text>

                <Interruptor
                    valor={usuario.avisosActivos}
                    alCambiar={(nuevoValor) => {
                        setUsuario({
                            ...usuario,
                            avisosActivos: nuevoValor,
                        });
                    }}
                />
            </View>

            <View style={styles.section}>
                <Text style={[
                    styles.sectionTitle,
                    { color: coloresActuales.texto },
                ]}>Tema</Text>

                <Selector
                    valor={usuario.tema}
                    opciones={[
                        { valor: 'claro', etiqueta: 'Claro' },
                        { valor: 'oscuro', etiqueta: 'Oscuro' },
                        { valor: 'sistema', etiqueta: 'Sistema' },
                    ]}
                    alCambiar={(nuevoTema) => {
                        setUsuario({
                            ...usuario,
                            tema: nuevoTema as Usuario['tema'],
                        });
                        cambiarTema(nuevoTema as Usuario['tema']);
                    }}
                />
            </View>
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
        marginBottom: 20,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    card: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
    },
    nombre: {
        fontSize: 22,
        fontWeight: '700',
    },
    email: {
        fontSize: 16,
        marginTop: 4,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    itemFavoritoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    item: {
        fontSize: 16,
    },
    itemVacio: {
        fontSize: 14,
        fontStyle: 'italic',
    },
});