import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Spinner, Dots, Skeleton, SkeletonRouteCard, StateView } from '../../components/common/feedback';

describe('feedback 컴포넌트', () => {
  it('Spinner가 SVG로 렌더링된다', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('Spinner에 custom size가 적용된다', () => {
    const { container } = render(<Spinner size={30} />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '30');
  });

  it('Spinner에 custom className이 적용된다', () => {
    const { container } = render(<Spinner className="text-red-500" />);
    expect(container.querySelector('svg').getAttribute('class')).toContain('text-red-500');
  });

  it('Dots가 3개의 점을 렌더링한다', () => {
    const { container } = render(<Dots />);
    const innerSpans = container.querySelectorAll('span > span');
    expect(innerSpans.length).toBe(3);
  });

  it('Dots에 custom className이 적용된다', () => {
    const { container } = render(<Dots className="bg-red-500" />);
    const dot = container.querySelectorAll('span > span')[0];
    expect(dot.className).toContain('bg-red-500');
  });

  it('Skeleton이 렌더링된다', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('span')).toBeInTheDocument();
  });

  it('Skeleton에 style이 적용된다', () => {
    const { container } = render(<Skeleton style={{ height: '20px' }} />);
    expect(container.querySelector('span').style.height).toBe('20px');
  });

  it('SkeletonRouteCard가 data-testid="skeleton-route-card"를 가진다', () => {
    render(<SkeletonRouteCard />);
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

  it('StateView secondary 버튼 클릭 시 onSecondary가 호출된다', async () => {
    const onSecondary = vi.fn();
    render(<StateView Icon={() => null} title="t" primary="확인" onPrimary={vi.fn()} secondary="취소" onSecondary={onSecondary} />);
    await userEvent.click(screen.getByText('취소'));
    expect(onSecondary).toHaveBeenCalledOnce();
  });

  it('compact prop이 있으면 compact 스타일이 적용된다', () => {
    const { container } = render(<StateView Icon={() => null} title="t" compact />);
    expect(container.firstChild.className).toContain('py-9');
  });

  it('warn tone으로 렌더링된다', () => {
    const { container } = render(<StateView Icon={() => null} title="경고" tone="warn" />);
    expect(container.innerHTML).toContain('bg-weather');
  });

  it('error tone으로 렌더링된다', () => {
    const { container } = render(<StateView Icon={() => null} title="에러" tone="error" />);
    expect(container.innerHTML).toContain('bg-red-600');
  });

  it('desc 없어도 렌더링된다', () => {
    render(<StateView Icon={() => null} title="t" />);
    expect(screen.getByText('t')).toBeInTheDocument();
  });
});
