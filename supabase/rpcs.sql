-- ✦ The Song the Sea Forgot — RPC layer
-- Run AFTER schema.sql, in the Supabase SQL editor.
--
-- All tables are RLS-locked with no anon policies; these SECURITY DEFINER
-- functions are the only door in. Players prove identity with their device
-- token; the DM proves it with the campaign's dm_code. The anon key alone
-- can call these and get nothing back.

-- ---------------------------------------------------------------- helpers

create or replace function _campaign_by_dm_code(p_dm_code text)
returns uuid language sql security definer set search_path = public as $$
  select id from campaigns where dm_code = p_dm_code limit 1;
$$;

create or replace function _player_by_token(p_device_token text)
returns uuid language sql security definer set search_path = public as $$
  select id from players where device_token = p_device_token limit 1;
$$;

-- ------------------------------------------------------------------- join

create or replace function join_campaign(p_code text, p_name text, p_device_token text)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_campaign uuid;
begin
  -- DM code first: the DM does not get a player row.
  select id into v_campaign from campaigns where dm_code = p_code;
  if v_campaign is not null then
    return 'dm';
  end if;

  select id into v_campaign from campaigns where join_code = p_code;
  if v_campaign is null then
    return 'invalid';
  end if;

  -- Same name rejoining from a new phone moves the seat to that device.
  insert into players (campaign_id, name, device_token)
  values (v_campaign, p_name, p_device_token)
  on conflict (campaign_id, name)
  do update set device_token = excluded.device_token;

  return 'player';
end;
$$;

-- ------------------------------------------------------- character & quiz

create or replace function get_character(p_device_token text)
returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'build', c.build, 'state', c.state, 'notes', c.private_notes,
    'updatedAt', c.updated_at)
  from characters c
  where c.player_id = _player_by_token(p_device_token)
  limit 1;
$$;

create or replace function save_character(
  p_device_token text, p_build jsonb, p_state jsonb, p_private_notes jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_player uuid := _player_by_token(p_device_token);
begin
  if v_player is null then return; end if;
  insert into characters (player_id, build, state, private_notes, updated_at)
  values (v_player, p_build, p_state, p_private_notes, now())
  on conflict (player_id)
  do update set build = excluded.build, state = excluded.state,
    private_notes = excluded.private_notes, updated_at = now();
end;
$$;

-- characters needs one row per player for the upsert above
alter table characters drop constraint if exists characters_player_unique;
alter table characters add constraint characters_player_unique unique (player_id);

create or replace function get_quiz(p_device_token text)
returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'playerName', p.name, 'answers', q.answers,
    'topClasses', q.top_classes, 'updatedAt', q.updated_at)
  from quiz_results q join players p on p.id = q.player_id
  where q.player_id = _player_by_token(p_device_token)
  limit 1;
$$;

create or replace function save_quiz(p_device_token text, p_answers jsonb, p_top_classes jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_player uuid := _player_by_token(p_device_token);
begin
  if v_player is null then return; end if;
  insert into quiz_results (player_id, answers, top_classes, updated_at)
  values (v_player, p_answers, p_top_classes, now())
  on conflict (player_id)
  do update set answers = excluded.answers,
    top_classes = excluded.top_classes, updated_at = now();
end;
$$;

-- -------------------------------------------------------------- DM: roster

create or replace function dm_roster(p_dm_code text)
returns jsonb language sql security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'playerId', p.id,
    'playerName', p.name,
    'characterId', c.id,
    'character', case when c.id is null then null else jsonb_build_object(
      'build', c.build, 'state', c.state, 'notes', c.private_notes,
      'updatedAt', c.updated_at) end,
    'quiz', case when q.player_id is null then null else jsonb_build_object(
      'playerName', p.name, 'answers', q.answers,
      'topClasses', q.top_classes, 'updatedAt', q.updated_at) end
  ) order by p.created_at), '[]'::jsonb)
  from players p
  left join characters c on c.player_id = p.id
  left join quiz_results q on q.player_id = p.id
  where p.campaign_id = _campaign_by_dm_code(p_dm_code);
$$;

-- --------------------------------------------------------- DM: lost things

create or replace function dm_get_lost_things(p_dm_code text, p_character_id uuid)
returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object('characterId', l.character_id, 'taken', l.taken,
    'believed', l.believed, 'truth', l.truth)
  from lost_things l
  join characters c on c.id = l.character_id
  join players p on p.id = c.player_id
  where l.character_id = p_character_id
    and p.campaign_id = _campaign_by_dm_code(p_dm_code)
  limit 1;
$$;

create or replace function dm_save_lost_things(
  p_dm_code text, p_character_id uuid, p_taken text, p_believed text, p_truth text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if _campaign_by_dm_code(p_dm_code) is null then return; end if;
  insert into lost_things (character_id, taken, believed, truth, updated_at)
  values (p_character_id, p_taken, p_believed, p_truth, now())
  on conflict (character_id)
  do update set taken = excluded.taken, believed = excluded.believed,
    truth = excluded.truth, updated_at = now();
end;
$$;

-- --------------------------------------------------------------- DM: NPCs

create or replace function dm_list_npcs(p_dm_code text)
returns jsonb language sql security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', n.id, 'name', n.name, 'pronunciation', n.pronunciation,
    'trait', n.trait, 'motivation', n.motivation, 'secret', n.secret,
    'connection', n.connection) order by n.created_at), '[]'::jsonb)
  from npcs n where n.campaign_id = _campaign_by_dm_code(p_dm_code);
