/**
 * THE HOUSE — Room 2: What Did I Watch?
 */

import { store } from '../store.js';

export function initCinemaRoom() {
  const inputTitle = document.getElementById('movie-title-input');
  const inputNote = document.getElementById('movie-note-input');
  const btnSave = document.getElementById('btn-save-movie');
  const listEl = document.getElementById('cinema-movies-list');

  const statFinished = document.getElementById('stat-finished');
  const statOpened = document.getElementById('stat-opened');
  const statWatching = document.getElementById('stat-watching');
  const statCompletionRatio = document.getElementById('stat-completion-ratio');

  let currentFilter = 'all';

  // Filter tabs
  const tabBtns = document.querySelectorAll('.cinema-tab');
  tabBtns.forEach(tab => {
    tab.addEventListener('click', () => {
      tabBtns.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter');
      renderMovies();
    });
  });

  function renderMovies() {
    const movies = store.data.movies || [];

    // Calculate statistics
    const finishedCount = movies.filter(m => m.status === 'finished').length;
    const openedCount = movies.filter(m => m.status === 'abandoned').length;
    const watchingCount = movies.filter(m => m.status === 'watching').length;
    const totalOpenedOrFinished = finishedCount + openedCount;

    statFinished.textContent = finishedCount;
    statOpened.textContent = openedCount;
    statWatching.textContent = watchingCount;

    if (totalOpenedOrFinished > 0) {
      const percentage = Math.round((finishedCount / totalOpenedOrFinished) * 100);
      statCompletionRatio.textContent = `Finished ${finishedCount} of ${totalOpenedOrFinished} initiated (${percentage}%)`;
    } else {
      statCompletionRatio.textContent = 'No concluded films yet.';
    }

    // Filter list
    let filtered = movies;
    if (currentFilter !== 'all') {
      filtered = movies.filter(m => m.status === currentFilter);
    }

    if (filtered.length === 0) {
      listEl.innerHTML = '<div class="empty-stream-msg">The screen is dark. No films listed under this light.</div>';
      return;
    }

    listEl.innerHTML = filtered.map(m => {
      let tagClass = 'tag-watching';
      let tagLabel = 'Currently watching';
      if (m.status === 'finished') {
        tagClass = 'tag-finished';
        tagLabel = 'Finished';
      } else if (m.status === 'abandoned') {
        tagClass = 'tag-abandoned';
        tagLabel = 'Opened & closed';
      }

      return `
        <div class="movie-item" data-id="${m.id}">
          <div class="movie-main">
            <div class="movie-title-row">
              <span class="movie-title-text">${escapeHtml(m.title)}</span>
              <span class="movie-status-tag ${tagClass}">${tagLabel}</span>
            </div>
            ${m.note ? `<p class="movie-note">${escapeHtml(m.note)}</p>` : ''}
          </div>
          <div class="movie-actions">
            <select class="movie-status-select" data-id="${m.id}">
              <option value="watching" ${m.status === 'watching' ? 'selected' : ''}>Currently watching</option>
              <option value="finished" ${m.status === 'finished' ? 'selected' : ''}>Finished</option>
              <option value="abandoned" ${m.status === 'abandoned' ? 'selected' : ''}>Opened & closed</option>
            </select>
            <button class="movie-del-btn" data-del="${m.id}" title="Remove film entry">✕</button>
          </div>
        </div>
      `;
    }).join('');

    // Attach listeners
    listEl.querySelectorAll('.movie-status-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        store.updateMovieStatus(id, e.target.value);
      });
    });

    listEl.querySelectorAll('.movie-del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-del');
        store.deleteMovie(id);
      });
    });
  }

  function handleSave() {
    const title = inputTitle.value.trim();
    if (!title) return;

    const checkedRadio = document.querySelector('input[name="movie-status"]:checked');
    const status = checkedRadio ? checkedRadio.value : 'watching';
    const note = inputNote.value.trim();

    store.addMovie(title, status, note);

    inputTitle.value = '';
    inputNote.value = '';
  }

  btnSave.addEventListener('click', handleSave);

  inputTitle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  });

  store.subscribe(renderMovies);
  renderMovies();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
