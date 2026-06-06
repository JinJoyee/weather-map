import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const { mockCheckUsername } = vi.hoisted(() => ({ mockCheckUsername: vi.fn() }));

vi.mock('../../api/auth', () => ({
  signup: vi.fn(),
  checkUsernameAvailable: mockCheckUsername,
}));

import SignupPage from '../../components/Auth/SignupPage';

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckUsername.mockResolvedValue(false);
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
});
