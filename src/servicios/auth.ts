import * as SecureStore from 'expo-secure-store';
import API_URL from './api'; // Importa la URL base desde tu api.js en la misma carpeta

export async function iniciarSesionAPI(email: string, password: string) {
    try {
        const respuesta = await fetch(`${API_URL}/auth/ingreso`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const datos = await respuesta.json();

        // Si la respuesta no es exitosa (ej. 401 CREDENCIALES_INVALIDAS)
        if (!respuesta.ok) {
            // La cátedra devuelve los errores con la estructura: { error: { codigo, mensaje } }
            const mensajeError = datos.error?.mensaje || 'Correo o contraseña incorrectos';
            throw new Error(mensajeError);
        }

        // El backend devuelve el token (según especificaciones de la cátedra)
        const token = datos.token; 
        
        if (token) {
            // Guardamos el token usando expo-secure-store como exige la cátedra
            await SecureStore.setItemAsync('userToken', token);
        }

        return datos; // Retorna los datos de la respuesta (token, usuario, etc.)
    } catch (error: any) {
        throw new Error(error.message || 'Error de red al intentar conectar con el servidor');
    }
}

export async function cerrarSesionAPI() {
    await SecureStore.deleteItemAsync('userToken');
}

export async function obtenerTokenGuardado() {
    return await SecureStore.getItemAsync('userToken');
}