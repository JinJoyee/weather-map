import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

const { mockApiPost, mockGetToken } = vi.hoisted(() => ({
  mockApiPost: vi.fn(),
  mockGetToken: vi.fn(),
}));

vi.mock('../frontend/src/api/client', () => ({
  api: { post: mockApiPost },
}));

vi.mock('../frontend/src/api/auth', () => ({
  getToken: mockGetToken,
}));

vi.mock('../frontend/src/components/common/useViewport', () => ({
  default: vi.fn(() => true),
  DESKTOP_MIN: 1024,
}));

import CustomRouteDraw from '../frontend/src/components/Route/CustomRouteDraw';

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

function getMapClickHandler() {
  const calls = window.kakao.maps.event.addListener.mock.calls;
  const clickCall = calls.find((c) => c[1] === 'click');
  return clickCall ? clickCall[2] : null;
}

function makeMapEvent(lat, lng) {
  const latLng = new window.kakao.maps.LatLng(lat, lng);
  return { latLng };
}

describe('CustomRouteDraw', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockReturnValue('fake-token');
    mockApiPost.mockResolvedValue({ data: {} });
  });

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

  it('"저장된 경로" 링크를 표시한다', () => {
    renderWithRouter(<CustomRouteDraw />);
    expect(screen.getByText(/저장된 경로/)).toBeInTheDocument();
  });

  it('지도 1번 클릭 후 "다음 지점 클릭" 안내로 변경된다', async () => {
    renderWithRouter(<CustomRouteDraw />);
    const clickHandler = getMapClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeMapEvent(36.35, 127.38)); });
    await waitFor(() => {
      expect(screen.getByText(/다음 지점을 클릭하세요/)).toBeInTheDocument();
    });
  });

  it('지도 2번 클릭 후 "2개 지점 설정됨" 안내로 변경된다', async () => {
    renderWithRouter(<CustomRouteDraw />);
    const clickHandler = getMapClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeMapEvent(36.35, 127.38)); });
    act(() => { clickHandler(makeMapEvent(36.40, 127.40)); });
    await waitFor(() => {
      expect(screen.getByText(/2개 지점 설정됨/)).toBeInTheDocument();
    });
  });

  it('지도 2번 클릭 후 "경로 저장" 버튼이 활성화된다', async () => {
    renderWithRouter(<CustomRouteDraw />);
    const clickHandler = getMapClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeMapEvent(36.35, 127.38)); });
    act(() => { clickHandler(makeMapEvent(36.40, 127.40)); });
    await waitFor(() => {
      expect(screen.getByText('경로 저장')).not.toBeDisabled();
    });
  });

  it('지도 1번 클릭 후 되돌리기 버튼이 활성화된다', async () => {
    renderWithRouter(<CustomRouteDraw />);
    const clickHandler = getMapClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeMapEvent(36.35, 127.38)); });
    await waitFor(() => {
      expect(screen.getByText('되돌리기')).not.toBeDisabled();
    });
  });

  it('되돌리기 클릭 시 지점이 1개 줄어든다', async () => {
    renderWithRouter(<CustomRouteDraw />);
    const clickHandler = getMapClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeMapEvent(36.35, 127.38)); });
    act(() => { clickHandler(makeMapEvent(36.40, 127.40)); });
    await waitFor(() => expect(screen.getByText(/2개 지점/)).toBeInTheDocument());
    fireEvent.click(screen.getByText('되돌리기'));
    await waitFor(() => expect(screen.getByText(/다음 지점을 클릭하세요/)).toBeInTheDocument());
  });

  it('초기화 버튼 클릭 시 모든 지점이 제거된다', async () => {
    renderWithRouter(<CustomRouteDraw />);
    const clickHandler = getMapClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeMapEvent(36.35, 127.38)); });
    act(() => { clickHandler(makeMapEvent(36.40, 127.40)); });
    await waitFor(() => expect(screen.getByText(/2개 지점/)).toBeInTheDocument());
    fireEvent.click(screen.getByText('초기화'));
    await waitFor(() => expect(screen.getByText(/출발지를 설정하세요/)).toBeInTheDocument());
  });

  it('이름 없이 저장 시 에러 메시지가 표시된다', async () => {
    renderWithRouter(<CustomRouteDraw />);
    const clickHandler = getMapClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeMapEvent(36.35, 127.38)); });
    act(() => { clickHandler(makeMapEvent(36.40, 127.40)); });
    await waitFor(() => expect(screen.getByText('경로 저장')).not.toBeDisabled());
    fireEvent.click(screen.getByText('경로 저장'));
    await waitFor(() => {
      expect(screen.getByText(/경로 이름을 입력하세요/)).toBeInTheDocument();
    });
  });

  it('로그인 없이 저장 시 로그인 필요 에러를 표시한다', async () => {
    mockGetToken.mockReturnValue(null);
    renderWithRouter(<CustomRouteDraw />);
    const clickHandler = getMapClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeMapEvent(36.35, 127.38)); });
    act(() => { clickHandler(makeMapEvent(36.40, 127.40)); });
    await waitFor(() => expect(screen.getByText('경로 저장')).not.toBeDisabled());
    await userEvent.type(screen.getByPlaceholderText(/경로 이름/), '집→회사');
    fireEvent.click(screen.getByText('경로 저장'));
    await waitFor(() => {
      expect(screen.getByText(/로그인이 필요합니다/)).toBeInTheDocument();
    });
  });

  it('저장 성공 시 API가 호출된다', async () => {
    renderWithRouter(<CustomRouteDraw />);
    const clickHandler = getMapClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeMapEvent(36.35, 127.38)); });
    act(() => { clickHandler(makeMapEvent(36.40, 127.40)); });
    await waitFor(() => expect(screen.getByText('경로 저장')).not.toBeDisabled());
    await userEvent.type(screen.getByPlaceholderText(/경로 이름/), '집→회사');
    fireEvent.click(screen.getByText('경로 저장'));
    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalled();
    });
  });

  it('저장 실패 시 에러 메시지가 표시된다', async () => {
    mockApiPost.mockRejectedValue(new Error('500'));
    renderWithRouter(<CustomRouteDraw />);
    const clickHandler = getMapClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeMapEvent(36.35, 127.38)); });
    act(() => { clickHandler(makeMapEvent(36.40, 127.40)); });
    await waitFor(() => expect(screen.getByText('경로 저장')).not.toBeDisabled());
    await userEvent.type(screen.getByPlaceholderText(/경로 이름/), '집→회사');
    fireEvent.click(screen.getByText('경로 저장'));
    await waitFor(() => {
      expect(screen.getByText(/저장에 실패했습니다/)).toBeInTheDocument();
    });
  });

  it('"공개 경로로 저장" 체크박스를 토글할 수 있다', () => {
    renderWithRouter(<CustomRouteDraw />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('경로 이름 입력 필드가 있다', () => {
    renderWithRouter(<CustomRouteDraw />);
    expect(screen.getByPlaceholderText(/경로 이름을 입력하세요/)).toBeInTheDocument();
  });

  it('3번 클릭 시 이전 폴리라인이 지워지고 새 폴리라인이 그려진다', async () => {
    renderWithRouter(<CustomRouteDraw />);
    const clickHandler = getMapClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeMapEvent(36.35, 127.38)); });
    act(() => { clickHandler(makeMapEvent(36.40, 127.40)); });
    await waitFor(() => expect(screen.getByText(/2개 지점/)).toBeInTheDocument());
    act(() => { clickHandler(makeMapEvent(36.42, 127.42)); });
    await waitFor(() => expect(screen.getByText(/3개 지점/)).toBeInTheDocument());
  });

  it('3점에서 되돌리기 후 2점이 남고 폴리라인이 재그려진다', async () => {
    renderWithRouter(<CustomRouteDraw />);
    const clickHandler = getMapClickHandler();
    if (!clickHandler) return;
    act(() => { clickHandler(makeMapEvent(36.35, 127.38)); });
    act(() => { clickHandler(makeMapEvent(36.40, 127.40)); });
    act(() => { clickHandler(makeMapEvent(36.42, 127.42)); });
    await waitFor(() => expect(screen.getByText(/3개 지점/)).toBeInTheDocument());
    fireEvent.click(screen.getByText('되돌리기'));
    await waitFor(() => expect(screen.getByText(/2개 지점/)).toBeInTheDocument());
  });
});
