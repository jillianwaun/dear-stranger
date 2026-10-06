// Draws each letter on the homepage using the real envelope photos in public/img.
// Each letter's envelope is picked from its id, so the same letter always looks the same.

import { niceDate } from './common.js';

// To add an envelope: drop a transparent .webp or .png in public/img
// and add a line here with its file name, width and height.
export const PHOTOS = [
  { name: 'airmail-window',     w: 1000, h: 514 },
  { name: 'butterfly-seal',     w: 1000, h: 685 },
  { name: 'green-pansy',        w: 1000, h: 569 },
  { name: 'kiss-sending-love',  w: 1000, h: 629 },
  { name: 'heart-stamp-to-you', w: 1000, h: 671 },
  { name: 'pink-roses',         w: 1000, h: 683 },
  { name: 'kraft-read-me',      w: 1000, h: 709 },
  { name: 'stack-read-for-a-smile', w: 1000, h: 648 },
  { name: 'olive-rose-seal',        w: 1000, h: 665 },
  { name: 'ivory-for-you-to-read',  w: 1000, h: 680 },
];

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// avoid: envelope names used by the letters just before this one
export function card(story, avoid = [], index = 0) {
  const h = hash(story.id);
  const allowed = PHOTOS.filter((x) => !avoid.includes(x.name));
  const choices = allowed.length ? allowed : PHOTOS;
  const p = choices[(h >>> 3) % choices.length];
  const tilt = (((h >>> 9) % 50) / 10 - 2.5).toFixed(1);
  const date = niceDate(story.published_at);
  return `<button type="button" class="letter" data-style="${p.name}" style="--tilt:${tilt}deg" data-id="${story.id}"
            aria-label="Open the letter from ${date}"><img src="img/${p.name}.webp" width="${p.w}" height="${p.h}" alt=""
            ${index > 5 ? 'loading="lazy" ' : ''}decoding="async"></button>`;
}
