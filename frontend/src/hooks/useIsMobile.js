import { useState, useEffect } from 'react';

/**
 * Shared hook to detect mobile (<768px) and tablet (<1024px) breakpoints.
 * Uses a single resize listener with debounce-free instant detection.
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return isMobile;
}

export function useIsTablet() {
  return useIsMobile(1024);
}
