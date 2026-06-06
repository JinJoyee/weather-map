import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPost, mockGet } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockGet: vi.fn(),
}));

vi.mock('../../frontend/src/api/client', () => ({
  api: { post: mockPost, get: mockGet },
}));

import { login, signup, logout, getToken, checkUsernameAvailable, resetPassword } from '../../frontend/src/api/auth';

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

  it('signup 성공 시 data를 반환한다', async () => {
    mockPost.mockResolvedValue({ data: { id: 1, username: 'user1' } });
    const result = await signup('user1', 'pw123');
    expect(result.username).toBe('user1');
  });

  it('signup 실패 시 에러를 throw한다', async () => {
    mockPost.mockRejectedValue(new Error('400'));
    await expect(signup('user1', 'pw')).rejects.toThrow();
  });

  it('resetPassword 성공 시 data를 반환한다', async () => {
    mockPost.mockResolvedValue({ data: { message: '비밀번호가 변경되었습니다' } });
    const result = await resetPassword('user1', 'newpw123');
    expect(result.message).toBeDefined();
  });

  it('checkUsernameAvailable이 false를 반환한다', async () => {
    mockGet.mockResolvedValue({ data: { available: false } });
    const result = await checkUsernameAvailable('taken');
    expect(result).toBe(false);
  });
});
