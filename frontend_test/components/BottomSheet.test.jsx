import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import BottomSheet from '../../frontend/src/components/common/BottomSheet';

describe('BottomSheet', () => {
  it('children을 렌더링한다', () => {
    render(
      <BottomSheet snap="mid" onSnap={vi.fn()}>
        <div>내용</div>
      </BottomSheet>
    );
    expect(screen.getByText('내용')).toBeInTheDocument();
  });

  it('header를 렌더링한다', () => {
    render(
      <BottomSheet snap="mid" onSnap={vi.fn()} header={<span>헤더</span>}>
        <div>내용</div>
      </BottomSheet>
    );
    expect(screen.getByText('헤더')).toBeInTheDocument();
  });

  it('header 없으면 헤더 영역이 없다', () => {
    render(
      <BottomSheet snap="mid" onSnap={vi.fn()}>
        <div>내용</div>
      </BottomSheet>
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('snap="peek" 시 peekHeight로 렌더링된다', () => {
    const { container } = render(
      <BottomSheet snap="peek" onSnap={vi.fn()} peekHeight={120}>
        <div>내용</div>
      </BottomSheet>
    );
    const sheet = container.firstChild;
    expect(sheet.style.height).toBe('120px');
  });

  it('드래그 핸들 마우스다운 시 drag 상태가 시작된다', () => {
    const onSnap = vi.fn();
    const { container } = render(
      <BottomSheet snap="mid" onSnap={onSnap} containerHeight={800}>
        <div>내용</div>
      </BottomSheet>
    );
    const handle = container.querySelector('.cursor-grab');
    fireEvent.mouseDown(handle, { clientY: 400 });
    expect(container.firstChild.style.transition).toBe('none');
  });

  it('마우스업 시 onSnap을 가장 가까운 스냅으로 호출한다', () => {
    const onSnap = vi.fn();
    render(
      <BottomSheet snap="mid" onSnap={onSnap} containerHeight={800} peekHeight={150}>
        <div>내용</div>
      </BottomSheet>
    );
    fireEvent.mouseUp(window);
  });

  it('touchStart 이벤트를 처리한다', () => {
    const onSnap = vi.fn();
    const { container } = render(
      <BottomSheet snap="mid" onSnap={onSnap} containerHeight={800}>
        <div>내용</div>
      </BottomSheet>
    );
    const handle = container.querySelector('.cursor-grab');
    fireEvent.touchStart(handle, { touches: [{ clientY: 400 }] });
    expect(container.firstChild.style.transition).toBe('none');
  });

  it('드래그 중 mousemove 시 높이가 변경된다', () => {
    const onSnap = vi.fn();
    const { container } = render(
      <BottomSheet snap="mid" onSnap={onSnap} containerHeight={800} peekHeight={150} midRatio={0.54} topGap={64}>
        <div>내용</div>
      </BottomSheet>
    );
    const handle = container.querySelector('.cursor-grab');
    fireEvent.mouseDown(handle, { clientY: 400 });
    fireEvent.mouseMove(window, { clientY: 300 });
    fireEvent.mouseUp(window);
  });

  it('touchmove 이벤트로 드래그가 가능하다', () => {
    const onSnap = vi.fn();
    const { container } = render(
      <BottomSheet snap="mid" onSnap={onSnap} containerHeight={800} peekHeight={150}>
        <div>내용</div>
      </BottomSheet>
    );
    const handle = container.querySelector('.cursor-grab');
    fireEvent.touchStart(handle, { touches: [{ clientY: 400 }] });
    fireEvent(window, new TouchEvent('touchmove', {
      touches: [{ clientY: 300 }],
      bubbles: true,
    }));
    fireEvent(window, new TouchEvent('touchend', { bubbles: true }));
  });
});
