  import axios from 'axios';

  const BASE_URL = 'http://localhost:8000';

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
        console.error('[API] 타임아웃: 백엔드 서버가 느리거나 꺼져있습니다.');
      } else if (error.response) {
        console.error(`[API] 에러 ${error.response.status}:`, error.response.data);
      } else {
        console.error('[API] 네트워크 에러:', error.message);
      }
      return Promise.reject(error);
    }
  );