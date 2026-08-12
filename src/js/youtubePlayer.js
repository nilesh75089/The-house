/**
 * THE HOUSE — Multi-Room YouTube Ambient Audio Engine
 * Manages streaming YouTube audio tracks for:
 * - Room 01 (Thoughts): "Two Different Worlds | Super Slowed + Reverb" (Niu8Kv2hrU8)
 * - Room 04 (Imagination): "Distant Echoes | Slowed + Reverb" (vA3praIBO8c)
 */

class YouTubeManager {
  constructor() {
    this.tracks = {
      room1: {
        containerId: 'thoughts-yt-player',
        videoId: 'Niu8Kv2hrU8',
        title: 'Two Different Worlds (Super Slowed + Reverb)',
        artist: 'KoruSe · mzmff',
        player: null,
        isReady: false,
        isPlaying: false,
        shouldPlay: false
      },
      room4: {
        containerId: 'imagination-yt-player',
        videoId: 'vA3praIBO8c',
        title: 'Distant Echoes (Slowed + Reverb)',
        artist: 'VXLLAIN · VØJ · Narvent',
        player: null,
        isReady: false,
        isPlaying: false,
        shouldPlay: false
      }
    };

    this.listeners = [];
    this.loadAPI();
  }

  loadAPI() {
    if (window.YT && window.YT.Player) {
      this.initAllPlayers();
      return;
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      this.initAllPlayers();
    };

    if (!document.getElementById('yt-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }

  initAllPlayers() {
    Object.keys(this.tracks).forEach(roomKey => {
      this.initPlayer(roomKey);
    });
  }

  initPlayer(roomKey) {
    const config = this.tracks[roomKey];
    if (!config || config.player) return;

    const el = document.getElementById(config.containerId);
    if (!el) return;

    try {
      config.player = new window.YT.Player(config.containerId, {
        height: '1',
        width: '1',
        videoId: config.videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          loop: 1,
          playlist: config.videoId,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            config.isReady = true;
            config.player.setVolume(80);
            if (config.shouldPlay) {
              this.playRoom(roomKey);
            }
          },
          onStateChange: (event) => {
            // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
            if (event.data === 1) {
              config.isPlaying = true;
              this.notify(roomKey, true);
            } else if (event.data === 2 || event.data === 0) {
              config.isPlaying = false;
              this.notify(roomKey, false);
            }
          },
          onError: (err) => {
            console.warn(`YouTube Player error for ${roomKey}:`, err);
          }
        }
      });
    } catch (e) {
      console.warn(`Error initializing YouTube player for ${roomKey}:`, e);
    }
  }

  playRoom(roomKey) {
    // 1. Pause other rooms
    Object.keys(this.tracks).forEach(key => {
      if (key !== roomKey) {
        this.pauseRoom(key);
      }
    });

    // 2. Play target room
    const target = this.tracks[roomKey];
    if (!target) return;

    if (target.isReady && target.player && typeof target.player.playVideo === 'function') {
      try {
        target.player.playVideo();
        target.isPlaying = true;
        this.notify(roomKey, true);
      } catch (e) {
        console.warn(`Error playing YouTube track for ${roomKey}:`, e);
      }
    } else {
      target.shouldPlay = true;
      this.initPlayer(roomKey);
    }
  }

  pauseRoom(roomKey) {
    const target = this.tracks[roomKey];
    if (!target) return;

    target.shouldPlay = false;
    if (target.isReady && target.player && typeof target.player.pauseVideo === 'function') {
      try {
        target.player.pauseVideo();
        target.isPlaying = false;
        this.notify(roomKey, false);
      } catch (e) {}
    }
  }

  pauseAll() {
    Object.keys(this.tracks).forEach(key => {
      this.pauseRoom(key);
    });
  }

  toggleRoom(roomKey) {
    const target = this.tracks[roomKey];
    if (!target) return;

    if (target.isPlaying) {
      this.pauseRoom(roomKey);
    } else {
      this.playRoom(roomKey);
    }
  }

  onStateChange(cb) {
    this.listeners.push(cb);
  }

  notify(roomKey, state) {
    this.listeners.forEach(cb => {
      try { cb(roomKey, state); } catch (e) {}
    });
  }
}

export const youtubeManager = new YouTubeManager();
// Alias for backward compatibility
export const youtubeThoughtsPlayer = {
  play: () => youtubeManager.playRoom('room1'),
  pause: () => youtubeManager.pauseRoom('room1'),
  toggle: () => youtubeManager.toggleRoom('room1'),
  onStateChange: (cb) => youtubeManager.onStateChange((roomKey, state) => {
    if (roomKey === 'room1') cb(state);
  })
};
