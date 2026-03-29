import { useCallback, useEffect, useState } from 'react';
import type { RefCallback } from 'react';

import { useWindow } from './useWindow';

interface UseIntersectionObserverProps extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export const useVisible = <T extends HTMLElement>({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}): [RefCallback<T>, boolean] => {
  const [element, setElement] = useState<T | null>(null);
  const ref = useCallback((node: T | null) => setElement(node), []);
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const win = useWindow();

  const hasSupport = !!win?.IntersectionObserver;
  const isIntersecting = entry ? entry.isIntersecting : false;
  const frozen = !hasSupport || !element || (isIntersecting && freezeOnceVisible);

  useEffect(() => {
    if (frozen) return;

    const updateEntry = ([entry]: IntersectionObserverEntry[]) => {
      setEntry(entry);
    };
    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);
    observer.observe(element);

    return () => observer.disconnect();
  }, [element, threshold, root, rootMargin, frozen]);

  return [ref, frozen || isIntersecting];
};
