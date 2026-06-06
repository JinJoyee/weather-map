import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const { mockFetchRoute } = vi.hoisted(() => ({ mockFetchRoute: vi.fn() }));

vi.mock('../frontend/src/api/route', () => ({
  fetchRouteRecommend: mockFetchRoute,
}));

vi.mock('../frontend/src/components/common/useViewport', () => ({
  default: vi.fn(() => true),
  DESKTOP_MIN: 1024,
}));

import RouteCompare from '../frontend/src/components/Route/RouteCompare';
import { ThemeProvider } from '../frontend/src/context/ThemeContext';

function renderWithRouter(ui) {
  return render(<ThemeProvider><MemoryRouter>{ui}</MemoryRouter></ThemeProvider>);
}

function getClickHandler() {
  const calls = window.kakao.maps.event.addListener.mock.calls;
  const clickCall = calls.find((c) => c[1] === 'click');
  return clickCall ? clickCall[2] : null;
}

function makeLatLng(lat, lng) {
  return { latLng: { getLat: () => lat, getLng: () => lng } };
}

const ROUTE_DATA = {
  routes: {
    normal: { polyline: [{ lat: 36.35, lng: 127.38 }, { lat: 36.40, lng: 127.40 }], foot_polyline: [], distance: 3000, duration: 600 },
    context: { polyline: [{ lat: 36.35, lng: 127.38 }, { lat: 36.40, lng: 127.40 }], foot_polyline: [], foot_distance: 3000 },
  },
  recommendation: '날씨가 좋아요',
  context_tags: ['그늘'],
  warnings: [],
  weather: { temperature: 25, uv_index: 3, rain_probability: 10 },
};

