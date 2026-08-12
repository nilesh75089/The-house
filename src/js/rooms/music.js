/**
 * THE HOUSE — Room 3: WHAT AM I LISTENING TO? (Personal Music Archive)
 * Manages Real Audio Playback, Now Playing cassette deck, the staged "NEW SONGS" approval queue,
 * the permanent music archive, and comprehensive listening statistics.
 */

import { store } from '../store.js';
import { musicPlayer } from '../musicPlayer.js';

export function initMusicRoom() {
  // Now Playing elements
  const inputSong = document.getElementById('music-song-input');
  const inputArtist = document.getElementById('music-artist-input');
  const inputAlbum = document.getElementById('music-album-input');
  const btnSave = document.getElementById('btn-save-music');
  const curSong = document.getElementById('current-song-title');
  const curArtist = document.getElementById('current-song-artist');
  const curAlbum = document.getElementById('current-song-album');
  const nowSourceTag = document.getElementById('now-source-tag');

  // Real Audio Player Controls
  const btnPlay = document.getElementById('btn-music-play');
  const btnPrev = document.getElementById('btn-music-prev');
  const btnNext = document.getElementById('btn-music-next');
  const progressSlider = document.getElementById('music-progress-slider');
  const timeCurrent = document.getElementById('music-time-current');
  const timeTotal = document.getElementById('music-time-total');
  const volumeSlider = document.getElementById('music-volume-slider');
  const fileInput = document.getElementById('input-audio-file-direct');
  const cassetteDeck = document.getElementById('cassette-deck');
  const visualizerCanvas = document.getElementById('cassette-visualizer-canvas');

  // Pending queue elements
  const pendingCountBadge = document.getElementById('pending-count-badge');
  const pendingListEl = document.getElementById('pending-songs-list');
  const btnKeepAll = document.getElementById('btn-keep-all');
  const btnDiscardAll = document.getElementById('btn-discard-all');

  // Statistics elements
  const statTopSong = document.getElementById('mstat-top-song');
  const statTopArtist = document.getElementById('mstat-top-artist');
  const statTotalSongs = document.getElementById('mstat-total-songs');
  const statTotalSessions = document.getElementById('mstat-total-sessions');
  const statTotalTime = document.getElementById('mstat-total-time');
  const statSongsToday = document.getElementById('mstat-songs-today');
  const statSongsWeek = document.getElementById('mstat-songs-week');
  const statSongsMonth = document.getElementById('mstat-songs-month');

  // Lists
  const mostListenedEl = document.getElementById('most-listened-list');
  const journalEl = document.getElementById('music-journal-list');
  const historyTotalTag = document.getElementById('history-total-tag');

  // Import Modal elements
  const btnOpenImport = document.getElementById('btn-open-import-modal');
  const importModal = document.getElementById('music-import-modal');
  const btnCloseImport = document.getElementById('btn-close-music-import');
  const tabTakeout = document.getElementById('tab-import-takeout');
  const tabSample = document.getElementById('tab-import-sample');
  const paneTakeout = document.getElementById('import-pane-takeout');
  const paneSample = document.getElementById('import-pane-sample');
  const inputJson = document.getElementById('import-json-input');
  const inputMusicFile = document.getElementById('input-import-music-file');
  const btnRunJsonImport = document.getElementById('btn-run-json-import');
  const btnLoadSample = document.getElementById('btn-load-sample-pending');

  let isScrubbing = false;

  // --- Real Audio Player Listeners ---
  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      musicPlayer.togglePlay();
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      musicPlayer.prevTrack();
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      musicPlayer.nextTrack();
    });
  }

  if (progressSlider) {
    progressSlider.addEventListener('input', () => {
      isScrubbing = true;
    });

    progressSlider.addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      musicPlayer.seek(val / 100);
      isScrubbing = false;
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      musicPlayer.setVolume(parseFloat(e.target.value) / 100);
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        const track = await musicPlayer.loadLocalFile(file);
        store.setNowPlaying(track.title, track.artist, track.album, 'local_file');
      }
    });
  }

  musicPlayer.on('playState', (isPlaying) => {
    if (btnPlay) {
      btnPlay.textContent = isPlaying ? '⏸ PAUSE' : '▶ PLAY';
      btnPlay.classList.toggle('active-playing', isPlaying);
    }
    if (cassetteDeck) {
      cassetteDeck.classList.toggle('playing', isPlaying);
    }
  });

  musicPlayer.on('timeUpdate', ({ currentTime, duration, progress }) => {
    if (timeCurrent) timeCurrent.textContent = formatTime(currentTime);
    if (timeTotal && duration && !isNaN(duration)) timeTotal.textContent = formatTime(duration);
    if (progressSlider && !isScrubbing) {
      progressSlider.value = (progress * 100).toFixed(1);
    }
  });

  musicPlayer.on('trackChange', (track) => {
    if (curSong) curSong.textContent = track.title;
    if (curArtist) curArtist.textContent = track.artist;
    if (curAlbum) curAlbum.textContent = track.album || 'Single';
    if (nowSourceTag) nowSourceTag.textContent = (track.source || 'archive').toUpperCase();
    store.setNowPlaying(track.title, track.artist, track.album || 'Single', track.source || 'archive');
  });

  // --- Real-time Equalizer Visualizer on Cassette Window ---
  if (visualizerCanvas) {
    const vCtx = visualizerCanvas.getContext('2d');
    const drawVisualizer = () => {
      const width = visualizerCanvas.width;
      const height = visualizerCanvas.height;
      vCtx.clearRect(0, 0, width, height);

      const freq = musicPlayer.getFrequencyData();
      if (freq && musicPlayer.isPlaying) {
        const barCount = 12;
        const barWidth = Math.floor(width / barCount) - 2;

        for (let i = 0; i < barCount; i++) {
          const val = freq[i * 2] || 0;
          const barHeight = Math.max(2, Math.floor((val / 255) * height));
          const x = i * (barWidth + 2) + 2;
          const y = height - barHeight;

          vCtx.fillStyle = '#f6b93b';
          vCtx.fillRect(x, y, barWidth, barHeight);
        }
      } else {
        // Idle ambient line
        vCtx.fillStyle = 'rgba(246, 185, 59, 0.25)';
        vCtx.fillRect(0, height / 2 - 1, width, 2);
      }

      requestAnimationFrame(drawVisualizer);
    };
    drawVisualizer();
  }

  function renderMusicArchive() {
    const musicData = store.data.music || { nowPlaying: {}, pending: [], history: [], stats: {} };
    const nowPlaying = musicData.nowPlaying || {};
    const pending = musicData.pending || [];
    const history = musicData.history || [];
    const stats = musicData.stats || {};

    // 1. Render NOW PLAYING metadata
    const currentTrack = musicPlayer.getCurrentTrack();
    curSong.textContent = currentTrack?.title || nowPlaying.title || 'Gymnopédie No. 1';
    curArtist.textContent = currentTrack?.artist || nowPlaying.artist || 'Érik Satie';
    curAlbum.textContent = currentTrack?.album || nowPlaying.album || 'Nocturnes & Reveries';
    if (nowSourceTag) {
      nowSourceTag.textContent = (currentTrack?.source || nowPlaying.source || 'archive').toUpperCase();
    }

    // 2. Render NEW SONGS (Pending Approval Queue)
    if (pendingCountBadge) {
      pendingCountBadge.textContent = `${pending.length} PENDING`;
    }

    if (pending.length === 0) {
      pendingListEl.innerHTML = '<div class="empty-placeholder">No new songs waiting for review. All clear.</div>';
    } else {
      pendingListEl.innerHTML = pending.map(p => {
        const pDate = new Date(p.played_at);
        const timeStr = pDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = pDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const sourceLabel = p.source === 'youtube_music' ? 'YT MUSIC' : (p.source || 'IMPORT').toUpperCase();

        return `
          <div class="pending-song-card" data-id="${p.id}">
            <div class="pending-song-meta">
              <div class="pending-song-title-row">
                <span class="pending-song-title">${escapeHtml(p.title)}</span>
                <span class="pixel-source-badge">${sourceLabel}</span>
              </div>
              <span class="pending-song-artist">${escapeHtml(p.artist)}</span>
              <span class="pending-song-sub">${escapeHtml(p.album || 'Single')} · ${dateStr} at ${timeStr}</span>
            </div>
            <div class="pending-song-actions">
              <button class="btn-play-track-now" data-play-title="${escapeHtml(p.title)}" data-play-artist="${escapeHtml(p.artist)}" data-play-album="${escapeHtml(p.album || '')}" title="Listen now">▶ PLAY</button>
              <button class="btn-keep" data-keep="${p.id}" title="Move to permanent archive">KEEP</button>
              <button class="btn-discard" data-discard="${p.id}" title="Discard entry">DISCARD</button>
            </div>
          </div>
        `;
      }).join('');

      pendingListEl.querySelectorAll('.btn-keep').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.getAttribute('data-keep');
          store.keepPendingSong(id);
        });
      });

      pendingListEl.querySelectorAll('.btn-discard').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.getAttribute('data-discard');
          store.discardPendingSong(id);
        });
      });
    }

    // 3. Render MUSIC HISTORY STATISTICS
    statTopSong.textContent = stats.mostListenedSong || '—';
    statTopArtist.textContent = stats.mostListenedArtist || '—';
    statTotalSongs.textContent = stats.totalSongs || 0;
    statTotalSessions.textContent = stats.totalSessions || history.length;
    statTotalTime.textContent = stats.totalListeningTime || '0h 0m';
    statSongsToday.textContent = stats.songsToday || 0;
    statSongsWeek.textContent = stats.songsThisWeek || 0;
    statSongsMonth.textContent = stats.songsThisMonth || 0;

    // 4. Render MOST LISTENED (Top Songs) with Real Play Buttons
    const topSongs = stats.topSongs || [];
    if (topSongs.length === 0) {
      mostListenedEl.innerHTML = `
        <li class="empty-placeholder">1. No tracks recorded yet</li>
        <li class="empty-placeholder">2. —</li>
        <li class="empty-placeholder">3. —</li>
      `;
    } else {
      mostListenedEl.innerHTML = topSongs.slice(0, 5).map((t, idx) => `
        <li class="most-item">
          <span class="most-rank-num">[${idx + 1}]</span>
          <div class="most-info">
            <span class="most-title">${escapeHtml(t.title)}</span>
            <span class="most-sub">${escapeHtml(t.artist)} · ${escapeHtml(t.album || 'Single')}</span>
          </div>
          <div class="most-actions-group">
            <button class="btn-play-track-now" data-play-title="${escapeHtml(t.title)}" data-play-artist="${escapeHtml(t.artist)}" data-play-album="${escapeHtml(t.album || '')}" title="Play audio">▶ PLAY</button>
            <span class="most-plays">${t.plays} ${t.plays === 1 ? 'play' : 'plays'}</span>
          </div>
        </li>
      `).join('');
    }

    // 5. Render RECENTLY LISTENED (Chronological Archive Log) with Real Play Buttons
    if (historyTotalTag) {
      historyTotalTag.textContent = `${history.length} archived sessions`;
    }

    if (history.length === 0) {
      journalEl.innerHTML = '<div class="empty-placeholder">No permanent listening records yet.</div>';
    } else {
      journalEl.innerHTML = history.slice(0, 50).map(h => {
        const hDate = new Date(h.played_at);
        const timeStr = hDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = hDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const durationMin = h.duration ? `${Math.floor(h.duration / 60)}:${String(h.duration % 60).padStart(2, '0')}` : '3:30';

        return `
          <div class="journal-item">
            <div class="journal-meta">
              <div class="journal-song-row">
                <span class="journal-song">${escapeHtml(h.title)}</span>
                <span class="pixel-source-badge">${(h.source || 'ARCHIVE').toUpperCase()}</span>
              </div>
              <span class="journal-artist">${escapeHtml(h.artist)} · ${escapeHtml(h.album || 'Single')}</span>
            </div>
            <div class="journal-actions">
              <span class="journal-duration">${durationMin} · ${dateStr}</span>
              <button class="btn-play-track-now" data-play-title="${escapeHtml(h.title)}" data-play-artist="${escapeHtml(h.artist)}" data-play-album="${escapeHtml(h.album || '')}" title="Play audio">▶ PLAY</button>
              <button class="btn-replay-track" data-replay-title="${escapeHtml(h.title)}" data-replay-artist="${escapeHtml(h.artist)}" data-replay-album="${escapeHtml(h.album || '')}" title="Log another listen">+1 PLAY</button>
            </div>
          </div>
        `;
      }).join('');

      journalEl.querySelectorAll('.btn-replay-track').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const t = e.target.getAttribute('data-replay-title');
          const a = e.target.getAttribute('data-replay-artist');
          const al = e.target.getAttribute('data-replay-album');
          store.logPlayEvent(t, a, al);
        });
      });
    }

    // Attach Play Handlers across all rendered tracklists
    document.querySelectorAll('.btn-play-track-now').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const t = e.currentTarget.getAttribute('data-play-title');
        const a = e.currentTarget.getAttribute('data-play-artist');
        const al = e.currentTarget.getAttribute('data-play-album');
        await musicPlayer.playByMeta(t, a, al);
        store.logPlayEvent(t, a, al);
      });
    });
  }

  // --- Handlers ---
  function handleSaveNowPlaying() {
    const song = inputSong.value.trim();
    if (!song) return;

    const artist = inputArtist.value.trim() || 'Unknown Artist';
    const album = inputAlbum.value.trim() || 'Single';

    musicPlayer.playByMeta(song, artist, album);
    store.setNowPlaying(song, artist, album, 'manual');
    store.logPlayEvent(song, artist, album);

    inputSong.value = '';
    inputArtist.value = '';
    inputAlbum.value = '';
  }

  btnSave.addEventListener('click', handleSaveNowPlaying);

  inputSong.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveNowPlaying();
    }
  });

  // Bulk KEEP / DISCARD
  btnKeepAll.addEventListener('click', () => {
    store.keepAllPending();
  });

  btnDiscardAll.addEventListener('click', () => {
    if (confirm('Discard all pending songs from the review queue?')) {
      store.discardAllPending();
    }
  });

  // --- Import Modal Logic ---
  btnOpenImport.addEventListener('click', () => {
    importModal.classList.remove('hidden');
  });

  btnCloseImport.addEventListener('click', () => {
    importModal.classList.add('hidden');
  });

  importModal.addEventListener('click', (e) => {
    if (e.target === importModal) importModal.classList.add('hidden');
  });

  tabTakeout.addEventListener('click', () => {
    tabTakeout.classList.add('active');
    tabSample.classList.remove('active');
    paneTakeout.classList.remove('hidden');
    paneSample.classList.add('hidden');
  });

  tabSample.addEventListener('click', () => {
    tabSample.classList.add('active');
    tabTakeout.classList.remove('active');
    paneSample.classList.remove('hidden');
    paneTakeout.classList.add('hidden');
  });

  // Run JSON Import
  btnRunJsonImport.addEventListener('click', () => {
    const raw = inputJson.value.trim();
    if (!raw) return;

    try {
      let parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) && parsed.items) parsed = parsed.items;
      if (!Array.isArray(parsed)) parsed = [parsed];

      const itemsToStage = parsed.map(it => {
        let title = it.title || it.song || '';
        if (title.startsWith('Watched ')) title = title.substring(8);
        const artist = it.artist || (it.subtitles && it.subtitles[0] ? it.subtitles[0].name : 'Unknown Artist');
        return {
          title,
          artist,
          album: it.album || 'YouTube Music Import',
          source: 'youtube_music',
          played_at: it.played_at || it.time || new Date().toISOString(),
          duration: it.duration || 210
        };
      }).filter(it => it.title && it.artist);

      if (itemsToStage.length > 0) {
        store.importPendingMusic(itemsToStage);
        inputJson.value = '';
        importModal.classList.add('hidden');
      } else {
        alert('No valid song objects found. Please ensure JSON contains title and artist.');
      }
    } catch (err) {
      alert('Invalid JSON: ' + err.message);
    }
  });

  // File upload import
  inputMusicFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      inputJson.value = evt.target.result;
    };
    reader.readAsText(file);
  });

  // Sample batch staging
  btnLoadSample.addEventListener('click', () => {
    const now = new Date().toISOString();
    const demoBatch = [
      { title: 'Gymnopédie No. 1', artist: 'Érik Satie', album: 'Nocturnes & Reveries', source: 'youtube_music', duration: 204, played_at: now },
      { title: 'Clair de Lune', artist: 'Claude Debussy', album: 'Suite Bergamasque', source: 'youtube_music', duration: 302, played_at: now },
      { title: 'Nocturne Op. 9 No. 2', artist: 'Frédéric Chopin', album: 'Nocturnes', source: 'youtube_music', duration: 260, played_at: now },
      { title: 'Midnight Rain Lofi', artist: 'The House Sanctuary', album: 'Nocturnal Tape', source: 'youtube_music', duration: 180, played_at: now },
      { title: 'Moonlight Sonata', artist: 'Ludwig van Beethoven', album: 'Piano Sonatas', source: 'youtube_music', duration: 320, played_at: now }
    ];
    store.importPendingMusic(demoBatch);
    importModal.classList.add('hidden');
  });

  store.subscribe(renderMusicArchive);
  renderMusicArchive();
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
