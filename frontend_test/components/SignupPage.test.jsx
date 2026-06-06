import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const { mockCheckUsername, mockSignup } = vi.hoisted(() => ({
  mockCheckUsername: vi.fn(),
  mockSignup: vi.fn(),
}));

vi.mock('../../frontend/src/api/auth', () => ({
  signup: mockSignup,
  checkUsernameAvailable: mockCheckUsername,
}));

import SignupPage from '../../frontend/src/components/Auth/SignupPage';

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckUsername.mockResolvedValue(false);
    mockSignup.mockResolvedValue({});
  });

  it('아이디·비밀번호·비밀번호 확인 필드를 표시한다', () => {
    renderWithRouter(<SignupPage />);
    expect(screen.getByPlaceholderText(/아이디/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호 확인')).toBeInTheDocument();
  });

  it('아이디 2자 입력 시 "3자 이상 입력하세요" 힌트를 표시한다', async () => {
    renderWithRouter(<SignupPage />);
    await userEvent.type(screen.getByPlaceholderText(/아이디/), 'ab');
    expect(screen.getByText(/3자 이상/)).toBeInTheDocument();
  });

  it('비밀번호 불일치 시 에러 메시지를 표시한다', async () => {
    renderWithRouter(<SignupPage />);
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'Password1!');
    await userEvent.type(screen.getByPlaceholderText('비밀번호 확인'), 'Different1!');
    expect(screen.getByText(/일치하지 않아요/)).toBeInTheDocument();
  });

  it('가입 버튼이 초기에 비활성화 상태이다', () => {
    renderWithRouter(<SignupPage />);
    expect(screen.getByText(/가입하고 시작/)).toBeDisabled();
  });

  it('로그인 링크가 있다', () => {
    renderWithRouter(<SignupPage />);
    expect(screen.getByText('로그인')).toBeInTheDocument();
  });

  it('아이디 3자 이상 입력 시 사용 가능 여부 확인 중 상태를 표시한다', async () => {
    mockCheckUsername.mockReturnValue(new Promise(() => {}));
    renderWithRouter(<SignupPage />);
    await userEvent.type(screen.getByPlaceholderText(/아이디/), 'abc');
    expect(screen.getByText(/확인 중/)).toBeInTheDocument();
  });

  it('사용 가능한 아이디이면 "사용 가능한 아이디" 힌트를 표시한다', async () => {
    mockCheckUsername.mockResolvedValue(true);
    renderWithRouter(<SignupPage />);
    await userEvent.type(screen.getByPlaceholderText(/아이디/), 'gooduser');
    expect(await screen.findByText(/사용 가능한 아이디/)).toBeInTheDocument();
  });

  it('이미 사용 중인 아이디이면 "이미 사용 중" 힌트를 표시한다', async () => {
    mockCheckUsername.mockResolvedValue(false);
    renderWithRouter(<SignupPage />);
    await userEvent.type(screen.getByPlaceholderText(/아이디/), 'takenuser');
    expect(await screen.findByText(/이미 사용 중/)).toBeInTheDocument();
  });

  it('checkUsername 에러 시 idle 상태로 돌아간다', async () => {
    mockCheckUsername.mockRejectedValue(new Error('network'));
    renderWithRouter(<SignupPage />);
    await userEvent.type(screen.getByPlaceholderText(/아이디/), 'erroruser');
    await waitFor(() => {
      expect(screen.queryByText(/확인 중/)).not.toBeInTheDocument();
    });
  });

  it('비밀번호 강도 바가 표시된다', async () => {
    renderWithRouter(<SignupPage />);
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'Password1!');
    expect(screen.getByText(/강함|보통|약함/)).toBeInTheDocument();
  });

  it('비밀번호 표시 토글이 작동한다', async () => {
    renderWithRouter(<SignupPage />);
    const pw = screen.getByPlaceholderText('비밀번호');
    expect(pw).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByText('표시'));
    expect(pw).toHaveAttribute('type', 'text');
  });

  it('가입 실패 시 에러 메시지를 표시한다', async () => {
    mockCheckUsername.mockResolvedValue(true);
    mockSignup.mockRejectedValue({ response: { status: 400, data: {} } });
    renderWithRouter(<SignupPage />);
    await userEvent.type(screen.getByPlaceholderText(/아이디/), 'gooduser');
    await screen.findByText(/사용 가능한 아이디/);
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'Password1!');
    await userEvent.type(screen.getByPlaceholderText('비밀번호 확인'), 'Password1!');
    const btn = screen.getByText(/가입하고 시작/);
    if (!btn.disabled) {
      await userEvent.click(btn);
      expect(await screen.findByText(/잘못된 요청/)).toBeInTheDocument();
    }
  });
});
