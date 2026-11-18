/**
 * Localização atual com cidade e país (geocodificação inversa).
 *
 * Pede permissão de localização, segue a posição enquanto o ecrã está
 * aberto e, a cada nova posição, atualiza cidade/país (uma de cada vez).
 * `onPlaceChange` é chamado sempre que cidade/país são recalculados.
 */

import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

export function useLocationWatcher(onPlaceChange?: (city: string | null, country: string | null) => void) {
  const onPlaceChangeRef = useRef(onPlaceChange);
  useEffect(() => {
    onPlaceChangeRef.current = onPlaceChange;
  });
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;
    let geocoding = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Highest, distanceInterval: 0 },
        async (loc) => {
          setLocation(loc);
          if (geocoding) return;
          geocoding = true;
          try {
            const [place] = await Location.reverseGeocodeAsync({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
            if (!cancelled && place) {
              setCity(place.city ?? null);
              setCountry(place.country ?? null);
              onPlaceChangeRef.current?.(place.city ?? null, place.country ?? null);
            }
          } catch (e) {
            console.log('Erro ao fazer geocodificação reversa:', e);
          } finally {
            geocoding = false;
          }
        }
      );
      if (cancelled) subscription.remove();
    })().catch((e) => console.log('Erro ao obter a localização:', e));
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return { location, city, country };
}
