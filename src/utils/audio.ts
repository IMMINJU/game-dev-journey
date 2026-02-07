// Web Audio API based sound system
class AudioManager {
  private audioContext: AudioContext | null = null;
  private currentBGM: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;
  private currentTrack: string | null = null;
  private isMuted = false;

  constructor() {
    // Initialize on first user interaction
  }

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Generate simple beep sound
  private playBeep(frequency: number, duration: number, volume: number = 0.3) {
    if (this.isMuted) return;

    const ctx = this.initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'square'; // Retro square wave

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  // Play multi-tone melody
  private playMelody(notes: { freq: number; duration: number }[], volume: number = 0.2) {
    if (this.isMuted) return;

    const ctx = this.initAudioContext();
    let time = ctx.currentTime;

    notes.forEach(note => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = note.freq;
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(volume, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + note.duration);

      oscillator.start(time);
      oscillator.stop(time + note.duration);

      time += note.duration;
    });
  }

  playBGM(track: 'act1' | 'act2' | 'act3', fadeIn: boolean = true) {
    // Simple ambient BGM (optional, can be silent for now)
    if (this.currentTrack === track) return;
    this.currentTrack = track;
    // BGM is minimal/optional for this game
  }

  playSFX(sound: 'click' | 'complete' | 'bug' | 'warning' | 'day-transition' | 'error' | 'success') {
    switch (sound) {
      case 'click':
        this.playBeep(800, 0.05, 0.2);
        break;
      case 'complete':
        this.playMelody([
          { freq: 523, duration: 0.1 }, // C
          { freq: 659, duration: 0.1 }, // E
          { freq: 784, duration: 0.2 }, // G
        ]);
        break;
      case 'bug':
        this.playBeep(200, 0.1, 0.3);
        break;
      case 'warning':
        this.playMelody([
          { freq: 400, duration: 0.1 },
          { freq: 300, duration: 0.1 },
          { freq: 400, duration: 0.1 },
        ]);
        break;
      case 'day-transition':
        this.playMelody([
          { freq: 440, duration: 0.1 },
          { freq: 554, duration: 0.1 },
          { freq: 659, duration: 0.15 },
        ]);
        break;
      case 'error':
        this.playMelody([
          { freq: 300, duration: 0.15 },
          { freq: 250, duration: 0.15 },
        ]);
        break;
      case 'success':
        this.playMelody([
          { freq: 523, duration: 0.08 },
          { freq: 659, duration: 0.08 },
          { freq: 784, duration: 0.08 },
          { freq: 1047, duration: 0.2 },
        ]);
        break;
    }
  }

  stopBGM() {
    if (this.currentBGM) {
      this.currentBGM.stop();
      this.currentBGM = null;
    }
  }

  setVolume(volume: number) {
    if (this.bgmGain) {
      this.bgmGain.gain.value = volume;
    }
  }

  muteAll() {
    this.isMuted = true;
  }

  unmuteAll() {
    this.isMuted = false;
  }
}

export const audioManager = new AudioManager();
