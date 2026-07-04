import axios from 'axios';

export const authApi = axios.create({ baseURL: process.env.EXPO_PUBLIC_AUTH_URL || 'http://localhost:3001' });
export const registroApi = axios.create({ baseURL: process.env.EXPO_PUBLIC_REGISTRO_URL || 'http://localhost:3002' });
export const chamadaApi = axios.create({ baseURL: process.env.EXPO_PUBLIC_CHAMADA_URL || 'http://localhost:3003' });

export default registroApi;