import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const { mockLogin } = vi.hoisted(() => ({ mockLogin: vi.fn() }));

vi.mock('../../frontend/src/api/auth', () => ({
  login: mockLogin,
  getToken: vi.fn(),
}));

import LoginPage from '../../frontend/src/components/Auth/LoginPage';

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('아이디·비밀번호 입력 필드를 표시한다', () => {
    renderWithRouter(<LoginPage onLogin={vi.fn()} />);
    expect(screen.getByPlaceholderText('아이디')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호')).toBeInTheDocument();
  });

  it('"로그인" 제출 버튼을 표시한다', () => {
    renderWithRouter(<LoginPage onLogin={vi.fn()} />);
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });

  it('"로그인 없이 둘러보기" 버튼을 표시한다', () => {
    renderWithRouter(<LoginPage onLogin={vi.fn()} />);
    expect(screen.getByText(/로그인 없이/)).toBeInTheDocument();
  });

  it('아이디 미입력 시 에러 메시지를 표시한다', async () => {
    renderWithRouter(<LoginPage onLogin={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));
    expect(screen.getByText(/아이디와 비밀번호를 입력/)).toBeInTheDocument();
  });

  it('회원가입 링크가 있다', () => {
    renderWithRouter(<LoginPage onLogin={vi.fn()} />);
    expect(screen.getByText('회원가입')).toBeInTheDocument();
  });

  it('로그인 성공 시 onLogin이 호출된다', async () => {
    const onLogin = vi.fn();
    mockLogin.mockResolvedValue({});
    renderWithRouter(<LoginPage onLogin={onLogin} />);
    await userEvent.type(screen.getByPlaceholderText('아이디'), 'user1');
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'pw123');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));
    expect(onLogin).toHaveBeenCalled();
  });

  it('로그인 실패 시 에러 메시지를 표시한다', async () => {
    mockLogin.mockRejectedValue({ response: { status: 401, data: {} } });
    renderWithRouter(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText('아이디'), 'user1');
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'wrongpw');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));
    expect(await screen.findByText(/인증이 필요합니다/)).toBeInTheDocument();
  });

  it('비밀번호 표시 토글이 작동한다', async () => {
    renderWithRouter(<LoginPage onLogin={vi.fn()} />);
    const pw = screen.getByPlaceholderText('비밀번호');
    expect(pw).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByText('표시'));
    expect(pw).toHaveAttribute('type', 'text');
  });
});
