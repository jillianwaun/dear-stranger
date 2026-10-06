// POST /api/submit  → a new letter goes through rules, then Claude, then is saved.

import { insert, count } from '../lib/db.js';
import { checkRules } from '../lib/rules.js';
import { moderate } from '../lib/moderate.js';
import { sendPublished } from '../lib/email.js';
import { FONTS, SIGNOFFS, ipHash, sinceHoursAgo, isEmail } from '../lib/util.js';

const MAX_PER_DAY = 5;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });

  try {
    const { body, font, signoff, email, notify_comments, marketing_opt_in, website } = req.body || {};

    // Honeypot: a hidden field real people never fill in.
    if (website) return res.status(200).json({ status: 'held' });

    if (!isEmail(email)) return res.status(400).json({ error: 'Add an email address so we can tell you when someone writes back.' });

    const ruleProblem = checkRules(body, 'story');
    if (ruleProblem) return res.status(400).json({ error: ruleProblem });

    const hash = ipHash(req);
    const recent = await count('stories', { ip_hash: `eq.${hash}`, created_at: `gte.${sinceHoursAgo(24)}` });
    if (recent >= MAX_PER_DAY) {
      return res.status(429).json({ error: 'You have sent a lot of letters today. Come back tomorrow to send another.' });
    }

    const { decision, reason } = await moderate(body.trim(), 'story');
    const status = decision === 'publish' ? 'published' : decision === 'decline' ? 'declined' : 'held';

    const story = await insert('stories', {
      body: body.trim(),
      font: FONTS.includes(font) ? font : FONTS[0],
      signoff: SIGNOFFS.includes(signoff) ? signoff : SIGNOFFS[0],
      email: email.trim().toLowerCase(),
      notify_comments: notify_comments !== false,
      marketing_opt_in: marketing_opt_in === true,
      ip_hash: hash,
      status,
      mod_reason: reason,
      published_at: status === 'published' ? new Date().toISOString() : null,
    });

    if (status === 'published') await sendPublished(story);

    return res.status(200).json({ status, id: status === 'published' ? story.id : undefined });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Your letter did not send. Your words are still on the page, so try again in a moment.' });
  }
}
