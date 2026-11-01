import * as SecureStore from 'expo-secure-store';
import { Usuario } from '../tipos/usuario';

const API_URL = 'https://api-transporte-publico-kwtl.onrender.com';

export async function obtenerUsuario(): Promise<Usuario | null> {
    try {
        // Obtenemos el token que guardamos previamente en SecureStore durante el login
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) return null;

        console.log('[ServicioUsuario] Consultando perfil de usuario a la API...');
        // Cambiado de /usuario a /yo según el contrato de la API
        const respuesta = await fetch(`${API_URL}/yo`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!respuesta.ok) {
            throw new Error('No se pudieron obtener los datos del usuario desde el servidor');
        }

        const resultado = await respuesta.json();
        // Extraemos el objeto usuario del envoltorio "datos" de tu API
        const usuario: Usuario = resultado.datos; 
        return usuario;
    } catch (error) {
        console.error('Error en el servicio de usuario:', error);
        return null;
    }
}