/**
 * THE HOUSE — Navigation & Room Transition System
 */

import { ambient } from './ambient.js';
import { sanctuaryAudio } from './audio.js';
import { youtubeManager } from './youtubePlayer.js';

export function initNavigation() {
  const views = {
    hall: document.getElementById('view-hall'),
    room1: document.getElementById('view-room1'),
    room2: document.getElementById('view-room2'),
    room3: document.getElementById('view-room3'),
    room4: document.getElementById('view-room4'),
    room5: document.getElementById('view-room5')
  };

  const bgLayers = {
    hall: document.querySelector('.bg-hall'),
    room1: document.querySelector('.bg-room1'),
    room2: document.querySelector('.bg-room2'),
    room3: document.querySelector('.bg-room3'),
    room4: document.querySelector('.bg-room4'),
    room5: document.querySelector('.bg-room5')
  };

  const roomIndicator = document.getElementById('room-indicator');
  const roomNames = {
    hall: 'THE HOUSE',
    room1: 'ROOM 01 // WHAT AM I THINKING?',
    room2: 'ROOM 02 // WHAT DID I WATCH?',
    room3: 'ROOM 03 // WHAT AM I LISTENING TO?',
    room4: 'ROOM 04 // MY IMAGINATION',
    room5: 'ROOM 05 // DID I STUDY?'
  };

  const dockLinks = document.querySelectorAll('.dock-room-link');
  let currentRoom = 'hall';
  let isTransitioning = false;

  function navigateTo(roomId) {
    if (isTransitioning || !views[roomId] || roomId === currentRoom) return;

    isTransitioning = true;
    const prevRoom = currentRoom;
    currentRoom = roomId;

    // Safe audio room transition (never blocks UI)
    try {
      if (roomId === 'room1' || roomId === 'room4') {
        youtubeManager.playRoom(roomId);
      } else {
        youtubeManager.pauseAll();
      }

      if (sanctuaryAudio.isPlaying) {
        sanctuaryAudio.playDoorChime();
        sanctuaryAudio.setRoom(roomId);
      }
    } catch (e) {
      console.warn('Audio switch error:', e);
    }

    // Update body state class
    if (roomId === 'hall') {
      document.body.classList.add('in-hall');
    } else {
      document.body.classList.remove('in-hall');
    }

    // Update room indicator
    roomIndicator.textContent = roomNames[roomId] || '';

    // Cross-fade background layers
    Object.keys(bgLayers).forEach(key => {
      if (bgLayers[key]) {
        if (key === roomId) {
          bgLayers[key].classList.add('active');
        } else {
          bgLayers[key].classList.remove('active');
        }
      }
    });

    // Update dock active states
    dockLinks.forEach(link => {
      if (link.getAttribute('data-goto') === roomId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Animate view transition
    const prevView = views[prevRoom];
    const nextView = views[roomId];

    if (prevView) {
      prevView.classList.remove('active');
      prevView.classList.add('room-transition-exit');
    }

    setTimeout(() => {
      if (prevView) {
        prevView.classList.remove('room-transition-exit');
      }

      nextView.classList.add('active');
      nextView.classList.add('room-transition-enter');

      // Update ambient particle mode
      ambient.setRoom(roomId);

      setTimeout(() => {
        nextView.classList.remove('room-transition-enter');
        isTransitioning = false;
      }, 700);
    }, 350);
  }

  // Hall Portal Click Handlers
  document.querySelectorAll('.portal-door').forEach(door => {
    door.addEventListener('click', () => {
      const targetRoom = door.getAttribute('data-goto');
      navigateTo(targetRoom);
    });
  });

  // Top Return to Hall button
  const btnReturn = document.getElementById('btn-return-hall');
  if (btnReturn) {
    btnReturn.addEventListener('click', () => navigateTo('hall'));
  }

  // Dock Links
  dockLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetRoom = link.getAttribute('data-goto');
      navigateTo(targetRoom);
    });
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // If typing inside an input or textarea, don't trigger room hotkeys unless Esc
    const isEditing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

    if (e.key === 'Escape') {
      navigateTo('hall');
      return;
    }

    if (isEditing) return;

    if (e.key === '1') navigateTo('room1');
    else if (e.key === '2') navigateTo('room2');
    else if (e.key === '3') navigateTo('room3');
    else if (e.key === '4') navigateTo('room4');
    else if (e.key === '5') navigateTo('room5');
    else if (e.key.toLowerCase() === 'h') navigateTo('hall');
  });

  return { navigateTo };
}
