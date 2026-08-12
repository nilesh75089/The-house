/**
 * THE HOUSE — Procedural Multi-Room Generative Soundscape Engine
 * Pure Web Audio API synthesis: zero external audio files, 100% offline & lightweight.
 */

import { youtubeThoughtsPlayer } from './youtubePlayer.js';

class SanctuaryAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.currentRoom = 'hall';
    this.masterGain = null;
    this.activeRoomStopFn = null;
    this.onRoomChange = null;

    this.trackTitles = {
      hall: 'THE HOUSE · Nocturnal Drift',
      room1: 'ROOM 01 · Two Different Worlds (Slowed + Reverb)',
      room2: 'ROOM 02 · 35mm Reel & Cinematic Pad',
      room3: 'ROOM 03 · Lofi Vinyl & Rhodes Lounge',
      room4: 'ROOM 04 · Distant Echoes (Slowed + Reverb)',
      room5: 'ROOM 05 · Library Kalimba & Focus Clock'
    };
  }

  async getContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.75;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (e) {
        console.warn('AudioContext resume error:', e);
      }
    }
    return this.ctx;
  }

  createNoiseBuffer(seconds = 3) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * seconds;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
      b6 = white * 0.115926;
    }
    return noiseBuffer;
  }

  /* -------------------------------------------------------------
     ROOM 0: THE HOUSE (HALL) — Nocturnal Sanctuary Drift
     ------------------------------------------------------------- */
  startHallSound(roomGain) {
    const ctx = this.ctx;
    const cleanupNodes = [];
    const timers = [];

    // 1. Warm Night Drone
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.16;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;

    [110.0, 164.81, 220.0, 261.63].forEach(f => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = f;
      osc.connect(filter);
      osc.start();
      cleanupNodes.push(osc);
    });

    filter.connect(droneGain);
    droneGain.connect(roomGain);

    // 2. Soft Night Breeze
    try {
      const noise = ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(4);
      noise.loop = true;
      const nFilter = ctx.createBiquadFilter();
      nFilter.type = 'lowpass';
      nFilter.frequency.value = 500;
      const nGain = ctx.createGain();
      nGain.gain.value = 0.22;
      noise.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(roomGain);
      noise.start();
      cleanupNodes.push(noise);
    } catch (e) {}

    // 3. Gentle Sanctuary Piano Chimes
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 659.25];
    const playChime = () => {
      if (!this.isPlaying || this.currentRoom !== 'hall' || !this.ctx) return;
      const now = ctx.currentTime;
      const freq = scale[Math.floor(Math.random() * scale.length)];
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.value = freq;
      f.type = 'lowpass';
      f.frequency.value = 1400;

      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.18, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(f);
      f.connect(g);
      g.connect(roomGain);

      osc.start(now);
      osc.stop(now + 3.4);
    };

    playChime();
    timers.push(setInterval(playChime, 3200));

    return () => {
      timers.forEach(clearInterval);
      cleanupNodes.forEach(n => {
        try { n.stop(); } catch (e) {}
      });
    };
  }

  /* -------------------------------------------------------------
     ROOM 1: THOUGHTS — Two Different Worlds & Soft Window Rain
     ------------------------------------------------------------- */
  startRoom1Thoughts(roomGain) {
    const ctx = this.ctx;
    const cleanupNodes = [];
    const timers = [];

    // Trigger YouTube audio stream
    youtubeThoughtsPlayer.play();

    // Gentle nocturnal rain layer in background
    try {
      const rain = ctx.createBufferSource();
      rain.buffer = this.createNoiseBuffer(4);
      rain.loop = true;
      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.value = 650;
      const rainGain = ctx.createGain();
      rainGain.gain.value = 0.16;
      rain.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(roomGain);
      rain.start();
      cleanupNodes.push(rain);
    } catch (e) {}

    return () => {
      youtubeThoughtsPlayer.pause();
      timers.forEach(clearInterval);
      cleanupNodes.forEach(n => {
        try { n.stop(); } catch (e) {}
      });
    };
  }

  /* -------------------------------------------------------------
     ROOM 2: CINEMA — 35mm Projector Hum & Analog Synth Pad
     ------------------------------------------------------------- */
  startRoom2Cinema(roomGain) {
    const ctx = this.ctx;
    const cleanupNodes = [];
    const timers = [];

    // 1. 35mm Projector Hum
    const projOsc = ctx.createOscillator();
    const projGain = ctx.createGain();
    const projFilter = ctx.createBiquadFilter();

    projOsc.type = 'sawtooth';
    projOsc.frequency.value = 50;
    projFilter.type = 'bandpass';
    projFilter.frequency.value = 160;
    projGain.gain.value = 0.08;

    projOsc.connect(projFilter);
    projFilter.connect(projGain);
    projGain.connect(roomGain);
    projOsc.start();
    cleanupNodes.push(projOsc);

    // 2. Cinematic Analog Saw Chord Progression (Fmaj7 -> Am7 -> Bbmaj7 -> C)
    const chords = [
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [110.00, 164.81, 196.00, 261.63], // Am7
      [116.54, 174.61, 220.00, 293.66], // Bbmaj7
      [130.81, 196.00, 261.63, 329.63]  // C
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!this.isPlaying || this.currentRoom !== 'room2' || !this.ctx) return;
      const now = ctx.currentTime;
      const freqs = chords[chordIdx % chords.length];
      chordIdx++;

      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(600, now);
      f.frequency.linearRampToValueAtTime(1000, now + 2.5);
      f.frequency.linearRampToValueAtTime(550, now + 5.5);

      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.18, now + 1.5);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 6.0);

      f.connect(g);
      g.connect(roomGain);

      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        osc.detune.value = (Math.random() - 0.5) * 12;
        osc.connect(f);
        osc.start(now);
        osc.stop(now + 6.2);
      });
    };

    playChord();
    timers.push(setInterval(playChord, 5600));

    return () => {
      timers.forEach(clearInterval);
      cleanupNodes.forEach(n => {
        try { n.stop(); } catch (e) {}
      });
    };
  }

  /* -------------------------------------------------------------
     ROOM 3: MUSIC — Lofi Vinyl Crackle & Rhodes Lounge
     ------------------------------------------------------------- */
  startRoom3Music(roomGain) {
    const ctx = this.ctx;
    const cleanupNodes = [];
    const timers = [];

    // 1. Vinyl Crackle
    try {
      const bufferSize = ctx.sampleRate * 2;
      const crackleBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = crackleBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() < 0.003 ? (Math.random() * 2 - 1) * 0.4 : (Math.random() * 2 - 1) * 0.01;
      }
      const crackle = ctx.createBufferSource();
      crackle.buffer = crackleBuffer;
      crackle.loop = true;
      const cFilter = ctx.createBiquadFilter();
      cFilter.type = 'bandpass';
      cFilter.frequency.value = 1800;
      const cGain = ctx.createGain();
      cGain.gain.value = 0.18;
      crackle.connect(cFilter);
      cFilter.connect(cGain);
      cGain.connect(roomGain);
      crackle.start();
      cleanupNodes.push(crackle);
    } catch (e) {}

    // 2. Lofi Rhodes Electric Piano
    const rhodesChords = [
      [155.56, 196.00, 233.08, 293.66, 349.23], // Ebmaj9
      [98.00, 146.83, 174.61, 233.08, 293.66],  // Gm7
      [103.83, 155.56, 196.00, 261.63, 311.13], // Abmaj7
      [87.31, 130.81, 155.56, 207.65, 349.23]   // Fm9
    ];
    let chordIdx = 0;

    const playRhodes = () => {
      if (!this.isPlaying || this.currentRoom !== 'room3' || !this.ctx) return;
      const now = ctx.currentTime;
      const freqs = rhodesChords[chordIdx % rhodesChords.length];
      chordIdx++;

      freqs.forEach((freq, i) => {
        const carrier = ctx.createOscillator();
        const mod = ctx.createOscillator();
        const modGain = ctx.createGain();
        const noteGain = ctx.createGain();

        carrier.type = 'sine';
        carrier.frequency.value = freq;
        mod.type = 'sine';
        mod.frequency.value = freq * 2;
        modGain.gain.setValueAtTime(freq * 0.9, now);
        modGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

        mod.connect(modGain);
        modGain.connect(carrier.frequency);

        const strumOffset = i * 0.04;
        noteGain.gain.setValueAtTime(0.0001, now + strumOffset);
        noteGain.gain.linearRampToValueAtTime(0.12, now + strumOffset + 0.05);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + strumOffset + 4.2);

        carrier.connect(noteGain);
        noteGain.connect(roomGain);

        mod.start(now + strumOffset);
        carrier.start(now + strumOffset);
        mod.stop(now + strumOffset + 4.5);
        carrier.stop(now + strumOffset + 4.5);
      });
    };

    playRhodes();
    timers.push(setInterval(playRhodes, 4800));

    return () => {
      timers.forEach(clearInterval);
      cleanupNodes.forEach(n => {
        try { n.stop(); } catch (e) {}
      });
    };
  }

  /* -------------------------------------------------------------
     ROOM 4: IMAGINATION — Distant Echoed Slowed & Reverb Sanctuary
     ------------------------------------------------------------- */
  startRoom4Imagination(roomGain) {
    const ctx = this.ctx;
    const cleanupNodes = [];
    const timers = [];

    // 1. Multi-tap Stereo Feedback Delay Line (Distant Hall Echo & Reverb)
    const delay1 = ctx.createDelay(3.0);
    const delay2 = ctx.createDelay(3.0);
    delay1.delayTime.value = 0.58;
    delay2.delayTime.value = 1.16;

    const feedback = ctx.createGain();
    feedback.gain.value = 0.65;

    // Damping Lowpass Filter (muffled cathedral distance)
    const dampFilter = ctx.createBiquadFilter();
    dampFilter.type = 'lowpass';
    dampFilter.frequency.value = 750;

    const distantSpaceGain = ctx.createGain();
    distantSpaceGain.gain.value = 0.35;

    // Delay Network Wiring
    delay1.connect(dampFilter);
    dampFilter.connect(delay2);
    delay2.connect(feedback);
    feedback.connect(delay1);
    delay1.connect(distantSpaceGain);
    delay2.connect(distantSpaceGain);
    distantSpaceGain.connect(roomGain);

    // 2. Slowed Detuned Analog Tape Pad (F# Minor / A Lydian: F#2, C#3, A3, E4)
    const padGain = ctx.createGain();
    padGain.gain.value = 0.22;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 520;

    // Slow tape wow-and-flutter LFO
    const wowLFO = ctx.createOscillator();
    const wowGain = ctx.createGain();
    wowLFO.frequency.value = 0.25; // Slow 0.25Hz wobble
    wowGain.gain.value = 3.5; // subtle pitch drift
    wowLFO.connect(wowGain);
    wowLFO.start();
    cleanupNodes.push(wowLFO);

    [92.50, 138.59, 185.00, 220.00, 329.63].forEach(f => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = f;
      wowGain.connect(osc.detune);
      osc.connect(padFilter);
      osc.start();
      cleanupNodes.push(osc);
    });

    padFilter.connect(padGain);
    padGain.connect(roomGain);
    padGain.connect(delay1);

    // 3. Distant Slowed Reverb Melody Plucks (F# Dorian / Melancholy Ether)
    const slowedNotes = [185.00, 220.00, 277.18, 329.63, 370.00, 440.00, 554.37, 659.25];
    let noteCounter = 0;

    const playSlowedReverbMelody = () => {
      if (!this.isPlaying || this.currentRoom !== 'room4' || !this.ctx) return;
      const now = ctx.currentTime;
      const freq = slowedNotes[noteCounter % slowedNotes.length];
      noteCounter = (noteCounter + Math.floor(Math.random() * 3 + 1)) % slowedNotes.length;

      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();

      // Soft sine-triangle hybrid note
      osc.type = 'sine';
      osc.frequency.value = freq;

      f.type = 'lowpass';
      f.frequency.value = 900;

      // Slowed attack & long trailing reverb release
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.20, now + 0.12);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);

      osc.connect(f);
      f.connect(g);
      g.connect(roomGain);
      g.connect(delay1); // Heavy feed into echo chamber

      osc.start(now);
      osc.stop(now + 5.2);
    };

    playSlowedReverbMelody();
    timers.push(setInterval(playSlowedReverbMelody, 3800));

    return () => {
      timers.forEach(clearInterval);
      cleanupNodes.forEach(n => {
        try { n.stop(); } catch (e) {}
      });
    };
  }

  /* -------------------------------------------------------------
     ROOM 5: STUDY — Minimalist Kalimba & Antique Library Clock
     ------------------------------------------------------------- */
  startRoom5Study(roomGain) {
    const ctx = this.ctx;
    const cleanupNodes = [];
    const timers = [];

    // 1. Focus Drone (136.1Hz)
    const focusOsc = ctx.createOscillator();
    const focusGain = ctx.createGain();
    focusOsc.type = 'sine';
    focusOsc.frequency.value = 136.1;
    focusGain.gain.value = 0.16;
    focusOsc.connect(focusGain);
    focusGain.connect(roomGain);
    focusOsc.start();
    cleanupNodes.push(focusOsc);

    // 2. Pendulum Clock Tick
    const playTick = () => {
      if (!this.isPlaying || this.currentRoom !== 'room5' || !this.ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const g = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.04);

      filter.type = 'bandpass';
      filter.frequency.value = 500;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.09, now + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

      osc.connect(filter);
      filter.connect(g);
      g.connect(roomGain);

      osc.start(now);
      osc.stop(now + 0.09);
    };

    timers.push(setInterval(playTick, 1500));

    // 3. Kalimba Plucks (G Major)
    const kalimbaNotes = [392.00, 493.88, 587.33, 659.25, 783.99];
    let noteIdx = 0;
    const playKalimba = () => {
      if (!this.isPlaying || this.currentRoom !== 'room5' || !this.ctx) return;
      const now = ctx.currentTime;
      const freq = kalimbaNotes[noteIdx % kalimbaNotes.length];
      noteIdx = (noteIdx + 1) % kalimbaNotes.length;

      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.value = freq;
      f.type = 'lowpass';
      f.frequency.value = 1500;

      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.20, now + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(f);
      f.connect(g);
      g.connect(roomGain);

      osc.start(now);
      osc.stop(now + 2.0);
    };

    playKalimba();
    timers.push(setInterval(playKalimba, 2200));

    return () => {
      timers.forEach(clearInterval);
      cleanupNodes.forEach(n => {
        try { n.stop(); } catch (e) {}
      });
    };
  }

  /* -------------------------------------------------------------
     DOOR OPEN SOUND EFFECT
     ------------------------------------------------------------- */
  playDoorChime() {
    if (!this.ctx || !this.isPlaying) return;
    try {
      const now = this.ctx.currentTime;
      [659.25, 987.77].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const startTime = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.value = freq;

        g.gain.setValueAtTime(0.0001, startTime);
        g.gain.linearRampToValueAtTime(0.22, startTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.9);

        osc.connect(g);
        g.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 1.0);
      });
    } catch (e) {
      console.warn('Door chime error:', e);
    }
  }

  /* -------------------------------------------------------------
     ROOM SWITCHING & CROSS-FADING
     ------------------------------------------------------------- */
  async setRoom(roomId) {
    if (!['hall', 'room1', 'room2', 'room3', 'room4', 'room5'].includes(roomId)) return;
    this.currentRoom = roomId;

    if (!this.isPlaying) {
      if (this.onRoomChange) {
        this.onRoomChange(this.getTrackInfo());
      }
      return;
    }

    await this.getContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const newRoomGain = ctx.createGain();
    newRoomGain.gain.setValueAtTime(0.0001, now);
    newRoomGain.gain.linearRampToValueAtTime(1.0, now + 0.8);
    newRoomGain.connect(this.masterGain);

    let newStopFn = null;
    switch (roomId) {
      case 'hall':  newStopFn = this.startHallSound(newRoomGain); break;
      case 'room1': newStopFn = this.startRoom1Thoughts(newRoomGain); break;
      case 'room2': newStopFn = this.startRoom2Cinema(newRoomGain); break;
      case 'room3': newStopFn = this.startRoom3Music(newRoomGain); break;
      case 'room4': newStopFn = this.startRoom4Imagination(newRoomGain); break;
      case 'room5': newStopFn = this.startRoom5Study(newRoomGain); break;
    }

    const oldStopFn = this.activeRoomStopFn;
    this.activeRoomStopFn = newStopFn;

    if (oldStopFn) {
      setTimeout(() => {
        try { oldStopFn(); } catch (e) {}
      }, 900);
    }

    if (this.onRoomChange) {
      this.onRoomChange(this.getTrackInfo());
    }
  }

  getTrackInfo() {
    return {
      roomId: this.currentRoom,
      title: this.trackTitles[this.currentRoom] || 'THE HOUSE',
      isPlaying: this.isPlaying
    };
  }

  /* -------------------------------------------------------------
     MASTER PLAY / STOP
     ------------------------------------------------------------- */
  async start() {
    await this.getContext();
    this.isPlaying = true;
    await this.setRoom(this.currentRoom);
    return true;
  }

  stop() {
    this.isPlaying = false;
    if (this.activeRoomStopFn) {
      try { this.activeRoomStopFn(); } catch (e) {}
      this.activeRoomStopFn = null;
    }
    youtubeThoughtsPlayer.pause();
    if (this.onRoomChange) {
      this.onRoomChange(this.getTrackInfo());
    }
    return false;
  }

  async toggle() {
    if (!this.isPlaying) {
      return await this.start();
    } else {
      return this.stop();
    }
  }
}

export const sanctuaryAudio = new SanctuaryAudio();
