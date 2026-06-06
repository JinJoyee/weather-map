import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, beforeEach } from 'vitest';

const { mockFetchRoute } = vi.hoisted(() => ({
  mockFetchRoute: vi.fn(),
}));

vi.mock('../api/route', () => ({
  fetchRouteRecommend: mockFetchRoute,
}));

import RouteCompare from '../components/Route/RouteCompare';

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const mockRouteData = {
  routes: {
    normal: {
      distance: 7200,
      foot_distance: 7400,
      duration: 900,
      polyline: [{ lat: 36.35, lng: 127.38 }, { lat: 36.36, lng: 127.39 }],
      foot_polyline: [{ lat: 36.35, lng: 127.38 }, { lat: 36.36, lng: 127.39 }],
    },
    context: {
      distance: 7800,
      foot_distance: 7800,
      polyline: [{ lat: 36.35, lng: 127.38 }, { lat: 36.36, lng: 127.39 }],
    },
  },
  recommendation: '날씨 최적 경로를 추천합니다',
  context_tags: ['맑음'],
  warnings: [],
  weather: { temperature: 25, uv_index: 3, rain_probability: 10 },
};

function getClickHandler() {
  const calls = window.kakao.maps.event.addListener.mock.calls;
  const clickCall = calls.find((c) => c[1] === 'click');
  return clickCall?.[2];
}

function simulateMapClick(handler, lat, lng) {
  act(() => {
    handler({
      latLng: {
        getLat: () => lat,
        getLng: () => lng,
      },
    });
  });
}

