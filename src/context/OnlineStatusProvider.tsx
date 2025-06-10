
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import OfflineFallback from '@/components/layout/OfflineFallback';

interface OnlineStatusContextType {
  isOnline: boolean;
}

const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(undefined);

export function useOnlineStatus(): OnlineStatusContextType {
  const context = useContext(OnlineStatusContext);
  if (context === undefined) {
    throw new Error('useOnlineStatus must be used within an OnlineStatusProvider');
  }
  return context;
}

interface OnlineStatusProviderProps {
  children: ReactNode;
}

export function OnlineStatusProvider({ children }: OnlineStatusProviderProps) {
  const [isOnline, setIsOnline] = useState(true); // Assume online by default

  useEffect(() => {
    // Set initial state based on browser's navigator.onLine after component mounts
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <OnlineStatusContext.Provider value={{ isOnline }}>
      {isOnline ? children : <OfflineFallback />}
    </OnlineStatusContext.Provider>
  );
}
