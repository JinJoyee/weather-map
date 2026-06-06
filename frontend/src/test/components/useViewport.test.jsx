import { render, screen, act } from '@testing-library/react';
import { useState, useEffect } from 'react';
import { vi, beforeEach, afterEach } from 'vitest';
import useViewport, { DESKTOP_MIN } from '../../components/common/useViewport';

function ViewportConsumer() {
  const isDesktop = useViewport();
  return <div>{isDesktop ? 'desktop' : 'mobile'}</div>;
}

describe('useViewport', () => {
  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 0 });
  });

  it('window.innerWidth < 1024일 때 false(mobile)를 반환한다', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 0 });
    render(<ViewportConsumer />);
    expect(screen.getByText('mobile')).toBeInTheDocument();
  });

  it('window.innerWidth >= 1024일 때 true(desktop)를 반환한다', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
    render(<ViewportConsumer />);
    expect(screen.getByText('desktop')).toBeInTheDocument();
  });

  it('resize 이벤트 발생 시 isDesktop이 업데이트된다', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 0 });
    render(<ViewportConsumer />);
    expect(screen.getByText('mobile')).toBeInTheDocument();

    act(() => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
      window.dispatchEvent(new Event('resize'));
    });

    expect(screen.getByText('desktop')).toBeInTheDocument();
  });

  it('컴포넌트 언마운트 시 resize 리스너가 제거된다', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 0 });
    const { unmount } = render(<ViewportConsumer />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('DESKTOP_MIN이 1024이다', () => {
    expect(DESKTOP_MIN).toBe(1024);
  });
});
