/**
 * Best-effort client-side geocoding via the Google Geocoding API (supports CORS).
 * Used only to compute a straight-line "how far" distance for an address-based store.
 * Returns null on any failure (missing key, blocked API, no result) — never throws,
 * so callers degrade gracefully to the map-only view.
 */
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  if (!KEY || !address) return null;
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${KEY}`,
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== 'OK' || !json.results?.length) return null;
    const loc = json.results[0].geometry?.location;
    if (typeof loc?.lat !== 'number' || typeof loc?.lng !== 'number') return null;
    return { lat: loc.lat, lng: loc.lng };
  } catch {
    return null;
  }
}
