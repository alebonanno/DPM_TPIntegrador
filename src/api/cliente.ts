import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// 1. Creamos la instancia centralizada de Axios
export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL, // Ej: 'http://10.0.2.2:3000'
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// 2. Interceptor de peticiones: Se ejecuta ANTES de cada request
api.interceptors.request.use(
  async (config) => {
    try {
      // Leemos el token guardado de forma segura
      const token = await SecureStore.getItemAsync('userToken');
      
      // Si el token existe, lo adjuntamos en el encabezado con el formato Bearer
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error al adjuntar el token en el interceptor:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. (Opcional pero recomendado por la cátedra) Interceptor de respuestas para el 401
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401) {
      // Si el servidor responde un 401 (No autorizado / Token vencido), 
      // podemos limpiar la sesión o disparar el cierre de sesión automáticamente.
      SecureStore.deleteItemAsync('userToken');
    }
    return Promise.reject(error);
  }
);