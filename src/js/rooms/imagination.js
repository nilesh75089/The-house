import { store } from '../store.js';
import { youtubeManager } from '../youtubePlayer.js';

export function initImaginationRoom() {
  const inputTitle = document.getElementById('imagination-title-input');
  const inputBody = document.getElementById('imagination-body-input');
  const btnSave = document.getElementById('btn-save-imagination');
  const gridEl = document.getElementById('fragments-canvas-container');
  const counterEl = document.getElementById('fragments-count');
  const btnToggleYT = document.getElementById('btn-toggle-imagination-yt');

  if (btnToggleYT) {
    btnToggleYT.addEventListener('click', () => {
      youtubeManager.toggleRoom('room4');
    });

    youtubeManager.onStateChange((roomKey, isPlaying) => {
      if (roomKey === 'room4') {
        btnToggleYT.textContent = isPlaying ? '⏸ PAUSE' : '▶ PLAY';
        btnToggleYT.classList.toggle('playing', isPlaying);
      }
    });
  }

  // Modal elements
  const modalBackdrop = document.getElementById('fragment-modal');
  const modalClose = document.getElementById('btn-close-fragment');
  const modalDate = document.getElementById('modal-fragment-date');
  const modalTitle = document.getElementById('modal-fragment-title');
  const modalBody = document.getElementById('modal-fragment-body');
  const modalDelete = document.getElementById('btn-delete-fragment');

  let activeFragmentId = null;

  function renderFragments() {
    const frags = store.data.imaginations || [];
    counterEl.textContent = `${frags.length} ${frags.length === 1 ? 'fragment' : 'fragments'}`;

    if (frags.length === 0) {
      gridEl.innerHTML = '<div class="empty-stream-msg" style="grid-column: 1/-1;">The void is quiet. Release a fragment of what you imagine.</div>';
      return;
    }

    gridEl.innerHTML = frags.map(f => {
      const d = new Date(f.createdAt);
      const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

      return `
        <div class="fragment-node-card" data-id="${f.id}">
          <span class="fragment-date">${dateStr}</span>
          <h4 class="fragment-preview-title">${escapeHtml(f.title)}</h4>
          <p class="fragment-snippet">${escapeHtml(f.body)}</p>
        </div>
      `;
    }).join('');

    gridEl.querySelectorAll('.fragment-node-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        openFragmentModal(id);
      });
    });
  }

  function openFragmentModal(id) {
    const frags = store.data.imaginations || [];
    const frag = frags.find(f => f.id === id);
    if (!frag) return;

    activeFragmentId = id;
    const d = new Date(frag.createdAt);
    modalDate.textContent = `Recorded ${d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}`;
    modalTitle.textContent = frag.title;
    modalBody.textContent = frag.body;

    modalBackdrop.classList.remove('hidden');
  }

  function closeFragmentModal() {
    modalBackdrop.classList.add('hidden');
    activeFragmentId = null;
  }

  modalClose.addEventListener('click', closeFragmentModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeFragmentModal();
  });

  modalDelete.addEventListener('click', () => {
    if (activeFragmentId) {
      store.deleteImagination(activeFragmentId);
      closeFragmentModal();
    }
  });

  function handleSave() {
    const body = inputBody.value.trim();
    if (!body) return;

    const title = inputTitle.value.trim();
    store.addImagination(title, body);

    inputTitle.value = '';
    inputBody.value = '';
  }

  btnSave.addEventListener('click', handleSave);

  inputBody.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  });

  store.subscribe(renderFragments);
  renderFragments();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
