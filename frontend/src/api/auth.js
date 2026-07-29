import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const plain = axios.create({ baseURL: BASE_URL });

export const login = (data) => plain.post('/auth/login/', data);
export const register = (data) => plain.post('/auth/register/', data);
