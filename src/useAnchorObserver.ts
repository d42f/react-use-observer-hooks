import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefCallback } from 'react';
import scrollIntoView from 'scroll-into-view-if-needed';

import { getIntersectionRatio } from './utils/getIntersectionRatio';
import { smoothScrollBehavior } from './utils/smoothScroll';
import { throttle } from './utils/throttle';

const THRESHOLD = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

interface UseAnchorObserver<T> {
  ref: RefCallback<T>;
  focusedAnchor: string | undefined;
  scrollToAnchor: (anchor: string) => void;
}

interface UseAnchorObserverProps {
  anchors: string[];
  currentAnchor: string;
  offsetPx?: number;
  throttleMs?: number;
  onAnchorChange?: (anchor: string) => void;
}

export const useAnchorObserver = <T extends HTMLElement>({
  anchors,
  currentAnchor,
  offsetPx = 0,
  throttleMs = 50,
  onAnchorChange,
}: UseAnchorObserverProps): UseAnchorObserver<T> => {
  const [container, setContainer] = useState<T | null>(null);
  const ref = useCallback((node: T | null) => setContainer(node), []) as RefCallback<T>;

  const [, forceUpdate] = useState(0);
  const stateRef = useRef({ isInit: false, isLocked: false });
  const stableParamsRef = useRef({ anchors, onAnchorChange });
  const focusedAnchorRef = useRef<string | undefined>(undefined);
  const [focusedChild, setFocusedChild] = useState<Element | null>(null);

  currentAnchor = anchors.includes(currentAnchor) ? currentAnchor : anchors[0];
  const currentAnchorIndex = anchors.indexOf(currentAnchor);

  const actualAnchor = useMemo(() => {
    const childIndex = container && focusedChild ? Array.from(container.children).indexOf(focusedChild) : -1;
    return childIndex >= 0 ? anchors[childIndex] : undefined;
  }, [anchors, focusedChild, container]);

  useEffect(() => {
    if (!container || !window.IntersectionObserver) return;
    const updateEntry = throttle(([{ target }]: IntersectionObserverEntry[]) => {
      setFocusedChild(prev => (!prev || getIntersectionRatio(prev) < getIntersectionRatio(target) ? target : prev));
    }, throttleMs);
    const observers = Array.from(container.children).map(child => {
      const observer = new IntersectionObserver(updateEntry, { threshold: THRESHOLD });
      observer.observe(child);
      return observer;
    });
    return () => observers.forEach(o => o.disconnect());
  }, [container, throttleMs]);

  const focusedAnchor = useMemo(() => {
    if (!stateRef.current.isLocked) {
      focusedAnchorRef.current = actualAnchor;
    }
    return focusedAnchorRef.current;
  }, [actualAnchor]);

  const scrollToAnchor = useCallback(
    async (anchor: string) => {
      if (container) {
        const anchorIndex = stableParamsRef.current.anchors.indexOf(anchor);
        if (anchorIndex >= 0) {
          const child = container.children.item(anchorIndex);
          if (child) {
            focusedAnchorRef.current = anchor;
            forceUpdate(n => n + 1);

            stateRef.current.isLocked = true;
            await scrollIntoView(child, {
              behavior: smoothScrollBehavior(),
              block: 'start',
              scrollMode: 'if-needed',
            });
            stateRef.current.isLocked = false;
          }
        }
      }
    },
    [container],
  );

  useEffect(() => {
    stableParamsRef.current = { anchors, onAnchorChange };
  }, [anchors, onAnchorChange]);

  useEffect(() => {
    if (focusedAnchor && !stateRef.current.isLocked) {
      stableParamsRef.current?.onAnchorChange?.(focusedAnchor);
    }
  }, [focusedAnchor]);

  useEffect(() => {
    if (currentAnchor && currentAnchor !== focusedAnchorRef.current) {
      scrollToAnchor(currentAnchor);
    }
  }, [currentAnchor, scrollToAnchor]);

  useEffect(() => {
    if (!stateRef.current.isInit && container) {
      const child = currentAnchorIndex >= 0 ? container.children.item(currentAnchorIndex) : null;
      if (child) {
        stateRef.current.isInit = true;
        focusedAnchorRef.current = currentAnchor;
        scrollIntoView(child, { behavior: 'instant', block: 'start', scrollMode: 'if-needed' });
      }
    }
  }, [currentAnchor, currentAnchorIndex, container]);

  return { ref, focusedAnchor: focusedAnchorRef.current, scrollToAnchor };
};
