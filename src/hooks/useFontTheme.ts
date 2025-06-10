
"use client";

import { useState, useEffect, useCallback } from 'react';
import { FONT_STORAGE_KEY, DEFAULT_FONT_THEME_KEY, AVAILABLE_FONTS } from '@/lib/fonts.config';

export function useFontTheme() {
  const [fontThemeKey, setFontThemeKeyState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(FONT_STORAGE_KEY) || DEFAULT_FONT_THEME_KEY;
    }
    return DEFAULT_FONT_THEME_KEY;
  });

  useEffect(() => {
    const currentTheme = localStorage.getItem(FONT_STORAGE_KEY) || DEFAULT_FONT_THEME_KEY;
    document.body.dataset.fontTheme = currentTheme;
    setFontThemeKeyState(currentTheme);
  }, []);

  const setFontTheme = useCallback((newThemeKey: string) => {
    const fontExists = AVAILABLE_FONTS.some(font => font.key === newThemeKey);
    if (!fontExists) {
      console.warn(`Font theme key "${newThemeKey}" not found. Reverting to default.`);
      newThemeKey = DEFAULT_FONT_THEME_KEY;
    }
    localStorage.setItem(FONT_STORAGE_KEY, newThemeKey);
    document.body.dataset.fontTheme = newThemeKey;
    setFontThemeKeyState(newThemeKey);
  }, []);

  return { fontThemeKey, setFontTheme };
}
