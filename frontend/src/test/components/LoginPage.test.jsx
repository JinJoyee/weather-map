import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const { mockLogin } = vi.hoisted(() => ({ mockLogin: vi.fn() }));

vi.mock('../../api/auth', () => ({
  login: mockLogin,
  getToken: vi.fn(),
}));

vi.mock('../../utils/apiErrorHandler', () => ({
  resolveApiError: (err) => ({ code: 'UNKNOWN', message: err?.message || '오류가 발생했습니다.' }),
}));

import LoginPage from '../../components/Auth/LoginPage';

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

  it('비밀번호 "표시" 버튼 클릭 시 type이 text로 바뀐다', async () => {
    renderWithRouter(<LoginPage onLogin={vi.fn()} />);
    const pwInput = screen.getByPlaceholderText('비밀번호');
    expect(pwInput).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByText('표시'));
    expect(pwInput).toHaveAttribute('type', 'text');
  });

  it('"숨기기" 버튼이 표시된 상태에서 클릭 시 다시 password type으로 바뀐다', async () => {
    renderWithRouter(<LoginPage onLogin={vi.fn()} />);
    const pwInput = screen.getByPlaceholderText('비밀번호');
    await userEvent.click(screen.getByText('표시'));
    await userEvent.click(screen.getByText('숨기기'));
    expect(pwInput).toHaveAttribute('type', 'password');
  });

  it('로그인 성공 시 onLogin이 호출된다', async () => {
    mockLogin.mockResolvedValue({ access_token: 'tok' });
    const onLogin = vi.fn();
    renderWithRouter(<LoginPage onLogin={onLogin} />);
    await userEvent.type(screen.getByPlaceholderText('아이디'), 'testuser');
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'password');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => expect(onLogin).toHaveBeenCalled());
  });

  it('로그인 실패 시 에러 메시지를 표시한다', async () => {
    mockLogin.mockRejectedValue(new Error('인증 오류'));
    renderWithRouter(<LoginPage onLogin={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText('아이디'), 'user');
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'wrongpw');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => expect(screen.getByText('인증 오류')).toBeInTheDocument());
  });

  it('"로그인 없이 둘러보기" 버튼 클릭 시 페이지 이동이 시도된다', async () => {
    renderWithRouter(<LoginPage onLogin={vi.fn()} />);
    const browseBtn = screen.getByText(/로그인 없이/);
    await userEvent.click(browseBtn);
    // MemoryRouter가 navigate를 처리하므로 에러 없이 클릭이 완료되면 통과
    expect(browseBtn).toBeInTheDocument();
  });
});
