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
    expect(screen.getByText('로그인이 필요합니다.')).toBeInTheDocument();
  });

  it('토큰 없을 때 로그인 링크를 표시한다', () => {
    mockGetToken.mockReturnValue(null);
    renderWithRouter(<RouteList />);
    expect(screen.getByRole('link', { name: /로그인/ })).toBeInTheDocument();
  });

  it('토큰 있을 때 로딩 상태를 표시한다', () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiGet.mockReturnValue(new Promise(() => {}));
    renderWithRouter(<RouteList />);
    expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
  });
});
