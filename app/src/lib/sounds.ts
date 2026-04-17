import { useSettingsStore } from '../store/settingsStore';

type SfxName =
  | 'trade_place'
  | 'trade_win'
  | 'trade_loss'
  | 'timer_warning'
  | 'battle_start'
  | 'battle_end'
  | 'paintress_attack'
  | 'character_switch'
  | 'tilt_warning'
  | 'achievement'
  | 'chaos_alert'
  | 'power_up';

let audioCtx: AudioContext | null = null;
let unlocked = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function installUnlock() {
  if (unlocked || typeof window === 'undefined') return;
  unlocked = true;
  const unlock = () => {
    getCtx()?.resume().catch(() => {});
  };
  window.addEventListener('pointerdown', unlock, { passive: true, once: true });
  window.addEventListener('keydown', unlock, { passive: true, once: true });
}

interface ToneParams {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  ramp?: number; // fade out start (0-1)
  sweep?: number; // frequency sweep target
}

const SOUND_DEFS: Record<SfxName, ToneParams[]> = {
  trade_place: [
    { frequency: 880, duration: 0.08, type: 'sine', volume: 0.2 },
    { frequency: 1100, duration: 0.06, type: 'sine', volume: 0.15 },
  ],
  trade_win: [
    { frequency: 523, duration: 0.1, type: 'sine', volume: 0.25 },
    { frequency: 659, duration: 0.1, type: 'sine', volume: 0.25 },
    { frequency: 784, duration: 0.15, type: 'sine', volume: 0.2 },
  ],
  trade_loss: [
    { frequency: 300, duration: 0.15, type: 'sawtooth', volume: 0.15 },
    { frequency: 200, duration: 0.2, type: 'sawtooth', volume: 0.1 },
  ],
  timer_warning: [
    { frequency: 600, duration: 0.1, type: 'square', volume: 0.15 },
    { frequency: 600, duration: 0.1, type: 'square', volume: 0.15 },
  ],
  battle_start: [
    { frequency: 440, duration: 0.15, type: 'sine', volume: 0.2 },
    { frequency: 554, duration: 0.15, type: 'sine', volume: 0.2 },
    { frequency: 659, duration: 0.15, type: 'sine', volume: 0.2 },
    { frequency: 880, duration: 0.25, type: 'sine', volume: 0.25 },
  ],
  battle_end: [
    { frequency: 880, duration: 0.15, type: 'sine', volume: 0.2 },
    { frequency: 659, duration: 0.15, type: 'sine', volume: 0.2 },
    { frequency: 440, duration: 0.3, type: 'sine', volume: 0.15 },
  ],
  paintress_attack: [
    { frequency: 150, duration: 0.2, type: 'sawtooth', volume: 0.2, sweep: 80 },
    { frequency: 100, duration: 0.3, type: 'sawtooth', volume: 0.15 },
  ],
  character_switch: [
    { frequency: 1200, duration: 0.05, type: 'sine', volume: 0.1 },
  ],
  tilt_warning: [
    { frequency: 400, duration: 0.12, type: 'square', volume: 0.15 },
    { frequency: 500, duration: 0.12, type: 'square', volume: 0.15 },
    { frequency: 400, duration: 0.12, type: 'square', volume: 0.15 },
  ],
  achievement: [
    { frequency: 523, duration: 0.12, type: 'sine', volume: 0.2 },
    { frequency: 659, duration: 0.12, type: 'sine', volume: 0.2 },
    { frequency: 784, duration: 0.12, type: 'sine', volume: 0.2 },
    { frequency: 1047, duration: 0.3, type: 'sine', volume: 0.25 },
  ],
  chaos_alert: [
    { frequency: 200, duration: 0.15, type: 'sawtooth', volume: 0.2 },
    { frequency: 350, duration: 0.1, type: 'square', volume: 0.15 },
    { frequency: 200, duration: 0.2, type: 'sawtooth', volume: 0.15 },
  ],
  power_up: [
    { frequency: 600, duration: 0.08, type: 'sine', volume: 0.2 },
    { frequency: 900, duration: 0.08, type: 'sine', volume: 0.2 },
    { frequency: 1200, duration: 0.12, type: 'sine', volume: 0.15 },
  ],
};

function playTones(tones: ToneParams[]) {
  const ctx = getCtx();
  if (!ctx) return;

  let offset = 0;
  for (const tone of tones) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tone.type;
    osc.frequency.setValueAtTime(tone.frequency, ctx.currentTime + offset);

    if (tone.sweep) {
      osc.frequency.linearRampToValueAtTime(tone.sweep, ctx.currentTime + offset + tone.duration);
    }

    gain.gain.setValueAtTime(tone.volume, ctx.currentTime + offset);
    const fadeStart = tone.ramp ?? 0.7;
    gain.gain.setValueAtTime(tone.volume, ctx.currentTime + offset + tone.duration * fadeStart);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + offset + tone.duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + offset);
    osc.stop(ctx.currentTime + offset + tone.duration);

    offset += tone.duration;
  }
}

export const sfx = {
  prime() {
    installUnlock();
    getCtx();
  },

  play(name: SfxName) {
    if (typeof window === 'undefined') return;
    installUnlock();

    const enabled = useSettingsStore.getState().soundEnabled;
    if (!enabled) return;

    const tones = SOUND_DEFS[name];
    if (!tones) return;

    try {
      playTones(tones);
    } catch {
      // Audio failures must not break gameplay
    }
  },
};
