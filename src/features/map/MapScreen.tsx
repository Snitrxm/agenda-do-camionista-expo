/**
 * Mapa do dia: um marcador por ação com coordenadas e uma linha a ligá-las
 * pela ordem registada.
 */

import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { actionTitle } from '../../domain/actionTypes';
import { useStrings } from '../../hooks/useStrings';
import { colors } from '../../ui/theme';
import { useDaysStore } from '../../stores/daysStore';

export function MapScreen({ dayId }: { dayId: string }) {
  useStrings(); // volta a desenhar os marcadores ao mudar de idioma
  const day = useDaysStore((s) => s.days.find((d) => d.id === dayId));
  const mapRef = useRef<MapView>(null);

  const points = (day?.actions ?? [])
    .map((a) => {
      const lat = a.latitude != null ? Number(a.latitude) : NaN;
      const lon = a.longitude != null ? Number(a.longitude) : NaN;
      return isFinite(lat) && isFinite(lon) && a.latitude !== '' && a.longitude !== ''
        ? { action: a, coordinate: { latitude: lat, longitude: lon } }
        : null;
    })
    .filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      onMapReady={() => {
        if (points.length > 0) {
          mapRef.current?.fitToCoordinates(
            points.map((p) => p.coordinate),
            { edgePadding: { top: 80, right: 60, bottom: 80, left: 60 }, animated: false }
          );
        }
      }}
    >
      {points.map((p) => (
        <Marker key={p.action.id} coordinate={p.coordinate} title={actionTitle(p.action.action)} />
      ))}
      {points.length >= 2 && (
        <Polyline coordinates={points.map((p) => p.coordinate)} strokeColor={colors.blue} strokeWidth={4} />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
