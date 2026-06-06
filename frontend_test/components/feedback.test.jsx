import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { Spinner, Dots, SkeletonRouteCard, StateView, Skeleton } from '../../frontend/src/components/common/feedback';
import { ThemeProvider } from '../../frontend/src/context/ThemeContext';

describe('feedback 컴포넌트', () => {
  it('Spinner가 SVG로 렌더링된다', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('SkeletonRouteCard가 data-testid="skeleton-route-card"를 가진다', () => {
    render(<ThemeProvider><SkeletonRouteCard /></ThemeProvider>);
    expect(screen.getByTestId('skeleton-route-card')).toBeInTheDocument();
  });

  it('StateView가 title을 표시한다', () => {
    render(<StateView Icon={() => null} title="에러 발생" desc="설명" />);
    expect(screen.getByText('에러 발생')).toBeInTheDocument();
  });

  it('StateView가 desc를 표시한다', () => {
    render(<StateView Icon={() => null} title="제목" desc="자세한 설명" />);
    expect(screen.getByText('자세한 설명')).toBeInTheDocument();
  });

  it('StateView primary 버튼 클릭 시 onPrimary가 호출된다', async () => {
    const onPrimary = vi.fn();
    render(<StateView Icon={() => null} title="t" primary="확인" onPrimary={onPrimary} />);
    await userEvent.click(screen.getByText('확인'));
    expect(onPrimary).toHaveBeenCalledOnce();
  });

  it('secondary prop 없으면 두 번째 버튼이 표시되지 않는다', () => {
    render(<StateView Icon={() => null} title="t" primary="확인" onPrimary={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /취소/ })).not.toBeInTheDocument();
  });

  it('secondary 버튼 클릭 시 onSecondary가 호출된다', async () => {
    const onSecondary = vi.fn();
    render(<StateView Icon={() => null} title="t" secondary="취소" onSecondary={onSecondary} />);
    await userEvent.click(screen.getByText('취소'));
    expect(onSecondary).toHaveBeenCalledOnce();
  });

  it('Dots가 3개의 span을 렌더링한다', () => {
    const { container } = render(<Dots />);
    expect(container.querySelectorAll('span > span').length).toBe(3);
  });

  it('Skeleton이 span 블록을 렌더링한다', () => {
    const { container } = render(
      <ThemeProvider><Skeleton className="w-10 h-4" /></ThemeProvider>
    );
    expect(container.querySelector('span.block')).toBeInTheDocument();
  });

  it('StateView compact 모드에서 py-9 클래스가 적용된다', () => {
    const { container } = render(<StateView Icon={() => null} title="t" compact />);
    expect(container.querySelector('.py-9')).toBeInTheDocument();
  });

  it('Skeleton dark 모드에서 어두운 그라데이션을 사용한다', () => {
    localStorage.setItem('theme', 'dark');
    const { container } = render(
      <ThemeProvider><Skeleton className="w-10 h-4" /></ThemeProvider>
    );
    const span = container.querySelector('span.block');
    const bg = span.style.backgroundImage;
    expect(bg.includes('#273449') || bg.includes('39, 52, 73')).toBe(true);
    localStorage.removeItem('theme');
  });
});
