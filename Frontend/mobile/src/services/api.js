import axios from 'axios';

export const authApi = axios.create({ baseURL: 'http://localhost:3001' });
export const registroApi = axios.create({ baseURL: 'http://localhost:3002' });
export const chamadaApi = axios.create({ baseURL: 'http://localhost:3003' });

export default registroApi;