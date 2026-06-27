/**
 * Shared UUID detection. Demo stores use slug ids (e.g. "jays-burger") that are NOT
 * valid Supabase UUIDs — callers use this to branch to a client-side/demo path
 * instead of sending a slug to Postgres (which throws "invalid input syntax for type uuid").
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(id: string | null | undefined): boolean {
  return !!id && UUID_RE.test(id);
}
