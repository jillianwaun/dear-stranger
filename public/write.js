import { api, FONTS, SIGNOFFS, escapeHtml, injectDefs } from './common.js';

injectDefs();

const form = document.getElementById('letter-form');
const paper = document.getElementById('paper');
const body = document.getElementById('body');
const counter = document.getElementById('counter');
const signoffPreview = document.getElementById('signoff-preview');
const signoffs = document.getElementById('signoffs');
const status = document.getElementById('status');
const send = document.getElementById('send');

// Pen choices
document.getElementById('pens').innerHTML = FONTS.map((f, i) => `
  <div class="pen">
    <input type="radio" name="font" id="pen-${f.id}" value="${f.id}" ${i === 0 ? 'checked' : ''}>
    <label for="pen-${f.id}"><span class="sample hand-${f.id}">Dear stranger</span><span class="name">${f.name}</span></label>
  </div>`).join('');

// Sign-off choices
signoffs.innerHTML = SIGNOFFS.map((s, i) => `
  <div>
    <input type="radio" name="signoff" id="so-${i}" value="${escapeHtml(s)}" ${i === 0 ? 'checked' : ''}>
    <label for="so-${i}">${escapeHtml(s)}</label>
  </div>`).join('');

function setFont(id) {
  for (const f of FONTS) {
    paper.classList.toggle(`hand-${f.id}`, f.id === id);
    signoffs.classList.toggle(`hand-${f.id}`, f.id === id);
  }
  grow();
}

// Keep the textarea growing line by line so it always sits on the rules.
function grow() {
  const line = parseFloat(getComputedStyle(paper).getPropertyValue('--line')) || 32;
  body.style.height = 'auto';
  const lines = Math.max(12, Math.ceil(body.scrollHeight / line));
  body.style.height = `${lines * line}px`;
}

form.addEventListener('change', (e) => {
  if (e.target.name === 'font') setFont(e.target.value);
  if (e.target.name === 'signoff') signoffPreview.textContent = e.target.value;
});
body.addEventListener('input', () => {
  counter.textContent = `${body.value.length} / 3000`;
  grow();
});
window.addEventListener('resize', grow);
document.fonts?.ready.then(grow);
grow();

let demo = false;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const letter = {
    body: body.value.trim(),
    font: data.get('font'),
    signoff: data.get('signoff'),
    email: String(data.get('email') || '').trim(),
    notify_comments: data.get('notify_comments') === 'on',
    marketing_opt_in: data.get('marketing_opt_in') === 'on',
    trap: data.get('ds_trap_7q'),
  };

  status.className = 'status';
  if (letter.body.length < 80) return fail(`Your letter needs a little more. Write at least 80 characters (you have ${letter.body.length}).`, body);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(letter.email)) return fail('Add your email so we can tell you when someone writes back.', form.email);

  send.disabled = true;
  status.textContent = 'Sealing your letter…';

  try {
    let result = demo ? null : await api('/api/submit', { method: 'POST', body: JSON.stringify(letter) });
    if (!result) {
      demo = true;
      document.getElementById('demo-banner').hidden = false;
      await new Promise((r) => setTimeout(r, 900));
      result = { status: 'published' };
    }
    showResult(result, letter);
  } catch (err) {
    fail(err.message);
  } finally {
    send.disabled = false;
  }
});

function fail(msg, field) {
  status.className = 'status error';
  status.textContent = msg;
  field?.focus();
}

function showResult(result, letter) {
  const copy = {
    published: {
      title: 'Your letter is out in the world.',
      text: 'Anyone who needs a little good news can find it now. We’ll email you when someone writes back.',
      link: result.id ? `<a class="button" href="index.html?l=${result.id}">Read your letter</a>` : `<a class="button" href="index.html">See all the letters</a>`,
    },
    held: {
      title: 'Your letter is being read by a person first.',
      text: 'Some letters get a second look before they go up. We’ll email you as soon as yours is out.',
      link: `<a class="button" href="index.html">Read other letters</a>`,
    },
    declined: {
      title: 'This letter can’t go up here.',
      text: 'This space is for happy, kind stories that keep everyone anonymous. You can edit your letter and send it again.',
      link: `<button class="button" type="button" id="edit-again">Edit my letter</button>`,
    },
  }[result.status] || {};

  document.getElementById('compose').hidden = true;
  const box = document.getElementById('result');
  box.hidden = false;
  box.innerHTML = `
    <header class="write-head" style="padding-left:0;padding-right:0">
      <h1>${copy.title}</h1>
      <p>${copy.text}</p>
    </header>
    <div class="sheet-wrap"><div class="paper hand-${letter.font}">
      <p class="salutation">Dear stranger,</p>
      <div class="letter-body">${escapeHtml(letter.body)}</div>
      <p class="signoff">${escapeHtml(letter.signoff)}</p>
    </div></div>
    <div class="result-actions">${copy.link}<a href="write.html">Write another</a></div>`;
  window.scrollTo({ top: 0 });

  document.getElementById('edit-again')?.addEventListener('click', () => {
    box.hidden = true;
    document.getElementById('compose').hidden = false;
    status.textContent = '';
    body.focus();
  });
}
