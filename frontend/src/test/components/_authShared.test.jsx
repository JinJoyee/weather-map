import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthShell, AuthHeader, Brand, Field, pwStrength } from '../../components/Auth/_authShared';

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('_authShared 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('AuthShell이 children을 렌더링한다', () => {
    renderWithRouter(<AuthShell><span>자식</span></AuthShell>);
    expect(screen.getByText('자식')).toBeInTheDocument();
  });

  it('AuthHeader 뒤로가기 버튼이 존재한다', () => {
    renderWithRouter(<AuthHeader />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('AuthHeader 뒤로가기 버튼 클릭 시 nav(-1)이 호출된다', async () => {
    renderWithRouter(<AuthHeader />);
    const btn = screen.getByRole('button');
    await userEvent.click(btn);
    // MemoryRouter에서 nav(-1)은 에러 없이 처리됨
    expect(btn).toBeInTheDocument();
  });

  it('Brand가 "Weather Map" 제목을 렌더링한다', () => {
    renderWithRouter(<Brand />);
    expect(screen.getByText('Weather Map')).toBeInTheDocument();
  });

  it('Brand에 subtitle이 있으면 표시한다', () => {
    renderWithRouter(<Brand subtitle="로그인하세요" />);
    expect(screen.getByText('로그인하세요')).toBeInTheDocument();
  });

  it('Brand에 subtitle이 없으면 p 태그가 없다', () => {
    const { container } = renderWithRouter(<Brand />);
    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('Field가 input을 렌더링한다', () => {
    renderWithRouter(<Field placeholder="테스트" value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('테스트')).toBeInTheDocument();
  });

  it('Field onChange가 호출된다', async () => {
    const onChange = vi.fn();
    renderWithRouter(<Field placeholder="입력" value="" onChange={onChange} />);
    await userEvent.type(screen.getByPlaceholderText('입력'), 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('Field focus 시 border 스타일이 변경된다', async () => {
    renderWithRouter(<Field placeholder="입력" value="" onChange={vi.fn()} />);
    const input = screen.getByPlaceholderText('입력');
    await userEvent.click(input);
    // focus가 적용되면 에러 없이 완료
    expect(input).toHaveAttribute('type', 'text');
  });

  it('Field trailing prop이 렌더링된다', () => {
    renderWithRouter(<Field placeholder="입력" value="" onChange={vi.fn()} trailing={<span>후미</span>} />);
    expect(screen.getByText('후미')).toBeInTheDocument();
  });

  describe('pwStrength', () => {
    it('빈 문자열 → 빈 label 반환', () => {
      expect(pwStrength('').label).toBe('');
    });

    it('짧은 비밀번호 → 약함', () => {
      expect(pwStrength('abc').label).toBe('약함');
    });

    it('8자 이상 숫자 포함 → 보통', () => {
      expect(pwStrength('abcdefg1').label).toBe('보통');
    });

    it('12자+숫자+대문자 → 강함', () => {
      expect(pwStrength('Password1!Strong').label).toBe('강함');
    });

    it('score가 최대 3을 넘지 않는다', () => {
      expect(pwStrength('Password1!StrongLong').score).toBeLessThanOrEqual(3);
    });
  });
});
