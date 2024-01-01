import { useEffect, useRef, useState } from 'react';

import { useWindow } from './useWindow';

interface UseIntersectionObserverProps extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export const useVisibleChildren = (
  element: Element | null,
  {
    root = null,
    rootMargin = '0%',
    threshold = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    freezeOnceVisible = false,
  }: UseIntersectionObserverProps = {},
) => {
  const [activeChildren, setActiveChildren] = useState<Element | null>(null);
  const activeEntryRef = useRef<IntersectionObserverEntry>();

  useEffect(() => {
    const updateEntry = ([entry]: IntersectionObserverEntry[]) => {
      const { intersectionRatio, isIntersecting, target } = entry;
      const { current: activeEntry } = activeEntryRef;
      const frozen = isIntersecting && freezeOnceVisible;
      if (!frozen) {
        if (!activeEntry || target === activeEntry.target || intersectionRatio >= activeEntry.intersectionRatio) {
          activeEntryRef.current = entry;
        }
        setActiveChildren(activeEntryRef.current?.target || null);
      }
    };

    if (element && window.IntersectionObserver) {
      const observerParams = { threshold, root, rootMargin };
      const observers = Array.from(element.children).map(children => {
        const observer = new IntersectionObserver(updateEntry, observerParams);
        observer.observe(children);
        return observer;
      });

      return () => observers.forEach(observer => observer.disconnect());
    }
  }, [element, freezeOnceVisible, root, rootMargin, threshold]);

  return activeChildren;
};

export const useVisible = (
  element: Element | null,
  { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false }: UseIntersectionObserverProps = {},
): boolean => {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const win = useWindow();

  const hasSupport = !!win?.IntersectionObserver;
  const isIntersecting = entry ? entry.isIntersecting : false;
  const frozen = !hasSupport || !element || (isIntersecting && freezeOnceVisible);

  useEffect(() => {
    if (frozen) {
      return;
    }

    const updateEntry = ([entry]: IntersectionObserverEntry[]) => setEntry(entry);
    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(element);

    return () => observer.disconnect();
  }, [element, threshold, root, rootMargin, frozen]);

  return frozen || isIntersecting;
};
