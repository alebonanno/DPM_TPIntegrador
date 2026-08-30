import { StyleSheet, Text, View } from 'react-native';

export default function LineasScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lineas</Text>
            <Text>Aca aparecen las 14 Lineas</Text>
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
        marginBottom: 10
    },
});