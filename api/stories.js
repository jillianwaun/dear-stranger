// GET /api/stories            → published letters for the homepage grid, in a new random order every time
// GET /api/stories?id=<uuid>  → one letter plus its published notes

import crypto from 'node:crypto';
import { select } from '../lib/db.js';
import { isUuid } from '../lib/util.js';

// Public columns only. Email and tokens are never sent to the browser.
const PUBLIC = 'id,body,font,signoff,published_at';
const MAX_ON_PAGE = 500;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Use GET.' });

  try {
    const { id } = req.query;

    if (id) {
      if (!isUuid(id)) return res.status(400).json({ error: 'That letter link is broken.' });
      const [story] = await select('stories', PUBLIC, { id: `eq.${id}`, status: 'eq.published' });
      if (!story) return res.status(404).json({ error: 'This letter is not here anymore.' });
      const notes = await select('comments', 'id,body,created_at', {
        story_id: `eq.${id}`,
        status: 'eq.published',
        order: 'created_at.asc',
      });
      return res.status(200).json({ story, notes });
    }

    // Homepage: every published letter, shuffled fresh on every request.
    // The database does the shuffling (see published_random in schema.sql),
    // so this stays fast even with thousands of letters.
    const stories = await select('published_random', 'id,published_at', { limit: String(MAX_ON_PAGE) });
    shuffle(stories); // a second shuffle here, in case anything upstream reused an order
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ stories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'The letters could not be loaded. Refresh to try again.' });
  }
}
