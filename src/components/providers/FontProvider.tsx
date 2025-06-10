
"use client";

import type { ReactNode } from 'react';
import { useFontTheme } from '@/hooks/useFontTheme';

interface FontProviderProps {
  children: ReactNode;
}

export function FontProvider({ children }: FontProviderProps) {
  useFontTheme(); // This hook handles setting the body attribute on mount and updates

  return <>{children}</>;
}
