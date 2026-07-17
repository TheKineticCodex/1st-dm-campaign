-- ✦ The Song the Sea Forgot — Supabase schema
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
--
-- Access model (no user accounts):
--   * Players hold a device_token minted on join; it identifies their rows.
--   * The DM holds the campaign's dm_code.
--   * Because there is no Supabase Auth, row filtering is enforced by
--     Postgres functions that check tokens passed per-request (see the
--     RLS section at the bottom). Phase 1 ships with the anon key +
--     these policies; revisit before adding anything sensitive beyond
--     the campaign itself.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- campaigns
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text not null unique,
  dm_code text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------ players
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns (id) on delete cascade,
  name text not null,
  device_token text not null unique,
  created_at timestamptz not null default now(),
  unique (campaign_id, name)
);

-- --------------------------------------------------------------- characters
create table if not exists characters (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players (id) on delete cascade,
  -- Full character build: species, class, background, abilities, choices.
  -- Shaped as { class: { levels: { "1": {...}, "2": {...} } } } friendly data
  -- so levels 2-8 slot in without refactoring.
  build jsonb not null default '{}'::jsonb,
  -- Volatile play state: hp, spell slots, conditions, death saves.
  state jsonb not null default '{}'::jsonb,
  -- Player free text. "What I lost" lives inside private_notes and is
  -- visible only to the owning player and the DM.
  private_notes jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------- quiz_results
create table if not exists quiz_results (
  player_id uuid primary key references players (id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  top_classes jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------------- lost_things
-- DM-only. Never sent to player devices.
create table if not exists lost_things (
  character_id uuid primary key references characters (id) on delete cascade,
  taken text not null default '',
  believed text not null default '',
  truth text not null default '',
  updated_at timestamptz not null default now()
);

-- --------------------------------------------------------- DM prep (Phase 2)
create table if not exists npcs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns (id) on delete cascade,
  name text not null,
  pronunciation text not null default '',
  trait text not null default '',
  motivation text not null default '',
  secret text not null default '',
  connection text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists clues (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns (id) on delete cascade,
  conclusion text not null,
  clue_1 text not null default '',
  clue_1_found boolean not null default false,
  clue_2 text not null default '',
  clue_2_found boolean not null default false,
  clue_3 text not null default '',
  clue_3_found boolean not null default false
);

create table if not exists session_notes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns (id) on delete cascade,
  session_number int not null,
  what_happened text not null default '',
  clues_found text not null default '',
  clues_missed text not null default '',
  npcs_met text not null default '',
  threads_open text not null default '',
  created_at timestamptz not null default now(),
  unique (campaign_id, session_number)
);

-- --------------------------------------------------------- realtime (Phase 3)
create table if not exists handouts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns (id) on delete cascade,
  -- null target = everyone; otherwise a single player's id (secret handout)
  target uuid references players (id) on delete cascade,
  content jsonb not null,
  sent_at timestamptz not null default now()
);

create table if not exists encounters (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns (id) on delete cascade,
  initiative_order jsonb not null default '[]'::jsonb,
  active_index int not null default 0,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

-- ------------------------------------------------------------------ indexes
create index if not exists players_campaign_idx on players (campaign_id);
create index if not exists characters_player_idx on characters (player_id);
create index if not exists npcs_campaign_idx on npcs (campaign_id);
create index if not exists clues_campaign_idx on clues (campaign_id);
create index if not exists session_notes_campaign_idx on session_notes (campaign_id);
create index if not exists handouts_campaign_idx on handouts (campaign_id);
create index if not exists encounters_campaign_idx on encounters (campaign_id);

-- ---------------------------------------------------------------------- RLS
-- Everything locked by default; access goes through security-definer RPCs
-- that verify a device_token or dm_code argument. This keeps the anon key
-- powerless on its own: without a valid token it can call the RPCs and get
-- nothing back.
alter table campaigns enable row level security;
alter table players enable row level security;
alter table characters enable row level security;
alter table quiz_results enable row level security;
alter table lost_things enable row level security;
alter table npcs enable row level security;
alter table clues enable row level security;
alter table session_notes enable row level security;
alter table handouts enable row level security;
alter table encounters enable row level security;

-- No policies are created for the anon role: direct table access is denied.
-- The app's reads/writes are implemented as RPCs added alongside each phase
-- (see supabase/rpcs.sql once Phase 1 server persistence lands).

-- ------------------------------------------------------------- seed campaign
-- Edit the codes before running if you want different ones, then text the
-- join code to your players and keep the DM code to yourself.
insert into campaigns (name, join_code, dm_code)
values ('The Song the Sea Forgot', 'SEAFORGOT', 'LANTERNKEEPER')
on conflict (join_code) do nothing;
