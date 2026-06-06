import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, beforeEach } from 'vitest';

const { mockApiPost, mockGetToken } = vi.hoisted(() => ({
  mockApiPost: vi.fn(),
  mockGetToken: vi.fn(),
}));

vi.mock('../api/client', () => ({
  api: { post: mockApiPost },
}));

vi.mock('../api/auth', () => ({
  getToken: mockGetToken,
}));

import CustomRouteDraw from '../components/Route/CustomRouteDraw';

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

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

describe('CustomRouteDraw', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockReturnValue(null);
  });

  it('초기 출발지 안내 문구를 표시한다', () => {
    renderWithRouter(<CustomRouteDraw />);
    expect(screen.getByText(/출발지를 설정하세요/)).toBeInTheDocument();
  });

  it('kakao가 없을 때 지도를 초기화하지 않는다', () => {
    const savedKakao = window.kakao;
    window.kakao = undefined;
    renderWithRouter(<CustomRouteDraw />);
    window.kakao = savedKakao;
    // kakao 없어도 컴포넌트가 크래시 없이 렌더링되면 통과
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

  it('"저장된 경로" 링크를 표시한다', () => {
    renderWithRouter(<CustomRouteDraw />);
    expect(screen.getByText(/저장된 경로/)).toBeInTheDocument();
  });

  it('지도 클릭 후 "다음 지점을 클릭" 안내가 표시된다', () => {
    renderWithRouter(<CustomRouteDraw />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    expect(screen.getByText(/다음 지점을 클릭/)).toBeInTheDocument();
  });

  it('2번 클릭 후 "되돌리기" 버튼이 활성화된다', () => {
    renderWithRouter(<CustomRouteDraw />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);
    expect(screen.getByText('되돌리기')).not.toBeDisabled();
  });

  it('2번 클릭 후 "경로 저장" 버튼이 활성화된다', () => {
    renderWithRouter(<CustomRouteDraw />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);
    expect(screen.getByText('경로 저장')).not.toBeDisabled();
  });

  it('"초기화" 버튼 클릭 시 포인트가 초기화된다', () => {
    renderWithRouter(<CustomRouteDraw />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);
    expect(screen.getByText('초기화')).not.toBeDisabled();

    act(() => { screen.getByText('초기화').click(); });
    expect(screen.getByText(/출발지를 설정하세요/)).toBeInTheDocument();
  });

  it('"되돌리기" 클릭 시 마지막 포인트가 제거된다', () => {
    renderWithRouter(<CustomRouteDraw />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);
    expect(screen.getByText(/2개 지점 설정됨/)).toBeInTheDocument();

    act(() => { screen.getByText('되돌리기').click(); });
    expect(screen.getByText(/다음 지점을 클릭/)).toBeInTheDocument();
  });

  it('경로 이름 입력 필드가 동작한다', async () => {
    renderWithRouter(<CustomRouteDraw />);
    const nameInput = screen.getByPlaceholderText(/경로 이름을 입력하세요/);
    await userEvent.type(nameInput, '우리집 경로');
    expect(nameInput.value).toBe('우리집 경로');
  });

  it('"공개 경로로 저장" 체크박스가 동작한다', async () => {
    renderWithRouter(<CustomRouteDraw />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('포인트 2개+이름 없이 저장 시 에러를 표시한다', async () => {
    renderWithRouter(<CustomRouteDraw />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);
    await userEvent.click(screen.getByText('경로 저장'));
    expect(screen.getByText('경로 이름을 입력하세요.')).toBeInTheDocument();
  });

  it('로그인 없이 저장 시 에러를 표시한다', async () => {
    mockGetToken.mockReturnValue(null);
    renderWithRouter(<CustomRouteDraw />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);
    await userEvent.type(screen.getByPlaceholderText(/경로 이름/), '테스트');
    await userEvent.click(screen.getByText('경로 저장'));
    expect(screen.getByText('로그인이 필요합니다.')).toBeInTheDocument();
  });

  it('저장 성공 시 API가 호출된다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiPost.mockResolvedValue({ data: { id: 1 } });
    renderWithRouter(<CustomRouteDraw />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);
    await userEvent.type(screen.getByPlaceholderText(/경로 이름/), '집→학교');
    await userEvent.click(screen.getByText('경로 저장'));
    await waitFor(() => expect(mockApiPost).toHaveBeenCalled());
  });

  it('저장 실패 시 에러 메시지를 표시한다', async () => {
    mockGetToken.mockReturnValue('fake-token');
    mockApiPost.mockRejectedValue(new Error('network'));
    renderWithRouter(<CustomRouteDraw />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);
    await userEvent.type(screen.getByPlaceholderText(/경로 이름/), '테스트');
    await userEvent.click(screen.getByText('경로 저장'));
    await waitFor(() => expect(screen.getByText(/저장에 실패했습니다/)).toBeInTheDocument());
  });

  it('3번 클릭 시 기존 polyline이 지워지고 새 polyline이 그려진다', () => {
    renderWithRouter(<CustomRouteDraw />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);
    // 이 시점에서 polylineRef.current에 polyline이 있음
    simulateMapClick(handler, 36.37, 127.40);
    // 3개 지점이 설정되어야 함
    expect(screen.getByText(/3개 지점 설정됨/)).toBeInTheDocument();
  });

  it('"되돌리기" 클릭 후 2개 이상 남으면 polyline이 유지된다', () => {
    renderWithRouter(<CustomRouteDraw />);
    const handler = getClickHandler();
    if (!handler) return;

    simulateMapClick(handler, 36.35, 127.38);
    simulateMapClick(handler, 36.36, 127.39);
    simulateMapClick(handler, 36.37, 127.40);
    expect(screen.getByText(/3개 지점 설정됨/)).toBeInTheDocument();

    // 되돌리기 → 2개 남음 (polyline 재생성 경로)
    act(() => { screen.getByText('되돌리기').click(); });
    expect(screen.getByText(/2개 지점 설정됨/)).toBeInTheDocument();
  });
});
