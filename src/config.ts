const IP_COMPUTADORA = '192.168.1.45'; 

export const API_URL = __DEV__ 
  ? `http://${IP_COMPUTADORA}:3000`
  : 'https://tu-api-en-produccion.com';