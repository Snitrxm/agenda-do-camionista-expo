/**
 * Repouso diário fracionado "3+9".
 *
 * O repouso diário pode ser dividido num Repouso 3H+ (1.ª parte) seguido de
 * um Repouso 9H (2.ª parte). Nesse caso o 9H NÃO conta como reduzida e a
 * amplitude do dia pode ir até 15h.
 *
 * @module domain/fractionedRest
 */

import { DayActionStruct } from '../types/models';

const ts = (iso: string | null | undefined): number | null => {
  if (!iso) return null;
  const v = Date.parse(iso);
  return isNaN(v) ? null : v;
};

/** Hora da (primeira) Partida do dia, em ms; `null` se não houver. */
function departureTime(dayActions: DayActionStruct[]): number | null {
  return ts(dayActions.find((a) => a.action === 'Partida')?.date);
}

/** `true` se o dia tem um Repouso 3H+ registado depois da Partida. */
export function hasThreeHourRest(dayActions: DayActionStruct[]): boolean {
  const departure = departureTime(dayActions);
  if (departure == null) return false;
  return dayActions.some((a) => {
    const d = ts(a.date);
    return a.action === 'Repouso 3H+' && d != null && d > departure;
  });
}

/**
 * `true` se este Repouso 9H é a 2.ª parte de um fracionado: existe um
 * Repouso 3H+ depois da Partida do dia e antes deste 9H.
 */
export function isFractionedNineHourRest(rest: DayActionStruct, dayActions: DayActionStruct[]): boolean {
  if (rest.action !== 'Pausa 9H') return false;
  const restTime = ts(rest.date);
  const departure = departureTime(dayActions);
  if (restTime == null || departure == null) return false;
  return dayActions.some((a) => {
    const d = ts(a.date);
    return a.action === 'Repouso 3H+' && d != null && d > departure && d < restTime;
  });
}
