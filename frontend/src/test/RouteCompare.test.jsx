import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import RouteCompare from '../components/Route/RouteCompare';

vi.mock('../api/route', () => ({
  fetchRouteRecommend: vi.fn(),
}));

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('RouteCompare', () => {
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
});
