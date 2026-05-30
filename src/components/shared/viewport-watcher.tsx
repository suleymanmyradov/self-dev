'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';

// Keeps uiStore.isMobile in sync with viewport width
// Mobile breakpoint set to < 768px (tailwind md)
export function ViewportWatcher() {
  const setIsMobile = useUIStore(s => s.setIsMobile);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('resize', onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [setIsMobile]);

  return null;
}
