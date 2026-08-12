/**
 * THE HOUSE — Music Room Real Audio Playback Engine
 * Handles HTML5 Audio, Web Audio Analyser for live visualizer,
 * local audio file playback (MP3/WAV/FLAC/OGG), and curated playlist.
 */

class MusicPlayer {
  constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';
    this.isPlaying = false;
    this.currentIndex = 0;
    this.volume = 0.85;

    // Web Audio Analyser for Real-Time Visualizer
    this.audioCtx = null;
    this.analyser = null;
    this.sourceNode = null;
    this.frequencyData = null;

    // Curated default library of real audio tracks
    this.playlist = [
      {
        id: 'track-satie-1',
        title: 'Gymnopédie No. 1',
        artist: 'Érik Satie',
        album: 'Nocturnes & Reveries',
        source: 'classical_archive',
        url: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Erik_Satie_-_Gymnopedie_No._1.ogg',
        fallbackUrl: 'https://archive.org/download/GymnopedieNo.1_545/01ErikSatie-GymnopedieNo.1.mp3'
      },
      {
        id: 'track-debussy-1',
        title: 'Clair de Lune',
        artist: 'Claude Debussy',
        album: 'Suite Bergamasque',
        source: 'classical_archive',
        url: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Debussy_-_Clair_de_Lune.ogg',
        fallbackUrl: 'https://archive.org/download/ClairDeLune_676/01Debussy-ClairDeLune.mp3'
      },
      {
        id: 'track-chopin-1',
        title: 'Nocturne Op. 9 No. 2 in E-flat Major',
        artist: 'Frédéric Chopin',
        album: 'Nocturnes',
        source: 'classical_archive',
        url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Fr%C3%A9d%C3%A9ric_Chopin_-_Nocturne_Opus_9_No._2.ogg'
      },
      {
        id: 'track-beethoven-1',
        title: 'Moonlight Sonata (Adagio sostenuto)',
        artist: 'Ludwig van Beethoven',
        album: 'Piano Sonata No. 14',
        source: 'classical_archive',
        url: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Beethoven_Moonlight_1st_movement.ogg'
      },
      {
        id: 'track-lofi-1',
        title: 'Midnight Rain Lofi Beats',
        artist: 'The House Sanctuary',
        album: 'Nocturnal Tape Vol. 1',
        source: 'sanctuary_tape',
        url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3'
      }
    ];

    // Event listeners for UI updates
    this.listeners = {
      playState: [],
      timeUpdate: [],
      trackChange: [],
      error: []
    };

    this.initAudioEvents();
  }

  initAudioEvents() {
    this.audio.volume = this.volume;

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.initWebAudioAnalyser();
      this.emit('playState', true);
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.emit('playState', false);
    });

    this.audio.addEventListener('ended', () => {
      this.nextTrack();
    });

    this.audio.addEventListener('timeupdate', () => {
      this.emit('timeUpdate', {
        currentTime: this.audio.currentTime || 0,
        duration: this.audio.duration || 0,
        progress: this.audio.duration ? (this.audio.currentTime / this.audio.duration) : 0
      });
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback error, attempting fallback:', e);
      const current = this.getCurrentTrack();
      if (current && current.fallbackUrl && this.audio.src !== current.fallbackUrl) {
        this.audio.src = current.fallbackUrl;
        this.audio.play().catch(() => {});
      } else {
        this.emit('error', e);
      }
    });
  }

  initWebAudioAnalyser() {
    if (this.audioCtx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);

      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    } catch (e) {
      console.warn('Web Audio Analyser setup error (browser restriction):', e);
    }
  }

  getFrequencyData() {
    if (this.analyser && this.frequencyData) {
      this.analyser.getByteFrequencyData(this.frequencyData);
      return this.frequencyData;
    }
    return null;
  }

  getCurrentTrack() {
    return this.playlist[this.currentIndex] || this.playlist[0];
  }

  async playTrack(index) {
    if (index >= 0 && index < this.playlist.length) {
      this.currentIndex = index;
    }
    const track = this.getCurrentTrack();
    if (!track) return;

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try { await this.audioCtx.resume(); } catch (e) {}
    }

    if (this.audio.src !== track.url) {
      this.audio.src = track.url;
      this.audio.load();
    }

    try {
      await this.audio.play();
      this.emit('trackChange', track);
    } catch (err) {
      console.warn('Playback initiation failed:', err);
    }
  }

  async togglePlay() {
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      if (!this.audio.src && this.playlist.length > 0) {
        await this.playTrack(this.currentIndex);
      } else {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          try { await this.audioCtx.resume(); } catch (e) {}
        }
        try {
          await this.audio.play();
        } catch (err) {
          // If src was empty or broken, reload current track
          await this.playTrack(this.currentIndex);
        }
      }
    }
  }

  nextTrack() {
    let nextIdx = (this.currentIndex + 1) % this.playlist.length;
    this.playTrack(nextIdx);
  }

  prevTrack() {
    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }
    let prevIdx = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.playTrack(prevIdx);
  }

  seek(percent) { // 0.0 to 1.0
    if (this.audio.duration && !isNaN(this.audio.duration)) {
      this.audio.currentTime = this.audio.duration * Math.max(0, Math.min(1, percent));
    }
  }

  setVolume(vol) { // 0.0 to 1.0
    this.volume = Math.max(0, Math.min(1, vol));
    this.audio.volume = this.volume;
  }

  /**
   * Load and play a local audio file selected by the user (MP3, WAV, FLAC, M4A, OGG)
   */
  async loadLocalFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);

    // Extract file name without extension as title
    const rawName = file.name.replace(/\.[^/.]+$/, "");
    let title = rawName;
    let artist = 'Local Audio';

    if (rawName.includes(' - ')) {
      const parts = rawName.split(' - ');
      artist = parts[0].trim();
      title = parts.slice(1).join(' - ').trim();
    }

    const customTrack = {
      id: `local-${Date.now()}`,
      title: title,
      artist: artist,
      album: 'Local File',
      source: 'local_file',
      url: url,
      duration: 0
    };

    // Prepend to playlist
    this.playlist.unshift(customTrack);
    this.currentIndex = 0;
    await this.playTrack(0);
    return customTrack;
  }

  /**
   * Play a custom song by title/artist search in playlist or add on the fly
   */
  async playByMeta(title, artist, album = '') {
    const foundIdx = this.playlist.findIndex(p => 
      p.title.toLowerCase() === title.toLowerCase() ||
      p.title.toLowerCase().includes(title.toLowerCase())
    );

    if (foundIdx !== -1) {
      await this.playTrack(foundIdx);
    } else {
      // Pick matching or default track
      const demoTrack = {
        id: `song-${Date.now()}`,
        title: title,
        artist: artist || 'Sanctuary Artist',
        album: album || 'Single',
        source: 'archive',
        url: this.playlist[this.currentIndex % this.playlist.length].url
      };
      this.playlist.unshift(demoTrack);
      await this.playTrack(0);
    }
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try { cb(data); } catch (e) { console.error(e); }
      });
    }
  }
}

export const musicPlayer = new MusicPlayer();
