-- Living stage (2026-08-15): the stage keeps its light (tint) and fog of war
-- alongside the map and tokens. One jsonb column holds whatever else the
-- StageState grows; get_stage merges it back in.

alter table stage_states add column if not exists extra jsonb not null default '{}'::jsonb;

create or replace function get_stage(p_code text)
returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object('mode', s.mode, 'mapUrl', s.map_url, 'tokens', s.tokens) || coalesce(s.extra, '{}'::jsonb)
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
  insert into stage_states (campaign_id, mode, map_url, tokens, extra, updated_at)
  values (v_campaign, coalesce(p_state->>'mode','ambient'),
    p_state->>'mapUrl', coalesce(p_state->'tokens','[]'::jsonb),
    (p_state - 'mode' - 'mapUrl' - 'tokens'), now())
  on conflict (campaign_id) do update set mode = excluded.mode,
    map_url = excluded.map_url, tokens = excluded.tokens, extra = excluded.extra, updated_at = now();
end;
$$;
