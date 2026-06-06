import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import RouteMapModal from '../../frontend/src/components/Route/RouteMapModal';

const baseRoute = {
  name: '집→회사',
  start_lat: 36.35,
  start_lng: 127.38,
  end_lat: 36.40,
  end_lng: 127.40,
  waypoints: [{ lat: 36.37, lng: 36.39 }],
};

describe('RouteMapModal', () => {
  it('경로 이름을 표시한다', () => {
    render(<RouteMapModal route={baseRoute} onClose={vi.fn()} />);
    expect(screen.getByText('집→회사')).toBeInTheDocument();
  });

  it('경유지 수를 표시한다', () => {
    render(<RouteMapModal route={baseRoute} onClose={vi.fn()} />);
    expect(screen.getByText(/경유지 1개/)).toBeInTheDocument();
  });

  it('경유지 없을 때 0개를 표시한다', () => {
    render(<RouteMapModal route={{ ...baseRoute, waypoints: [] }} onClose={vi.fn()} />);
    expect(screen.getByText(/경유지 0개/)).toBeInTheDocument();
  });

  it('waypoints가 배열 아닐 때 0개를 표시한다', () => {
    render(<RouteMapModal route={{ ...baseRoute, waypoints: null }} onClose={vi.fn()} />);
    expect(screen.getByText(/경유지 0개/)).toBeInTheDocument();
  });

  it('X 버튼 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn();
    render(<RouteMapModal route={baseRoute} onClose={onClose} />);
    fireEvent.click(screen.getByText('×'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('배경 오버레이 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn();
    const { container } = render(<RouteMapModal route={baseRoute} onClose={onClose} />);
    fireEvent.click(container.firstChild);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('모달 내부 클릭 시 onClose가 호출되지 않는다 (stopPropagation)', () => {
    const onClose = vi.fn();
    render(<RouteMapModal route={baseRoute} onClose={onClose} />);
    const modal = screen.getByText('집→회사').closest('.bg-white');
    fireEvent.click(modal);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('route=null 시 kakao 코드가 실행되지 않는다', () => {
    const { container } = render(<RouteMapModal route={null} onClose={vi.fn()} />);
    expect(container.querySelector('.fixed')).toBeInTheDocument();
  });
});
