import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { Spinner, SkeletonRouteCard, StateView } from '../../components/common/feedback';

describe('feedback 컴포넌트', () => {
  it('Spinner가 SVG로 렌더링된다', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toBeInTheDocument();
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
});
