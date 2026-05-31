import axios from 'axios';
import { setupErrorInterceptor } from '../utils/apiErrorHandler';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://weather-map-7f9f.onrender.com';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupErrorInterceptor(api);
