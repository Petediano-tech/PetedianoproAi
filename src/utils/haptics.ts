
'use client';

import type { SoundSettings } from '@/hooks/useSoundSettings';

/**
 * Triggers a short vibration on supported devices.
 * @param settings - The user's sound/haptic settings.
 */
export function playTypingVibration(settings: Pick<SoundSettings, 'isTypingVibrationEnabled'>) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator && settings.isTypingVibrationEnabled) {
    try {
      // A short, subtle vibration suitable for a key press
      navigator.vibrate(5);
    } catch (error) {
      // Silently fail if vibration is not supported or fails.
      // console.error("Vibration failed:", error);
    }
  }
}
