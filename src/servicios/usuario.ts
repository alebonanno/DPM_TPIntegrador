import { usuarioMock } from '../mocks/usuario';

export async function obtenerUsuario() {
  return usuarioMock;
}
//import * as SecureStore from 'expo-secure-store';
// import type { Usuario } from '../tipos/usuario';

// export async function obtenerUsuario(): Promise<Usuario> {
//     try {
//         // Obtenemos el token que guardamos previamente en SecureStore durante el login
//         const token = await SecureStore.getItemAsync('userToken');

//         const respuesta = await fetch('https://tu-api-real.com/api/usuario', {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json',
//             },
//         });

//         if (!respuesta.ok) {
//             throw new Error('No se pudieron obtener los datos del usuario desde el servidor');
//         }

//         const datos: Usuario = await respuesta.json();
//         return datos;
//     } catch (error) {
//         console.error('Error en el servicio de usuario:', error);
//         throw error;
//     }
// }