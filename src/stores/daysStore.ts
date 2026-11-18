/**
 * Estado global dos dias de trabalho (fonte única de verdade da app).
 *
 * Todos os ecrãs leem os dias daqui; qualquer alteração (editar o dia,
 * criar/editar/apagar ações) passa por `updateDay`, que também recalcula os
 * contadores semanais e grava a cache local.
 *
 * @module stores/daysStore
 */

import { Alert, LayoutAnimation } from 'react-native';
import { create } from 'zustand';
import * as daysApi from '../api/days';
import { getErrorMessage } from '../api/client';
import { strings } from '../i18n';
import { computeWeekCounters, EMPTY_WEEK_COUNTERS, WeekCounters } from '../domain/week';
import { nowISO8601 } from '../lib/dateFormat';
import { loadDaysCache, mergeWithCache, saveDaysCache } from '../storage/daysCache';
import { DayActionStruct, DayStruct, DrivingHoursResponse } from '../types/models';
import { currentTimeZoneId } from './settingsStore';

const showError = (message: string) => Alert.alert(strings().common.errorTitle, message);

interface DaysState {
  days: DayStruct[];
  /** A carregar e ainda sem dias para mostrar. */
  isLoading: boolean;
  isCreatingDay: boolean;
  /** Texto da pesquisa do Início. */
  searchQuery: string;
  weekCounters: WeekCounters;
  drivingHours: DrivingHoursResponse | null;

  /** Mostra logo os dias da cache local (antes da resposta do backend). */
  hydrateFromCache: () => void;
  setSearchQuery: (query: string) => void;
  /** Substitui um dia (pelo id), recalcula os contadores e grava a cache. */
  updateDay: (day: DayStruct) => void;
  /** Acrescenta uma ação a um dia. */
  addAction: (dayId: string, action: DayActionStruct) => void;
  /** Substitui uma ação (pelo id) num dia. */
  replaceAction: (dayId: string, action: DayActionStruct) => void;
  /** Remove uma ação de um dia. */
  removeAction: (dayId: string, actionId: string) => void;
  /** Recalcula os contadores semanais (mantém os anteriores se não houver ações esta semana). */
  refreshWeekCounters: (days: DayStruct[]) => void;
  /** Vai buscar os dias ao backend e junta-os com a cache. */
  loadDays: () => void;
  loadDrivingHours: () => void;
  /** Cria um dia "agora"; devolve-o, ou `null` em caso de erro (já mostrado). */
  createDay: () => Promise<DayStruct | null>;
  deleteDay: (day: DayStruct) => void;
}

export const useDaysStore = create<DaysState>((set, get) => ({
  days: [],
  isLoading: false,
  isCreatingDay: false,
  searchQuery: '',
  weekCounters: EMPTY_WEEK_COUNTERS,
  drivingHours: null,

  hydrateFromCache: () => {
    const cached = loadDaysCache();
    if (cached.length > 0) {
      set({ days: cached });
      get().refreshWeekCounters(cached);
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  updateDay: (updated) => {
    const days = get().days;
    const idx = days.findIndex((d) => d.id === updated.id);
    if (idx < 0) return;
    const next = [...days];
    next[idx] = updated;
    set({ days: next });
    get().refreshWeekCounters(next);
    saveDaysCache(next);
  },

  addAction: (dayId, action) => {
    const day = get().days.find((d) => d.id === dayId);
    if (day) get().updateDay({ ...day, actions: [...(day.actions ?? []), action] });
  },

  replaceAction: (dayId, action) => {
    const day = get().days.find((d) => d.id === dayId);
    if (day) get().updateDay({ ...day, actions: (day.actions ?? []).map((a) => (a.id === action.id ? action : a)) });
  },

  removeAction: (dayId, actionId) => {
    const day = get().days.find((d) => d.id === dayId);
    if (day) get().updateDay({ ...day, actions: (day.actions ?? []).filter((a) => a.id !== actionId) });
  },

  refreshWeekCounters: (days) => {
    const counters = computeWeekCounters(days, currentTimeZoneId());
    if (counters) set({ weekCounters: counters });
  },

  loadDays: () => {
    // Com cache já carregada não mostramos o spinner.
    set({ isLoading: get().days.length === 0 });
    daysApi
      .fetchDays()
      .then((remote) => {
        const cache = loadDaysCache();
        const merged = mergeWithCache(remote, cache.length === 0 ? get().days : cache);
        set({ isLoading: false, days: merged });
        get().refreshWeekCounters(merged);
        saveDaysCache(merged);
      })
      .catch((error) => {
        set({ isLoading: false });
        // Sem rede mas com cache: continua a mostrar a cache, sem erro.
        if (get().days.length === 0) showError(getErrorMessage(error));
      });
  },

  loadDrivingHours: () => {
    daysApi
      .fetchDrivingHours()
      .then((response) => set({ drivingHours: response }))
      .catch((e) => console.log(e));
  },

  createDay: async () => {
    set({ isCreatingDay: true });
    try {
      const newDay = await daysApi.createDay({ date: nowISO8601() });
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const days = [newDay, ...get().days];
      set({ isCreatingDay: false, days });
      saveDaysCache(days);
      return newDay;
    } catch (error) {
      set({ isCreatingDay: false });
      showError(getErrorMessage(error));
      return null;
    }
  },

  deleteDay: (day) => {
    daysApi
      .deleteDay(day.id)
      .then(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const days = get().days.filter((d) => d.id !== day.id);
        set({ days });
        saveDaysCache(days);
      })
      .catch((error) => showError(getErrorMessage(error)));
  },
}));
