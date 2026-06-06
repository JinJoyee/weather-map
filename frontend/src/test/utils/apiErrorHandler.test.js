import { describe, it, expect, vi } from 'vitest';
import { resolveApiError, setupErrorInterceptor } from '../../utils/apiErrorHandler';

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

  it('status 422 → UNKNOWN 반환 (5xx 미만, 맵핑 없음)', () => {
    expect(resolveApiError({ response: { status: 422, data: {} } }).code).toBe('UNKNOWN');
  });

  it('request 있고 response 없으면 NETWORK_ERROR 반환', () => {
    expect(resolveApiError({ request: {}, response: undefined }).code).toBe('NETWORK_ERROR');
  });

  it('request도 response도 없으면 UNKNOWN 반환', () => {
    expect(resolveApiError({}).code).toBe('UNKNOWN');
  });

  it('data.message가 있으면 해당 메시지를 반환한다', () => {
    const err = { response: { status: 400, data: { message: '커스텀 에러' } } };
    expect(resolveApiError(err).message).toBe('커스텀 에러');
  });

  it('status와 code를 함께 반환한다', () => {
    const result = resolveApiError({ response: { status: 404, data: {} } });
    expect(result.status).toBe(404);
    expect(result.code).toBe('NOT_FOUND');
  });
});

describe('setupErrorInterceptor', () => {
  it('interceptor가 등록된다', () => {
    const use = vi.fn();
    const mockAxios = { interceptors: { response: { use } } };
    setupErrorInterceptor(mockAxios);
    expect(use).toHaveBeenCalledOnce();
  });

  it('에러 발생 시 apiError 속성을 추가하고 reject한다', async () => {
    let errorHandler;
    const use = vi.fn((ok, err) => { errorHandler = err; });
    const mockAxios = { interceptors: { response: { use } } };
    setupErrorInterceptor(mockAxios);

    const err = { response: { status: 400, data: {} } };
    await expect(errorHandler(err)).rejects.toMatchObject({ apiError: { code: 'BAD_REQUEST' } });
  });

  it('성공 응답은 그대로 통과한다', () => {
    let successHandler;
    const use = vi.fn((ok) => { successHandler = ok; });
    const mockAxios = { interceptors: { response: { use } } };
    setupErrorInterceptor(mockAxios);

    const res = { data: 'ok' };
    expect(successHandler(res)).toBe(res);
  });
});
