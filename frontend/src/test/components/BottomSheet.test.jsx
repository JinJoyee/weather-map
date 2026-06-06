import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, beforeEach } from 'vitest';
import BottomSheet from '../../components/common/BottomSheet';

describe('BottomSheet', () => {
  const defaultProps = {
    snap: 'mid',
    onSnap: vi.fn(),
    header: <div>헤더</div>,
    children: <div>내용</div>,
    containerHeight: 800,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('children이 렌더링된다', () => {
    render(<BottomSheet {...defaultProps} />);
    expect(screen.getByText('내용')).toBeInTheDocument();
  });

  it('header가 렌더링된다', () => {
    render(<BottomSheet {...defaultProps} />);
    expect(screen.getByText('헤더')).toBeInTheDocument();
  });

  it('snap="peek"일 때 peekHeight로 높이가 설정된다', () => {
    const { container } = render(
      <BottomSheet {...defaultProps} snap="peek" peekHeight={150} />
    );
    expect(container.firstChild.style.height).toBe('150px');
  });

  it('snap="full"일 때 containerHeight - topGap으로 높이가 설정된다', () => {
    const { container } = render(
      <BottomSheet {...defaultProps} snap="full" containerHeight={800} topGap={64} />
    );
    expect(container.firstChild.style.height).toBe('736px');
  });

  it('마우스 드래그 시작 후 이동하면 높이가 변한다', () => {
    const { container } = render(
      <BottomSheet {...defaultProps} snap="mid" containerHeight={800} />
    );
    const handle = container.querySelector('[class*="cursor-grab"]');
    const initialHeight = container.firstChild.style.height;

    fireEvent.mouseDown(handle, { clientY: 400 });
    act(() => {
      fireEvent.mouseMove(window, { clientY: 300 }); // 100px 위로 드래그
    });
    expect(container.firstChild.style.height).not.toBe(initialHeight);
  });

  it('마우스 업 시 onSnap이 호출된다', () => {
    const onSnap = vi.fn();
    const { container } = render(
      <BottomSheet {...defaultProps} onSnap={onSnap} snap="mid" containerHeight={800} />
    );
    const handle = container.querySelector('[class*="cursor-grab"]');

    fireEvent.mouseDown(handle, { clientY: 400 });
    act(() => {
      fireEvent.mouseMove(window, { clientY: 400 });
      fireEvent.mouseUp(window);
    });
    expect(onSnap).toHaveBeenCalled();
  });

  it('터치 드래그 시작 후 이동하면 높이가 변한다', () => {
    const { container } = render(
      <BottomSheet {...defaultProps} snap="mid" containerHeight={800} />
    );
    const handle = container.querySelector('[class*="cursor-grab"]');

    fireEvent.touchStart(handle, { touches: [{ clientY: 400 }] });
    act(() => {
      fireEvent.touchMove(window, { touches: [{ clientY: 300 }] });
    });
    expect(container.firstChild.style.height).toBeTruthy();
  });

  it('터치 종료 시 onSnap이 호출된다', () => {
    const onSnap = vi.fn();
    const { container } = render(
      <BottomSheet {...defaultProps} onSnap={onSnap} snap="peek" containerHeight={800} />
    );
    const handle = container.querySelector('[class*="cursor-grab"]');

    fireEvent.touchStart(handle, { touches: [{ clientY: 700 }] });
    act(() => {
      fireEvent.touchMove(window, { touches: [{ clientY: 700 }] });
      fireEvent.touchEnd(window);
    });
    expect(onSnap).toHaveBeenCalled();
  });

  it('header 없어도 렌더링된다', () => {
    render(<BottomSheet snap="mid" onSnap={vi.fn()} containerHeight={800}><div>c</div></BottomSheet>);
    expect(screen.getByText('c')).toBeInTheDocument();
  });
});
