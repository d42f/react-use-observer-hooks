import { RefObject, useCallback, useEffect, useMemo, useRef } from 'react';

import { useVisibleChildren } from './useIntersectionObserver';

interface UseAnchorObserver<T> {
  ref: RefObject<T>;
  focusedAnchor: string | undefined;
  isScrolling: boolean;
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
  const stateRef = useRef({ isInit: false, isScrolling: false });
  const changeListenerRef = useRef(onAnchorChange);
  const focusedAnchorRef = useRef<string | undefined>();

  const focusedChild = useVisibleChildren(ref.current);

  const focusedAnchor = useMemo(() => {
    if (!stateRef.current.isScrolling) {
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
            stateRef.current.isScrolling = true;
            child.scrollIntoView({ behavior: 'smooth' });
            // TODO: make it better
            setTimeout(() => (stateRef.current.isScrolling = false), 200);
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
    if (focusedAnchor) {
      changeListenerRef.current?.(focusedAnchor);
    }
  }, [focusedAnchor]);

  useEffect(() => {
    if (currentAnchor && currentAnchor !== focusedAnchorRef.current && !stateRef.current.isScrolling) {
      scrollToAnchor(currentAnchor);
    }
  }, [currentAnchor, scrollToAnchor]);

  useEffect(() => {
    if (!stateRef.current.isInit && ref.current) {
      const anchorIndex = anchors.indexOf(currentAnchor);
      const child = anchorIndex >= 0 ? ref.current.children.item(anchorIndex) : null;
      if (child) {
        stateRef.current.isInit = true;
        // TODO: check if it already close with target
        child.scrollIntoView({ behavior: 'instant' });
      }
    }
  }, [currentAnchor, anchors]);

  return { ref, focusedAnchor, isScrolling: stateRef.current.isScrolling, scrollToAnchor };
};
