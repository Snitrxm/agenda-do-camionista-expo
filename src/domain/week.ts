/**
 * Visão da semana no Início: contadores semanais, dia em curso, prazo do
 * repouso semanal, avisos e pesquisa de dias.
 *
 * Todas as funções são puras; o fuso horário é passado por parâmetro.
 *
 * @module domain/week
 */

import { dateLocale, strings } from '../i18n';
import { formatAppDate, parseISO } from '../lib/dateFormat';
import { addDays, dayOrdinal, formatDate, isToday, partsInTz, startOfDay } from '../lib/timezone';
import { DayActionStruct, DayStruct } from '../types/models';
import { actionDisplayName, WEEKLY_RESTS, weeklyRestHours } from './actionTypes';
import { isDayOpen } from './days';
import { isFractionedNineHourRest } from './fractionedRest';

const H = 3600 * 1000;

/** Contadores do cartão "ESTA SEMANA". */
export interface WeekCounters {
  /** Dias com Repouso 9H não fracionado (reduzidas). Máximo legal: 3. */
  reducedRests: number;
  /** Dias com Repouso 11H. */
  normalRests: number;
  /** Dias desta semana com 9h01 ou mais de condução ("10H"). Máximo: 2. */
  extendedDrivingDays: number;
}

export const EMPTY_WEEK_COUNTERS: WeekCounters = { reducedRests: 0, normalRests: 0, extendedDrivingDays: 0 };

/** Segunda-feira 00:00 desta semana e a segunda-feira seguinte, no fuso `tz`. */
function currentWeekRange(tz: string): [Date, Date] {
  const startOfToday = startOfDay(new Date(), tz);
  const weekday = partsInTz(startOfToday, tz).weekday;
  const daysFromMonday = weekday === 1 ? 6 : weekday - 2;
  const monday = addDays(startOfToday, -daysFromMonday, tz);
  return [monday, addDays(monday, 7, tz)];
}

function daysCreatedThisWeek(days: DayStruct[], tz: string): DayStruct[] {
  const [monday, nextMonday] = currentWeekRange(tz);
  return days.filter((day) => {
    const date = parseISO(day.createdAt);
    return !!date && date >= monday && date < nextMonday;
  });
}

function actionsThisWeek(days: DayStruct[], tz: string): DayActionStruct[] {
  const [monday, nextMonday] = currentWeekRange(tz);
  return days
    .flatMap((d) => d.actions ?? [])
    .filter((a) => {
      const date = parseISO(a.date);
      return !!date && date >= monday && date < nextMonday;
    });
}

function maxDate(dates: (Date | null | undefined)[]): Date | null {
  let m: Date | null = null;
  for (const d of dates) if (d && (!m || d > m)) m = d;
  return m;
}

/**
 * Calcula os contadores semanais.
 *
 * A "semana" dos contadores de repouso começa no mais recente entre:
 * - o último dia marcado como início da semana;
 * - o fim do último repouso semanal (24H / 45H / 45H+21H…).
 * Assim, terminado um repouso semanal, as reduzidas e os 11H voltam a 0.
 *
 * @returns `null` quando não há nenhuma ação na semana de calendário atual
 *          (nesse caso o Início mantém os contadores anteriores).
 */
export function computeWeekCounters(days: DayStruct[], tz: string): WeekCounters | null {
  if (actionsThisWeek(days, tz).length === 0) return null;

  const lastWeekStartDate = maxDate(days.filter((d) => d.weekStart).map((d) => parseISO(d.date)));
  const endOfLastWeeklyRest = maxDate(
    days
      .flatMap((d) => d.actions ?? [])
      .filter((a) => WEEKLY_RESTS.has(a.action))
      .map((a) => {
        const date = parseISO(a.date);
        return date ? new Date(date.getTime() + weeklyRestHours(a.action) * H) : null;
      })
  );
  const effectiveStart = maxDate([lastWeekStartDate, endOfLastWeeklyRest]);

  const actionsSinceStart = effectiveStart
    ? days
        .flatMap((d) => d.actions ?? [])
        .filter((a) => {
          const date = parseISO(a.date);
          return !!date && date >= effectiveStart;
        })
    : [];

  const distinctDays = (actions: DayActionStruct[]) =>
    new Set(
      actions
        .map((a) => parseISO(a.date))
        .filter((d): d is Date => !!d)
        .map((d) => dayOrdinal(d, tz))
    ).size;

  const reduced = actionsSinceStart
    .filter((a) => a.action === 'Pausa 9H')
    .filter((rest) => {
      const sameDayActions = days.find((d) => d.id === rest.dayId)?.actions ?? [];
      return !isFractionedNineHourRest(rest, sameDayActions);
    });
  const normal = actionsSinceStart.filter((a) => a.action === 'Pausa 11H');

  return {
    reducedRests: distinctDays(reduced),
    normalRests: distinctDays(normal),
    extendedDrivingDays: daysCreatedThisWeek(days, tz).filter((d) => (d.drivingMinutes ?? 0) >= 541).length,
  };
}

