// Admin queue. Every request needs the x-admin-password header.
// GET  /api/admin                 → held letters and notes, plus the 50 most recent letters
// GET  /api/admin?export=marketing → CSV of emails that opted in to updates
// POST /api/admin { kind, id, action: 'publish' | 'decline' }

import { select, update } from '../lib/db.js';
import { sendPublished, sendNewComment } from '../lib/email.js';
import { isAdmin, isUuid } from '../lib/util.js';

export default async function handler(req, res) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Wrong password.' });

  try {
    if (req.method === 'GET' && req.query.export === 'marketing') {
      const rows = await select('stories', 'email,created_at', { marketing_opt_in: 'eq.true', order: 'created_at.asc' });
      const seen = new Set();
      const lines = ['email,first_signed_up'];
      for (const r of rows) {
        if (seen.has(r.email)) continue;
        seen.add(r.email);
        lines.push(`${r.email},${r.created_at.slice(0, 10)}`);
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="dear-stranger-subscribers.csv"');
      return res.status(200).send(lines.join('\n'));
    }

    if (req.method === 'GET') {
      const stories = await select('stories', 'id,body,font,signoff,mod_reason,created_at', {
        status: 'eq.held',
        order: 'created_at.asc',
      });
      const notes = await select('comments', 'id,story_id,body,mod_reason,created_at', {
        status: 'eq.held',
        order: 'created_at.asc',
      });
      // Everything sent recently, whatever happened to it, so nothing is invisible.
      const recent = await select('stories', 'id,body,status,mod_reason,created_at', {
        order: 'created_at.desc',
        limit: '50',
      });
      return res.status(200).json({ stories, notes, recent });
    }

    if (req.method === 'POST') {
      const { kind, id, action } = req.body || {};
      if (!isUuid(id) || !['story', 'note'].includes(kind) || !['publish', 'decline'].includes(action)) {
        return res.status(400).json({ error: 'Bad request.' });
      }
      const status = action === 'publish' ? 'published' : 'declined';

      if (kind === 'story') {
        const patch = { status, mod_reason: `Reviewed by you: ${status}` };
        if (status === 'published') patch.published_at = new Date().toISOString();
        const [story] = await update('stories', { id: `eq.${id}` }, patch);
        if (story && status === 'published') await sendPublished(story);
      } else {
        const [note] = await update('comments', { id: `eq.${id}` }, { status, mod_reason: `Reviewed by you: ${status}` });
        if (note && status === 'published') {
          const [story] = await select('stories', 'id,email,notify_comments,unsubscribe_token', { id: `eq.${note.story_id}` });
          if (story) await sendNewComment(story, note);
        }
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
}
