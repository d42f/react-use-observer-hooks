export const useWindow = (): (Window & typeof globalThis) | null => (typeof window === 'object' ? window : null);
