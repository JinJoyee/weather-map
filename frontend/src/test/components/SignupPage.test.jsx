import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const { mockCheckUsername, mockSignup } = vi.hoisted(() => ({
  mockCheckUsername: vi.fn(),
  mockSignup: vi.fn(),
}));

vi.mock('../../api/auth', () => ({
  signup: mockSignup,
  checkUsernameAvailable: mockCheckUsername,
}));

vi.mock('../../utils/apiErrorHandler', () => ({
  resolveApiError: (err) => ({ code: 'UNKNOWN', message: err?.message || '오류' }),
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

  it('아이디 사용 가능할 때 "사용 가능한 아이디예요"를 표시한다', async () => {
    mockCheckUsername.mockResolvedValue(true);
    renderWithRouter(<SignupPage />);
    await userEvent.type(screen.getByPlaceholderText(/아이디/), 'testuser');
    await waitFor(() => expect(screen.getByText('사용 가능한 아이디예요')).toBeInTheDocument(), { timeout: 2000 });
  });

  it('아이디 이미 사용 중일 때 "이미 사용 중인 아이디예요"를 표시한다', async () => {
    mockCheckUsername.mockResolvedValue(false);
    renderWithRouter(<SignupPage />);
    await userEvent.type(screen.getByPlaceholderText(/아이디/), 'takenuser');
    await waitFor(() => expect(screen.getByText('이미 사용 중인 아이디예요')).toBeInTheDocument(), { timeout: 2000 });
  });

  it('비밀번호 입력 시 강도 바가 표시된다', async () => {
    renderWithRouter(<SignupPage />);
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'a');
    expect(screen.getByText('약함')).toBeInTheDocument();
  });

  it('강한 비밀번호 입력 시 "강함"이 표시된다', async () => {
    renderWithRouter(<SignupPage />);
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'Password1!Strong');
    expect(screen.getByText('강함')).toBeInTheDocument();
  });

  it('비밀번호 "표시" 버튼 클릭 시 type이 text로 바뀐다', async () => {
    renderWithRouter(<SignupPage />);
    const pwInput = screen.getByPlaceholderText('비밀번호');
    await userEvent.click(screen.getByText('표시'));
    expect(pwInput).toHaveAttribute('type', 'text');
  });

  it('가입 성공 시 signup API가 호출된다', async () => {
    mockCheckUsername.mockResolvedValue(true);
    mockSignup.mockResolvedValue({});
    renderWithRouter(<SignupPage />);

    await userEvent.type(screen.getByPlaceholderText(/아이디/), 'newuser');
    await waitFor(() => expect(screen.getByText('사용 가능한 아이디예요')).toBeInTheDocument(), { timeout: 2000 });

    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'Password1!');
    await userEvent.type(screen.getByPlaceholderText('비밀번호 확인'), 'Password1!');

    const submitBtn = screen.getByText(/가입하고 시작/);
    expect(submitBtn).not.toBeDisabled();
    await userEvent.click(submitBtn);
    await waitFor(() => expect(mockSignup).toHaveBeenCalledWith('newuser', 'Password1!'));
  });

  it('가입 실패 시 에러 메시지를 표시한다', async () => {
    mockCheckUsername.mockResolvedValue(true);
    mockSignup.mockRejectedValue(new Error('서버 오류'));
    renderWithRouter(<SignupPage />);

    await userEvent.type(screen.getByPlaceholderText(/아이디/), 'newuser');
    await waitFor(() => expect(screen.getByText('사용 가능한 아이디예요')).toBeInTheDocument(), { timeout: 2000 });

    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'Password1!');
    await userEvent.type(screen.getByPlaceholderText('비밀번호 확인'), 'Password1!');

    await userEvent.click(screen.getByText(/가입하고 시작/));
    await waitFor(() => expect(screen.getByText('서버 오류')).toBeInTheDocument());
  });

  it('checkUsernameAvailable 실패 시 catch 블록이 동작한다', async () => {
    mockCheckUsername.mockRejectedValue(new Error('network error'));
    renderWithRouter(<SignupPage />);
    await userEvent.type(screen.getByPlaceholderText(/아이디/), 'testuser');
    // 500ms 디바운스 타이머가 실행되어 checkUsernameAvailable이 호출될 때까지 대기
    await waitFor(() => expect(mockCheckUsername).toHaveBeenCalled(), { timeout: 2000 });
    // 에러 catch 후 idState가 "idle"로 복귀해도 UI가 크래시하지 않으면 통과
    expect(screen.getByPlaceholderText(/아이디/)).toBeInTheDocument();
  });
});
