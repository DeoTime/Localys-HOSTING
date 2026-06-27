'use client';

import { useCallback, useState } from 'react';
import { MapPin } from 'lucide-react';
import { haversineDistance } from '@/lib/utils/geo';
import type { BusinessLocation } from '@/lib/supabase/profiles';
import { GoogleMap } from '@/components/GoogleMap';

export interface BusinessLocationMapProps {
  locations: BusinessLocation[];
  businessName: string;
}

type GpsState = 'idle' | 'loading' | 'granted' | 'denied';

/**
 * Business location map (Google Maps Embed API). Shows the store marker; once the
 * user shares their location it switches to a driving route + straight-line distance.
 * Palette: black / white / #f97316 only.
 */
export default function BusinessLocationMap({ locations, businessName }: BusinessLocationMapProps) {
  const [gpsState, setGpsState] = useState<GpsState>('idle');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setGpsState('denied'); return; }
    setGpsState('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsState('granted');
      },
      () => setGpsState('denied'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const primary = locations[0];
  if (!primary) return null;

  const query = `${primary.latitude},${primary.longitude}`;
  const straightKm =
    userLocation && gpsState === 'granted'
      ? haversineDistance(primary.latitude, primary.longitude, userLocation.lat, userLocation.lng)
      : null;
  const distanceLabel =
    straightKm == null ? null
      : straightKm < 1 ? `${Math.round(straightKm * 1000)} m away`
      : `${straightKm.toFixed(1)} km away`;

  return (
    <div>
      <GoogleMap
        title={`${businessName} location`}
        query={query}
        origin={gpsState === 'granted' ? userLocation : null}
        className="h-[320px] w-full"
      />

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          {gpsState === 'idle' && (
            <button
              onClick={requestLocation}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#f97316] hover:underline"
            >
              <MapPin className="h-4 w-4" />
              Show distance from me
            </button>
          )}
          {gpsState === 'loading' && (
            <span className="inline-flex items-center gap-2 text-sm text-white/70">
              <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-[#f97316]" />
              Getting your location...
            </span>
          )}
          {gpsState === 'granted' && (
            <span className="text-sm text-white">
              {distanceLabel ? `${distanceLabel} · route on map` : 'Route shown on map'}
            </span>
          )}
          {gpsState === 'denied' && (
            <span className="text-sm text-white/60">Location unavailable — showing store location only.</span>
          )}
        </div>
        {locations.length > 1 && (
          <span className="shrink-0 text-xs text-white/50">Showing primary location</span>
        )}
      </div>
    </div>
  );
}
