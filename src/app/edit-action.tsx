/** Rota "/edit-action?dayId=…&actionId=…" (modal). */

import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { EditActionScreen } from '../features/actions/EditActionScreen';

export default function EditActionRoute() {
  const { dayId, actionId } = useLocalSearchParams<{ dayId: string; actionId: string }>();
  return <EditActionScreen dayId={dayId} actionId={actionId} />;
}
