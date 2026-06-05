import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import CustomRouteDraw from '../components/Route/CustomRouteDraw';

vi.mock('../api/client', () => ({
  api: { post: vi.fn() },
}));

vi.mock('../api/auth', () => ({
  getToken: vi.fn(() => null),
}));

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('CustomRouteDraw', () => {
  it('초기 출발지 안내 문구를 표시한다', () => {
    renderWithRouter(<CustomRouteDraw />);
    expect(screen.getByText(/출발지를 설정하세요/)).toBeInTheDocument();
  });

  it('"되돌리기" 버튼이 초기에 비활성화 상태이다', () => {
    renderWithRouter(<CustomRouteDraw />);
    expect(screen.getByText('되돌리기')).toBeDisabled();
  });

  it('"경로 저장" 버튼이 초기에 비활성화 상태이다', () => {
    renderWithRouter(<CustomRouteDraw />);
    expect(screen.getByText('경로 저장')).toBeDisabled();
  });

  it('"저장된 경로 보기" 링크를 표시한다', () => {
    renderWithRouter(<CustomRouteDraw />);
    expect(screen.getByText(/저장된 경로 보기/)).toBeInTheDocument();
  });
});
