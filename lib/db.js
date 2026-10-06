// Tiny Supabase (PostgREST) client using fetch — no npm packages needed.

const url = () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  }
  return process.env.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/';
};

// Works with both Supabase key styles: the newer secret key (sb_secret_...)
// goes in the apikey header only; the older service_role key (eyJ...) also
// goes in the Authorization header.
const headers = (extra = {}) => {
  const key = process.env.SUPABASE_SERVICE_KEY;
  const h = { apikey: key, 'Content-Type': 'application/json', ...extra };
  if (key && key.startsWith('eyJ')) h.Authorization = `Bearer ${key}`;
  return h;
};

async function call(path, options = {}) {
  const res = await fetch(url() + path, { ...options, headers: headers(options.headers) });
  const text = await res.text();
  if (!res.ok) throw new Error(`Database error ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

// select('stories', 'id,body', { status: 'eq.published', order: 'published_at.desc' })
export function select(table, columns, filters = {}) {
  const params = new URLSearchParams({ select: columns, ...filters });
  return call(`${table}?${params}`);
}

export async function insert(table, row) {
  const rows = await call(table, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  });
  return rows[0];
}

export function update(table, filters, patch) {
  const params = new URLSearchParams(filters);
  return call(`${table}?${params}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(patch),
  });
}

export async function count(table, filters) {
  const params = new URLSearchParams({ select: 'id', ...filters });
  const res = await fetch(url() + `${table}?${params}`, {
    method: 'HEAD',
    headers: headers({ Prefer: 'count=exact' }),
  });
  const range = res.headers.get('content-range') || '*/0';
  return Number(range.split('/')[1]) || 0;
}
