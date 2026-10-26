import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTema } from '../src/contexto/TemaContexto';
import { iniciarSesionAPI } from '../src/servicios/auth';
import { colores } from '../src/tema/colores';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false);
        
    const { temaReal } = useTema();
    const coloresActuales = colores[temaReal];

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        try {
            setCargando(true);
            await iniciarSesionAPI(email, password);
            // Si el login es exitoso, volvemos a las solapas principales
            router.replace('/(tabs)/' as any);
        } catch (error) {
            Alert.alert('Error', 'Credenciales inválidas');
        } finally {
            setCargando(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: coloresActuales.fondo }]}>
            <View style={styles.card}>
                <Text style={styles.titulo}>Iniciar Sesión</Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    placeholderTextColor="#888"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />
                
                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    placeholderTextColor="#888"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity 
                    style={styles.botonIngresar} 
                    onPress={handleLogin}
                    disabled={cargando}
                >
                    <Text style={styles.textoBoton}>
                        {cargando ? 'Ingresando...' : 'Ingresar'}
                    </Text>
                </TouchableOpacity>

                {/* BOTÓN PARA VOLVER COMO INVITADO */}
                <TouchableOpacity 
                    style={styles.botonInvitado} 
                    onPress={() => router.replace('/(tabs)/' as any)}
                >
                    <Text style={styles.textoBotonInvitado}>Continuar como invitado ➔</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1B6CA8',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 12,
        backgroundColor: '#f9f9f9',
    },
    botonIngresar: {
        backgroundColor: '#1B6CA8',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    textoBoton: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    botonInvitado: {
        marginTop: 15,
        alignItems: 'center',
        padding: 8,
    },
    textoBotonInvitado: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '600',
    },
});