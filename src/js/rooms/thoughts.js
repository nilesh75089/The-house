/**
 * THE HOUSE — Room 1: What Am I Thinking?
 */

import { store } from '../store.js';
import { youtubeThoughtsPlayer } from '../youtubePlayer.js';

export function initThoughtsRoom() {
  const input = document.getElementById('thought-input');
  const btnSave = document.getElementById('btn-save-thought');
  const timeline = document.getElementById('thoughts-timeline');
  const countEl = document.getElementById('thoughts-count');
  const btnToggleYT = document.getElementById('btn-toggle-thoughts-yt');

  if (btnToggleYT) {
    btnToggleYT.addEventListener('click', () => {
      youtubeThoughtsPlayer.toggle();
    });

    youtubeThoughtsPlayer.onStateChange((isPlaying) => {
      btnToggleYT.textContent = isPlaying ? '⏸ PAUSE' : '▶ PLAY';
      btnToggleYT.classList.toggle('playing', isPlaying);
    });
  }

  function renderThoughts() {
    const thoughts = store.data.thoughts || [];
    countEl.textContent = `${thoughts.length} ${thoughts.length === 1 ? 'thought' : 'thoughts'} recorded`;

    if (thoughts.length === 0) {
      timeline.innerHTML = '<div class="empty-stream-msg">The silence is waiting for your mind.</div>';
      return;
    }

    timeline.innerHTML = thoughts.map(t => {
      const d = new Date(t.createdAt);
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      
      // Calculate relative time or time of day
      const hour = d.getHours();
      let partOfDay = 'Night';
      if (hour >= 5 && hour < 12) partOfDay = 'Morning';
      else if (hour >= 12 && hour < 17) partOfDay = 'Afternoon';
      else if (hour >= 17 && hour < 22) partOfDay = 'Evening';
      else partOfDay = 'Midnight';

      return `
        <article class="thought-entry" data-id="${t.id}">
          <div class="thought-node"></div>
          <div class="thought-header">
            <time class="thought-time">${dateStr} · ${timeStr}</time>
            <span class="thought-rel">(${partOfDay})</span>
          </div>
          <p class="thought-text">${escapeHtml(t.text)}</p>
          <div class="thought-actions">
            <button class="thought-btn-del" data-del="${t.id}" title="Dissolve thought">Dissolve</button>
          </div>
        </article>
      `;
    }).join('');

    // Attach delete listeners
    timeline.querySelectorAll('.thought-btn-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-del');
        store.deleteThought(id);
      });
    });
  }

  function handleSave() {
    const text = input.value.trim();
    if (!text) return;
    store.addThought(text);
    input.value = '';
  }

  btnSave.addEventListener('click', handleSave);

  input.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  });

  store.subscribe(renderThoughts);
  renderThoughts();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
