import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useWasScrolled } from '../useWasScrolled';

describe('useWasScrolled', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { writable: true, value: 0 });
  });

  it('returns false initially when not scrolled', () => {
    const { result } = renderHook(() => useWasScrolled());
    expect(result.current).toBe(false);
  });

  it('returns true when scrolled past offset', () => {
    const { result } = renderHook(() => useWasScrolled(undefined, 50));

    act(() => {
      Object.defineProperty(window, 'scrollY', { writable: true, value: 100 });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(true);
  });

  it('returns false when scrolled but not past offset', () => {
    const { result } = renderHook(() => useWasScrolled(undefined, 200));

    act(() => {
      Object.defineProperty(window, 'scrollY', { writable: true, value: 50 });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(false);
  });

  it('updates when scrolling back above offset', () => {
    const { result } = renderHook(() => useWasScrolled(undefined, 50));

    act(() => {
      Object.defineProperty(window, 'scrollY', { writable: true, value: 100 });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(true);

    act(() => {
      Object.defineProperty(window, 'scrollY', { writable: true, value: 10 });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(false);
  });

  it('uses scrollTop for HTMLElement', () => {
    const div = document.createElement('div');
    Object.defineProperty(div, 'scrollTop', { writable: true, value: 0 });

    const { result } = renderHook(() => useWasScrolled(div, 50));
    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(div, 'scrollTop', { writable: true, value: 100 });
      div.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(true);
  });

  it('removes scroll listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useWasScrolled());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
});
