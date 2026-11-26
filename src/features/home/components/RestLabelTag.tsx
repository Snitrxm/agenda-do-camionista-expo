/**
 * Etiqueta do repouso real nos dias recentes
 * ("Real: 28h00 · compensar 17h", "… contou como normal ✓", "… contou como semanal reduzido", "… incompleto").
 * Sem Partida seguinte não mostra nada.
 */

import React from 'react';
import { getRestLabel, RestLabelKind } from '../../../domain/restTracking';
import { DayActionStruct, DayStruct } from '../../../types/models';
import { Tag } from '../../../ui/primitives';
import { colors, fontSize } from '../../../ui/theme';

const COLORS: Record<RestLabelKind, { fg: string; bg: string }> = {
  compensate: { fg: colors.warningText, bg: colors.warningBg },
  incomplete: { fg: colors.dangerText, bg: colors.dangerBg },
  'counted-as-normal': { fg: colors.restGreen, bg: colors.restGreenBg },
  'weekly-reduced': { fg: colors.warningText, bg: colors.warningBg },
  'weekly-normal': { fg: colors.restGreen, bg: colors.restGreenBg },
  ok: { fg: colors.restGreen, bg: colors.restGreenBg },
};

export function RestLabelTag({ action, days }: { action: DayActionStruct; days: DayStruct[] }) {
  const label = getRestLabel(action, days);
  if (!label) return null;
  const c = COLORS[label.kind];
  return <Tag label={label.text} color={c.fg} background={c.bg} radius={10} size={fontSize.caption} />;
}
