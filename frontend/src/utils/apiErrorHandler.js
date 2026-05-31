const ERROR_MESSAGES = {
  TIMEOUT:      '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
  BAD_REQUEST:  '잘못된 요청입니다.',
  UNAUTHORIZED: '인증이 필요합니다.',
  FORBIDDEN:    '접근 권한이 없습니다.',
  NOT_FOUND:    '요청한 리소스를 찾을 수 없습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  NETWORK_ERROR:'네트워크 연결을 확인해주세요.',
  UNKNOWN:      '알 수 없는 오류가 발생했습니다.',
};

const STATUS_CODE_MAP = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
};

export function resolveApiError(error) {
  if (error.code === 'ECONNABORTED') {
    return { code: 'TIMEOUT', message: ERROR_MESSAGES.TIMEOUT };
  }

  if (error.response) {
    const { status, data } = error.response;
    const code = STATUS_CODE_MAP[status] ?? (status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN');
    const message = data?.message ?? ERROR_MESSAGES[code];
    return { code, message, status };
  }

  if (error.request) {
    return { code: 'NETWORK_ERROR', message: ERROR_MESSAGES.NETWORK_ERROR };
  }

  return { code: 'UNKNOWN', message: ERROR_MESSAGES.UNKNOWN };
}

export function setupErrorInterceptor(axiosInstance) {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const apiError = resolveApiError(error);
      console.error(`[API] ${apiError.code}:`, apiError.message);
      error.apiError = apiError;
      return Promise.reject(error);
    }
  );
}
