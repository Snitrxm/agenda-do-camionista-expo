/**
 * Compensações marcadas manualmente como "Feita" (guardadas no telemóvel;
 * a API não guarda compensações).
 *
 * @module stores/compensationStore
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { ManualCompletion } from '../domain/restTracking';

const STORAGE_KEY = 'compensacoesFeitas';

interface CompensationState {
  /** id da compensação (ação "Pausa 24H") → marcação manual */
  manualCompletions: Record<string, ManualCompletion>;
  load: () => Promise<void>;
  markDone: (compensationId: string) => void;
}

export const useCompensationStore = create<CompensationState>((set, get) => ({
  manualCompletions: {},
  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) set({ manualCompletions: JSON.parse(raw) });
    } catch {}
  },
  markDone: (id) => {
    const manualCompletions = { ...get().manualCompletions, [id]: { date: new Date().toISOString() } };
    set({ manualCompletions });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(manualCompletions)).catch(() => {});
  },
}));