describe('RouteCompare', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchRoute.mockResolvedValue(ROUTE_DATA);
  });

  it('초기 상태에서 출발·도착 안내 문구를 표시한다', () => {
    renderWithRouter(<RouteCompare />);
    expect(screen.getByText(/출발지와 도착지를 선택하면/)).toBeInTheDocument();
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

  it('지도 첫 클릭 시 출발지 좌표가 ODPill에 표시된다', async () => {
    renderWithRouter(<RouteCompare />);
    const clickHandler = getClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeLatLng(36.35, 127.38)); });
    await waitFor(() => {
      expect(screen.getByText(/36\.35/)).toBeInTheDocument();
    });
  });

  it('지도 첫 클릭 후 "새 탐색" 버튼이 나타난다', async () => {
    renderWithRouter(<RouteCompare />);
    const clickHandler = getClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeLatLng(36.35, 127.38)); });
    await waitFor(() => {
      expect(screen.getByText('새 탐색')).toBeInTheDocument();
    });
  });

  it('지도 두 번 클릭 시 fetchRouteRecommend가 호출된다', async () => {
    renderWithRouter(<RouteCompare />);
    const clickHandler = getClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeLatLng(36.35, 127.38)); });
    act(() => { clickHandler(makeLatLng(36.40, 127.40)); });
    await waitFor(() => {
      expect(mockFetchRoute).toHaveBeenCalled();
    });
  });

  it('경로 로딩 중 스켈레톤을 표시한다', async () => {
    mockFetchRoute.mockReturnValue(new Promise(() => {}));
    renderWithRouter(<RouteCompare />);
    const clickHandler = getClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeLatLng(36.35, 127.38)); });
    act(() => { clickHandler(makeLatLng(36.40, 127.40)); });
    await waitFor(() => {
      expect(screen.getAllByTestId('skeleton-route-card').length).toBeGreaterThan(0);
    });
  });

  it('경로 로드 성공 시 "날씨 최적 경로"와 "최단 경로" 카드를 표시한다', async () => {
    renderWithRouter(<RouteCompare />);
    const clickHandler = getClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeLatLng(36.35, 127.38)); });
    act(() => { clickHandler(makeLatLng(36.40, 127.40)); });
    expect(await screen.findByText('날씨 최적 경로')).toBeInTheDocument();
    expect(await screen.findByText('최단 경로')).toBeInTheDocument();
  });

  it('경로 로드 성공 시 recommendation 배너를 표시한다', async () => {
    renderWithRouter(<RouteCompare />);
    const clickHandler = getClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeLatLng(36.35, 127.38)); });
    act(() => { clickHandler(makeLatLng(36.40, 127.40)); });
    expect(await screen.findByText('날씨가 좋아요')).toBeInTheDocument();
  });

  it('경로 로드 실패 시 "경로를 불러오지 못했어요"를 표시한다', async () => {
    mockFetchRoute.mockRejectedValue(new Error('network'));
    renderWithRouter(<RouteCompare />);
    const clickHandler = getClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeLatLng(36.35, 127.38)); });
    act(() => { clickHandler(makeLatLng(36.40, 127.40)); });
    expect(await screen.findByText(/경로를 불러오지 못했어요/)).toBeInTheDocument();
  });

  it('경로 결과 없음 시 "추천할 경로가 없어요"를 표시한다', async () => {
    mockFetchRoute.mockResolvedValue({ routes: {}, recommendation: '', context_tags: [], warnings: [], weather: null });
    renderWithRouter(<RouteCompare />);
    const clickHandler = getClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeLatLng(36.35, 127.38)); });
    act(() => { clickHandler(makeLatLng(36.40, 127.40)); });
    expect(await screen.findByText(/추천할 경로가 없어요/)).toBeInTheDocument();
  });

  it('"새 탐색" 클릭 시 초기 상태로 돌아간다', async () => {
    renderWithRouter(<RouteCompare />);
    const clickHandler = getClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeLatLng(36.35, 127.38)); });
    await waitFor(() => expect(screen.queryByText('새 탐색')).toBeInTheDocument());
    fireEvent.click(screen.getByText('새 탐색'));
    expect(screen.queryByText('새 탐색')).not.toBeInTheDocument();
  });

  it('ready 상태에서 SegMode 도보 버튼 클릭 시 설명이 도보로 바뀐다', async () => {
    renderWithRouter(<RouteCompare />);
    const clickHandler = getClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeLatLng(36.35, 127.38)); });
    act(() => { clickHandler(makeLatLng(36.40, 127.40)); });
    await screen.findByText('날씨 최적 경로');
    const walkButtons = screen.getAllByText('도보');
    fireEvent.click(walkButtons[0]);
    expect(screen.getByText('날씨 맞춤 · 그늘길 도보')).toBeInTheDocument();
  });

  it('SegMode 자전거 버튼 클릭 시 설명이 자전거로 바뀐다', async () => {
    renderWithRouter(<RouteCompare />);
    const clickHandler = getClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeLatLng(36.35, 127.38)); });
    act(() => { clickHandler(makeLatLng(36.40, 127.40)); });
    await screen.findByText('최단 경로');
    const bikeButtons = screen.getAllByText('자전거');
    fireEvent.click(bikeButtons[1]);
    expect(screen.getByText('자전거 최단 경로')).toBeInTheDocument();
  });

  it('warnings가 있으면 경고 박스를 표시한다', async () => {
    mockFetchRoute.mockResolvedValue({
      ...ROUTE_DATA,
      warnings: ['주의: 우천 예상'],
    });
    renderWithRouter(<RouteCompare />);
    const clickHandler = getClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeLatLng(36.35, 127.38)); });
    act(() => { clickHandler(makeLatLng(36.40, 127.40)); });
    expect(await screen.findByText('주의: 우천 예상')).toBeInTheDocument();
  });

  it('"커스텀 경로" 카드가 ready 상태에서 표시된다', async () => {
    renderWithRouter(<RouteCompare />);
    const clickHandler = getClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeLatLng(36.35, 127.38)); });
    act(() => { clickHandler(makeLatLng(36.40, 127.40)); });
    expect(await screen.findByText('커스텀 경로')).toBeInTheDocument();
  });

  it('error 상태에서 "다시 시도" 클릭 시 초기화된다', async () => {
    mockFetchRoute.mockRejectedValue(new Error('fail'));
    renderWithRouter(<RouteCompare />);
    const clickHandler = getClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeLatLng(36.35, 127.38)); });
    act(() => { clickHandler(makeLatLng(36.40, 127.40)); });
    await screen.findByText(/경로를 불러오지 못했어요/);
    fireEvent.click(screen.getByText('다시 시도'));
    expect(screen.queryByText('새 탐색')).not.toBeInTheDocument();
  });

  it('weather=null 시 기상 정보 없이 recommendation만 표시한다', async () => {
    mockFetchRoute.mockResolvedValue({
      ...ROUTE_DATA,
      weather: null,
    });
    renderWithRouter(<RouteCompare />);
    const clickHandler = getClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeLatLng(36.35, 127.38)); });
    act(() => { clickHandler(makeLatLng(36.40, 127.40)); });
    expect(await screen.findByText('날씨가 좋아요')).toBeInTheDocument();
  });

  it('"카카오 내비로 안내" 버튼 클릭 시 window.open이 호출된다', async () => {
    window.open = vi.fn();
    renderWithRouter(<RouteCompare />);
    const clickHandler = getClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeLatLng(36.35, 127.38)); });
    act(() => { clickHandler(makeLatLng(36.40, 127.40)); });
    await screen.findByText('날씨 최적 경로');
    const naviButtons = screen.getAllByText('카카오 내비로 안내');
    fireEvent.click(naviButtons[0]);
    expect(window.open).toHaveBeenCalled();
  });

  it('SegMode car 버튼 클릭 시 설명이 자동차로 바뀐다', async () => {
    renderWithRouter(<RouteCompare />);
    const clickHandler = getClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeLatLng(36.35, 127.38)); });
    act(() => { clickHandler(makeLatLng(36.40, 127.40)); });
    await screen.findByText('최단 경로');
    const walkButtons = screen.getAllByText('도보');
    fireEvent.click(walkButtons[1]);
    const carButtons = screen.getAllByText('자동차');
    fireEvent.click(carButtons[1]);
    expect(screen.getByText('시간 최단 · 카카오 내비')).toBeInTheDocument();
  });
});
