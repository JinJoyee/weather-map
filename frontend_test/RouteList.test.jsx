import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

const { mockApiGet, mockGetToken, mockApiDelete } = vi.hoisted(() => ({
  mockApiGet: vi.fn(),
  mockGetToken: vi.fn(),
  mockApiDelete: vi.fn(),
}));

vi.mock('../frontend/src/api/client', () => ({
  api: { get: mockApiGet, delete: mockApiDelete },
}));

vi.mock('../frontend/src/api/auth', () => ({
  getToken: mockGetToken,
}));

import { ThemeProvider } from '../frontend/src/context/ThemeContext';
import RouteList from '../frontend/src/components/Route/RouteList';

function renderWithRouter(ui) {
  return render(<ThemeProvider><MemoryRouter>{ui}</MemoryRouter></ThemeProvider>);
}

describe('RouteList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiDelete.mockResolvedValue({});
  });

  it('토큰 없을 때 로그인 안내를 표시한다', () => {
    mockGetToken.mockReturnValue(null);
    renderWithRouter(<RouteList />);
    expect(screen.getByText('로그인이 필요해요')).toBeInTheDocument();
  });

  it('토큰 없을 때 로그인 버튼을 표시한다', () => {
    mockGetToken.mockReturnValue(null);
    renderWithRouter(<RouteList />);
    expect(screen.getByRole('button', { name: /로그인/ })).toBeInTheDocument();
  });

  it('토큰 있을 때 로딩 상태를 표시한다', () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockReturnValue(new Promise(() => {}));
    renderWithRouter(<RouteList />);
    expect(screen.getAllByTestId('skeleton-route-card').length).toBeGreaterThan(0);
  });

  it('API 성공 시 경로 이름을 표시한다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({ data: { routes: [{ id: 1, name: '집→회사', waypoints: [], created_at: '2026-01-01' }] } });
    renderWithRouter(<RouteList />);
    expect(await screen.findByText('집→회사')).toBeInTheDocument();
  });

  it('API 에러 시 "불러오지 못했어요"를 표시한다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockRejectedValue({ request: {}, response: undefined });
    renderWithRouter(<RouteList />);
    expect(await screen.findByText('불러오지 못했어요')).toBeInTheDocument();
  });

  it('빈 목록이면 "아직 저장된 경로가 없어요"를 표시한다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({ data: { routes: [] } });
    renderWithRouter(<RouteList />);
    expect(await screen.findByText('아직 저장된 경로가 없어요')).toBeInTheDocument();
  });

  it('context_tag가 있으면 배지를 표시한다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({
      data: { routes: [{ id: 1, name: '출근길', context_tag: '그늘', waypoints: [], created_at: '2026-01-01' }] },
    });
    renderWithRouter(<RouteList />);
    expect(await screen.findByText('그늘')).toBeInTheDocument();
  });

  it('is_public이면 "공개" 배지를 표시한다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({
      data: { routes: [{ id: 1, name: '출근길', is_public: true, waypoints: [], created_at: '2026-01-01' }] },
    });
    renderWithRouter(<RouteList />);
    expect(await screen.findByText('공개')).toBeInTheDocument();
  });

  it('경로 항목 클릭 시 RouteMapModal이 열린다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({
      data: { routes: [{ id: 1, name: '집→회사', waypoints: [], created_at: '2026-01-01', start_lat: 36.35, start_lng: 127.38, end_lat: 36.40, end_lng: 127.40 }] },
    });
    renderWithRouter(<RouteList />);
    const item = await screen.findByText('집→회사');
    fireEvent.click(item.closest('.cursor-pointer'));
    expect(screen.getByText('×')).toBeInTheDocument();
  });

  it('모달 닫기 버튼 클릭 시 모달이 닫힌다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({
      data: { routes: [{ id: 1, name: '집→회사', waypoints: [], created_at: '2026-01-01', start_lat: 36.35, start_lng: 127.38, end_lat: 36.40, end_lng: 127.40 }] },
    });
    renderWithRouter(<RouteList />);
    const item = await screen.findByText('집→회사');
    fireEvent.click(item.closest('.cursor-pointer'));
    fireEvent.click(screen.getByText('×'));
    expect(screen.queryByText('×')).not.toBeInTheDocument();
  });

  it('삭제 버튼 클릭 시 confirm 후 delete API를 호출한다', async () => {
    window.confirm = vi.fn(() => true);
    const mockDelete = vi.fn().mockResolvedValue({});
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({
      data: { routes: [{ id: 5, name: '출근길', waypoints: [], created_at: '2026-01-01' }] },
    });
    vi.mocked(mockApiGet).mockImplementation(() =>
      Promise.resolve({ data: { routes: [{ id: 5, name: '출근길', waypoints: [], created_at: '2026-01-01' }] } })
    );
    renderWithRouter(<RouteList />);
    await screen.findByText('출근길');
    const deleteBtn = screen.getByText('삭제');
    fireEvent.click(deleteBtn);
    expect(window.confirm).toHaveBeenCalled();
  });

  it('confirm 취소 시 delete API가 호출되지 않는다', async () => {
    window.confirm = vi.fn(() => false);
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({
      data: { routes: [{ id: 5, name: '출근길', waypoints: [], created_at: '2026-01-01' }] },
    });
    renderWithRouter(<RouteList />);
    await screen.findByText('출근길');
    fireEvent.click(screen.getByText('삭제'));
    expect(window.confirm).toHaveBeenCalled();
  });

  it('삭제 성공 시 목록에서 항목이 제거된다', async () => {
    window.confirm = vi.fn(() => true);
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({
      data: { routes: [{ id: 5, name: '삭제될경로', waypoints: [], created_at: '2026-01-01' }] },
    });
    renderWithRouter(<RouteList />);
    await screen.findByText('삭제될경로');
    fireEvent.click(screen.getByText('삭제'));
    await waitFor(() => {
      expect(screen.queryByText('삭제될경로')).not.toBeInTheDocument();
    });
  });

  it('삭제 실패 시 alert를 표시한다', async () => {
    window.confirm = vi.fn(() => true);
    window.alert = vi.fn();
    mockApiDelete.mockRejectedValue({ response: { status: 500, data: {} } });
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({
      data: { routes: [{ id: 5, name: '삭제실패경로', waypoints: [], created_at: '2026-01-01' }] },
    });
    renderWithRouter(<RouteList />);
    await screen.findByText('삭제실패경로');
    fireEvent.click(screen.getByText('삭제'));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled();
    });
  });

  it('"로그인하기" 버튼 클릭이 동작한다', () => {
    mockGetToken.mockReturnValue(null);
    renderWithRouter(<RouteList />);
    const loginBtn = screen.getByRole('button', { name: /로그인/ });
    fireEvent.click(loginBtn);
  });

  it('"경로 그리러 가기" 버튼이 있다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({ data: { routes: [] } });
    renderWithRouter(<RouteList />);
    expect(await screen.findByText('경로 그리러 가기')).toBeInTheDocument();
  });

  it('"경로 그리러 가기" 버튼 클릭이 동작한다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({ data: { routes: [] } });
    renderWithRouter(<RouteList />);
    const btn = await screen.findByText('경로 그리러 가기');
    fireEvent.click(btn);
  });
});
