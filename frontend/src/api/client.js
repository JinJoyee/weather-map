import axios from 'axios';
import logger from '../utils/logger';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://weather-map-7f9f.onrender.com';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      logger.error('[API] 타임아웃: 백엔드 서버가 느리거나 꺼져있습니다.');
    } else if (error.response) {
      logger.error(`[API] 에러 ${error.response.status}:`, error.response.data);
    } else {
      logger.error('[API] 네트워크 에러:', error.message);
    }
    return Promise.reject(error);
  }
);