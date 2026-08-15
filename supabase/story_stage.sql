-- ✦ The Song the Sea Forgot — story engine, stage & maps bucket
-- Run AFTER schema.sql and rpcs.sql. Covers the Store methods that shipped
-- without SQL: dm_list_story / dm_save_story_node / dm_delete_story_node,
-- get_stage / dm_save_stage, and the 'maps' storage bucket that
-- uploadMapImage targets.

-- -------------------------------------------------------------- story_nodes
create table if not exists story_nodes (
  id uuid primary key,
  campaign_id uuid not null references campaigns (id) on delete cascade,
  act int not null,
  ord int not null,
  title text not null default '',
  summary text not null default '',
  status text not null default 'possible',
  branches jsonb not null default '[]'::jsonb
);

create index if not exists story_nodes_campaign_idx on story_nodes (campaign_id);
alter table story_nodes enable row level security;

create or replace function dm_list_story(p_dm_code text)
returns jsonb language sql security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', s.id, 'act', s.act, 'ord', s.ord, 'title', s.title,
    'summary', s.summary, 'status', s.status, 'branches', s.branches
  ) order by s.act, s.ord), '[]'::jsonb)
  from story_nodes s where s.campaign_id = _campaign_by_dm_code(p_dm_code);
$$;

create or replace function dm_save_story_node(p_dm_code text, p_node jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_campaign uuid := _campaign_by_dm_code(p_dm_code);
begin
  if v_campaign is null then return; end if;
  insert into story_nodes (id, campaign_id, act, ord, title, summary, status, branches)
  values ((p_node->>'id')::uuid, v_campaign,
    coalesce((p_node->>'act')::int, 1), coalesce((p_node->>'ord')::int, 0),
    coalesce(p_node->>'title',''), coalesce(p_node->>'summary',''),
    coalesce(p_node->>'status','possible'), coalesce(p_node->'branches','[]'::jsonb))
  on conflict (id) do update set act = excluded.act, ord = excluded.ord,
    title = excluded.title, summary = excluded.summary,
    status = excluded.status, branches = excluded.branches;
end;
$$;

create or replace function dm_delete_story_node(p_dm_code text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from story_nodes where id = p_id
    and campaign_id = _campaign_by_dm_code(p_dm_code);
end;
$$;

-- ------------------------------------------------------------- stage_states
-- One stage per campaign; players read it with either code (get_stage takes
-- the join code from player devices, matching StageState in src/types.ts).
create table if not exists stage_states (
  campaign_id uuid primary key references campaigns (id) on delete cascade,
  mode text not null default 'ambient',
  map_url text,
  tokens jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table stage_states enable row level security;

create or replace function get_stage(p_code text)
returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object('mode', s.mode, 'mapUrl', s.map_url, 'tokens', s.tokens)
  from stage_states s
  join campaigns c on c.id = s.campaign_id
  where c.join_code = p_code or c.dm_code = p_code
  limit 1;
$$;

create or replace function dm_save_stage(p_dm_code text, p_state jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_campaign uuid := _campaign_by_dm_code(p_dm_code);
begin
  if v_campaign is null then return; end if;
  insert into stage_states (campaign_id, mode, map_url, tokens, updated_at)
  values (v_campaign, coalesce(p_state->>'mode','ambient'),
    p_state->>'mapUrl', coalesce(p_state->'tokens','[]'::jsonb), now())
  on conflict (campaign_id) do update set mode = excluded.mode,
    map_url = excluded.map_url, tokens = excluded.tokens, updated_at = now();
end;
$$;

-- -------------------------------------------------------------- maps bucket
-- uploadMapImage (src/lib/store.ts) uploads with the anon key and loads the
-- image back via its public URL, so the bucket is public-read and the anon
-- role needs insert on storage.objects for this bucket only.
insert into storage.buckets (id, name, public)
values ('maps', 'maps', true)
on conflict (id) do nothing;

drop policy if exists "anon uploads to maps" on storage.objects;
create policy "anon uploads to maps" on storage.objects
  for insert to anon with check (bucket_id = 'maps');

drop policy if exists "public reads maps" on storage.objects;
create policy "public reads maps" on storage.objects
  for select using (bucket_id = 'maps');
