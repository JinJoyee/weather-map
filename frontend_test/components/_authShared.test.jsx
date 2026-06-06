import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import {
  AuthShell, AuthHeader, Brand, Field, pwStrength,
} from '../../frontend/src/components/Auth/_authShared';

function wrap(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('AuthShell', () => {
  it('children을 렌더링한다', () => {
    wrap(<AuthShell><div>내용</div></AuthShell>);
    expect(screen.getByText('내용')).toBeInTheDocument();
  });
});

describe('AuthHeader', () => {
  it('뒤로가기 버튼이 있다', () => {
    wrap(<AuthHeader />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('버튼 클릭 시 nav(-1)을 호출한다', () => {
    wrap(<AuthHeader />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});

describe('Brand', () => {
  it('"Weather Map"을 표시한다', () => {
    wrap(<Brand />);
    expect(screen.getByText('Weather Map')).toBeInTheDocument();
  });

  it('subtitle이 있으면 표시한다', () => {
    wrap(<Brand subtitle="날씨 맞춤 경로" />);
    expect(screen.getByText('날씨 맞춤 경로')).toBeInTheDocument();
  });

  it('subtitle 없으면 표시되지 않는다', () => {
    wrap(<Brand />);
    expect(screen.queryByText('날씨 맞춤 경로')).not.toBeInTheDocument();
  });
});

describe('Field', () => {
  it('placeholder를 표시한다', () => {
    wrap(<Field placeholder="아이디" value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('아이디')).toBeInTheDocument();
  });

  it('onChange가 입력 값으로 호출된다', async () => {
    const onChange = vi.fn();
    wrap(<Field placeholder="아이디" value="" onChange={onChange} />);
    await userEvent.type(screen.getByPlaceholderText('아이디'), 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('trailing이 있으면 렌더링된다', () => {
    wrap(<Field placeholder="pw" value="" onChange={vi.fn()} trailing={<span>표시</span>} />);
    expect(screen.getByText('표시')).toBeInTheDocument();
  });

  it('포커스 시 스타일이 변경된다', async () => {
    const { container } = wrap(<Field placeholder="pw" value="" onChange={vi.fn()} />);
    const input = screen.getByPlaceholderText('pw');
    fireEvent.focus(input);
    expect(container.querySelector('.border-primary')).toBeInTheDocument();
    fireEvent.blur(input);
  });

  it('type prop이 input에 적용된다', () => {
    wrap(<Field placeholder="pw" value="" onChange={vi.fn()} type="password" />);
    expect(screen.getByPlaceholderText('pw')).toHaveAttribute('type', 'password');
  });
});

describe('pwStrength', () => {
  it('빈 문자열이면 label이 비어있다', () => {
    expect(pwStrength('').label).toBe('');
  });

  it('짧은 비밀번호는 약함이다', () => {
    expect(pwStrength('abc').label).toBe('약함');
  });

  it('8자 이상 + 숫자이면 보통 이상이다', () => {
    expect(pwStrength('password1').score).toBeGreaterThanOrEqual(2);
  });

  it('12자 이상 + 복잡이면 강함이다', () => {
    expect(pwStrength('MyStr0ngPass!').label).toBe('강함');
  });

  it('score는 최대 3이다', () => {
    expect(pwStrength('MyStr0ngPass!2024#').score).toBe(3);
  });
});
