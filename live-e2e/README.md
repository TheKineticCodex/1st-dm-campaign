# Live two-device tests

Not part of CI. These run against a local preview that was **built with `.env.local`**
(the live Supabase URL + anon key), so two browser contexts talk through the real
realtime channel — the DM's Book in one, a phone in the other.

    npm run build && npx vite preview --port 4173 --strictPort &
    npx playwright test -c live-e2e/playwright.live.config.ts

They create throwaway players (`_wheeltest`, `_gametest`) in the live campaign. **Delete them after**
(`delete from players where name in ('_wheeltest','_gametest');` — cascades their rows) and any
prize handouts (`delete from handouts where content::text like '%the prize%';`).

`finale.live.spec.ts` also leaves a stage row, test encounters (single-row, ended) and tiny
`*-e2e-map.png` objects in the `maps` bucket: `delete from stage_states; delete from encounters
where jsonb_array_length(initiative_order) <= 1;` — the bucket objects can only be removed from
the Storage dashboard (SQL deletes on storage.objects are blocked).

Set `LIVE_URL=http://localhost:4174/` to point the specs at a different preview port.

Note: the ordinary phone-flow suite (`npx playwright test`) builds with `--mode e2e`, which
blanks the Supabase keys (`.env.e2e`) so it never touches the live campaign even when
`.env.local` exists.
