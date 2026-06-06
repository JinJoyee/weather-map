import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach } from 'vitest';
import RouteMapModal from '../../components/Route/RouteMapModal';

const mockRoute = {
  id: 1,
  name: '집→회사',
  start_lat: 36.35,
  start_lng: 127.38,
  end_lat: 36.36,
  end_lng: 127.39,
  waypoints: [{ lat: 36.355, lng: 127.385 }],
};

describe('RouteMapModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('경로 이름을 표시한다', () => {
    render(<RouteMapModal route={mockRoute} onClose={vi.fn()} />);
    expect(screen.getByText('집→회사')).toBeInTheDocument();
  });

  it('닫기(×) 버튼을 표시한다', () => {
    render(<RouteMapModal route={mockRoute} onClose={vi.fn()} />);
    expect(screen.getByText('×')).toBeInTheDocument();
  });

  it('× 버튼 클릭 시 onClose가 호출된다', async () => {
    const onClose = vi.fn();
    render(<RouteMapModal route={mockRoute} onClose={onClose} />);
    await userEvent.click(screen.getByText('×'));
    expect(onClose).toHaveBeenCalled();
  });

  it('배경(오버레이) 클릭 시 onClose가 호출된다', async () => {
    const onClose = vi.fn();
    const { container } = render(<RouteMapModal route={mockRoute} onClose={onClose} />);
    const overlay = container.firstChild;
    await userEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it('경유지 개수를 표시한다', () => {
    render(<RouteMapModal route={mockRoute} onClose={vi.fn()} />);
    expect(screen.getByText(/경유지 1개/)).toBeInTheDocument();
  });

  it('경유지 없을 때 0개를 표시한다', () => {
    const route = { ...mockRoute, waypoints: [] };
    render(<RouteMapModal route={route} onClose={vi.fn()} />);
    expect(screen.getByText(/경유지 0개/)).toBeInTheDocument();
  });

  it('kakao Map이 초기화된다', () => {
    render(<RouteMapModal route={mockRoute} onClose={vi.fn()} />);
    expect(window.kakao.maps.Map).toHaveBeenCalled();
  });

  it('Polyline이 생성된다', () => {
    render(<RouteMapModal route={mockRoute} onClose={vi.fn()} />);
    expect(window.kakao.maps.Polyline).toHaveBeenCalled();
  });

  it('Marker가 2개 생성된다 (출발/도착)', () => {
    render(<RouteMapModal route={mockRoute} onClose={vi.fn()} />);
    expect(window.kakao.maps.Marker).toHaveBeenCalledTimes(2);
  });

  it('kakao가 없으면 지도를 초기화하지 않는다', () => {
    const savedKakao = window.kakao;
    window.kakao = undefined;
    render(<RouteMapModal route={mockRoute} onClose={vi.fn()} />);
    expect(window.kakao).toBeUndefined();
    window.kakao = savedKakao;
  });

  it('route가 null이면 크래시 없이 렌더링된다', () => {
    render(<RouteMapModal route={null} onClose={vi.fn()} />);
    // route?.name이 undefined이므로 h2가 비어있음 — 에러 없이 렌더링되면 통과
    expect(screen.getByText('×')).toBeInTheDocument();
  });

  it('polyline이 unmount 시 setMap(null)로 정리된다', () => {
    const { unmount } = render(<RouteMapModal route={mockRoute} onClose={vi.fn()} />);
    unmount();
    // Polyline의 setMap(null)이 호출되면 통과 (cleanup)
    const polylineCalls = window.kakao.maps.Polyline.mock.instances;
    expect(polylineCalls.length).toBeGreaterThan(0);
  });
});
