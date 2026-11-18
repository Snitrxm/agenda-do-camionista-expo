/**
 * Regras e cálculos sobre um dia de trabalho (`DayStruct`).
 *
 * @module domain/days
 */

import { strings } from '../i18n';
import { formatAppDate, parseISO } from '../lib/dateFormat';
import { DayActionStruct, DayStruct } from '../types/models';
import { BREAK_MINUTES, DAY_ENDING_RESTS } from './actionTypes';

/** Primeira ação "Partida" do dia. */
export function findDeparture(day: DayStruct): DayActionStruct | undefined {
  return day.actions?.find((a) => a.action === 'Partida');
}

/**
 * Dia "em aberto": tem Partida e ainda não tem Chegada nem repouso de fecho
 * (9H/11H/24H/45H…). Estes dias abrem diretamente no separador Ações.
 */
export function isDayOpen(day: DayStruct): boolean {
  const actions = day.actions ?? [];
  const hasDeparture = actions.some((a) => a.action === 'Partida');
  const hasArrival = actions.some((a) => a.action === 'Chegada');
  const hasEndingRest = actions.some((a) => DAY_ENDING_RESTS.has(a.action));
  return hasDeparture && !hasArrival && !hasEndingRest;
}

/**
 * Último repouso de fecho do dia (o mais tardio; em empate, o primeiro).
 * É usado como "Chegada" no trajeto do dia.
 */
export function lastEndingRest(actions: DayActionStruct[]): DayActionStruct | undefined {
  let best: DayActionStruct | undefined;
  let bestTime = -Infinity;
  for (const a of actions.filter((x) => DAY_ENDING_RESTS.has(x.action))) {
    const t = parseISO(a.date)?.getTime() ?? -Infinity;
    if (!best || t > bestTime) {
      best = a;
      bestTime = t;
    }
  }
  return best;
}

/**
 * Texto da hora a que uma pausa/repouso termina ("17/11/26 às 19:00").
 *
 * @param startISO hora em que a pausa começou; sem ela usa-se "agora"
 */
export function breakEndText(action: string, startISO?: string | null): string {
  let result = (startISO ? parseISO(startISO) : null) ?? new Date();
  const mins = BREAK_MINUTES[action];
  if (mins) result = new Date(result.getTime() + mins * 60000);
  return formatAppDate(result, strings().dates.dateTimeAt);
}

/** Quilómetros percorridos (chegada − partida). */
export function totalKm(departureKm: number, arriveKm: number): number {
  return arriveKm - departureKm;
}

/**
 * Hora limite de amplitude (Partida + 13h ou + 15h), formatada,
 * ou uma mensagem a pedir a Partida.
 */
export function amplitudeLimitText(day: DayStruct, hours: 13 | 15): string {
  const departure = findDeparture(day);
  const departureDate = departure ? parseISO(departure.date) : null;
  if (!departureDate) return strings().domain.amplitudeNeedsDeparture;
  return formatAppDate(new Date(departureDate.getTime() + hours * 3600000), strings().dates.dateTimeAt);
}

/** Minutos → "2h 15m" / "2h" / "15m" / "0m". */
export function formatDuration(minutes: number): string {
  const hours = Math.trunc(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0 && remainingMinutes > 0) return `${hours}h ${remainingMinutes}m`;
  if (hours > 0) return `${hours}h`;
  if (remainingMinutes > 0) return `${remainingMinutes}m`;
  return '0m';
}

/** Só a cidade de um local "Cidade - País" ("Viana do Castelo - Portugal" → "Viana do Castelo"). */
export function cityOnly(local: string): string {
  const idx = local.indexOf(' - ');
  return (idx >= 0 ? local.slice(0, idx) : local).trim();
}

/**
 * Última pausa ou repouso do dia (qualquer "Pausa …" ou "Repouso 3H+"),
 * pela hora registada; em empate fica a que foi registada depois.
 */
export function latestBreak(actions: DayActionStruct[]): DayActionStruct | undefined {
  const breaks = actions
    .filter((a) => a.action.includes('Pausa') || a.action === 'Repouso 3H+')
    .map((a, i) => ({ a, i }))
    .sort((x, y) => (parseISO(x.a.date)?.getTime() ?? -Infinity) - (parseISO(y.a.date)?.getTime() ?? -Infinity) || x.i - y.i)
    .map((x) => x.a);
  return breaks[breaks.length - 1];
}
