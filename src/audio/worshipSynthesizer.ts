/**
 * Synthesizes a warm acoustic worship piano + ambient celestial pad
 * specifically sequenced for "You Laid Aside Your Majesty" in G Major (68 BPM).
 */

class WorshipSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private startTime = 0;
  private pauseOffset = 0;
  private timerId: number | null = null;
  private gainNode: GainNode | null = null;
  private padGainNode: GainNode | null = null;
  private metronomeGain: GainNode | null = null;
  private isMetronomeEnabled = false;
  private currentSongId = 'you-laid-aside-your-majesty';

  // Chord frequencies for G Major & Bb Major worship progressions
  // G: G3, B3, D4, G4
  // D/F#: F#3, A3, D4, F#4
  // Em: E3, G3, B3, E4
  // Bm: B2, D3, F#3, B3
  // C: C3, E3, G3, C4
  // Am7: A2, C3, E3, G3
  // D: D3, F#3, A3, D4
  // Bb: Bb2, D3, F3, Bb3, D4
  // Eb: Eb3, G3, Bb3, Eb4
  // Gm: G2, D3, G3, Bb3
  // F: F2, C3, F3, A3
  // Fsus: F2, C3, F3, Bb3
  // Bb/F: F2, D3, F3, Bb3
  // Cm: C3, Eb3, G3, C4
  private chordMap: Record<string, number[]> = {
    G: [196.00, 246.94, 293.66, 392.00],
    'D/F#': [185.00, 220.00, 293.66, 369.99],
    Em: [164.81, 196.00, 246.94, 329.63],
    Bm: [123.47, 146.83, 185.00, 246.94],
    C: [130.81, 164.81, 196.00, 261.63],
    Am7: [110.00, 130.81, 164.81, 196.00],
    D: [146.83, 185.00, 220.00, 293.66],
    Bb: [116.54, 146.83, 174.61, 233.08, 293.66],
    Eb: [155.56, 196.00, 233.08, 311.13],
    Gm: [146.83, 196.00, 233.08, 293.66],
    F: [130.81, 174.61, 220.00, 261.63],
    Fsus: [130.81, 174.61, 233.08, 261.63],
    'Bb/F': [174.61, 233.08, 293.66, 349.23],
    Cm: [130.81, 155.56, 196.00, 261.63],
  };

  // 1 bar = 4 beats at tempo BPM (default 68 BPM)
  private beatDuration = 60 / 68; // ~0.882 sec

  public setSong(songId: string, tempoBpm = 68) {
    this.currentSongId = songId;
    this.beatDuration = 60 / (tempoBpm || 68);
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMetronome(enabled: boolean) {
    this.isMetronomeEnabled = enabled;
  }

  public getMetronome(): boolean {
    return this.isMetronomeEnabled;
  }

  public start(offset = 0) {
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.pauseOffset = offset;
    this.startTime = this.ctx.currentTime - offset;

    // Master bus
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    // Pad bus with gentle lowpass
    this.padGainNode = this.ctx.createGain();
    this.padGainNode.gain.setValueAtTime(0.25, this.ctx.currentTime);
    const padFilter = this.ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(650, this.ctx.currentTime);
    padFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);
    this.padGainNode.connect(padFilter);
    padFilter.connect(this.gainNode);

    // Metronome bus
    this.metronomeGain = this.ctx.createGain();
    this.metronomeGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    this.metronomeGain.connect(this.gainNode);

    this.scheduleNotes();
  }

  public pause(): number {
    this.isPlaying = false;
    if (this.timerId) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.ctx) {
      const current = this.ctx.currentTime - this.startTime;
      this.pauseOffset = Math.max(0, current);
      return this.pauseOffset;
    }
    return this.pauseOffset;
  }

  public seek(timeSeconds: number) {
    const wasPlaying = this.isPlaying;
    this.stop();
    this.pauseOffset = timeSeconds;
    if (wasPlaying) {
      this.start(timeSeconds);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.gainNode && this.ctx) {
      try {
        this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.gainNode.disconnect();
      } catch {
        // ignore
      }
    }
  }

  public getCurrentTime(): number {
    if (!this.isPlaying || !this.ctx) {
      return this.pauseOffset;
    }
    return Math.max(0, this.ctx.currentTime - this.startTime);
  }

  private scheduleNotes() {
    if (!this.isPlaying || !this.ctx) return;

    const currentAppTime = this.getCurrentTime();
    const nextLookahead = 2.0; // schedule notes for next 2 seconds
    const horizon = currentAppTime + nextLookahead;

    // Determine current musical measure & beat
    const startBeat = Math.floor(currentAppTime / this.beatDuration);
    const endBeat = Math.ceil(horizon / this.beatDuration);

    for (let b = startBeat; b <= endBeat; b++) {
      const beatTime = b * this.beatDuration;
      if (beatTime >= currentAppTime && beatTime < horizon) {
        const audioScheduleTime = this.startTime + beatTime;
        if (audioScheduleTime >= this.ctx.currentTime) {
          const chord = this.getChordForBeat(b);
          const isBarStart = b % 4 === 0;

          // Metronome click if enabled
          if (this.isMetronomeEnabled) {
            this.playClick(audioScheduleTime, isBarStart);
          }

          // Piano arpeggio / strike
          if (isBarStart) {
            this.playPianoChord(chord, audioScheduleTime, this.beatDuration * 3.8);
            this.playAmbientPad(chord, audioScheduleTime, this.beatDuration * 4);
          } else if (b % 4 === 2) {
            // Gentle mid-bar piano touch
            this.playSoftArpeggioNote(chord, audioScheduleTime);
          }
        }
      }
    }

    this.timerId = window.setTimeout(() => {
      this.scheduleNotes();
    }, 400);
  }

  private getChordForBeat(beatIndex: number): string {
    const barIndex = Math.floor(beatIndex / 4);

    if (this.currentSongId === 'god-youre-so-good') {
      const gysgProgression: string[] = [
        // Intro (4 bars)
        'Bb', 'Eb', 'Bb', 'F',
        // Verse 1 (8 bars)
        'Bb', 'Eb', 'Bb', 'Fsus', 'Bb', 'Eb', 'Gm', 'F',
        // Chorus 1 (8 bars)
        'Bb', 'F', 'Gm', 'Eb', 'Bb', 'F', 'Bb', 'Bb',
        // Verse 2 (8 bars)
        'Bb', 'Eb', 'Bb', 'Fsus', 'Bb', 'Eb', 'Gm', 'F',
        // Chorus 2 (8 bars)
        'Bb', 'F', 'Gm', 'Eb', 'Bb', 'F', 'Bb', 'Bb',
        // Bridge 1 (8 bars)
        'F', 'Gm', 'Eb', 'Bb', 'F', 'Gm', 'Eb', 'Bb',
        // Chorus 3 (8 bars)
        'Bb', 'F', 'Gm', 'Eb', 'Bb', 'F', 'Bb', 'Bb',
        // Verse 3 (8 bars)
        'Bb', 'Eb', 'Bb', 'Fsus', 'Gm', 'Eb', 'Bb', 'F',
        // Bridge 2 (8 bars)
        'F', 'Gm', 'Eb', 'Bb', 'F', 'Gm', 'Eb', 'Bb',
        // Chorus 4 (8 bars)
        'Bb', 'F', 'Gm', 'Eb', 'Bb', 'F', 'Bb', 'Bb',
        // Outro (6 bars)
        'Bb', 'F', 'Eb', 'Bb', 'Bb', 'Bb',
      ];
      const idx = barIndex % gysgProgression.length;
      return gysgProgression[idx] || 'Bb';
    }

    // Default progression: You Laid Aside Your Majesty (in G Major)
    const progression: string[] = [
      // Intro 4 bars
      'G', 'Em', 'C', 'D',
      // Verse 1 (8 bars)
      'G', 'D/F#', 'Em', 'Bm', 'C', 'G', 'Am7', 'D',
      // Chorus 1 (8 bars)
      'G', 'D/F#', 'Em', 'C', 'G', 'D/F#', 'C', 'D',
      // Verse 2 (8 bars)
      'G', 'D/F#', 'Em', 'Bm', 'C', 'G', 'Am7', 'D',
      // Chorus 2 (8 bars)
      'G', 'D/F#', 'Em', 'C', 'G', 'D/F#', 'C', 'D',
      // Bridge / Vamp (8 bars)
      'Em', 'C', 'G', 'D', 'Em', 'C', 'G', 'D',
      // Outro (12 bars)
      'G', 'D/F#', 'Em', 'C', 'G', 'D/F#', 'C', 'D', 'C', 'D', 'G', 'G',
    ];

    const idx = barIndex % progression.length;
    return progression[idx] || 'G';
  }

  private playPianoChord(chordName: string, time: number, duration: number) {
    if (!this.ctx || !this.gainNode) return;
    const freqs = this.chordMap[chordName] || this.chordMap.G;

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.gainNode) return;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      // Slightly staggered piano strike (strum effect)
      const noteTime = time + idx * 0.028;

      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      // Piano envelope: sharp percussive attack, exponential acoustic decay
      noteGain.gain.setValueAtTime(0.0001, noteTime);
      noteGain.gain.linearRampToValueAtTime(0.22 / (idx * 0.4 + 1), noteTime + 0.015);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + duration);

      osc.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.start(noteTime);
      osc.stop(noteTime + duration);
    });
  }

  private playSoftArpeggioNote(chordName: string, time: number) {
    if (!this.ctx || !this.gainNode) return;
    const freqs = this.chordMap[chordName] || this.chordMap.G;
    const freq = freqs[freqs.length - 1]; // top note

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    noteGain.gain.setValueAtTime(0.0001, time);
    noteGain.gain.linearRampToValueAtTime(0.12, time + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, time + 1.4);

    osc.connect(noteGain);
    noteGain.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + 1.5);
  }

  private playAmbientPad(chordName: string, time: number, duration: number) {
    if (!this.ctx || !this.padGainNode) return;
    const freqs = this.chordMap[chordName] || this.chordMap.G;

    // Play root + 5th with slow attack pad
    [freqs[0], freqs[2]].forEach((freq, i) => {
      if (!this.ctx || !this.padGainNode) return;
      const osc = this.ctx.createOscillator();
      const padGain = this.ctx.createGain();

      // Slightly detuned warmth
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * (i === 0 ? 0.998 : 1.002), time);

      // Swell envelope
      padGain.gain.setValueAtTime(0.001, time);
      padGain.gain.linearRampToValueAtTime(0.09, time + 0.8);
      padGain.gain.linearRampToValueAtTime(0.07, time + duration - 0.8);
      padGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(padGain);
      padGain.connect(this.padGainNode);

      osc.start(time);
      osc.stop(time + duration);
    });
  }

  private playClick(time: number, isAccent: boolean) {
    if (!this.ctx || !this.metronomeGain) return;
    const osc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isAccent ? 1200 : 800, time);

    clickGain.gain.setValueAtTime(0.001, time);
    clickGain.gain.linearRampToValueAtTime(isAccent ? 0.35 : 0.18, time + 0.003);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

    osc.connect(clickGain);
    clickGain.connect(this.metronomeGain);

    osc.start(time);
    osc.stop(time + 0.05);
  }
}

export const worshipSynth = new WorshipSynthesizer();
