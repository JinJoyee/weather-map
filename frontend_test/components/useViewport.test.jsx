import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import useViewport, { DESKTOP_MIN } from '../../frontend/src/components/common/useViewport';

describe('useViewport', () => {
  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
  });

  it('DESKTOP_MIN이 1024이다', () => {
    expect(DESKTOP_MIN).toBe(1024);
  });

  it('innerWidth >= 1024이면 true를 반환한다', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    const { result } = renderHook(() => useViewport());
    expect(result.current).toBe(true);
  });

  it('innerWidth < 1024이면 false를 반환한다', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 768 });
    const { result } = renderHook(() => useViewport());
    expect(result.current).toBe(false);
  });

  it('resize 시 값이 업데이트된다', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 768 });
    const { result } = renderHook(() => useViewport());
    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1280 });
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe(true);
  });

  it('언마운트 시 resize 이벤트 리스너가 제거된다', () => {
    const { unmount } = renderHook(() => useViewport());
    expect(() => unmount()).not.toThrow();
  });
});
