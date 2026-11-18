/**
 * Navegação para o ecrã de um dia.
 *
 * @module features/day/navigation
 */

import { router } from 'expo-router';
import { DayStruct } from '../../types/models';

/** Separadores do ecrã do dia. */
export type DayTab = 'Form' | 'Actions' | 'Files';

/**
 * Abre o dia. Com `initialTab = 'Actions'` o ecrã abre também logo o
 * formulário "Criar Ação" (dia em curso).
 */
export function openDay(day: DayStruct, initialTab: 'Form' | 'Actions') {
  router.push({ pathname: '/day/[id]', params: { id: day.id, initialTab } });
}
