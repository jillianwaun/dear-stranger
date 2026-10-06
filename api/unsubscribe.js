// GET /api/unsubscribe?token=<uuid>  → turns off note notifications and marketing for that address.

import { select, update } from '../lib/db.js';
import { isUuid } from '../lib/util.js';

const page = (msg) => `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dear Stranger</title>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#4a1520;font-family:'Times New Roman',Times,serif;color:#fbf7ee;padding:24px">
<div style="max-width:420px;text-align:center"><p style="font-size:22px;line-height:1.5">${msg}</p>
<p><a href="/" style="color:#e8c98a">Back to the letters</a></p></div></body>`;

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const { token } = req.query;
  if (!isUuid(token)) return res.status(400).send(page('That unsubscribe link is broken.'));
  try {
    const [story] = await select('stories', 'email', { unsubscribe_token: `eq.${token}` });
    if (!story) return res.status(404).send(page('That unsubscribe link has expired.'));
    // Unsubscribe the address from everything, across all of their letters.
    await update('stories', { email: `eq.${story.email}` }, { notify_comments: false, marketing_opt_in: false });
    return res.status(200).send(page('You won’t get any more emails from us. Your letters stay up.'));
  } catch (err) {
    console.error(err);
    return res.status(500).send(page('That did not work. Try the link again in a moment.'));
  }
}
