import crypto from 'node:crypto';

export const FONTS = ['caveat', 'homemade-apple', 'reenie-beanie', 'patrick-hand', 'nothing-you-could-do'];

export const SIGNOFFS = [
  'With love, a stranger',
  'Yours, someone who is glad',
  'xo, a friend you haven’t met',
  'Warmly, from somewhere sunny',
  'Love, me',
];

export function ipHash(req) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || '';
  return crypto.createHash('sha256').update(ip + (process.env.IP_SALT || '')).digest('hex').slice(0, 32);
}

export function sinceHoursAgo(h) {
  return new Date(Date.now() - h * 3600 * 1000).toISOString();
}

export function isAdmin(req) {
  const given = Buffer.from(String(req.headers['x-admin-password'] || ''));
  const real = Buffer.from(String(process.env.ADMIN_PASSWORD || ''));
  if (!real.length || given.length !== real.length) return false;
  return crypto.timingSafeEqual(given, real);
}

export const isUuid = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s || ''));
export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '')) && String(s).length < 255;
