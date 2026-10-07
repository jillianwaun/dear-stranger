import { api, escapeHtml, DEMO_STORIES, DEMO_NOTES, injectDefs } from './common.js';
import { card } from './cards.js';

injectDefs();

const pile = document.getElementById('pile');
const empty = document.getElementById('pile-empty');
const reader = document.getElementById('reader');
const sheet = document.getElementById('sheet');
const noteList = document.getElementById('note-list');
const noteForm = document.getElementById('note-form');
const noteBody = document.getElementById('note-body');
const noteStatus = document.getElementById('note-status');

let demo = false;
let stories = [];
let current = null;

function render() {
  if (!stories.length) {
    empty.hidden = false;
    empty.textContent = 'No letters yet. Write the first one.';
    pile.innerHTML = '';
    return;
  }
  empty.hidden = true;
  const recent = [];
  const cards = stories.map((s, i) => {
    const html = card(s, recent.slice(-6), i);
    recent.push(html.match(/data-style="([^"]+)"/)[1]);
    return html;
  });
  // Deal letters into columns left to right, so the newest sit across the top row.
  const n = columnCount();
  const cols = Array.from({ length: n }, () => []);
  cards.forEach((html, i) => cols[i % n].push(html));
  pile.innerHTML = cols.map((c) => `<div class="pile-col">${c.join('')}</div>`).join('');
  pile.dataset.cols = n;
}

function columnCount() {
  const w = pile.clientWidth || window.innerWidth;
  return 2;
}
window.addEventListener('resize', () => {
  if (stories.length && Number(pile.dataset.cols) !== columnCount()) render();
});

// ── reader ──────────────────────────────
function paragraphs(body) {
  return escapeHtml(body.trim());
}

function renderNotes(notes) {
  noteList.innerHTML = notes.map((n) => `<div class="sticky">${escapeHtml(n.body)}</div>`).join('');
  document.getElementById('notes-hint').textContent = notes.length
    ? 'Leave the writer something kind. They get an email when you do.'
    : 'No notes yet. Be the first to write back. The writer gets an email when you do.';
}

async function openLetter(id, push = true) {
  let story = stories.find((s) => s.id === id);
  let notes = [];
  try {
    if (demo) {
      notes = DEMO_NOTES[id] || [];
    } else {
      const data = await api(`/api/stories?id=${encodeURIComponent(id)}`);
      if (data) { story = data.story; notes = data.notes; }
    }
  } catch (err) {
    if (!story) { alertInPile(err.message); return; }
  }
  if (!story) return;

  current = story;
  sheet.className = `paper creased hand-${story.font}`;
  sheet.innerHTML = `
    <p class="salutation">Dear stranger,</p>
    <div class="letter-body">${paragraphs(story.body)}</div>
    <p class="signoff">${escapeHtml(story.signoff)}</p>`;
  renderNotes(notes);
  noteStatus.textContent = '';
  noteStatus.className = 'status';
  noteForm.hidden = false;

  if (push) history.pushState({ l: id }, '', `?l=${id}`);
  if (!reader.open) reader.showModal();
  reader.querySelector('.reader-scroll').scrollTop = 0;
}

function closeLetter() {
  if (reader.open) reader.close();
}
reader.addEventListener('close', () => {
  current = null;
  if (new URLSearchParams(location.search).has('l')) history.pushState({}, '', location.pathname);
});
reader.addEventListener('click', (e) => {
  if (e.target === reader || e.target.closest('[data-close]')) closeLetter();
});
window.addEventListener('popstate', () => {
  const id = new URLSearchParams(location.search).get('l');
  if (id) openLetter(id, false); else closeLetter();
});

pile.addEventListener('click', (e) => {
  const btn = e.target.closest('.letter');
  if (btn) openLetter(btn.dataset.id);
});

function alertInPile(msg) {
  empty.hidden = false;
  empty.textContent = msg;
}

// ── notes ───────────────────────────────
noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!current) return;
  const body = noteBody.value.trim();
  if (!body) return;
  const button = noteForm.querySelector('button');
  button.disabled = true;
  noteStatus.className = 'status';
  noteStatus.textContent = 'Reading your note…';

  try {
    let result;
    if (demo) {
      await new Promise((r) => setTimeout(r, 600));
      result = { status: 'published', note: { id: String(Date.now()), body } };
      (DEMO_NOTES[current.id] ||= []).push(result.note);
    } else {
      result = await api('/api/comment', {
        method: 'POST',
        body: JSON.stringify({ story_id: current.id, body, trap: noteForm.ds_trap_7q.value }),
      });
    }
    noteBody.value = '';
    if (result.status === 'published') {
      noteList.insertAdjacentHTML('beforeend', `<div class="sticky">${escapeHtml(result.note.body)}</div>`);
      noteStatus.textContent = 'Your note is on the letter. The writer will hear about it.';
    } else if (result.status === 'held') {
      noteStatus.textContent = 'Thanks. Your note will appear once a person has read it.';
    } else {
      noteStatus.textContent = 'This note can’t go up here. Notes need to be kind and keep everyone anonymous.';
    }
  } catch (err) {
    noteStatus.className = 'status error';
    noteStatus.textContent = err.message;
  } finally {
    button.disabled = false;
  }
});

// ── start ───────────────────────────────
(async function start() {
  try {
    const data = await api('/api/stories', { cache: 'no-store' });
    if (data) {
      stories = data.stories;
    } else {
      demo = true;
      // Preview only: shuffle the sample letters the same way the server does.
      stories = [...DEMO_STORIES];
      for (let i = stories.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [stories[i], stories[j]] = [stories[j], stories[i]];
      }
      document.getElementById('demo-banner').hidden = false;
    }
  } catch (err) {
    alertInPile(err.message);
    return;
  }
  render();
  const id = new URLSearchParams(location.search).get('l');
  if (id) openLetter(id, false);
})();
