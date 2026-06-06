import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPost, mockGet } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockGet: vi.fn(),
}));

vi.mock('../../api/client', () => ({
  api: { post: mockPost, get: mockGet },
}));

import { login, logout, getToken, checkUsernameAvailable } from '../../api/auth';

describe('auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('login 성공 시 access_token을 localStorage에 저장한다', async () => {
    mockPost.mockResolvedValue({ data: { access_token: 'tok123' } });
    await login('user', 'pw');
    expect(localStorage.getItem('token')).toBe('tok123');
  });

  it('login 실패 시 에러를 throw한다', async () => {
    mockPost.mockRejectedValue(new Error('401'));
    await expect(login('u', 'p')).rejects.toThrow();
  });

  it('logout 시 localStorage에서 token을 제거한다', () => {
    localStorage.setItem('token', 'existing');
    logout();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('getToken은 저장된 토큰을 반환한다', () => {
    localStorage.setItem('token', 'mytoken');
    expect(getToken()).toBe('mytoken');
  });

  it('getToken은 토큰 없으면 null을 반환한다', () => {
    expect(getToken()).toBeNull();
  });

  it('checkUsernameAvailable은 available 필드를 반환한다', async () => {
    mockGet.mockResolvedValue({ data: { available: true } });
    const result = await checkUsernameAvailable('testuser');
    expect(result).toBe(true);
  });
});
