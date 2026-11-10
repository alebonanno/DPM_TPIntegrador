
import * as SecureStore from 'expo-secure-store';
import { Usuario } from '../tipos/usuario';
import { api } from '../api/cliente';

export async function obtenerUsuario(): Promise<Usuario | null> {
    try {
        // Obtenemos el token guardado durante el login
        const token = await SecureStore.getItemAsync('userToken');

        if (!token) return null;

        console.log('[ServicioUsuario] Consultando perfil de usuario a la API...');

        const respuesta = await api.get('/yo', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Extraemos el usuario del envoltorio "datos"
        const usuario: Usuario = respuesta.data.datos;

        return usuario;

    } catch (error) {
        console.error('Error en el servicio de usuario:', error);
        return null;
    }
}
