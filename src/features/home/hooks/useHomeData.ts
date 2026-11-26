/**
 * Dados do Início: carrega os dias e as horas de condução ao abrir e
 * deriva tudo o que os cartões mostram (pesquisa, avisos, dia em curso,
 * repouso semanal, compensações).
 */

import { useEffect, useMemo } from 'react';
import { buildCompensations, ongoingDailyRestPast24h, ongoingWeeklyRest, visibleCompensations } from '../../../domain/restTracking';
import { buildWarnings, findDayInProgress, searchDays } from '../../../domain/week';
import { useNow } from '../../../hooks/useNow';
import { useCompensationStore } from '../../../stores/compensationStore';
import { useDaysStore } from '../../../stores/daysStore';
import { timeZoneId, useSettingsStore } from '../../../stores/settingsStore';

export function useHomeData() {
  const days = useDaysStore((s) => s.days);
  const isLoading = useDaysStore((s) => s.isLoading);
  const isCreatingDay = useDaysStore((s) => s.isCreatingDay);
  const searchQuery = useDaysStore((s) => s.searchQuery);
  const weekCounters = useDaysStore((s) => s.weekCounters);
  const drivingHours = useDaysStore((s) => s.drivingHours);
  const manualCompletions = useCompensationStore((s) => s.manualCompletions);
  const tz = timeZoneId(useSettingsStore((s) => s.timeZone));
  const now = useNow(30000);
  const nowMs = now.getTime();

  useEffect(() => {
    useDaysStore.getState().loadDays();
    useDaysStore.getState().loadDrivingHours();
    useCompensationStore.getState().load();
  }, []);

  const filteredDays = useMemo(() => searchDays(days, searchQuery, tz), [days, searchQuery, tz]);
  const weeklyRest = useMemo(() => ongoingWeeklyRest(days, nowMs), [days, nowMs]);
  // Repouso diário que já passou das 24h: vai contar como semanal se sair agora.
  const dailyRestPast24h = useMemo(() => (weeklyRest ? null : ongoingDailyRestPast24h(days, nowMs)), [weeklyRest, days, nowMs]);
  const compensations = useMemo(
    // As provisórias (repouso em curso) já aparecem no cartão do repouso semanal.
    () => visibleCompensations(buildCompensations(days, tz, manualCompletions, nowMs), nowMs).filter((c) => !c.provisional),
    [days, tz, manualCompletions, nowMs]
  );

  return {
    days,
    filteredDays,
    isLoading,
    isCreatingDay,
    searchQuery,
    weekCounters,
    drivingHours,
    warnings: buildWarnings(days, weekCounters, tz, compensations, nowMs),
    dayInProgress: findDayInProgress(days, tz),
    weeklyRest,
    dailyRestPast24h,
    compensations,
    now,
    tz,
  };
}
