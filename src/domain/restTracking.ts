/**
 * Repouso real e compensação do repouso semanal reduzido.
 *
 * Regras:
 * - **Repouso real** = Partida seguinte − hora em que o repouso foi registado.
 *   Enquanto não houver Partida seguinte, conta até agora.
 * - **Repouso semanal 24H** gera uma compensação de `45h − repouso real`
 *   (21h provisórias enquanto não houver Partida seguinte). Com 45h ou mais
 *   de repouso real não há compensação ("contou como normal").
 * - **Pagamento automático**: um repouso real posterior, dentro do prazo,
 *   paga a compensação se for ≥ 9h + X (diário) ou ≥ 45h + X (semanal).
 *   Com várias pendentes paga primeiro a de prazo mais curto; cada repouso
 *   paga no máximo uma.
 * - **Prazo**: fim da 3.ª semana a seguir à semana do repouso reduzido.
 * - Repouso real abaixo do registado (9H, 11H, 24H, 45H) → "incompleto".
 *
 * Tempos em milissegundos (ms) desde a época.
 *
 * @module domain/restTracking
 */

import { dateLocale, strings } from '../i18n';
import { addDays, formatDate, fromWall, partsInTz } from '../lib/timezone';
import { DayActionStruct, DayStruct } from '../types/models';
import { REST_REGISTERED_HOURS, REST_TOTAL_HOURS, WEEKLY_RESTS } from './actionTypes';

const H = 3600 * 1000;

const ts = (iso: string): number | null => {
  const v = Date.parse(iso);
  return isNaN(v) ? null : v;
};

/** Um repouso registado e a sua duração real. */
export interface RestPeriod {
  action: DayActionStruct;
  /** hora do registo do repouso */
  start: number;
  /** Partida seguinte, ou `null` se ainda não houve */
  end: number | null;
  /** repouso real (até agora, se ainda não houve Partida) */
  realMs: number;
  weekly: boolean;
}

function allActions(days: DayStruct[]): DayActionStruct[] {
  return days.flatMap((d) => d.actions ?? []);
}

function sortedDepartures(days: DayStruct[]): number[] {
  return allActions(days)
    .filter((a) => a.action === 'Partida')
    .map((a) => ts(a.date))
    .filter((v): v is number => v != null)
    .sort((a, b) => a - b);
}

/** Repouso real de uma ação de repouso; `null` se a data for inválida. */
export function getRestPeriod(action: DayActionStruct, days: DayStruct[], now: number = Date.now()): RestPeriod | null {
  const start = ts(action.date);
  if (start == null) return null;
  const end = sortedDepartures(days).find((p) => p > start) ?? null;
  return {
    action,
    start,
    end,
    realMs: Math.max(0, (end ?? now) - start),
    weekly: WEEKLY_RESTS.has(action.action),
  };
}

/** Todos os repousos diários e semanais, por ordem cronológica. */
export function listRestPeriods(days: DayStruct[], now: number = Date.now()): RestPeriod[] {
  return allActions(days)
    .filter((a) => a.action in REST_REGISTERED_HOURS)
    .map((a) => getRestPeriod(a, days, now))
    .filter((r): r is RestPeriod => r != null)
    .sort((a, b) => a.start - b.start);
}

// ---------------------------------------------------------------------------
// Formatação
// ---------------------------------------------------------------------------

/** Duração como "28h00". */
export function formatHoursMinutes(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  return `${Math.floor(totalMin / 60)}h${String(totalMin % 60).padStart(2, '0')}`;
}

