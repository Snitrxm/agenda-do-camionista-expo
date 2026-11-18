/** Rota "/create-action?dayId=…" (modal). */

import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { CreateActionScreen } from '../features/actions/CreateActionScreen';

export default function CreateActionRoute() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  return <CreateActionScreen dayId={dayId} />;
}
