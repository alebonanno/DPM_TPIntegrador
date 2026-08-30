import { StyleSheet, View, Text } from 'react-native';

export default function ParadasScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Paradas</Text>
            <Text>Aca aparecen todas las paredas</Text>
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
    },
});