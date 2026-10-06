// Layer 1: instant rule checks. These run before Claude and cost nothing.
// Each failure returns a message the writer will see, so they can fix it.

// Add words or phrases here (lowercase). Matching is whole-word.
const BLOCKED = [
  // 'example-word',
];

const LIMITS = {
  story: { min: 80, max: 3000 },
  comment: { min: 2, max: 400 },
};

const URL_RE = /(https?:\/\/|www\.)|\b[a-z0-9-]+\.(com|net|org|io|co|me|ly|app|link|shop|xyz|info)\b/i;
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_RE = /(\+?\d[\d\s().-]{8,}\d)/;
const HANDLE_RE = /(^|\s)@[a-z0-9_.]{2,}/i;

export function checkRules(text, kind = 'story') {
  const body = (text || '').trim();
  const { min, max } = LIMITS[kind];

  if (body.length < min) {
    return kind === 'story'
      ? `Your letter needs a little more. Write at least ${min} characters.`
      : 'Your note is empty.';
  }
  if (body.length > max) return `Keep it under ${max} characters. You're at ${body.length}.`;
  if (URL_RE.test(body)) return 'Remove links and web addresses. Letters here stay offline.';
  if (EMAIL_RE.test(body)) return 'Remove email addresses so everyone stays anonymous.';
  if (PHONE_RE.test(body)) return 'Remove phone numbers so everyone stays anonymous.';
  if (HANDLE_RE.test(body)) return 'Remove @handles so everyone stays anonymous.';

  const lower = body.toLowerCase();
  for (const word of BLOCKED) {
    const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(lower)) return 'Some language in this one is not allowed here. Try rewording it.';
  }
  return null; // passed
}
