import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import scrollIntoView from 'scroll-into-view-if-needed';

import { useAnchorObserver } from '../useAnchorObserver';

vi.mock('scroll-into-view-if-needed', () => ({
  default: vi.fn(() => Promise.resolve()),
}));

const stubIntersectionObserver = () => {
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn(function (this: unknown) {
      return { observe: vi.fn(), disconnect: vi.fn(), unobserve: vi.fn() };
    }),
  );
};

describe('useAnchorObserver', () => {
  beforeEach(() => {
    stubIntersectionObserver();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('returns ref, focusedAnchor and scrollToAnchor', () => {
    const { result } = renderHook(() => useAnchorObserver({ anchors: ['a', 'b', 'c'], currentAnchor: 'a' }));

    expect(result.current.ref).toBeInstanceOf(Function);
    expect(result.current.scrollToAnchor).toBeInstanceOf(Function);
  });

  it('scrollToAnchor calls scrollIntoView for the correct child element', async () => {
    const { result } = renderHook(() => useAnchorObserver({ anchors: ['a', 'b', 'c'], currentAnchor: 'a' }));

    const container = document.createElement('div');
    ['a', 'b', 'c'].forEach(() => container.appendChild(document.createElement('div')));

    act(() => {
      result.current.ref(container);
    });

    act(() => {
      result.current.scrollToAnchor('b');
    });

    expect(vi.mocked(scrollIntoView)).toHaveBeenCalledWith(
      container.children[1],
      expect.objectContaining({ block: 'start', scrollMode: 'if-needed' }),
    );
  });

  it('scrollToAnchor does nothing for unknown anchor', () => {
    const { result } = renderHook(() => useAnchorObserver({ anchors: ['a', 'b'], currentAnchor: 'a' }));

    const container = document.createElement('div');
    ['a', 'b'].forEach(() => container.appendChild(document.createElement('div')));

    act(() => {
      result.current.ref(container);
    });

    vi.clearAllMocks();

    act(() => {
      result.current.scrollToAnchor('unknown');
    });

    expect(vi.mocked(scrollIntoView)).not.toHaveBeenCalled();
  });

  it('onAnchorChange is not called when ref has no element', () => {
    const onAnchorChange = vi.fn();
    renderHook(() => useAnchorObserver({ anchors: ['a', 'b'], currentAnchor: 'a', onAnchorChange }));
    expect(onAnchorChange).not.toHaveBeenCalled();
  });
});
