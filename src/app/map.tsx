/** Rota "/map?dayId=…" (folha a ecrã inteiro). */

import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { MapScreen } from '../features/map/MapScreen';

export default function MapRoute() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  return <MapScreen dayId={dayId} />;
}
