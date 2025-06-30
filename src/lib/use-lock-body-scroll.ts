import { useEffect } from 'react';
import { useMediaQuery } from './use-media-query';

/**
 * Conditionally lock body scroll on mobile devices when `locked` is true.
 * @param locked - Whether to lock the scroll.
 * @param query  - The media query string to identify mobile viewports. Default is Tailwind's `sm` breakpoint max (639px).
 */
export function useLockBodyScroll(locked: boolean, query = '(max-width: 639px)') {
  const isMobile = useMediaQuery(query);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (locked && isMobile) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || 'auto';
      };
    }

    return undefined;
  }, [locked, isMobile, query]);
} 