/**
 * THE HOUSE — Main Application Entrypoint
 */

import { store } from './store.js';
import { sanctuaryAudio } from './audio.js';
import { initNavigation } from './navigation.js';
import { initThoughtsRoom } from './rooms/thoughts.js';
import { initCinemaRoom } from './rooms/cinema.js';
import { initMusicRoom } from './rooms/music.js';
import { initImaginationRoom } from './rooms/imagination.js';
import { initStudyRoom } from './rooms/study.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize navigation & room transitions
  const nav = initNavigation();

  // Initialize room logic modules
  initThoughtsRoom();
  initCinemaRoom();
  initMusicRoom();
  initImaginationRoom();
  initStudyRoom();

  // Ambient Audio Controls & Soundscape Tracking
  const btnAudio = document.getElementById('btn-ambient-audio');
  const audioLabel = document.getElementById('audio-label');
  const audioIcon = document.getElementById('audio-icon');
  const trackIndicator = document.getElementById('dock-track-indicator');

  function updateAudioUI(isPlaying, trackInfo) {
    if (!btnAudio) return;

    if (isPlaying) {
      btnAudio.classList.add('playing');
      audioLabel.textContent = 'Sound: ON';
      audioIcon.textContent = '〰';
      if (trackIndicator && trackInfo) {
        trackIndicator.textContent = trackInfo.title;
        trackIndicator.style.color = 'var(--text-gold)';
        trackIndicator.style.borderColor = 'var(--px-border-amber)';
      }
    } else {
      btnAudio.classList.remove('playing');
      audioLabel.textContent = 'Sound: OFF';
      audioIcon.textContent = '♫';
      if (trackIndicator && trackInfo) {
        trackIndicator.textContent = trackInfo.title;
        trackIndicator.style.color = 'var(--text-muted)';
        trackIndicator.style.borderColor = 'var(--px-border-dark)';
      }
    }
  }

  // Hook room change notification to update the dock track display
  sanctuaryAudio.onRoomChange = (trackInfo) => {
    updateAudioUI(sanctuaryAudio.isPlaying, trackInfo);
  };

  if (btnAudio) {
    btnAudio.addEventListener('click', async () => {
      const isPlaying = await sanctuaryAudio.toggle();
      updateAudioUI(isPlaying, sanctuaryAudio.getTrackInfo());
    });
  }

  // Vault Backup & Privacy Modal
  const btnOpenVault = document.getElementById('btn-open-backup');
  const vaultModal = document.getElementById('vault-modal');
  const btnCloseVault = document.getElementById('btn-close-vault');
  const btnExport = document.getElementById('btn-export-data');
  const inputImport = document.getElementById('input-import-data');
  const btnClearAll = document.getElementById('btn-clear-all');

  if (btnOpenVault && vaultModal) {
    btnOpenVault.addEventListener('click', () => {
      vaultModal.classList.remove('hidden');
    });

    btnCloseVault.addEventListener('click', () => {
      vaultModal.classList.add('hidden');
    });

    vaultModal.addEventListener('click', (e) => {
      if (e.target === vaultModal) {
        vaultModal.classList.add('hidden');
      }
    });

    btnExport.addEventListener('click', () => {
      store.exportBackup();
    });

    inputImport.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const success = store.importBackup(evt.target.result);
        if (success) {
          vaultModal.classList.add('hidden');
        } else {
          alert('Could not restore backup. Please ensure the file is valid JSON.');
        }
      };
      reader.readAsText(file);
    });

    btnClearAll.addEventListener('click', () => {
      if (confirm('Are you sure you wish to clear all sanctuary records and return to the quiet silence?')) {
        store.resetAll();
        vaultModal.classList.add('hidden');
      }
    });
  }
});
