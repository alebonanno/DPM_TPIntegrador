import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';

interface Opcion {
    valor: string;
    etiqueta: string;
}

interface SelectorProps {
    valor: string;
    opciones: Opcion[];
    alCambiar: (valor: string) => void;
}

export default function Selector({
    valor,
    opciones,
    alCambiar,
}: SelectorProps) {
    const [abierto, setAbierto] = useState(false);

    const opcionActual = opciones.find(
        (opcion) => opcion.valor === valor
    );

    return (
        <View>
            <Pressable
                style={styles.selector}
                onPress={() => setAbierto(!abierto)}
            >
                <Text style={styles.texto}>
                    {opcionActual?.etiqueta ?? valor}
                </Text>

                <Text>▼</Text>
            </Pressable>

            {abierto && (
                <View style={styles.menu}>
                    {opciones.map((opcion) => (
                        <Pressable
                            key={opcion.valor}
                            style={styles.opcion}
                            onPress={() => {
                                alCambiar(opcion.valor);
                                setAbierto(false);
                            }}
                        >
                            <Text>{opcion.etiqueta}</Text>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    selector: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    texto: {
        fontSize: 16,
    },

    menu: {
        backgroundColor: '#FFFFFF',
        marginTop: 5,
        borderRadius: 10,
        overflow: 'hidden',
    },

    opcion: {
        padding: 15,
    },
});