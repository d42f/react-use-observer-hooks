import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefCallback } from 'react';
import scrollIntoView from 'scroll-into-view-if-needed';

import { smoothScrollBehavior } from './smoothScroll';

interface UseAnchorObserver<T> {
  ref: RefCallback<T>;
  focusedAnchor: string | undefined;
  scrollToAnchor: (anchor: string) => void;
}

interface UseAnchorObserverProps {
  anchors: string[];
  currentAnchor: string;
  onAnchorChange?: (anchor: string) => void;
}

const THRESHOLD = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

export const useAnchorObserver = <T extends HTMLElement>({
  anchors,
  currentAnchor,
  onAnchorChange,
}: UseAnchorObserverProps): UseAnchorObserver<T> => {
  const [container, setContainer] = useState<T | null>(null);
  const ref = useCallback((node: T | null) => setContainer(node), []) as RefCallback<T>;

  const stateRef = useRef({ isInit: false, isLocked: false });
  const [, forceUpdate] = useState(0);
  const changeListenerRef = useRef(onAnchorChange);
  const focusedAnchorRef = useRef<string | undefined>(undefined);

  const [activeChild, setActiveChild] = useState<Element | null>(null);
  const activeEntryRef = useRef<IntersectionObserverEntry>(null);

  useEffect(() => {
    if (!container || !window.IntersectionObserver) return;

    const updateEntry = ([entry]: IntersectionObserverEntry[]) => {
      const { intersectionRatio, target } = entry;
      const { current: activeEntry } = activeEntryRef;
      if (!activeEntry || target === activeEntry.target || intersectionRatio >= activeEntry.intersectionRatio) {
        activeEntryRef.current = entry;
      }
      setActiveChild(activeEntryRef.current?.target || null);
    };

    const observers = Array.from(container.children).map(child => {
      const observer = new IntersectionObserver(updateEntry, { threshold: THRESHOLD });
      observer.observe(child);
      return observer;
    });

    return () => observers.forEach(o => o.disconnect());
  }, [container]);

  const focusedAnchor = useMemo(() => {
    if (!stateRef.current.isLocked) {
      const childIndex = container && activeChild ? Array.from(container.children).indexOf(activeChild) : -1;
      focusedAnchorRef.current = childIndex >= 0 ? anchors[childIndex] : undefined;
    }
    return focusedAnchorRef.current;
  }, [anchors, activeChild, container]);

  const scrollToAnchor = useCallback(
    (anchor: string) => {
      if (container) {
        const anchorIndex = anchors.indexOf(anchor);
        if (anchorIndex >= 0) {
          const child = container.children.item(anchorIndex);
          if (child) {
            focusedAnchorRef.current = anchor;
            stateRef.current.isLocked = true;
            scrollIntoView<Promise<unknown>>(child, {
              behavior: smoothScrollBehavior(),
              block: 'start',
              scrollMode: 'if-needed',
            }).finally(() => {
              stateRef.current.isLocked = false;
              forceUpdate(n => n + 1);
            });
          }
        }
      }
    },
    [anchors, container],
  );

  useEffect(() => {
    changeListenerRef.current = onAnchorChange;
  }, [onAnchorChange]);

  useEffect(() => {
    if (focusedAnchor && !stateRef.current.isLocked) {
      changeListenerRef.current?.(focusedAnchor);
    }
  }, [focusedAnchor]);

  useEffect(() => {
    if (currentAnchor && currentAnchor !== focusedAnchorRef.current && !stateRef.current.isLocked) {
      scrollToAnchor(currentAnchor);
    }
  }, [currentAnchor, scrollToAnchor]);

  useEffect(() => {
    if (!stateRef.current.isInit && container) {
      const anchorIndex = anchors.indexOf(currentAnchor);
      const child = anchorIndex >= 0 ? container.children.item(anchorIndex) : null;
      if (child) {
        stateRef.current.isInit = true;
        focusedAnchorRef.current = currentAnchor;
        scrollIntoView(child, { behavior: 'instant', block: 'start', scrollMode: 'if-needed' });
      }
    }
  }, [currentAnchor, anchors, container]);

  return { ref, focusedAnchor: focusedAnchorRef.current, scrollToAnchor };
};
