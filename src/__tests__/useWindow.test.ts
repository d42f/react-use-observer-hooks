import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useWindow } from '../useWindow';

describe('useWindow', () => {
  it('returns window object in browser environment', () => {
    const { result } = renderHook(() => useWindow());
    expect(result.current).toBe(window);
  });
});
