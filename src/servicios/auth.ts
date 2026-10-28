import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.1.2:3000';

export async function iniciarSesionAPI(email: string, password: string) {
    try {
        console.log('[ServicioAuth] Intentando iniciar sesión contra la API...');
        const respuesta = await fetch(`${API_URL}/auth/ingreso`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, contrasena: password }),
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.error?.mensaje || 'Correo o contraseña incorrectos');
        }

        // Extraemos correctamente del sobre "datos" que devuelve la API
        const token = resultado.datos?.token;
        const usuario = resultado.datos?.usuario;

        if (token) {
            await SecureStore.setItemAsync('userToken', token);
        }

        return { token, usuario };
    } catch (error: any) {
        console.error('Error al iniciar sesión en la API:', error);
        throw new Error(error.message || 'Correo o contraseña incorrectos');
    }
}

export async function cerrarSesionAPI() {
    try {
        await SecureStore.deleteItemAsync('userToken');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

export async function obtenerTokenGuardado() {
    try {
        return await SecureStore.getItemAsync('userToken');
    } catch (error) {
        console.error('Error al obtener el token guardado:', error);
        return null;
    }
}