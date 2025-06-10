
"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function GlobalLoadingIndicator() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPathname) {
      setVisible(true);
      setPrevPathname(pathname); // Update previous pathname

      // Hide the bar after the animation duration + a small buffer
      // The animation is 1.5s
      const timer = setTimeout(() => {
        setVisible(false);
      }, 1600); 

      return () => clearTimeout(timer);
    }
  }, [pathname, prevPathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-[9999] bg-primary/20 overflow-hidden pointer-events-none">
      <div
        className="h-full bg-primary animate-loading-bar"
      ></div>
    </div>
  );
}