/** Duração arredondada ao minuto, sem ":00" ("17h", "16h30"). */
export function formatHoursCompact(ms: number): string {
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

/** "sexta 20/11 16:00" */
export function formatDayTime(ms: number, tz: string): string {
  return formatDate(new Date(ms), 'EEE dd/MM HH:mm', tz, dateLocale('pt_PT'));
}

/** "20/11" */
export function formatDayMonth(ms: number, tz: string): string {
  return formatDate(new Date(ms), 'dd/MM', tz, dateLocale('pt_PT'));
}

// ---------------------------------------------------------------------------
// Etiqueta "Real: …" nos dias recentes
// ---------------------------------------------------------------------------

/**
 * - `compensate`: 24H com repouso real entre 24h e 45h (laranja)
 * - `counted-as-normal`: 24H com 45h ou mais (verde)
 * - `incomplete`: repouso real abaixo do registado (vermelho)
 * - `ok`: repouso cumprido (verde)
 */
export type RestLabelKind = 'compensate' | 'counted-as-normal' | 'incomplete' | 'ok';

export interface RestLabel {
  kind: RestLabelKind;
  text: string;
}

/** Etiqueta do repouso real. `null` se não for um repouso ou ainda não houver Partida seguinte. */
export function getRestLabel(action: DayActionStruct, days: DayStruct[]): RestLabel | null {
  const registered = REST_REGISTERED_HOURS[action.action];
  if (registered == null) return null;
  const period = getRestPeriod(action, days);
  if (!period || period.end == null) return null;
  const t = strings().domain.restLabel;
  const real = t.real(formatHoursMinutes(period.realMs));

  if (action.action === 'Pausa 24H') {
    if (period.realMs >= 45 * H) return { kind: 'counted-as-normal', text: t.countedAsNormal(real) };
    if (period.realMs < 24 * H) return { kind: 'incomplete', text: t.incomplete(real) };
    return { kind: 'compensate', text: t.compensate(real, formatHoursCompact(45 * H - period.realMs)) };
  }
  if (period.realMs < registered * H) return { kind: 'incomplete', text: t.incomplete(real) };
  return { kind: 'ok', text: t.ok(real) };
}

// ---------------------------------------------------------------------------
// Compensações
// ---------------------------------------------------------------------------

/** Prazo da compensação: segunda-feira 00:00 a seguir à 3.ª semana após a semana do repouso. */
export function compensationDeadline(restStart: number, tz: string): number {
  const p = partsInTz(new Date(restStart), tz);
  const daysFromMonday = p.weekday === 1 ? 6 : p.weekday - 2;
  const monday = addDays(fromWall(p.year, p.month, p.day, 0, 0, 0, tz), -daysFromMonday, tz);
  return addDays(monday, 4 * 7, tz).getTime();
}

/** Marcação manual "Feita" (guardada no telemóvel). */
export interface ManualCompletion {
  /** ISO da hora em que foi marcada */
  date: string;
}

export interface Compensation {
  /** id da ação "Pausa 24H" que originou a compensação */
  id: string;
  rest: RestPeriod;
  /** horas a compensar (ms) */
  amountMs: number;
  /** repouso ainda em curso → 21h provisórias */
  provisional: boolean;
  /** limite para compensar (ms) */
  deadline: number;
  done: boolean;
  doneAt: number | null;
  /** repouso que pagou a compensação (`null` se manual ou pendente) */
  paidBy: RestPeriod | null;
  markedManually: boolean;
}

/**
 * Todas as compensações (pendentes e feitas), já com o pagamento automático aplicado.
 *
 * @param manual mapa id da compensação → marcação manual "Feita"
 */
export function buildCompensations(
  days: DayStruct[],
  tz: string,
  manual: Record<string, ManualCompletion> = {},
  now: number = Date.now()
): Compensation[] {
  const rests = listRestPeriods(days, now);

  const comps: Compensation[] = rests
    .filter((r) => r.action.action === 'Pausa 24H')
    .filter((r) => r.end == null || r.realMs < 45 * H)
    .map((r) => {
      const provisional = r.end == null;
      const m = manual[r.action.id];
      return {
        id: r.action.id,
        rest: r,
        amountMs: provisional ? 21 * H : 45 * H - r.realMs,
        provisional,
        deadline: compensationDeadline(r.start, tz),
        done: !!m,
        doneAt: m ? ts(m.date) : null,
        paidBy: null,
        markedManually: !!m,
      };
    });

  // Repousos já terminados, por ordem; cada um paga no máximo uma compensação.
  for (const r of rests) {
    if (r.end == null) continue;
    const base = r.weekly ? 45 * H : 9 * H;
    const candidates = comps
      .filter((c) => !c.done && !c.provisional)
      .filter((c) => c.rest.end != null && r.start >= c.rest.end) // repouso posterior
      .filter((c) => r.start <= c.deadline) // dentro do prazo
      .filter((c) => r.realMs >= base + c.amountMs)
      .sort((a, b) => a.deadline - b.deadline);
    const c = candidates[0];
    if (c) {
      c.done = true;
      c.doneAt = r.end;
      c.paidBy = r;
    }
  }

  return comps;
}

/** Compensações a mostrar: pendentes + feitas há menos de 2 dias. */
export function visibleCompensations(comps: Compensation[], now: number = Date.now()): Compensation[] {
  return comps.filter((c) => !c.done || (c.doneAt != null && now - c.doneAt < 2 * 24 * H));
}

// ---------------------------------------------------------------------------
// Repouso em curso
// ---------------------------------------------------------------------------

/** Última ação já registada (até `now`), com a sua hora. */
function lastAction(days: DayStruct[], now: number): { a: DayActionStruct; ts: number } | undefined {
  const actions = allActions(days)
    .map((a) => ({ a, ts: ts(a.date) }))
    .filter((x): x is { a: DayActionStruct; ts: number } => x.ts != null && x.ts <= now)
    .sort((x, y) => x.ts - y.ts);
  return actions[actions.length - 1];
}

/** Repouso semanal em curso: a última ação é um repouso semanal (sem Partida depois). */
export function ongoingWeeklyRest(days: DayStruct[], now: number = Date.now()): RestPeriod | null {
  const last = lastAction(days, now);
  if (!last || !WEEKLY_RESTS.has(last.a.action)) return null;
  return getRestPeriod(last.a, days, now);
}

export interface OngoingRest {
  action: DayActionStruct;
  start: number;
  /** hora a que pode sair */
  end: number;
  weekly: boolean;
}

/** Qualquer repouso em curso (3H+, 9H, 11H, semanais): a última ação é esse repouso. */
export function ongoingRest(days: DayStruct[], now: number = Date.now()): OngoingRest | null {
  const last = lastAction(days, now);
  if (!last) return null;
  const hours = REST_TOTAL_HOURS[last.a.action];
  if (hours == null) return null;
  return { action: last.a, start: last.ts, end: last.ts + hours * H, weekly: WEEKLY_RESTS.has(last.a.action) };
}
