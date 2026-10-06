-- Dear Stranger database
-- Paste this whole file into Supabase → SQL Editor → New query → Run.

create extension if not exists pgcrypto;

create table if not exists stories (
  id                uuid primary key default gen_random_uuid(),
  body              text not null,
  font              text not null default 'caveat',
  signoff           text not null default 'With love, a stranger',
  -- private: never returned by the public API
  email             text not null,
  notify_comments   boolean not null default true,
  marketing_opt_in  boolean not null default false,
  unsubscribe_token uuid not null default gen_random_uuid(),
  ip_hash           text,
  -- moderation
  status            text not null default 'held' check (status in ('published','held','declined')),
  mod_reason        text,
  created_at        timestamptz not null default now(),
  published_at      timestamptz
);

create table if not exists comments (
  id          uuid primary key default gen_random_uuid(),
  story_id    uuid not null references stories(id) on delete cascade,
  body        text not null,
  ip_hash     text,
  status      text not null default 'held' check (status in ('published','held','declined')),
  mod_reason  text,
  created_at  timestamptz not null default now()
);

create index if not exists stories_status_idx  on stories (status, published_at desc);
create index if not exists comments_story_idx  on comments (story_id, status, created_at);
create index if not exists stories_ip_idx      on stories (ip_hash, created_at);
create index if not exists comments_ip_idx     on comments (ip_hash, created_at);

-- Lock both tables down. With RLS on and no policies, the public "anon" key
-- can read nothing. Only the server (service role key) can, so emails stay private.
alter table stories  enable row level security;
alter table comments enable row level security;

-- A fresh random order of published letters every time it's read (used by the homepage).
create or replace view published_random as
  select id, published_at
  from stories
  where status = 'published'
  order by random();

-- Only the server reads this view, never the public API keys.
revoke all on published_random from anon, authenticated;
