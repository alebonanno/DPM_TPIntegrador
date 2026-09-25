import * as SecureStore from 'expo-secure-store';
import { usuarioMock } from '../mocks/usuario'; // Ajusta la ruta relativa si es necesario según dónde tengas tu archivo auth.ts

export async function iniciarSesionAPI(email: string, password: string) {
    // Simulamos la API usando los datos del mock
    if (email === usuarioMock.email && password === usuarioMock.password) {
        const token = 'mock-token-' + usuarioMock.id;
        await SecureStore.setItemAsync('userToken', token);
        return { token, usuario: usuarioMock };
    } else {
        throw new Error('Correo o contraseña incorrectos');
    }
}

export async function cerrarSesionAPI() {
    await SecureStore.deleteItemAsync('userToken');
}

export async function obtenerTokenGuardado() {
    return await SecureStore.getItemAsync('userToken');
}