/** Dia de hoje (no fuso `tz`) que está em aberto — o "dia em curso". */
export function findDayInProgress(days: DayStruct[], tz: string): DayStruct | undefined {
  return days.find((day) => {
    if (!isDayOpen(day)) return false;
    const date = parseISO(day.date);
    return !!date && isToday(date, tz);
  });
}

/**
 * Prazo para começar o repouso semanal: Partida do último dia marcado como
 * início da semana + 6 dias (144h). `null` se não houver esse dia/Partida.
 */
export function weeklyRestDeadline(days: DayStruct[]): Date | null {
  // Último dia com início da semana (em empate, o primeiro — como max(by:) do Swift).
  let lastWeekStartDay: DayStruct | undefined;
  let best = -Infinity;
  for (const d of days.filter((x) => x.weekStart)) {
    const t = parseISO(d.date)?.getTime() ?? -Infinity;
    if (lastWeekStartDay === undefined || t > best) {
      best = t;
      lastWeekStartDay = d;
    }
  }
  const departure = lastWeekStartDay?.actions?.find((a) => a.action === 'Partida');
  const departureDate = departure ? parseISO(departure.date) : null;
  if (!departureDate) return null;
  return new Date(departureDate.getTime() + (7 * 24 - 24) * H);
}

// ---------------------------------------------------------------------------
// Avisos
// ---------------------------------------------------------------------------

/** 0 = urgente (vermelho), 1 = aviso (laranja), 2 = informação (azul). */
export type WarningSeverity = 0 | 1 | 2;

export interface Warning {
  id: string;
  title: string;
  explanation: string;
  severity: WarningSeverity;
}

/** Avisos da cápsula do Início, ordenados por gravidade (mais grave primeiro). */
export function buildWarnings(days: DayStruct[], counters: WeekCounters, tz: string): Warning[] {
  const t = strings().domain.warnings;
  const out: Warning[] = [];
  const remainingReduced = Math.max(0, 3 - counters.reducedRests);
  const remainingExtended = Math.max(0, 2 - counters.extendedDrivingDays);

  if (counters.reducedRests >= 3) {
    out.push({
      id: 'reduzidas-0',
      title: t.reducedUsedTitle,
      explanation: t.reducedUsedText,
      severity: 0,
    });
  } else if (remainingReduced === 1) {
    out.push({
      id: 'reduzidas-1',
      title: t.oneReducedLeftTitle,
      explanation: t.oneReducedLeftText,
      severity: 1,
    });
  }

  if (remainingExtended === 1) {
    out.push({
      id: 'conducao-10h',
      title: t.oneExtendedDayLeftTitle,
      explanation: t.oneExtendedDayLeftText,
      severity: 1,
    });
  }

  const deadline = weeklyRestDeadline(days);
  if (deadline) {
    const hoursLeft = (deadline.getTime() - Date.now()) / H;
    if (hoursLeft <= 24 && hoursLeft >= 0) {
      out.push({
        id: 'repouso-semanal',
        title: t.weeklyRestSoonTitle,
        explanation: t.weeklyRestSoonText(formatDate(deadline, 'EEE dd/MM, HH:mm', tz, dateLocale('pt_PT'))),
        severity: 0,
      });
    }
  }

  // ordenação estável por gravidade
  return out
    .map((w, i) => ({ w, i }))
    .sort((x, y) => x.w.severity - y.w.severity || x.i - y.i)
    .map((x) => x.w);
}

// ---------------------------------------------------------------------------
// Pesquisa
// ---------------------------------------------------------------------------

/** Texto pesquisável de um dia: datas, matrículas, notas e ações. */
function searchText(day: DayStruct, tz: string): string {
  const parts: string[] = [];
  const date = parseISO(day.date);
  if (date) {
    for (const f of ['dd/MM/yyyy', "dd 'de' MMMM yyyy", 'EEEE, dd MMMM yyyy', 'MMMM yyyy', 'dd MMM']) {
      parts.push(formatDate(date, f, tz, dateLocale('pt_PT')));
    }
  }
  parts.push(formatAppDate(day.date));
  if (day.truckPlate) parts.push(day.truckPlate);
  if (day.trailerPlate) parts.push(day.trailerPlate);
  if (day.observations) parts.push(day.observations);
  for (const a of day.actions ?? []) {
    parts.push(a.action, actionDisplayName(a.action), a.local);
    if (a.cliente) parts.push(a.cliente);
    if (a.empresaLocal) parts.push(a.empresaLocal);
    if (a.posto) parts.push(a.posto);
    if (a.additionalInformations) parts.push(a.additionalInformations);
  }
  return parts.join(' | ');
}

const normalize = (s: string) => s.normalize('NFD').toLocaleLowerCase('pt');

/**
 * Filtra os dias pela pesquisa. Várias palavras separadas por espaço têm
 * TODAS de aparecer (E lógico); maiúsculas/minúsculas são ignoradas.
 */
export function searchDays(days: DayStruct[], query: string, tz: string): DayStruct[] {
  const q = query.trim();
  if (!q) return days;
  const terms = q.split(' ').filter((t) => t.length > 0).map(normalize);
  return days.filter((day) => {
    const haystack = normalize(searchText(day, tz));
    return terms.every((t) => haystack.includes(t));
  });
}
