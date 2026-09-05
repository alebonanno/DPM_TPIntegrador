import { StyleSheet, View, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { obtenerUsuario } from '@/src/servicios/usuario';
import { obtenerLineaPorId } from '@/src/servicios/linea';
import { obtenerParadaPorId } from '@/src/servicios/parada';
import { Usuario } from '@/src/tipos/usuario';
import type { Linea } from '@/src/tipos/linea';
import type { Parada } from '@/src/tipos/parada';
import Interruptor from '@/components/Interruptor';
import Selector from '@/components/Selector';
import { useTema } from '@/src/contexto/TemaContexto';
import { colores } from '@/src/tema/colores';

export default function YoScreen() {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [lineasFavoritas, setLineasFavoritas] = useState<Linea[]>([]);
    const [paradasFavoritas, setParadasFavoritas] = useState<Parada[]>([]);
    const { tema, temaReal, cambiarTema } = useTema();
    const coloresActuales = colores[temaReal];

    useEffect(() => {
        obtenerUsuario().then((datos) => {
            setUsuario(datos);

            Promise.all(
                datos.lineasFavoritas.map((id) => obtenerLineaPorId(id))
            ).then((lineas) => {
                setLineasFavoritas(
                    lineas.filter((linea) => linea !== null)
                );
            });

            Promise.all(
                datos.paradasFavoritas.map((id) => obtenerParadaPorId(id))
            ).then((paradas) => {
                setParadasFavoritas(
                    paradas.filter((parada) => parada !== null)
                );
            });
        });
    }, []);

    if (!usuario) {
        return (
            <View style={styles.container}>
                <Text>Cargando...</Text>
            </View>
        )
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

            <View style={styles.section}>
                <Text style={[
                    styles.sectionTitle,
                    { color: coloresActuales.texto },
                ]}>Líneas favoritas</Text>

                {lineasFavoritas.map((linea) => (
                    <Text key={linea.id} style={[
                        styles.item,
                        { color: coloresActuales.textoItem },
                    ]}>
                        Línea {linea.numero} - {linea.nombre}
                    </Text>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={[
                    styles.sectionTitle,
                    { color: coloresActuales.textoItem },
                ]}>Paradas favoritas</Text>

                {paradasFavoritas.map((parada) => (
                    <Text key={parada.id} style={[
                        styles.item,
                        { color: coloresActuales.texto },
                    ]}>
                        {parada.nombre}
                    </Text>
                ))}
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

    item: {
        fontSize: 16,
    },
});