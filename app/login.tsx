import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTema } from '../src/contexto/TemaContexto';
import { iniciarSesionAPI } from '../src/servicios/auth';
import { colores } from '../src/tema/colores';

export default function LoginScreen() {
    const [email, setEmail] = useState('');//Almacena el correo electrónico o usuario que se va tipeando en el primer campo.
    const [password, setPassword] = useState('');//Almacena la contraseña ingresada en el segundo campo.
    const [cargando, setCargando] = useState(false);
    
    const { temaReal } = useTema();//sirve para saber si la app está procesando el inicio de sesión. Permite deshabilitar el botón y cambiar el texto a "Ingresando..." para evitar que el usuario toque el botón varias veces seguidas (evita doble envío).
    const coloresActuales = colores[temaReal];

    const handleLogin = async () => {//Si el usuario deja el correo o la contraseña en blanco, se frena la ejecución y se muestra una alerta nativa (Alert.alert).
        if (!email || !password) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        try {
            setCargando(true);
            // Llama al servicio de autenticación que configuramos antes (el cual valida contra el mock y guarda el token en SecureStore).
            await iniciarSesionAPI(email, password);

            // Si el servicio no da error (es decir, el correo es correcto), redirige al usuario hacia la pantalla principal con pestañas ((tabs)). Se usa replace en lugar de push para que el usuario no pueda volver a la pantalla de login presionando el botón "Atrás" del celular.
            router.replace('/(tabs)');
        } catch (error: any) {//Si el servicio falla (por ejemplo, si el correo no coincide con el mock), captura el error y muestra una alerta con el mensaje correspondiente.
            Alert.alert('Error de autenticación', error.message || 'No se pudo iniciar sesión');
        } finally {//Ocurra un éxito o un error, este bloque siempre se ejecuta al final para desactivar el estado de carga y rehabilitar el botón.
            setCargando(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: coloresActuales.fondo }]}>
            <Text style={[styles.title, { color: coloresActuales.texto }]}>
                Iniciar Sesión
            </Text>

            <TextInput
                style={[styles.input, { backgroundColor: coloresActuales.tarjeta, color: coloresActuales.texto }]}
                placeholder="Correo electrónico o usuario"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />

            <TextInput
                style={[styles.input, { backgroundColor: coloresActuales.tarjeta, color: coloresActuales.texto }]}
                placeholder="Contraseña"
                placeholderTextColor="#888"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity 
                style={[styles.botonLogin, cargando && { opacity: 0.7 }]} 
                onPress={handleLogin}
                disabled={cargando}
            >
                <Text style={styles.textoBoton}>
                    {cargando ? 'Ingresando...' : 'Ingresar'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 16,
        marginBottom: 16,
        fontSize: 16,
    },
    botonLogin: {
        backgroundColor: '#1B6CA8',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    textoBoton: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});