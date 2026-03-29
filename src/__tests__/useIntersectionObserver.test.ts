import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useVisible } from '../useIntersectionObserver';

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

interface MockObserverInstance {
  callback: ObserverCallback;
  elements: Element[];
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
}

const createMockIntersectionObserver = () => {
  const instances: MockObserverInstance[] = [];

  // Must be a real constructor function (not arrow) so `new` works
  const MockObserver = vi.fn(function (this: unknown, callback: ObserverCallback) {
    const instance: MockObserverInstance = {
      callback,
      elements: [],
      observe: vi.fn((el: Element) => instance.elements.push(el)),
      disconnect: vi.fn(() => {
        instance.elements = [];
        const idx = instances.indexOf(instance);
        if (idx >= 0) instances.splice(idx, 1);
      }),
      unobserve: vi.fn(),
    };
    instances.push(instance);
    return instance;
  });

  const trigger = (element: Element, entry: Partial<IntersectionObserverEntry>) => {
    instances.forEach(({ callback, elements }) => {
      if (elements.includes(element)) {
        callback([{ target: element, isIntersecting: false, intersectionRatio: 0, ...entry }]);
      }
    });
  };

  return { MockObserver, trigger, instances };
};

describe('useVisible', () => {
  let trigger: ReturnType<typeof createMockIntersectionObserver>['trigger'];

  beforeEach(() => {
    const mock = createMockIntersectionObserver();
    trigger = mock.trigger;
    vi.stubGlobal('IntersectionObserver', mock.MockObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns true when ref is not attached (assume visible fallback)', () => {
    const { result } = renderHook(() => useVisible());
    const [, isVisible] = result.current;
    // frozen = !hasSupport || !element — element is null, so frozen = true → returns true
    expect(isVisible).toBe(true);
  });

  it('returns false when element is not intersecting', () => {
    const el = document.createElement('div');
    const { result } = renderHook(() => useVisible());

    act(() => {
      result.current[0](el);
    });
    act(() => {
      trigger(el, { isIntersecting: false, intersectionRatio: 0 });
    });

    expect(result.current[1]).toBe(false);
  });

  it('returns true when element is intersecting', () => {
    const el = document.createElement('div');
    const { result } = renderHook(() => useVisible());

    act(() => {
      result.current[0](el);
    });
    act(() => {
      trigger(el, { isIntersecting: true, intersectionRatio: 1 });
    });

    expect(result.current[1]).toBe(true);
  });

  it('freezeOnceVisible keeps true after element leaves viewport', () => {
    const el = document.createElement('div');
    const { result } = renderHook(() => useVisible({ freezeOnceVisible: true }));

    act(() => {
      result.current[0](el);
    });
    act(() => {
      trigger(el, { isIntersecting: true, intersectionRatio: 1 });
    });
    expect(result.current[1]).toBe(true);

    act(() => {
      trigger(el, { isIntersecting: false, intersectionRatio: 0 });
    });
    expect(result.current[1]).toBe(true);
  });

  it('returns true when IntersectionObserver is not supported', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const el = document.createElement('div');
    const { result } = renderHook(() => useVisible());

    act(() => {
      result.current[0](el);
    });

    expect(result.current[1]).toBe(true);
  });
});
