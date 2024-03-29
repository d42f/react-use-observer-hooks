import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import scrollIntoView from 'scroll-into-view-if-needed';

import { useVisibleChildren } from './useIntersectionObserver';
import { smoothScrollBehavior } from './smoothScroll';

interface UseAnchorObserver<T> {
  ref: RefObject<T>;
  focusedAnchor: string | undefined;
  scrollToAnchor: (anchor: string) => void;
}

interface UseAnchorObserverProps {
  anchors: string[];
  currentAnchor: string;
  onAnchorChange?: (anchor: string) => void;
}

export const useAnchorObserver = <T extends HTMLElement>({
  anchors,
  currentAnchor,
  onAnchorChange,
}: UseAnchorObserverProps): UseAnchorObserver<T> => {
  const ref = useRef<T>(null);
  const stateRef = useRef({ isInit: false, isLocked: false });
  const [, setRerender] = useState(0);
  const changeListenerRef = useRef(onAnchorChange);
  const focusedAnchorRef = useRef<string | undefined>();

  const focusedChild = useVisibleChildren(ref.current);

  const focusedAnchor = useMemo(() => {
    if (!stateRef.current.isLocked) {
      const childIndex = ref.current && focusedChild ? Array.from(ref.current.children).indexOf(focusedChild) : -1;
      focusedAnchorRef.current = childIndex >= 0 ? anchors[childIndex] : undefined;
    }
    return focusedAnchorRef.current;
  }, [anchors, focusedChild]);

  const scrollToAnchor = useCallback(
    (anchor: string) => {
      if (ref.current) {
        const anchorIndex = anchors.indexOf(anchor);
        if (anchorIndex >= 0) {
          const child = ref.current.children.item(anchorIndex);
          if (child) {
            focusedAnchorRef.current = anchor;
            stateRef.current.isLocked = true;
            scrollIntoView<Promise<unknown>>(child, {
              behavior: smoothScrollBehavior(),
              block: 'start',
              scrollMode: 'if-needed',
            }).finally(() => {
              stateRef.current.isLocked = false;
              setRerender(value => value + 1);
            });
          }
        }
      }
    },
    [anchors],
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
    if (!stateRef.current.isInit && ref.current) {
      const anchorIndex = anchors.indexOf(currentAnchor);
      const child = anchorIndex >= 0 ? ref.current.children.item(anchorIndex) : null;
      if (child) {
        stateRef.current.isInit = true;
        focusedAnchorRef.current = currentAnchor;
        scrollIntoView(child, { behavior: 'instant', block: 'start', scrollMode: 'if-needed' });
      }
    }
  }, [currentAnchor, anchors]);

  return { ref, focusedAnchor: focusedAnchorRef.current, scrollToAnchor };
};
