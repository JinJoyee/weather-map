import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

const { mockApiGet, mockGetToken } = vi.hoisted(() => ({
  mockApiGet: vi.fn(),
  mockGetToken: vi.fn(),
}));

vi.mock('../api/client', () => ({
  api: { get: mockApiGet, delete: vi.fn() },
}));

vi.mock('../api/auth', () => ({
  getToken: mockGetToken,
}));

import RouteList from '../components/Route/RouteList';

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

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
});