$$;

create or replace function dm_save_npc(p_dm_code text, p_npc jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_campaign uuid := _campaign_by_dm_code(p_dm_code);
begin
  if v_campaign is null then return; end if;
  insert into npcs (id, campaign_id, name, pronunciation, trait, motivation, secret, connection)
  values ((p_npc->>'id')::uuid, v_campaign, p_npc->>'name',
    coalesce(p_npc->>'pronunciation',''), coalesce(p_npc->>'trait',''),
    coalesce(p_npc->>'motivation',''), coalesce(p_npc->>'secret',''),
    coalesce(p_npc->>'connection',''))
  on conflict (id) do update set name = excluded.name,
    pronunciation = excluded.pronunciation, trait = excluded.trait,
    motivation = excluded.motivation, secret = excluded.secret,
    connection = excluded.connection;
end;
$$;

create or replace function dm_delete_npc(p_dm_code text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from npcs where id = p_id
    and campaign_id = _campaign_by_dm_code(p_dm_code);
end;
$$;

-- --------------------------------------------------------------- DM: clues

create or replace function dm_list_clues(p_dm_code text)
returns jsonb language sql security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id, 'conclusion', c.conclusion,
    'clues', jsonb_build_array(
      jsonb_build_object('text', c.clue_1, 'found', c.clue_1_found),
      jsonb_build_object('text', c.clue_2, 'found', c.clue_2_found),
      jsonb_build_object('text', c.clue_3, 'found', c.clue_3_found))
  )), '[]'::jsonb)
  from clues c where c.campaign_id = _campaign_by_dm_code(p_dm_code);
$$;

create or replace function dm_save_clue(p_dm_code text, p_clue jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_campaign uuid := _campaign_by_dm_code(p_dm_code);
begin
  if v_campaign is null then return; end if;
  insert into clues (id, campaign_id, conclusion,
    clue_1, clue_1_found, clue_2, clue_2_found, clue_3, clue_3_found)
  values ((p_clue->>'id')::uuid, v_campaign, p_clue->>'conclusion',
    coalesce(p_clue#>>'{clues,0,text}',''), coalesce((p_clue#>>'{clues,0,found}')::boolean,false),
    coalesce(p_clue#>>'{clues,1,text}',''), coalesce((p_clue#>>'{clues,1,found}')::boolean,false),
    coalesce(p_clue#>>'{clues,2,text}',''), coalesce((p_clue#>>'{clues,2,found}')::boolean,false))
  on conflict (id) do update set conclusion = excluded.conclusion,
    clue_1 = excluded.clue_1, clue_1_found = excluded.clue_1_found,
    clue_2 = excluded.clue_2, clue_2_found = excluded.clue_2_found,
    clue_3 = excluded.clue_3, clue_3_found = excluded.clue_3_found;
end;
$$;

create or replace function dm_delete_clue(p_dm_code text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from clues where id = p_id
    and campaign_id = _campaign_by_dm_code(p_dm_code);
end;
$$;

-- ------------------------------------------------------- DM: session notes

create or replace function dm_list_session_notes(p_dm_code text)
returns jsonb language sql security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', s.id, 'sessionNumber', s.session_number,
    'whatHappened', s.what_happened, 'cluesFound', s.clues_found,
    'cluesMissed', s.clues_missed, 'npcsMet', s.npcs_met,
    'threadsOpen', s.threads_open) order by s.session_number), '[]'::jsonb)
  from session_notes s where s.campaign_id = _campaign_by_dm_code(p_dm_code);
$$;

create or replace function dm_save_session_note(p_dm_code text, p_note jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_campaign uuid := _campaign_by_dm_code(p_dm_code);
begin
  if v_campaign is null then return; end if;
  insert into session_notes (id, campaign_id, session_number,
    what_happened, clues_found, clues_missed, npcs_met, threads_open)
  values ((p_note->>'id')::uuid, v_campaign, (p_note->>'sessionNumber')::int,
    coalesce(p_note->>'whatHappened',''), coalesce(p_note->>'cluesFound',''),
    coalesce(p_note->>'cluesMissed',''), coalesce(p_note->>'npcsMet',''),
    coalesce(p_note->>'threadsOpen',''))
  on conflict (id) do update set session_number = excluded.session_number,
    what_happened = excluded.what_happened, clues_found = excluded.clues_found,
    clues_missed = excluded.clues_missed, npcs_met = excluded.npcs_met,
    threads_open = excluded.threads_open;
end;
$$;

create or replace function dm_delete_session_note(p_dm_code text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from session_notes where id = p_id
    and campaign_id = _campaign_by_dm_code(p_dm_code);
end;
$$;

-- session_notes upserts by id, so the (campaign_id, session_number)
-- uniqueness must not block editing an existing note's number
alter table session_notes drop constraint if exists session_notes_campaign_id_session_number_key;

-- --------------------------------------------------------------- execution
-- Supabase grants EXECUTE to anon/authenticated by default on functions in
-- the public schema; the token/dm_code checks inside are the real gate.
