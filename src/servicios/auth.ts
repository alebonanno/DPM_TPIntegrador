
import * as SecureStore from 'expo-secure-store';
import { api } from '../api/cliente';

export async function iniciarSesionAPI(email: string, password: string) {
    try {
        console.log('[ServicioAuth] Intentando iniciar sesión contra la API...');

        const respuesta = await api.post('/auth/ingreso', {
            email,
            contrasena: password,
        });

        const resultado = respuesta.data;

        // Extraemos los datos que devuelve la API
        const token = resultado.datos?.token;
        const usuario = resultado.datos?.usuario;

        if (token) {
            await SecureStore.setItemAsync('userToken', token);
        }

        return { token, usuario };

    } catch (error: any) {
        console.error('Error al iniciar sesión en la API:', error);

        const mensaje = error.response?.data?.error?.mensaje
            || error.message
            || 'Correo o contraseña incorrectos';

        throw new Error(mensaje);
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
