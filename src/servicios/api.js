// Este archivo lee la variable de entorno que definimos
const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.warn('⚠️ ADVERTENCIA: EXPO_PUBLIC_API_URL no está definida en el .env');
}

export default API_URL;