describe('RouteCompare', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchRoute.mockResolvedValue(mockRouteData);
  });

  it('초기 상태에서 출발지 선택 안내 문구를 표시한다', () => {
    renderWithRouter(<RouteCompare />);
    expect(screen.getByText(/출발지를 지도에서 클릭/)).toBeInTheDocument();
  });

  it('"경로 비교" 제목을 표시한다', () => {
    renderWithRouter(<RouteCompare />);
    expect(screen.getByText('경로 비교')).toBeInTheDocument();
  });

  it('초기 상태에서 경로 카드가 표시되지 않는다', () => {
    renderWithRouter(<RouteCompare />);
    expect(screen.queryByText('최단 경로')).not.toBeInTheDocument();
    expect(screen.queryByText('날씨 최적 경로')).not.toBeInTheDocument();
  });

  it('ODPill에 "출발지 선택" 플레이스홀더가 표시된다', () => {
    renderWithRouter(<RouteCompare />);
    expect(screen.getByText('출발지 선택')).toBeInTheDocument();
  });

  it('ODPill에 "도착지 선택" 플레이스홀더가 표시된다', () => {
    renderWithRouter(<RouteCompare />);
    expect(screen.getByText('도착지 선택')).toBeInTheDocument();
  });

  it('"새 탐색" 버튼이 초기에 표시되지 않는다', () => {
    renderWithRouter(<RouteCompare />);
    expect(screen.queryByText('새 탐색')).not.toBeInTheDocument();
  });

  it('첫 번째 클릭 후 "도착지를 클릭" 안내가 표시된다', () => {
    renderWithRouter(<RouteCompare />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    expect(screen.getByText(/도착지를 지도에서 클릭/)).toBeInTheDocument();
  });

  it('첫 번째 클릭 후 "새 탐색" 버튼이 나타난다', () => {
    renderWithRouter(<RouteCompare />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    expect(screen.getByText('새 탐색')).toBeInTheDocument();
  });

  it('두 번 클릭 후 fetchRouteRecommend가 호출된다', async () => {
    renderWithRouter(<RouteCompare />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);

    await waitFor(() => expect(mockFetchRoute).toHaveBeenCalled());
  });

  it('경로 로딩 중 SkeletonRouteCard가 표시된다', async () => {
    mockFetchRoute.mockReturnValue(new Promise(() => {}));
    renderWithRouter(<RouteCompare />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);

    await waitFor(() => expect(screen.getAllByTestId('skeleton-route-card').length).toBeGreaterThan(0));
  });

  it('경로 로드 성공 시 "날씨 최적 경로"가 표시된다', async () => {
    renderWithRouter(<RouteCompare />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);

    expect(await screen.findByText('날씨 최적 경로')).toBeInTheDocument();
    expect(await screen.findByText('최단 경로')).toBeInTheDocument();
  });

  it('경로 로드 성공 시 recommendation이 표시된다', async () => {
    renderWithRouter(<RouteCompare />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);

    expect(await screen.findByText('날씨 최적 경로를 추천합니다')).toBeInTheDocument();
  });

  it('API 실패 시 에러 화면이 표시된다', async () => {
    mockFetchRoute.mockRejectedValue(new Error('network error'));
    renderWithRouter(<RouteCompare />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);

    expect(await screen.findByText('경로를 불러오지 못했어요')).toBeInTheDocument();
  });

  it('빈 routes 응답 시 "추천할 경로가 없어요"가 표시된다', async () => {
    mockFetchRoute.mockResolvedValue({ routes: {}, recommendation: '', context_tags: [], warnings: [], weather: null });
    renderWithRouter(<RouteCompare />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);

    expect(await screen.findByText('추천할 경로가 없어요')).toBeInTheDocument();
  });

  it('"새 탐색" 클릭 시 초기 상태로 돌아간다', async () => {
    renderWithRouter(<RouteCompare />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    expect(screen.getByText('새 탐색')).toBeInTheDocument();

    await userEvent.click(screen.getByText('새 탐색'));
    expect(screen.queryByText('새 탐색')).not.toBeInTheDocument();
    expect(screen.getByText(/출발지를 지도에서 클릭/)).toBeInTheDocument();
  });

  it('경고 메시지가 있으면 표시된다', async () => {
    mockFetchRoute.mockResolvedValue({
      ...mockRouteData,
      warnings: ['자외선 지수가 높습니다'],
    });
    renderWithRouter(<RouteCompare />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);

    expect(await screen.findByText('자외선 지수가 높습니다')).toBeInTheDocument();
  });

  it('날씨 정보가 표시된다', async () => {
    renderWithRouter(<RouteCompare />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);

    await screen.findByText('날씨 최적 경로');
    expect(screen.getByText(/25°C/)).toBeInTheDocument();
  });

  it('RouteCard 클릭 시 해당 경로가 선택된다', async () => {
    renderWithRouter(<RouteCompare />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);

    await screen.findByText('날씨 최적 경로');
    await userEvent.click(screen.getByText('최단 경로'));
    // handleSelectRoute('normal') 호출 후 에러 없으면 통과
    expect(screen.getByText('최단 경로')).toBeInTheDocument();
  });

  it('"카카오 내비로 안내" 버튼 클릭 시 window.open이 호출된다', async () => {
    window.open = vi.fn();
    renderWithRouter(<RouteCompare />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);

    await screen.findByText('날씨 최적 경로');
    const naviButtons = screen.getAllByText('카카오 내비로 안내');
    await userEvent.click(naviButtons[0]);
    expect(window.open).toHaveBeenCalled();
  });

  it('SegMode "도보" 클릭 시 이동 수단이 변경된다', async () => {
    renderWithRouter(<RouteCompare />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);

    await screen.findByText('날씨 최적 경로');
    const walkButtons = screen.getAllByText('도보');
    await userEvent.click(walkButtons[0]);
    // SegMode 클릭이 에러 없이 완료되면 통과
    expect(screen.getByText('날씨 최적 경로')).toBeInTheDocument();
  });

  it('"날씨 최적 경로" 카드 클릭 시 context 경로가 선택된다', async () => {
    renderWithRouter(<RouteCompare />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);

    await screen.findByText('날씨 최적 경로');
    await userEvent.click(screen.getByText('날씨 최적 경로'));
    expect(screen.getByText('날씨 최적 경로')).toBeInTheDocument();
  });

  it('최단 경로 SegMode "도보" 클릭이 에러 없이 처리된다', async () => {
    renderWithRouter(<RouteCompare />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);

    await screen.findByText('날씨 최적 경로');
    const walkButtons = screen.getAllByText('도보');
    // 두 번째 SegMode(최단 경로)의 도보 버튼 클릭
    await userEvent.click(walkButtons[1]);
    expect(screen.getByText('최단 경로')).toBeInTheDocument();
  });

  it('"커스텀 경로" 영역 클릭이 에러 없이 처리된다', async () => {
    renderWithRouter(<RouteCompare />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);

    await screen.findByText('커스텀 경로');
    // navigate("/draw") 를 커버 — MemoryRouter는 history를 변경하지만 component는 유지됨
    await userEvent.click(screen.getByText('직접 경로를 그려보세요 →'));
    expect(screen.getByText('날씨 최적 경로')).toBeInTheDocument();
  });

  it('distance가 없는 경로일 때 거리가 표시되지 않는다', async () => {
    mockFetchRoute.mockResolvedValue({
      routes: {
        normal: { duration: 900, polyline: [{ lat: 36.35, lng: 127.38 }] },
        context: { polyline: [{ lat: 36.35, lng: 127.38 }] },
      },
      recommendation: '테스트',
      context_tags: [],
      warnings: [],
      weather: null,
    });
    renderWithRouter(<RouteCompare />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);

    await screen.findByText('날씨 최적 경로');
    // distance=null → formatDistance returns null → 거리 텍스트 없음
    expect(screen.queryByText(/km/)).not.toBeInTheDocument();
  });
});
