/** Rota "/day/:id?initialTab=Form|Actions|Files" — ecrã de um dia. */

import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { DayScreen } from '../../features/day/DayScreen';

export default function DayRoute() {
  const { id, initialTab } = useLocalSearchParams<{ id: string; initialTab?: string }>();
  const tab = initialTab === 'Actions' ? 'Actions' : initialTab === 'Files' ? 'Files' : 'Form';
  return <DayScreen dayId={id} initialTab={tab} />;
}
