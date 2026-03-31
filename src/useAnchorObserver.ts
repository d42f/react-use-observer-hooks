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
  currentAnchor: currentAnchorProp,
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

  const currentAnchor = anchors.includes(currentAnchorProp) ? currentAnchorProp : undefined;
  const currentAnchorIndex = currentAnchor !== undefined ? anchors.indexOf(currentAnchor) : -1;

  const actualAnchor = useMemo(() => {
    const childIndex = container && focusedChild ? Array.from(container.children).indexOf(focusedChild) : -1;
    return childIndex >= 0 ? anchors[childIndex] : undefined;
  }, [anchors, focusedChild, container]);

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
              behavior: actions =>
                smoothScrollBehavior()(actions.map(a => ({ ...a, top: Math.max(0, a.top - offsetPx) }))),
              block: 'start',
              scrollMode: 'if-needed',
            });
            stateRef.current.isLocked = false;
          }
        }
      }
    },
    [container, offsetPx],
  );

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    stableParamsRef.current = { anchors, onAnchorChange };
  }, [anchors, onAnchorChange]);

  useEffect(() => {
    if (!container || !window.IntersectionObserver) return;
    const updateEntry = throttle(([{ target }]: IntersectionObserverEntry[]) => {
      setFocusedChild(prev => (!prev || getIntersectionRatio(prev) < getIntersectionRatio(target) ? target : prev));
    }, throttleMs);
    const observers = Array.from(container.children).map(child => {
      const observer = new IntersectionObserver(updateEntry, {
        threshold: THRESHOLD,
        rootMargin: `-${offsetPx}px 0px 0px 0px`,
      });
      observer.observe(child);
      return observer;
    });
    return () => observers.forEach(o => o.disconnect());
  }, [container, throttleMs, offsetPx]);

  useEffect(() => {
    if (focusedAnchor && stateRef.current.isInit && !stateRef.current.isLocked) {
      stableParamsRef.current?.onAnchorChange?.(focusedAnchor);
    }
  }, [focusedAnchor]);

  useEffect(() => {
    if (currentAnchor && stateRef.current.isInit && currentAnchor !== focusedAnchorRef.current) {
      scrollToAnchor(currentAnchor);
    }
  }, [currentAnchor, scrollToAnchor]);

  useEffect(() => {
    (async () => {
      if (!stateRef.current.isInit && container && currentAnchor) {
        const child = currentAnchorIndex >= 0 ? container.children.item(currentAnchorIndex) : null;
        if (child) {
          stateRef.current.isLocked = true;
          await scrollIntoView(child, {
            behavior: actions => {
              actions.forEach(({ el, left, top }) => {
                el.scrollLeft = left;
                el.scrollTop = Math.max(0, top - offsetPx);
              });
              return Promise.resolve([]);
            },
            block: 'start',
            scrollMode: 'if-needed',
          });
          stateRef.current.isLocked = false;

          focusedAnchorRef.current = currentAnchor;
          stableParamsRef.current?.onAnchorChange?.(currentAnchor);
          stateRef.current.isInit = true;
        }
      }
    })();
  }, [currentAnchor, currentAnchorIndex, container, offsetPx]);

  return { ref, focusedAnchor: focusedAnchorRef.current, scrollToAnchor };
};
