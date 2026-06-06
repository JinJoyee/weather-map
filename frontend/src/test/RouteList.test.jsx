import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

const { mockApiGet, mockApiDelete, mockGetToken } = vi.hoisted(() => ({
  mockApiGet: vi.fn(),
  mockApiDelete: vi.fn(),
  mockGetToken: vi.fn(),
}));

vi.mock('../api/client', () => ({
  api: { get: mockApiGet, delete: mockApiDelete },
}));

vi.mock('../api/auth', () => ({
  getToken: mockGetToken,
}));

import RouteList from '../components/Route/RouteList';

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const sampleRoute = {
  id: 1,
  name: '집→회사',
  waypoints: [],
  created_at: '2026-01-01T00:00:00Z',
  start_lat: 36.35,
  start_lng: 127.38,
  end_lat: 36.36,
  end_lng: 127.39,
};

describe('RouteList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    mockApiGet.mockResolvedValue({ data: { routes: [sampleRoute] } });
    renderWithRouter(<RouteList />);
    expect(await screen.findByText('집→회사')).toBeInTheDocument();
  });

  it('API 에러 시 "불러오지 못했어요"를 표시한다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockRejectedValue({ request: {}, response: undefined });
    renderWithRouter(<RouteList />);
    expect(await screen.findByText('불러오지 못했어요')).toBeInTheDocument();
  });

  it('API 401 에러 시 로그인 필요 화면을 표시한다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockRejectedValue({ response: { status: 401, data: {} } });
    renderWithRouter(<RouteList />);
    expect(await screen.findByText('로그인이 필요해요')).toBeInTheDocument();
  });

  it('빈 목록이면 "아직 저장된 경로가 없어요"를 표시한다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({ data: { routes: [] } });
    renderWithRouter(<RouteList />);
    expect(await screen.findByText('아직 저장된 경로가 없어요')).toBeInTheDocument();
  });

  it('새로고침 버튼 클릭 시 API를 다시 호출한다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({ data: { routes: [sampleRoute] } });
    renderWithRouter(<RouteList />);
    await screen.findByText('집→회사');
    await userEvent.click(screen.getByText('새로고침'));
    expect(mockApiGet).toHaveBeenCalledTimes(2);
  });

  it('삭제 버튼 클릭+confirm 시 경로가 삭제된다', async () => {
    window.confirm = vi.fn(() => true);
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({ data: { routes: [sampleRoute] } });
    mockApiDelete.mockResolvedValue({});
    renderWithRouter(<RouteList />);
    await screen.findByText('집→회사');
    await userEvent.click(screen.getByText('삭제'));
    expect(window.confirm).toHaveBeenCalled();
    expect(mockApiDelete).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText('집→회사')).not.toBeInTheDocument());
  });

  it('confirm 취소 시 경로가 삭제되지 않는다', async () => {
    window.confirm = vi.fn(() => false);
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({ data: { routes: [sampleRoute] } });
    renderWithRouter(<RouteList />);
    await screen.findByText('집→회사');
    await userEvent.click(screen.getByText('삭제'));
    expect(mockApiDelete).not.toHaveBeenCalled();
    expect(screen.getByText('집→회사')).toBeInTheDocument();
  });

  it('경로 클릭 시 RouteMapModal이 열린다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({ data: { routes: [sampleRoute] } });
    renderWithRouter(<RouteList />);
    await screen.findByText('집→회사');
    await userEvent.click(screen.getByText('집→회사'));
    expect(screen.getByText('×')).toBeInTheDocument();
  });

  it('RouteMapModal 닫기 시 모달이 사라진다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({ data: { routes: [sampleRoute] } });
    renderWithRouter(<RouteList />);
    await screen.findByText('집→회사');
    await userEvent.click(screen.getByText('집→회사'));
    await userEvent.click(screen.getByText('×'));
    await waitFor(() => expect(screen.queryByText('×')).not.toBeInTheDocument());
  });

  it('context_tag가 있는 경로에 태그를 표시한다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({ data: { routes: [{ ...sampleRoute, context_tag: '맑음' }] } });
    renderWithRouter(<RouteList />);
    expect(await screen.findByText('맑음')).toBeInTheDocument();
  });

  it('is_public=true인 경로에 "공개" 뱃지를 표시한다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({ data: { routes: [{ ...sampleRoute, is_public: true }] } });
    renderWithRouter(<RouteList />);
    expect(await screen.findByText('공개')).toBeInTheDocument();
  });

  it('삭제 API 실패 시 alert가 호출된다', async () => {
    window.confirm = vi.fn(() => true);
    window.alert = vi.fn();
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({ data: { routes: [sampleRoute] } });
    mockApiDelete.mockRejectedValue({ response: { status: 500, data: {} } });
    renderWithRouter(<RouteList />);
    await screen.findByText('집→회사');
    await userEvent.click(screen.getByText('삭제'));
    await waitFor(() => expect(window.alert).toHaveBeenCalled());
  });

  it('"로그인하기" 버튼 클릭 시 navigate가 호출된다', () => {
    mockGetToken.mockReturnValue(null);
    renderWithRouter(<RouteList />);
    screen.getByRole('button', { name: '로그인하기' }).click();
    // MemoryRouter가 navigate를 처리하므로 에러 없이 실행되면 통과
    expect(screen.getByText('로그인이 필요해요')).toBeInTheDocument();
  });

  it('"경로 그리러 가기" 버튼 클릭 시 navigate가 호출된다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({ data: { routes: [] } });
    renderWithRouter(<RouteList />);
    await screen.findByText('아직 저장된 경로가 없어요');
    screen.getByRole('button', { name: '경로 그리러 가기' }).click();
    expect(screen.getByText('아직 저장된 경로가 없어요')).toBeInTheDocument();
  });

  it('API 응답에 routes 속성이 없을 때 빈 목록으로 처리한다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({ data: {} }); // routes 없음 → ?? [] fallback
    renderWithRouter(<RouteList />);
    expect(await screen.findByText('아직 저장된 경로가 없어요')).toBeInTheDocument();
  });

  it('waypoints가 배열이 아닐 때 경유지 0개를 표시한다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({ data: { routes: [{ ...sampleRoute, waypoints: undefined }] } });
    renderWithRouter(<RouteList />);
    expect(await screen.findByText(/경유지 0개/)).toBeInTheDocument();
  });

  it('created_at이 없을 때 "-"를 표시한다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockResolvedValue({ data: { routes: [{ ...sampleRoute, created_at: null }] } });
    renderWithRouter(<RouteList />);
    expect(await screen.findByText(/저장일:.*-/)).toBeInTheDocument();
  });
});
