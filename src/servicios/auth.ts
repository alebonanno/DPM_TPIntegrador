import * as SecureStore from 'expo-secure-store';
import { api } from '../api/cliente'; // 👈 Usamos el cliente centralizado de Axios

export async function iniciarSesionAPI(email: string, password: string) {
    try {
        // Petición POST con Axios (el body se pasa directamente como un objeto y se auto-convierte a JSON)
        const respuesta = await api.post('/auth/ingreso', { email, password });

        // Con Axios, la respuesta ya viene parseada en respuesta.data
        const datos = respuesta.data;
        const token = datos.token; 
        
        if (token) {
            // Guardamos el token usando expo-secure-store 
            await SecureStore.setItemAsync('userToken', token);
        }

        return datos; // Retorna los datos de la respuesta (token, usuario, etc.)
    } catch (error: any) {
        // Axios atrapa los errores HTTP (401, 500, etc.) en el catch gracias a su configuración
        if (error.response) {
            // El servidor contestó con un código de error (ej: 401 Credenciales inválidas)
            const mensajeError = error.response.data?.error?.mensaje || 'Correo o contraseña incorrectos';
            throw new Error(mensajeError);
        } else if (error.request) {
            // El request salió pero no hubo respuesta (servidor caído / sin red)
            throw new Error('No pudimos conectarnos con el servidor. Revisá tu conexión.');
        } else {
            // Error de configuración
            throw new Error(error.message || 'Error al intentar conectar con el servidor');
        }
    }
}

export async function cerrarSesionAPI() {
    await SecureStore.deleteItemAsync('userToken');
}

export async function obtenerTokenGuardado() {
    return await SecureStore.getItemAsync('userToken');
}