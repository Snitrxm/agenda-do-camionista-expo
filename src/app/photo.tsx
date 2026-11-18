/** Rota "/photo?dayId=…&name=…&url=…" (modal escuro). */

import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { PhotoScreen } from '../features/photo/PhotoScreen';

export default function PhotoRoute() {
  const { dayId, name, url } = useLocalSearchParams<{ dayId: string; name: string; url: string }>();
  return <PhotoScreen dayId={dayId} name={name} url={url} />;
}
