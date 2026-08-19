/**
 * AudioManager.js - Centralized Web Audio API sound engine for VYAPAR
 * 
 * Features ONE single common looping ancient Indian instrumental track:
 * - Subtle meditative Tanpura drone (D / A)
 * - Soft expressive Bansuri / Flute melody in Raag Bhupali & Desh
 * - Light Keherwa / Jhaptal Tabla hand percussion
 * - Seamless looping, smooth fade-in/fade-out, and automatic dialogue volume ducking
 * - Zero external dependencies, 100% synthesized in Web Audio API
 */

const BANSURI_SCALE = {
  D3: 146.83, E3: 164.81, Fs3: 185.00, G3: 196.00, A3: 220.00, B3: 246.94, C4: 261.63,
  D4: 293.66, E4: 329.63, Fs4: 369.99, G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25,
  D5: 587.33, E5: 659.25, Fs5: 739.99, A5: 880.00
};

// 32-step melodic phrase cycle at ~76 BPM (step duration = 0.395s)
const BGM_MELODY_STEPS = [
  // Phrase 1 (Alap / Opening Call)
  { note: 'D4', dur: 2 }, null,
  { note: 'Fs4', dur: 1.5 }, { note: 'A4', dur: 0.5 },
  { note: 'B4', dur: 2 }, null,
  { note: 'A4', dur: 1 }, { note: 'Fs4', dur: 1 },

  // Phrase 2 (Ascending Flight)
  { note: 'D5', dur: 2.5 }, null, null,
  { note: 'E5', dur: 0.5 },
  { note: 'D5', dur: 1.5 }, { note: 'B4', dur: 0.5 },
  { note: 'A4', dur: 2 }, null,

  // Phrase 3 (Graceful Descent)
  { note: 'Fs4', dur: 1.5 }, { note: 'A4', dur: 0.5 },
  { note: 'B4', dur: 1 }, { note: 'A4', dur: 1 },
  { note: 'Fs4', dur: 1.5 }, { note: 'E4', dur: 0.5 },
  { note: 'D4', dur: 2 }, null,

  // Phrase 4 (Resolution & Cadence back to Root)
  { note: 'E4', dur: 1 }, { note: 'Fs4', dur: 1 },
  { note: 'A4', dur: 1.5 }, { note: 'Fs4', dur: 0.5 },
  { note: 'E4', dur: 2 }, null,
  { note: 'D4', dur: 2 }, null
];

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.isMuted = false;
    this.isDialogueActive = false;

    // Category Volume Settings (0.0 to 1.0)
    this.volumes = {
      master: 0.75,
      music: 0.45,
      ambient: 0.4,
      sfx: 0.65,
      ui: 0.6
    };

    // BGM Audio Nodes
    this.musicMasterGain = null;
    this.musicDuckingGain = null;
    this.droneOscillators = [];
    this.droneGain = null;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.isPlayingBGM = false;

    this.lastFootstepTime = 0;
    this.lastTypewriterTime = 0;
    this.listeners = new Set();

    this.loadSettings();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.getSettings()));
    this.saveSettings();
  }

  /**
   * Safely initialize Web Audio API AudioContext on first user gesture
   */
  initContext() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.isInitialized = true;
        this.setupAudioGraph();
        this.startBGM();
      }
    } catch (err) {
      console.warn('[AudioManager] AudioContext init warning:', err);
    }
  }

  setupAudioGraph() {
    if (!this.ctx) return;

    // Music Master Chain: Ducking Gain -> Master Gain -> Destination
    this.musicDuckingGain = this.ctx.createGain();
    this.musicDuckingGain.gain.setValueAtTime(this.isDialogueActive ? 0.45 : 1.0, this.ctx.currentTime);

    this.musicMasterGain = this.ctx.createGain();
    const effMusicVol = this.getEffectiveVolume('music');
    this.musicMasterGain.gain.setValueAtTime(effMusicVol, this.ctx.currentTime);

    this.musicDuckingGain.connect(this.musicMasterGain);
    this.musicMasterGain.connect(this.ctx.destination);
  }

  /**
   * Calculate effective volume for a category
   * @param {string} category 
   */
  getEffectiveVolume(category = 'sfx') {
    if (this.isMuted) return 0;
    const catVol = this.volumes[category] !== undefined ? this.volumes[category] : 0.6;
    return this.volumes.master * catVol;
  }

  /**
   * Start the single common ancient Indian looping background track with smooth fade-in
   */
  startBGM() {
    if (!this.ctx) return;
    if (this.isPlayingBGM) return;

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      if (!this.musicMasterGain) {
        this.setupAudioGraph();
      }

      this.isPlayingBGM = true;

      // 1. Start Tanpura Drone
      this.startTanpuraDrone();

      // 2. Start Sequenced Bansuri Flute & Tabla rhythm
      this.bgmStep = 0;
      const stepDurationMs = 395; // ~76 BPM
      
      this.bgmTimer = setInterval(() => {
        this.tickBGMStep(stepDurationMs / 1000);
      }, stepDurationMs);

      // Smooth Fade-In over 1.5 seconds
      const targetVol = this.getEffectiveVolume('music');
      const now = this.ctx.currentTime;
      this.musicMasterGain.gain.setValueAtTime(0.001, now);
      this.musicMasterGain.gain.linearRampToValueAtTime(targetVol, now + 1.5);
    } catch (err) {
      console.warn('[AudioManager] startBGM error:', err);
    }
  }

  /**
   * Stop background music with smooth fade-out
   */
  stopBGM() {
    if (!this.isPlayingBGM || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      if (this.musicMasterGain) {
        this.musicMasterGain.gain.setValueAtTime(this.musicMasterGain.gain.value, now);
        this.musicMasterGain.gain.linearRampToValueAtTime(0.001, now + 1.0);
      }

      setTimeout(() => {
        if (this.bgmTimer) {
          clearInterval(this.bgmTimer);
          this.bgmTimer = null;
        }
        this.stopTanpuraDrone();
        this.isPlayingBGM = false;
      }, 1000);
    } catch (err) {
      this.isPlayingBGM = false;
    }
  }

  /**
   * Continuous Tanpura Drone bed (D2, D3, A3, D4) with warm lowpass filtering
   */
  startTanpuraDrone() {
    if (!this.ctx || !this.musicDuckingGain) return;
    this.stopTanpuraDrone();

    const droneFreqs = [73.41, 146.83, 220.00, 293.66]; // D2, D3, A3, D4
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    // Warm Lowpass Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, this.ctx.currentTime);

    this.droneOscillators = droneFreqs.map((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      // Subtle micro-detuning for authentic natural shimmer
      osc.frequency.setValueAtTime(freq + (i * 0.15 - 0.2), this.ctx.currentTime);
      osc.connect(this.droneGain);
      osc.start();
      return osc;
    });

    this.droneGain.connect(filter);
    filter.connect(this.musicDuckingGain);
  }

  stopTanpuraDrone() {
    this.droneOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (_) {}
    });
    this.droneOscillators = [];
    if (this.droneGain) {
      try {
        this.droneGain.disconnect();
      } catch (_) {}
      this.droneGain = null;
    }
  }

  /**
   * Musical clock tick for bansuri melody and tabla pulse
   */
  tickBGMStep(stepSec = 0.395) {
    if (!this.ctx || !this.isPlayingBGM || !this.musicDuckingGain) return;
    if (this.isMuted || this.getEffectiveVolume('music') <= 0) return;

    const stepIndex = this.bgmStep % BGM_MELODY_STEPS.length;
    const item = BGM_MELODY_STEPS[stepIndex];
    const now = this.ctx.currentTime;

    // 1. Play Bansuri Note if present on this step
    if (item && item.note) {
      const freq = BANSURI_SCALE[item.note] || 293.66;
      const dur = (item.dur || 1) * stepSec;
      this.playBansuriNote(freq, dur, now);
    }

    // 2. Play Light Tabla percussion pulse
    // 8-beat groove pattern (step 0 = Sam/Dayan+Bayan, step 2 = Dayan, step 4 = Bayan, step 6 = Dayan)
    const beatIn8 = stepIndex % 8;
    if (beatIn8 === 0) {
      this.playTablaDayan(now);
      this.playTablaBayan(now);
    } else if (beatIn8 === 2 || beatIn8 === 6) {
      this.playTablaDayan(now, 0.7);
    } else if (beatIn8 === 4) {
      this.playTablaBayan(now, 0.85);
    }

    this.bgmStep++;
  }

  /**
   * Synthesize soft expressive Bansuri flute tone
   */
  playBansuriNote(freq, durationSec, startTime) {
    if (!this.ctx || !this.musicDuckingGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Main flute waveform
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      // Gentle vibrato
      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();
      vibrato.frequency.setValueAtTime(5.2, startTime); // 5.2 Hz vibrato
      vibratoGain.gain.setValueAtTime(freq * 0.015, startTime);
      vibrato.connect(osc.frequency);
      vibrato.start(startTime + 0.1);
      vibrato.stop(startTime + durationSec);

      // Breath harmonic
      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(freq * 2, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3.5, startTime);

      // Soft envelope (legato attack & gentle fade-out)
      const peakGain = 0.22;
      noteGain.gain.setValueAtTime(0.001, startTime);
      noteGain.gain.linearRampToValueAtTime(peakGain, startTime + 0.07);
      noteGain.gain.setValueAtTime(peakGain * 0.85, startTime + durationSec * 0.7);
      noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + durationSec + 0.08);

      osc.connect(filter);
      oscHarmonic.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.musicDuckingGain);

      osc.start(startTime);
      oscHarmonic.start(startTime);
      osc.stop(startTime + durationSec + 0.1);
      oscHarmonic.stop(startTime + durationSec + 0.1);
    } catch (_) {}
  }

  /**
   * Synthesize resonant high Dayan tabla stroke
   */
  playTablaDayan(startTime, volumeMult = 1.0) {
    if (!this.ctx || !this.musicDuckingGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Pitch drop creates classic drum resonance
      osc.frequency.setValueAtTime(293.66, startTime);
      osc.frequency.exponentialRampToValueAtTime(185.00, startTime + 0.12);

      gain.gain.setValueAtTime(0.1 * volumeMult, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.14);

      osc.connect(gain);
      gain.connect(this.musicDuckingGain);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
    } catch (_) {}
  }

  /**
   * Synthesize deep rounded Bayan bass tabla stroke
   */
  playTablaBayan(startTime, volumeMult = 1.0) {
    if (!this.ctx || !this.musicDuckingGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Warm low frequency bend
      osc.frequency.setValueAtTime(78.0, startTime);
      osc.frequency.exponentialRampToValueAtTime(55.0, startTime + 0.22);

      gain.gain.setValueAtTime(0.14 * volumeMult, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(this.musicDuckingGain);

      osc.start(startTime);
      osc.stop(startTime + 0.26);
    } catch (_) {}
  }

  /**
   * Automatic Dialogue Volume Ducking
   * Smoothly lowers music volume during conversations and restores it when finished.
   * @param {boolean} isActive 
   */
  setDialogueActive(isActive) {
    this.isDialogueActive = isActive;
    if (!this.ctx || !this.musicDuckingGain) return;

    try {
      const now = this.ctx.currentTime;
      const targetDucking = isActive ? 0.45 : 1.0;
      const rampTime = isActive ? 0.35 : 0.45;
      
      this.musicDuckingGain.gain.setValueAtTime(this.musicDuckingGain.gain.value, now);
      this.musicDuckingGain.gain.linearRampToValueAtTime(targetDucking, now + rampTime);
    } catch (_) {}
  }

  /**
   * Play synthesized sound effect
   */
  playTone(freq, type = 'sine', durationSec = 0.15, category = 'sfx') {
    const vol = this.getEffectiveVolume(category);
    if (vol <= 0 || !this.ctx) return;

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(vol * 0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + durationSec);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + durationSec);
    } catch (_) {}
  }

  playClick() {
    this.playTone(587.33, 'sine', 0.08, 'ui');
  }

  playDialogue() {
    this.playTone(440, 'triangle', 0.18, 'ui');
  }

  playTypewriter() {
    const now = Date.now();
    if (now - this.lastTypewriterTime < 60) return;
    this.lastTypewriterTime = now;
    this.playTone(800, 'square', 0.03, 'ui');
  }

  playFootstep() {
    const now = Date.now();
    if (now - this.lastFootstepTime < 280) return;
    this.lastFootstepTime = now;
    this.playTone(180 + Math.random() * 40, 'triangle', 0.05, 'sfx');
  }

  playCorrectAnswer() {
    const vol = this.getEffectiveVolume('sfx');
    if (vol <= 0 || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(vol * 0.3, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } catch (_) {}
  }

  playWrongAnswer() {
    this.playTone(220, 'sawtooth', 0.25, 'sfx');
  }

  playTradeBuy() {
    this.playTone(987.77, 'sine', 0.12, 'sfx');
  }

  playTradeSell() {
    const vol = this.getEffectiveVolume('sfx');
    if (vol <= 0 || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [880, 1174.66].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(vol * 0.35, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.2);
      });
    } catch (_) {}
  }

  playTravelStart() {
    this.playTone(329.63, 'sine', 0.3, 'sfx');
  }

  playArrival() {
    this.playCorrectAnswer();
  }

  /**
   * Toggle quick mute
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.updateVolumes();
    this.notify();
  }

  /**
   * Update category volume level
   * @param {string} category 
   * @param {number} val 0.0 to 1.0
   */
  setVolume(category, val) {
    if (this.volumes[category] !== undefined) {
      this.volumes[category] = Math.max(0, Math.min(1, val));
      this.updateVolumes();
      this.notify();
    }
  }

  updateVolumes() {
    if (!this.ctx || !this.musicMasterGain) return;
    try {
      const effMusic = this.getEffectiveVolume('music');
      this.musicMasterGain.gain.setValueAtTime(effMusic, this.ctx.currentTime);
    } catch (_) {}
  }

  getSettings() {
    return {
      isMuted: this.isMuted,
      volumes: { ...this.volumes }
    };
  }

  saveSettings() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('vyapar_audio_settings', JSON.stringify({
          isMuted: this.isMuted,
          volumes: this.volumes
        }));
      } catch (_) {}
    }
  }

  loadSettings() {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem('vyapar_audio_settings');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.volumes) this.volumes = { ...this.volumes, ...parsed.volumes };
          if (typeof parsed.isMuted === 'boolean') this.isMuted = parsed.isMuted;
        }
      } catch (_) {}
    }
  }
}

export const globalAudioManager = new AudioManager();
globalThis.globalAudioManager = globalAudioManager;
