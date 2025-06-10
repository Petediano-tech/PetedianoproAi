
import type { SoundSettings } from '@/hooks/useSoundSettings';

let audioContext: AudioContext | null = null;
let masterGainNode: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGainNode = audioContext.createGain();
      masterGainNode.connect(audioContext.destination);
    } catch (e) {
      console.error("Failed to initialize AudioContext:", e);
      return null;
    }
  }
  return audioContext;
}

export function playNotificationSound(settings: Pick<SoundSettings, 'isGlobalMuted' | 'globalVolume'>) {
  const context = getAudioContext();
  if (!context || !masterGainNode || settings.isGlobalMuted) {
    return;
  }

  if (context.state === 'suspended') {
    context.resume().catch(err => console.error("Error resuming AudioContext:", err));
  }
  
  masterGainNode.gain.setValueAtTime(settings.globalVolume, context.currentTime);

  try {
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(660, context.currentTime); // E5 note, a bit higher
    
    const envelope = context.createGain();
    envelope.connect(masterGainNode);
    
    const now = context.currentTime;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(0.2, now + 0.01); // Quick attack
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.15); // Quick decay

    oscillator.connect(envelope);
    oscillator.start(now);
    oscillator.stop(now + 0.15);
  } catch (error) {
     console.error("Error playing notification sound with Web Audio API:", error);
  }
}

// Function to update master volume if context is already initialized
export function updateMasterVolume(volume: number) {
  const context = getAudioContext();
   if (context && masterGainNode) {
    masterGainNode.gain.setValueAtTime(volume, context.currentTime);
  }
}
