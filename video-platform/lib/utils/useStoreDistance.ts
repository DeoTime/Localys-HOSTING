'use client';

import { useEffect, useState } from 'react';
import { useDeliveryLocation } from '@/contexts/DeliveryLocationContext';
import { geocodeAddress } from '@/lib/utils/googleGeocode';
import { haversineDistance } from '@/lib/utils/geo';

/**
 * Resolves the straight-line distance (km) + a rough driving ETA (min) from the
 * user's confirmed delivery location to a store address. Geocoded coordinates are
 * cached (in-memory + localStorage) so each address is only looked up once.
 *
 * Returns `{ km: null, label: null }` when the user has no location set or the
 * address can't be geocoded — callers should hide the distance in that case.
 */
const CACHE_KEY = 'localys:geocodeCache';
const memCache = new Map<string, { lat: number; lng: number }>();

function readDiskCache(addr: string): { lat: number; lng: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, { lat: number; lng: number }>;
    return map[addr] ?? null;
  } catch {
    return null;
  }
}

function writeDiskCache(addr: string, coords: { lat: number; lng: number }) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, { lat: number; lng: number }>) : {};
    map[addr] = coords;
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {
    /* storage unavailable — keep the in-memory cache only */
  }
}

export interface StoreDistance {
  km: number | null;
  label: string | null; // e.g. "3.2 km away"
  etaLabel: string | null; // e.g. "8 min"
}

export function useStoreDistance(address: string | undefined): StoreDistance {
  const { location } = useDeliveryLocation();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!address) return;
    let active = true;
    // Resolve through one async path (mem → disk → network) so we never call
    // setState synchronously inside the effect body.
    void (async () => {
      let c: { lat: number; lng: number } | null = memCache.get(address) ?? readDiskCache(address);
      if (!c) {
        c = await geocodeAddress(address);
        if (c) writeDiskCache(address, c);
      }
      if (c) memCache.set(address, c);
      if (active) setCoords(c);
    })();
    return () => {
      active = false;
    };
  }, [address]);

  if (!location || !coords) return { km: null, label: null, etaLabel: null };

  const km = haversineDistance(location.lat, location.lng, coords.lat, coords.lng);
  const label = km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`;
  const etaLabel = `${Math.max(4, Math.round((km / 35) * 60))} min`;
  return { km, label, etaLabel };
}
