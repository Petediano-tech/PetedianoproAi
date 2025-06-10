
"use client";

import { useState, useEffect, useCallback } from 'react';

const SOUND_SETTINGS_KEY = 'petedianoProSoundSettings';

export interface SoundSettings {
  isGlobalMuted: boolean;
  globalVolume: number; // 0 to 1
  isTypingVibrationEnabled: boolean; // Conceptual
  isGameMusicEnabled: boolean; // Conceptual
  isGameSfxEnabled: boolean; // Conceptual
}

const defaultSoundSettings: SoundSettings = {
  isGlobalMuted: false,
  globalVolume: 0.75,
  isTypingVibrationEnabled: true,
  isGameMusicEnabled: true,
  isGameSfxEnabled: true,
};

export function useSoundSettings() {
  const [settings, setSettings] = useState<SoundSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedSettings = localStorage.getItem(SOUND_SETTINGS_KEY);
        if (storedSettings) {
          // Merge stored settings with defaults to ensure new keys are present
          const parsed = JSON.parse(storedSettings);
          return { ...defaultSoundSettings, ...parsed };
        }
        return defaultSoundSettings;
      } catch (error) {
        console.error("Error reading sound settings from localStorage:", error);
        return defaultSoundSettings;
      }
    }
    return defaultSoundSettings;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error("Error saving sound settings to localStorage:", error);
      }
    }
  }, [settings]);

  const setGlobalMuted = useCallback((isMuted: boolean) => {
    setSettings(s => ({ ...s, isGlobalMuted: isMuted }));
  }, []);

  const setGlobalVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setSettings(s => ({ ...s, globalVolume: clampedVolume }));
  }, []);

  const setTypingVibration = useCallback((enabled: boolean) => {
    setSettings(s => ({ ...s, isTypingVibrationEnabled: enabled }));
  }, []);

  const setGameMusic = useCallback((enabled: boolean) => {
    setSettings(s => ({ ...s, isGameMusicEnabled: enabled }));
  }, []);
  
  const setGameSfx = useCallback((enabled: boolean) => {
    setSettings(s => ({ ...s, isGameSfxEnabled: enabled }));
  }, []);


  return {
    soundSettings: settings,
    setGlobalMuted,
    setGlobalVolume,
    setTypingVibration, // Conceptual
    setGameMusic, // Conceptual
    setGameSfx, // Conceptual
  };
}
