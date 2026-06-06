import { describe, it, expect, vi } from 'vitest';
import { resolveApiError, setupErrorInterceptor } from '../../frontend/src/utils/apiErrorHandler';

describe('resolveApiError', () => {
  it('code ECONNABORTED → TIMEOUT 반환', () => {
    expect(resolveApiError({ code: 'ECONNABORTED' }).code).toBe('TIMEOUT');
  });

  it('status 400 → BAD_REQUEST 반환', () => {
    expect(resolveApiError({ response: { status: 400, data: {} } }).code).toBe('BAD_REQUEST');
  });

  it('status 401 → UNAUTHORIZED 반환', () => {
    expect(resolveApiError({ response: { status: 401, data: {} } }).code).toBe('UNAUTHORIZED');
  });

  it('status 403 → FORBIDDEN 반환', () => {
    expect(resolveApiError({ response: { status: 403, data: {} } }).code).toBe('FORBIDDEN');
  });

  it('status 404 → NOT_FOUND 반환', () => {
    expect(resolveApiError({ response: { status: 404, data: {} } }).code).toBe('NOT_FOUND');
  });

  it('status 500 → SERVER_ERROR 반환', () => {
    expect(resolveApiError({ response: { status: 500, data: {} } }).code).toBe('SERVER_ERROR');
  });

  it('request 있고 response 없으면 NETWORK_ERROR 반환', () => {
    expect(resolveApiError({ request: {}, response: undefined }).code).toBe('NETWORK_ERROR');
  });

  it('data.message가 있으면 해당 메시지를 반환한다', () => {
    const err = { response: { status: 400, data: { message: '커스텀 에러' } } };
    expect(resolveApiError(err).message).toBe('커스텀 에러');
  });

  it('status 418 같은 미지정 상태 → UNKNOWN 반환', () => {
    expect(resolveApiError({ response: { status: 418, data: {} } }).code).toBe('UNKNOWN');
  });

  it('code/request/response 모두 없으면 UNKNOWN 반환', () => {
    expect(resolveApiError({}).code).toBe('UNKNOWN');
  });
});

describe('setupErrorInterceptor', () => {
  it('response interceptor를 등록한다', () => {
    const mockUse = vi.fn();
    const axiosInstance = { interceptors: { response: { use: mockUse } } };
    setupErrorInterceptor(axiosInstance);
    expect(mockUse).toHaveBeenCalledOnce();
  });

  it('interceptor success handler가 response를 그대로 반환한다', () => {
    const mockUse = vi.fn();
    const axiosInstance = { interceptors: { response: { use: mockUse } } };
    setupErrorInterceptor(axiosInstance);
    const [successHandler] = mockUse.mock.calls[0];
    const response = { data: { ok: true } };
    expect(successHandler(response)).toBe(response);
  });

  it('interceptor error handler가 apiError를 error에 첨부하고 reject한다', async () => {
    const mockUse = vi.fn();
    const axiosInstance = { interceptors: { response: { use: mockUse } } };
    setupErrorInterceptor(axiosInstance);
    const [, errorHandler] = mockUse.mock.calls[0];
    const error = { response: { status: 500, data: {} } };
    await expect(errorHandler(error)).rejects.toMatchObject({ apiError: { code: 'SERVER_ERROR' } });
  });
});
