import * as SecureStore from 'expo-secure-store';
import { usuarioMock } from '../mocks/usuario';
import type { Usuario } from '../tipos/usuario';
import API_URL from './api';

/**
 * Obtiene los datos del perfil del usuario desde la API real
 * usando el Token guardado en SecureStore. Si ocurre algún error o no hay red,
 * devuelve los datos de mock como respaldo.
 */
export async function obtenerUsuario(): Promise<Usuario> {
    try {
        const token = await SecureStore.getItemAsync('userToken');

        const respuesta = await fetch(`${API_URL}/usuario`, {
            method: 'GET',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });

        const json = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(json.error?.mensaje || 'No se pudieron obtener los datos del usuario desde el servidor');
        }

        const datos: Usuario = json.datos || json;
        return datos;
    } catch (error) {
        console.warn('[ServicioUsuario] Sin conexión o error con la API. Usando datos mock de respaldo...', error);
        return usuarioMock;
    }
}