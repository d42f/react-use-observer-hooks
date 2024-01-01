import { useEffect, useState } from 'react';

import { useWindow } from './useWindow';

export const useWasScrolled = (originalElement?: HTMLElement | Window | null | undefined, offset = 0): boolean => {
  const win = useWindow();
  const element = originalElement || win;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scroll = element
        ? 'scrollY' in element
          ? element.scrollY
          : 'scrollTop' in element
          ? element.scrollTop
          : null
        : null;
      setIsScrolled(typeof scroll === 'number' ? scroll > offset : false);
    };

    handleScroll();
    element?.addEventListener('scroll', handleScroll);
    return () => {
      element?.removeEventListener('scroll', handleScroll);
    };
  }, [element, offset]);

  return isScrolled;
};
