/**
 * THE HOUSE — Sanctuary Data Store
 * Manages thoughts, cinema logs, imaginations, study records,
 * and the staged Personal Music Archive (pending_music & music_history).
 */

const STORAGE_KEY = 'the_house_sanctuary_data_v2';
const API_BASE = ''; // Same origin

class HouseStore {
  constructor() {
    this.data = this.loadLocal();
    this.listeners = new Set();
    this.syncWithBackend();
  }

  loadLocal() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load local storage:', e);
    }
    return this.getDefaultState();
  }

  getDefaultState() {
    const now = new Date().toISOString();
    return {
      thoughts: [
        {
          id: 'thought-init-1',
          text: 'The stillness of midnight has a way of undoing every knot the day tied together.',
          createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString()
        }
      ],
      movies: [
        {
          id: 'movie-init-1',
          title: 'Stalker (1979)',
          status: 'finished',
          note: 'Andrei Tarkovsky. The quiet room where wishes are made.',
          createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString()
        },
        {
          id: 'movie-init-2',
          title: 'In the Mood for Love',
          status: 'finished',
          note: 'Wong Kar-wai. Secrets whispered into a hole in the stone.',
          createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString()
        },
        {
          id: 'movie-init-3',
          title: 'Solaris',
          status: 'watching',
          note: 'The ocean of memories.',
          createdAt: now
        }
      ],
      music: {
        nowPlaying: {
          title: 'Gymnopédie No. 1',
          artist: 'Érik Satie',
          album: 'Nocturnes',
          source: 'archive',
          updated_at: now
        },
        pending: [
          {
            id: 'pend-1',
            title: 'Subterranean Homesick Alien',
            artist: 'Radiohead',
            album: 'OK Computer',
            thumbnail_url: '',
            source: 'youtube_music',
            played_at: now,
            duration: 267,
            status: 'pending',
            created_at: now
          },
          {
            id: 'pend-2',
            title: 'Starálfur',
            artist: 'Sigur Rós',
            album: 'Ágætis byrjun',
            thumbnail_url: '',
            source: 'youtube_music',
            played_at: now,
            duration: 407,
            status: 'pending',
            created_at: now
          },
          {
            id: 'pend-3',
            title: 'Motion Picture Soundtrack',
            artist: 'Radiohead',
            album: 'Kid A',
            thumbnail_url: '',
            source: 'takeout',
            played_at: now,
            duration: 200,
            status: 'pending',
            created_at: now
          }
        ],
        history: [
          {
            id: 'hist-1',
            title: 'Gymnopédie No. 1',
            artist: 'Érik Satie',
            album: 'Nocturnes',
            thumbnail_url: '',
            source: 'youtube_music',
            played_at: now,
            duration: 204,
            status: 'approved',
            created_at: now
          },
          {
            id: 'hist-2',
            title: 'Avril 14th',
            artist: 'Aphex Twin',
            album: 'Drukqs',
            thumbnail_url: '',
            source: 'youtube_music',
            played_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
            duration: 125,
            status: 'approved',
            created_at: now
          },
          {
            id: 'hist-3',
            title: 'Near Light',
            artist: 'Ólafur Arnalds',
            album: 'Living Room Songs',
            thumbnail_url: '',
            source: 'takeout',
            played_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
            duration: 240,
            status: 'approved',
            created_at: now
          }
        ],
        stats: {
          mostListenedSong: 'Gymnopédie No. 1 (3 plays)',
          mostListenedArtist: 'Érik Satie (3 plays)',
          totalSongs: 3,
          totalSessions: 3,
          totalListeningTime: '0h 9m',
          songsToday: 2,
          songsThisWeek: 3,
          songsThisMonth: 3,
          topSongs: []
        }
      },
      imaginations: [
        {
          id: 'frag-init-1',
          title: 'The Library on the Edge of the Mist',
          body: 'A wooden house standing at the very precipice where the pine forest ends and the endless white mist begins. Inside, there are no clocks, only tall bookshelves and a single brass kettle whistling on the iron stove. Outside, snow falls in complete silence.',
          createdAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString()
        }
      ],
      study: {
        records: {}
      }
    };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.notify();
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.data));
  }

  // --- API SYNC ---
  async syncWithBackend() {
    try {
      const resp = await fetch(`${API_BASE}/api/music/state`);
      if (resp.ok) {
        const result = await resp.json();
        if (result && result.history) {
          if (!this.data.music) this.data.music = {};
          this.data.music.nowPlaying = result.nowPlaying;
          this.data.music.pending = result.pendingSongs;
          this.data.music.history = result.history;
          this.data.music.stats = result.stats;
          this.save();
        }
      }
    } catch (e) {
      // Running standalone / client-side storage active
    }
  }

  // --- THOUGHTS ---
  addThought(text) {
    if (!text || !text.trim()) return;
    const newEntry = {
      id: 'thought-' + Date.now(),
      text: text.trim(),
      createdAt: new Date().toISOString()
    };
    this.data.thoughts.unshift(newEntry);
    this.save();
    return newEntry;
  }

  deleteThought(id) {
    this.data.thoughts = this.data.thoughts.filter(t => t.id !== id);
    this.save();
  }

  // --- MOVIES ---
  addMovie(title, status = 'watching', note = '') {
    if (!title || !title.trim()) return;
    const newMovie = {
      id: 'movie-' + Date.now(),
      title: title.trim(),
      status,
      note: note.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.movies.unshift(newMovie);
    this.save();
    return newMovie;
  }

  updateMovieStatus(id, newStatus) {
    const movie = this.data.movies.find(m => m.id === id);
    if (movie) {
      movie.status = newStatus;
      movie.updatedAt = new Date().toISOString();
      this.save();
    }
  }

  deleteMovie(id) {
    this.data.movies = this.data.movies.filter(m => m.id !== id);
    this.save();
  }

  // --- MUSIC ARCHIVE (ROOM 3) ---
  async importPendingMusic(items) {
    if (!items || !items.length) return;
    // Send to backend API
    try {
      const resp = await fetch(`${API_BASE}/api/music/pending/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      if (resp.ok) {
        await this.syncWithBackend();
        return;
      }
    } catch (e) {}

    // Local fallback
    const now = new Date().toISOString();
    items.forEach(it => {
      this.data.music.pending.unshift({
        id: it.id || 'pend-' + Date.now() + Math.random().toString(36).substr(2, 4),
        title: it.title || it.song,
        artist: it.artist,
        album: it.album || 'Single / Import',
        thumbnail_url: it.thumbnail_url || '',
        source: it.source || 'youtube_music',
        played_at: it.played_at || now,
        duration: it.duration || 210,
        status: 'pending',
        created_at: now
      });
    });
    this.recalculateMusicStats();
    this.save();
  }

  async keepPendingSong(id) {
    try {
      const resp = await fetch(`${API_BASE}/api/music/pending/keep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (resp.ok) {
        await this.syncWithBackend();
        return;
      }
    } catch (e) {}

    // Local fallback
    const pendingList = this.data.music.pending || [];
    const item = pendingList.find(p => p.id === id);
    if (item) {
      this.data.music.pending = pendingList.filter(p => p.id !== id);
      this.data.music.history.unshift({
        ...item,
        id: 'hist-' + Date.now(),
        status: 'approved',
        created_at: new Date().toISOString()
      });
      this.recalculateMusicStats();
      this.save();
    }
  }

  async discardPendingSong(id) {
    try {
      const resp = await fetch(`${API_BASE}/api/music/pending/discard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (resp.ok) {
        await this.syncWithBackend();
        return;
      }
    } catch (e) {}

    // Local fallback
    this.data.music.pending = (this.data.music.pending || []).filter(p => p.id !== id);
    this.save();
  }

  async keepAllPending() {
    try {
      const resp = await fetch(`${API_BASE}/api/music/pending/keep-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (resp.ok) {
        await this.syncWithBackend();
        return;
      }
    } catch (e) {}

    // Local fallback
    const pending = this.data.music.pending || [];
    const now = new Date().toISOString();
    pending.forEach(p => {
      this.data.music.history.unshift({
        ...p,
        id: 'hist-' + Date.now() + Math.random().toString(36).substr(2, 4),
        status: 'approved',
        created_at: now
      });
    });
    this.data.music.pending = [];
    this.recalculateMusicStats();
    this.save();
  }

  async discardAllPending() {
    try {
      const resp = await fetch(`${API_BASE}/api/music/pending/discard-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (resp.ok) {
        await this.syncWithBackend();
        return;
      }
    } catch (e) {}

    // Local fallback
    this.data.music.pending = [];
    this.save();
  }

  async setNowPlaying(title, artist, album, source = 'manual') {
    try {
      const resp = await fetch(`${API_BASE}/api/music/now-playing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, artist, album, source })
      });
      if (resp.ok) {
        await this.syncWithBackend();
        return;
      }
    } catch (e) {}

    // Local fallback
    const now = new Date().toISOString();
    this.data.music.nowPlaying = {
      title,
      artist,
      album,
      source,
      updated_at: now
    };
    this.data.music.history.unshift({
      id: 'hist-' + Date.now(),
      title,
      artist,
      album,
      thumbnail_url: '',
      source,
      played_at: now,
      duration: 210,
      status: 'approved',
      created_at: now
    });
    this.recalculateMusicStats();
    this.save();
  }

  async logPlayEvent(title, artist, album, duration = 210) {
    try {
      const resp = await fetch(`${API_BASE}/api/music/history/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, artist, album, duration })
      });
      if (resp.ok) {
        await this.syncWithBackend();
        return;
      }
    } catch (e) {}

    // Local fallback
    const now = new Date().toISOString();
    this.data.music.history.unshift({
      id: 'hist-' + Date.now(),
      title,
      artist,
      album,
      thumbnail_url: '',
      source: 'archive',
      played_at: now,
      duration,
      status: 'approved',
      created_at: now
    });
    this.data.music.nowPlaying = {
      title,
      artist,
      album,
      source: 'archive',
      updated_at: now
    };
    this.recalculateMusicStats();
    this.save();
  }

  recalculateMusicStats() {
    const history = this.data.music.history || [];
    const totalSessions = history.length;
    const uniqueSongs = new Set(history.map(h => (h.title + ':::' + h.artist).toLowerCase())).size;

    let totalDuration = history.reduce((sum, h) => sum + (h.duration || 210), 0);
    const hours = Math.floor(totalDuration / 3600);
    const mins = Math.floor((totalDuration % 3600) / 60);

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    const monthStartStr = now.toISOString().slice(0, 7);

    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;

    const songCounts = {};
    const artistCounts = {};

    history.forEach(h => {
      const pDate = new Date(h.played_at);
      if (h.played_at.startsWith(todayStr)) todayCount++;
      if (pDate >= weekAgo) weekCount++;
      if (h.played_at.startsWith(monthStartStr)) monthCount++;

      const key = `${h.title}:::${h.artist}:::${h.album || ''}`;
      songCounts[key] = (songCounts[key] || 0) + 1;

      const art = h.artist || 'Unknown';
      artistCounts[art] = (artistCounts[art] || 0) + 1;
    });

    const sortedSongs = Object.entries(songCounts).sort((a, b) => b[1] - a[1]);
    const sortedArtists = Object.entries(artistCounts).sort((a, b) => b[1] - a[1]);

    this.data.music.stats = {
      mostListenedSong: sortedSongs.length ? `${sortedSongs[0][0].split(':::')[0]} (${sortedSongs[0][1]} plays)` : '—',
      mostListenedArtist: sortedArtists.length ? `${sortedArtists[0][0]} (${sortedArtists[0][1]} plays)` : '—',
      totalSongs: uniqueSongs,
      totalSessions: totalSessions,
      totalListeningTime: `${hours}h ${mins}m`,
      songsToday: todayCount,
      songsThisWeek: weekCount,
      songsThisMonth: monthCount,
      topSongs: sortedSongs.slice(0, 10).map(s => {
        const parts = s[0].split(':::');
        return { title: parts[0], artist: parts[1], album: parts[2], plays: s[1] };
      })
    };
  }

  // --- IMAGINATION ---
  addImagination(title, body) {
    if (!body || !body.trim()) return;
    const newFrag = {
      id: 'frag-' + Date.now(),
      title: (title || '').trim() || 'An Unspoken Scenario',
      body: body.trim(),
      createdAt: new Date().toISOString()
    };
    this.data.imaginations.unshift(newFrag);
    this.save();
    return newFrag;
  }

  deleteImagination(id) {
    this.data.imaginations = this.data.imaginations.filter(i => i.id !== id);
    this.save();
  }

  // --- STUDY ---
  recordStudyDay(dateKey, studied, subject = '', duration = '') {
    if (!this.data.study.records) {
      this.data.study.records = {};
    }
    this.data.study.records[dateKey] = {
      studied: Boolean(studied),
      subject: (subject || '').trim(),
      duration: (duration || '').trim(),
      timestamp: new Date().toISOString()
    };
    this.save();
  }

  // --- VAULT EXPORT & IMPORT ---
  exportBackup() {
    const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `the-house-sanctuary-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        this.data = { ...this.getDefaultState(), ...parsed };
        this.save();
        return true;
      }
    } catch (e) {
      console.error('Invalid backup JSON:', e);
    }
    return false;
  }

  resetAll() {
    this.data = this.getDefaultState();
    this.save();
  }
}

export const store = new HouseStore();
