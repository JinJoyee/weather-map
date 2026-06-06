import { describe, it, expect } from 'vitest';
import { resolveApiError } from '../../utils/apiErrorHandler';

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
});
