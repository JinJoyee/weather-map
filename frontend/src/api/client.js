import axios from 'axios';
import { setupErrorInterceptor } from '../utils/apiErrorHandler';

const BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupErrorInterceptor(api);
