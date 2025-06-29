
"use client";

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';

// --- Types and Context Definition ---

export type TextSizeType = 'sm' | 'md' | 'lg' | 'xl';

const ACCESSIBILITY_STORAGE_KEY = 'petedianoProAccessibility';

interface AccessibilitySettings {
  textSize: TextSizeType;
}

export interface AccessibilityContextType {
  settings: AccessibilitySettings;
  textSize: TextSizeType;
  setTextSize: (size: TextSizeType) => void;
}

const defaultSettings: AccessibilitySettings = {
  textSize: 'md',
};

// Export the context so the hook can use it
export const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// --- Provider Component ---

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...defaultSettings, ...parsed };
        }
      } catch (error) {
        console.error("Error reading accessibility settings from localStorage:", error);
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    document.documentElement.dataset.textSize = settings.textSize;

    try {
      localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving accessibility settings to localStorage:", error);
    }
  }, [settings]);

  const setTextSize = useCallback((size: TextSizeType) => {
    setSettings(s => ({ ...s, textSize: size }));
  }, []);

  const value = {
    settings,
    textSize: settings.textSize,
    setTextSize,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}
