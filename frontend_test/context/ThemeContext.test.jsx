import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '../../frontend/src/context/ThemeContext';

function TestConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>토글</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('기본 theme은 light이다', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('toggleTheme 시 dark로 전환된다', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    fireEvent.click(screen.getByText('토글'));
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('dark에서 다시 토글하면 light로 돌아온다', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    fireEvent.click(screen.getByText('토글'));
    fireEvent.click(screen.getByText('토글'));
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('ThemeProvider가 children을 렌더링한다', () => {
    render(<ThemeProvider><div>자녀</div></ThemeProvider>);
    expect(screen.getByText('자녀')).toBeInTheDocument();
  });

  it('theme 변경 시 documentElement에 dark 클래스가 추가된다', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    fireEvent.click(screen.getByText('토글'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
