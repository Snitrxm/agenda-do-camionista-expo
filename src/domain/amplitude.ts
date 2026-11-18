/**
 * Amplitude do dia e regra das 3 reduzidas.
 *
 * - **Reduzidas** = dias com Repouso 9H NÃO fracionado desde o início da
 *   semana efetivo (o mais recente entre o último dia marcado como início da
 *   semana e o fim do último repouso semanal). Depois de um repouso semanal
 *   voltam a 0. Só contam as anteriores à Partida do dia.
 * - Limite normal do dia: Partida + 15h.
 * - Com 3 reduzidas usadas:
 *   - sem Repouso 3H+ no dia → limite Partida + 13h e Repouso 9H indisponível;
 *   - com Repouso 3H+ (fracionado 3+9) → limite 15h e Repouso 9H permitido.
 *
 * @module domain/amplitude
 */

import { strings } from '../i18n';
import { dayOrdinal } from '../lib/timezone';
import { DayStruct } from '../types/models';
import { WEEKLY_RESTS, weeklyRestHours } from './actionTypes';
import { hasThreeHourRest, isFractionedNineHourRest } from './fractionedRest';

const H = 3600 * 1000;

/** Número máximo de repousos diários reduzidos (9H) entre repousos semanais. */
export const MAX_REDUCED_RESTS = 3;

/** Motivo mostrado quando o Repouso 9H não está disponível. */
export const nineHourRestUnavailableReason = () => strings().domain.nineHourRestUnavailable;

const ts = (iso: string | null | undefined): number | null => {
  if (!iso) return null;
  const v = Date.parse(iso);
  return isNaN(v) ? null : v;
};

/**
 * Início efetivo da semana (ms) até `before`: o mais recente entre os dias
 * marcados como início da semana e o fim dos repousos semanais.
 */
export function effectiveWeekStart(days: DayStruct[], before: number = Date.now()): number | null {
  const weekStarts = days
    .filter((d) => d.weekStart)
    .map((d) => ts(d.date))
    .filter((v): v is number => v != null && v <= before);
  const weeklyRestEnds = days
    .flatMap((d) => d.actions ?? [])
    .filter((a) => WEEKLY_RESTS.has(a.action))
    .map((a) => {
      const s = ts(a.date);
      return s == null ? null : s + weeklyRestHours(a.action) * H;
    })
    .filter((v): v is number => v != null && v <= before);
  const all = [...weekStarts, ...weeklyRestEnds];
  return all.length ? Math.max(...all) : null;
}

/** Reduzidas usadas (dias distintos com Repouso 9H não fracionado) antes de `before`. */
export function countReducedRests(days: DayStruct[], tz: string, before: number = Date.now()): number {
  const start = effectiveWeekStart(days, before);
  if (start == null) return 0;
  const distinctDays = new Set<number>();
  for (const day of days) {
    const actions = day.actions ?? [];
    for (const a of actions) {
      const d = ts(a.date);
      if (a.action !== 'Pausa 9H' || d == null || d < start || d >= before) continue;
      if (isFractionedNineHourRest(a, actions)) continue;
      distinctDays.add(dayOrdinal(new Date(d), tz));
    }
  }
  return distinctDays.size;
}

/** Limite de amplitude de um dia. */
export interface DayLimit {
  /** hora da Partida (ms) */
  departure: number | null;
  /** 13 ou 15 */
  limitHours: number;
  /** Partida + limite (ms); `null` sem Partida */
  limit: number | null;
  /** Partida + 15h, mesmo quando não está disponível (para a mensagem) */
  limit15h: number | null;
  reducedRests: number;
  /** o dia tem um Repouso 3H+ */
  fractioned: boolean;
  /** 3 reduzidas usadas e sem Repouso 3H+ → só 13h e sem Repouso 9H */
  blocked: boolean;
  /** Repouso 9H permitido neste dia */
  canTakeNineHourRest: boolean;
}

/** Calcula o limite de amplitude do dia, aplicando a regra das 3 reduzidas. */
export function getDayLimit(day: DayStruct, days: DayStruct[], tz: string, now: number = Date.now()): DayLimit {
  const actions = day.actions ?? [];
  const departure = ts(actions.find((a) => a.action === 'Partida')?.date);
  const reducedRests = countReducedRests(days, tz, departure ?? now);
  const fractioned = hasThreeHourRest(actions);
  const blocked = reducedRests >= MAX_REDUCED_RESTS && !fractioned;
  const limitHours = blocked ? 13 : 15;
  return {
    departure,
    limitHours,
    limit: departure == null ? null : departure + limitHours * H,
    limit15h: departure == null ? null : departure + 15 * H,
    reducedRests,
    fractioned,
    blocked,
    canTakeNineHourRest: !blocked,
  };
}
