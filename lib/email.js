// Notification emails via Resend (https://resend.com). Fails quietly:
// a missed email never blocks a letter or a note from being saved.

const site = () => (process.env.SITE_URL || '').replace(/\/$/, '');

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function wrap(inner, unsubscribeToken) {
  const unsub = unsubscribeToken
    ? `<p style="margin-top:32px;font-size:12px;color:#8a7f86">You're getting this because you asked to hear when someone writes back.
       <a href="${site()}/api/unsubscribe?token=${unsubscribeToken}" style="color:#8a7f86">Stop these emails</a>.</p>`
    : '';
  return `<div style="font-family:'Times New Roman',Times,serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#3b2a30;line-height:1.6">
    ${inner}${unsub}</div>`;
}

async function send(to, subject, html) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, html }),
    });
    if (!res.ok) console.error('Resend error', res.status, await res.text());
  } catch (err) {
    console.error('Email failed:', err);
  }
}

export function sendPublished(story) {
  const link = `${site()}/?l=${story.id}`;
  return send(
    story.email,
    'Your letter is out in the world',
    wrap(
      `<p>Dear stranger,</p>
       <p>Your letter has been delivered. Anyone who needs a little good news can find it now.</p>
       <p><a href="${link}" style="color:#7a1f2b">Read your letter</a></p>`,
      story.notify_comments ? story.unsubscribe_token : null
    )
  );
}

export function sendNewComment(story, comment) {
  if (!story.notify_comments) return;
  const link = `${site()}/?l=${story.id}`;
  return send(
    story.email,
    'Someone wrote back to your letter',
    wrap(
      `<p>Dear stranger,</p>
       <p>Someone read your letter and left you a note:</p>
       <blockquote style="margin:16px 0;padding:12px 16px;background:#fbf3d4;border-left:3px solid #c9a45c">${escape(comment.body)}</blockquote>
       <p><a href="${link}" style="color:#7a1f2b">See it on your letter</a></p>`,
      story.unsubscribe_token
    )
  );
}
