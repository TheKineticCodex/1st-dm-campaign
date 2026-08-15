# Live two-device tests

Not part of CI. These run against a local preview that was **built with `.env.local`**
(the live Supabase URL + anon key), so two browser contexts talk through the real
realtime channel — the DM's Book in one, a phone in the other.

    npm run build && npx vite preview --port 4173 --strictPort &
    npx playwright test -c live-e2e/playwright.live.config.ts

They create a throwaway player (`_wheeltest`) in the live campaign. **Delete it after**
(`delete from players where name = '_wheeltest';` — cascades its rows).
