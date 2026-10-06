// Shared bits for every page.

export const FONTS = [
  { id: 'caveat', name: 'Everyday' },
  { id: 'homemade-apple', name: 'Cursive' },
  { id: 'reenie-beanie', name: 'Scribbled' },
  { id: 'patrick-hand', name: 'Neat print' },
  { id: 'nothing-you-could-do', name: 'Loopy' },
];

export const SIGNOFFS = [
  'With love, a stranger',
  'Yours, someone who is glad',
  'xo, a friend you haven’t met',
  'Warmly, from somewhere sunny',
  'Love, me',
];

export const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const niceDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

// Talks to the API. If the API isn't there (the design preview), returns null
// so pages can fall back to sample letters.
export async function api(path, options = {}) {
  let res;
  try {
    res = await fetch(path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
  } catch {
    return null;
  }
  const type = res.headers.get('content-type') || '';
  if (!type.includes('application/json')) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

// ── sample letters for the preview ─────────────
const day = (n) => new Date(Date.now() - n * 864e5).toISOString();
export const DEMO_STORIES = [
  { id: 'a1f0c3e2-0000-4000-8000-000000000001', font: 'caveat', signoff: SIGNOFFS[0], published_at: day(0),
    body: 'This morning the man at the bakery remembered my order before I said a word. I’ve lived in this city for eight months and it’s the first time I’ve felt like a regular somewhere.\n\nI walked out with my croissant feeling like I belonged to something. Small thing, I know. It made my whole week.' },
  { id: 'b2e1d4f3-0000-4000-8000-000000000002', font: 'reenie-beanie', signoff: SIGNOFFS[3], published_at: day(1),
    body: 'My daughter learned to ride her bike today. She made me let go about forty feet before I was ready, and then she just kept going.\n\nShe yelled I’M DOING IT the entire length of the street. Three neighbors came out to clap.' },
  { id: 'c3d2e5a4-0000-4000-8000-000000000003', font: 'homemade-apple', signoff: SIGNOFFS[1], published_at: day(1),
    body: 'I passed the exam I failed twice. I’m 41 and I’m a nurse now.\n\nI cried in my car for twenty minutes and then called my grandmother, who said “I never doubted it,” which is a lie, because she was the one who had to talk me into trying again.' },
  { id: 'd4c3f6b5-0000-4000-8000-000000000004', font: 'patrick-hand', signoff: SIGNOFFS[4], published_at: day(2),
    body: 'Our dog is fourteen and the vet said she’s doing great for her age. She celebrated by stealing an entire rotisserie chicken off the counter. Worth it.' },
  { id: 'e5b4a7c6-0000-4000-8000-000000000005', font: 'nothing-you-could-do', signoff: SIGNOFFS[2], published_at: day(3),
    body: 'A stranger on the train saw me crying and, without saying anything, handed me a clementine. Just one clementine.\n\nI don’t know why it helped so much, but it did. If that was you: thank you. I think about it every winter.' },
  { id: 'f6a5b8d7-0000-4000-8000-000000000006', font: 'caveat', signoff: SIGNOFFS[3], published_at: day(4),
    body: 'I grew tomatoes for the first time this summer. Nineteen of them! I gave most of them away and now people wave at me from their porches. I think I accidentally made friends with vegetables.' },
  { id: '07b6c9e8-0000-4000-8000-000000000007', font: 'homemade-apple', signoff: SIGNOFFS[0], published_at: day(5),
    body: 'After two years of not speaking, my brother called me on my birthday. We talked for three hours. Nothing is fixed, but something is open.' },
  { id: '18c7dae9-0000-4000-8000-000000000008', font: 'patrick-hand', signoff: SIGNOFFS[4], published_at: day(6),
    body: 'My grandpa is 88 and just sent his first text message. It said HELLO THIS IS GRANDPA. I am keeping it forever.' },
  { id: '29d8ebfa-0000-4000-8000-000000000009', font: 'reenie-beanie', signoff: SIGNOFFS[1], published_at: day(8),
    body: 'I finally signed up for the painting class I’d been too scared to take. My pear is lopsided and the shadow is the wrong color and I love it more than anything I’ve ever made.' },
  { id: '3ae9fc0b-0000-4000-8000-00000000000a', font: 'nothing-you-could-do', signoff: SIGNOFFS[0], published_at: day(9),
    body: 'The kid next door has been leaving chalk drawings on my sidewalk all month. Today it said “have a good day Miss Ruth” next to a sun wearing sunglasses.\n\nI am having a good day.' },
  { id: '4bfa0d1c-0000-4000-8000-00000000000b', font: 'caveat', signoff: SIGNOFFS[2], published_at: day(11),
    body: 'Someone paid for my coffee in the drive-thru and I paid for the car behind me, and the barista told me it had gone on for eleven cars. Eleven! Faith in humanity: restored, at least until lunch.' },
  { id: '5c0b1e2d-0000-4000-8000-00000000000c', font: 'patrick-hand', signoff: SIGNOFFS[3], published_at: day(13),
    body: 'Two years sober today. My son made me a card that says “Happy Brave Day.” I don’t have anything else to add. I just wanted someone to know.' },
  { id: '6d1c2f3e-0000-4000-8000-00000000000d', font: 'homemade-apple', signoff: SIGNOFFS[3], published_at: day(14),
    body: 'My best friend and I haven\u2019t lived in the same state for six years. Today she showed up at my door with no warning and two iced coffees. We sat on the kitchen floor and talked until the coffees were just ice.' },
  { id: '7e2d304f-0000-4000-8000-00000000000e', font: 'reenie-beanie', signoff: SIGNOFFS[4], published_at: day(15),
    body: 'I ran my first mile without stopping. I\u2019m 52. A teenager running the other way gave me a thumbs up and I have never felt cooler in my life.' },
  { id: '8f3e4150-0000-4000-8000-00000000000f', font: 'caveat', signoff: SIGNOFFS[1], published_at: day(17),
    body: 'Our foster kitten finally let my husband pick her up. He sat perfectly still on the couch for an hour so he wouldn\u2019t wake her. His leg fell asleep. He says it was worth it.' },
  { id: '904f5261-0000-4000-8000-000000000010', font: 'nothing-you-could-do', signoff: SIGNOFFS[0], published_at: day(18),
    body: 'My dad, who has never said I love you first, ended our phone call with it today. Just like that. Then he hung up before I could say anything, which is very him.' },
  { id: 'a1506372-0000-4000-8000-000000000011', font: 'patrick-hand', signoff: SIGNOFFS[2], published_at: day(20),
    body: 'A little girl at the farmers market asked if she could buy one strawberry with a quarter. The farmer gave her the whole basket and told her to pay him back by sharing.' },
  { id: 'b2617483-0000-4000-8000-000000000012', font: 'homemade-apple', signoff: SIGNOFFS[0], published_at: day(22),
    body: 'I got the job. After eleven rejections and a lot of crying in parking lots, I got the job. I start Monday and I already bought a new pen.' },
];

export const DEMO_NOTES = {
  'a1f0c3e2-0000-4000-8000-000000000001': [
    { id: 'n1', body: 'Being a regular is the best feeling. Enjoy your croissants!' },
    { id: 'n2', body: 'Eight months in a new city is hard. So glad you found your spot.' },
  ],
  '5c0b1e2d-0000-4000-8000-00000000000c': [
    { id: 'n3', body: 'Happy Brave Day. Your son is right.' },
  ],
  'e5b4a7c6-0000-4000-8000-000000000005': [
    { id: 'n4', body: 'I will now be carrying clementines everywhere.' },
  ],
};

// Shared SVG filters that make paper, ink, wax and lipstick look real.
export function injectDefs() {
  if (document.getElementById('paper-defs')) return;
  document.body.insertAdjacentHTML('afterbegin', `
  <svg id="paper-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="g-flaplight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".03"/>
      </linearGradient>
      <filter id="f-flap" x="-5%" y="-5%" width="110%" height="115%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2.4" flood-color="#3b2a22" flood-opacity=".2"/>
      </filter>
      <filter id="f-softshadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity=".32"/>
      </filter>
      <filter id="f-wax" x="-25%" y="-25%" width="150%" height="150%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="b"/>
        <feSpecularLighting in="b" surfaceScale="4" specularConstant=".85" specularExponent="18" lighting-color="#fff" result="s">
          <fePointLight x="-40" y="-70" z="110"/>
        </feSpecularLighting>
        <feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>
        <feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k1="0" k2="1" k3=".6" k4="0" result="lit"/>
        <feDropShadow in="lit" dx="0" dy="2" stdDeviation="1.8" flood-color="#000" flood-opacity=".45"/>
      </filter>
      <filter id="f-lipstick" x="-5%" y="-15%" width="110%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency=".32 .028" numOctaves="3" seed="4" result="t1"/>
        <feColorMatrix in="t1" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.3 1.85" result="m1"/>
        <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="11" result="t2"/>
        <feColorMatrix in="t2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.6 2.2" result="m2"/>
        <feComposite in="m1" in2="m2" operator="in" result="m"/>
        <feComposite in="SourceGraphic" in2="m" operator="in" result="lips"/>
        <feTurbulence type="fractalNoise" baseFrequency=".07" numOctaves="2" seed="9" result="d"/>
        <feDisplacementMap in="lips" in2="d" scale="9" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="f-stampink" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="2" result="t"/>
        <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.75" result="m"/>
        <feComposite in="SourceGraphic" in2="m" operator="in"/>
      </filter>
      <filter id="f-ink" x="-2%" y="-10%" width="104%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="7" result="t"/>
        <feDisplacementMap in="SourceGraphic" in2="t" scale="1.3" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>
  </svg>`);
}
