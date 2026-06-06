import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPost, mockGet } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockGet: vi.fn(),
}));

vi.mock('../../api/client', () => ({
  api: { post: mockPost, get: mockGet },
}));

import { login, logout, getToken, signup, checkUsernameAvailable, resetPassword } from '../../api/auth';

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

  it('login 성공 시 data를 반환한다', async () => {
    mockPost.mockResolvedValue({ data: { access_token: 'tok123' } });
    const result = await login('user', 'pw');
    expect(result.access_token).toBe('tok123');
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

  it('signup 성공 시 data를 반환한다', async () => {
    mockPost.mockResolvedValue({ data: { id: 1, username: 'newuser' } });
    const result = await signup('newuser', 'pw');
    expect(result.username).toBe('newuser');
  });

  it('signup은 올바른 엔드포인트를 호출한다', async () => {
    mockPost.mockResolvedValue({ data: {} });
    await signup('u', 'p');
    expect(mockPost).toHaveBeenCalledWith('/api/auth/signup', { username: 'u', password: 'p' });
  });

  it('checkUsernameAvailable은 available 필드를 반환한다', async () => {
    mockGet.mockResolvedValue({ data: { available: true } });
    const result = await checkUsernameAvailable('testuser');
    expect(result).toBe(true);
  });

  it('checkUsernameAvailable이 false를 반환할 수 있다', async () => {
    mockGet.mockResolvedValue({ data: { available: false } });
    expect(await checkUsernameAvailable('taken')).toBe(false);
  });

  it('resetPassword는 올바른 엔드포인트를 호출한다', async () => {
    mockPost.mockResolvedValue({ data: { success: true } });
    const result = await resetPassword('user', 'newpw');
    expect(mockPost).toHaveBeenCalledWith('/api/auth/password/reset', { username: 'user', new_password: 'newpw' });
    expect(result.success).toBe(true);
  });
});
