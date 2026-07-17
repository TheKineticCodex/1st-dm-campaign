import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * The app must stay usable with no backend configured (local dev, or the
 * owner hasn't wired Supabase yet): every caller checks `supabase` for null
 * and falls back to device storage. Device storage is also the offline
 * cache once Supabase IS configured.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

export const isOnlineMode = supabase !== null
