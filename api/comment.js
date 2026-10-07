// POST /api/comment  → an anonymous note on a letter. Same two-layer review.

import { select, insert, count } from '../lib/db.js';
import { checkRules } from '../lib/rules.js';
import { moderate } from '../lib/moderate.js';
import { sendNewComment } from '../lib/email.js';
import { ipHash, sinceHoursAgo, isUuid } from '../lib/util.js';

const MAX_PER_DAY = 20;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });

  try {
    const { story_id, body, trap } = req.body || {};
    if (trap) { console.warn('Spam trap filled, note discarded'); return res.status(200).json({ status: 'held' }); }
    if (!isUuid(story_id)) return res.status(400).json({ error: 'That letter could not be found.' });

    const ruleProblem = checkRules(body, 'comment');
    if (ruleProblem) return res.status(400).json({ error: ruleProblem });

    const [story] = await select('stories', 'id,body,email,notify_comments,unsubscribe_token', {
      id: `eq.${story_id}`,
      status: 'eq.published',
    });
    if (!story) return res.status(404).json({ error: 'That letter could not be found.' });

    const hash = ipHash(req);
    const recent = await count('comments', { ip_hash: `eq.${hash}`, created_at: `gte.${sinceHoursAgo(24)}` });
    if (recent >= MAX_PER_DAY) return res.status(429).json({ error: 'You have left a lot of notes today. Come back tomorrow.' });

    const { decision, reason } = await moderate(body.trim(), 'comment', story.body);
    const status = decision === 'publish' ? 'published' : decision === 'decline' ? 'declined' : 'held';

    const comment = await insert('comments', { story_id, body: body.trim(), ip_hash: hash, status, mod_reason: reason });

    if (status === 'published') await sendNewComment(story, comment);

    return res.status(200).json({
      status,
      note: status === 'published' ? { id: comment.id, body: comment.body, created_at: comment.created_at } : undefined,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Your note did not send. Try again in a moment.' });
  }
}
