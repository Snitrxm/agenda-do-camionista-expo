/// <reference types="node" />
// Repouso diário (9H/11H) que afinal foi semanal (24h ou mais até à Partida).
// Correr: npm test

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { countReducedRests } from '../src/domain/amplitude';
import {
  buildCompensations,
  checkDepartureAfterRest,
  compensationDeadline,
  getRestLabel,
  mustTakeRegularWeeklyRest,
  ongoingDailyRestPast24h,
} from '../src/domain/restTracking';
import { buildWarnings, computeWeekCounters, weeklyRestDeadline } from '../src/domain/week';
import { fromWall } from '../src/lib/timezone';
import { DayActionStruct, DayStruct } from '../src/types/models';

const TZ = 'Europe/Lisbon';
const H = 3600 * 1000;
let seq = 0;

// 2026-11-16 é segunda-feira; 20/11 sexta; 21/11 sábado.
const at = (d: number, h: number, m = 0) => fromWall(2026, 11, d, h, m, 0, TZ);
const plus = (base: Date, hours: number) => new Date(base.getTime() + hours * H);

function act(action: string, date: Date): DayActionStruct {
  const iso = date.toISOString();
  return { id: `a${++seq}`, dayId: 'd', action, date: iso, local: 'Viana do Castelo - Portugal', createdAt: iso, updatedAt: iso };
}
const day = (weekStart: boolean, ...actions: DayActionStruct[]): DayStruct => {
  const id = `d${++seq}`;
  return {
    id,
    userId: 'u',
    date: actions[0].date,
    weekStart,
    createdAt: actions[0].date,
    updatedAt: actions[0].date,
    actions: actions.map((a) => ({ ...a, dayId: id })),
  };
};

/**
 * Semana a começar na segunda 16/11 (início da semana), dois Repousos 9H
 * (reduzidas 2/3), dois 11H e um Repouso 11H na sexta 20/11 às 18:00.
 */
function week(restAction = 'Pausa 11H') {
  const rest = act(restAction, at(20, 18));
  const days = [
    day(true, act('Partida', at(16, 6)), act('Pausa 9H', at(16, 20))),
    day(false, act('Partida', at(17, 6)), act('Pausa 9H', at(17, 20))),
    day(false, act('Partida', at(18, 6)), act('Pausa 11H', at(18, 19))),
    day(false, act('Partida', at(19, 6)), act('Pausa 11H', at(19, 18))),
    day(false, act('Partida', at(20, 6)), rest),
  ];
  return { rest, days };
}
const withDeparture = (days: DayStruct[], date: Date) => {
  const departure = act('Partida', date);
  const next = day(false, departure);
  return { departure: next.actions![0], days: [...days, next] };
};

test('antes da Partida: semana normal (reduzidas 2/3, dia 5/6)', () => {
  const { days } = week();
  const c = computeWeekCounters(days, TZ, at(21, 12).getTime());
  assert.equal(c?.reducedRests, 2);
  assert.equal(c?.workDays, 5);
});

test('a) 11H sex 18:00, Partida sáb 22:00 (28h) → semanal reduzido, compensação 17h, dia 1/6, reduzidas 0/3', () => {
  const base = week();
  const { departure, days } = withDeparture(base.days, at(21, 22));
  const now = at(21, 23).getTime();

  const check = checkDepartureAfterRest(days, departure, TZ, now);
  assert.equal(check?.kind, 'reduced');
  assert.equal(check?.rest.realMs, 28 * H);
  assert.equal(check?.compensationMs, 17 * H);
  assert.equal(check?.mustTakeRegularNext, false);
  // Prazo: domingo 13/12 24:00 (fim da 3.ª semana a seguir à semana de 16/11).
  assert.equal(check?.deadline, fromWall(2026, 12, 14, 0, 0, 0, TZ).getTime());

  const [comp] = buildCompensations(days, TZ, {}, now);
  assert.equal(comp.id, base.rest.id);
  assert.equal(comp.amountMs, 17 * H);
  assert.equal(comp.done, false);
  assert.equal(comp.deadline, compensationDeadline(at(20, 18).getTime(), TZ));

  const c = computeWeekCounters(days, TZ, now);
  assert.equal(c?.workDays, 1);
  assert.equal(c?.reducedRests, 0);
  assert.equal(c?.normalRests, 0);
  assert.equal(countReducedRests(days, TZ, now), 0);

  // A semana recomeça na Partida: próximo semanal até Partida + 144h.
  assert.equal(weeklyRestDeadline(days)?.getTime(), at(21, 22).getTime() + 144 * H);

  const label = getRestLabel(base.rest, days);
  assert.equal(label?.kind, 'weekly-reduced');
  assert.equal(label?.text, 'Real: 28h00 · contou como semanal reduzido');

  const warnings = buildWarnings(days, c!, TZ, buildCompensations(days, TZ, {}, now), now);
  assert.ok(warnings.some((w) => w.title === 'Compensação pendente: 17h · até 13/12'));
  assert.ok(!warnings.some((w) => w.id === 'semanal-45h'));
});

test('b) 11H, Partida 46h depois → semanal normal, sem compensação, dia 1/6', () => {
  const base = week();
  const { departure, days } = withDeparture(base.days, plus(at(20, 18), 46));
  const now = plus(at(20, 18), 47).getTime();

  const check = checkDepartureAfterRest(days, departure, TZ, now);
  assert.equal(check?.kind, 'normal');
  assert.equal(check?.compensationMs, 0);
  assert.equal(buildCompensations(days, TZ, {}, now).length, 0);

  const c = computeWeekCounters(days, TZ, now);
  assert.equal(c?.workDays, 1);
  assert.equal(c?.reducedRests, 0);

  const label = getRestLabel(base.rest, days);
  assert.equal(label?.kind, 'weekly-normal');
  assert.equal(label?.text, 'Real: 46h00 · contou como semanal normal ✓');
});

test('c) 11H, Partida 20h depois → continua diário; sem alterações', () => {
  const base = week();
  const { departure, days } = withDeparture(base.days, plus(at(20, 18), 20));
  const now = plus(at(20, 18), 21).getTime();

  assert.equal(checkDepartureAfterRest(days, departure, TZ, now), null);
  assert.equal(buildCompensations(days, TZ, {}, now).length, 0);
  const c = computeWeekCounters(days, TZ, now);
  assert.equal(c?.reducedRests, 2);
  assert.equal(c?.workDays, 6);
  assert.equal(weeklyRestDeadline(days)?.getTime(), at(16, 6).getTime() + 144 * H);
  assert.equal(getRestLabel(base.rest, days)?.kind, 'ok');
});

test('d) "Corrigir horas": Partida passa para 20h depois → deixa de contar como semanal', () => {
  const base = week();
  const { departure, days } = withDeparture(base.days, at(21, 22));
  assert.equal(checkDepartureAfterRest(days, departure, TZ)?.kind, 'reduced');

  // Corrige a hora da Partida (como faz o "Editar Ação").
  const corrected = { ...departure, date: plus(at(20, 18), 20).toISOString() };
  const fixedDays = days.map((d) => ({ ...d, actions: (d.actions ?? []).map((a) => (a.id === departure.id ? corrected : a)) }));
  const now = at(21, 23).getTime();

  assert.equal(checkDepartureAfterRest(fixedDays, corrected, TZ, now), null);
  assert.equal(buildCompensations(fixedDays, TZ, {}, now).length, 0);
  assert.equal(computeWeekCounters(fixedDays, TZ, now)?.reducedRests, 2);
  assert.equal(weeklyRestDeadline(fixedDays)?.getTime(), at(16, 6).getTime() + 144 * H);
  assert.equal(getRestLabel(base.rest, fixedDays)?.kind, 'ok');
});

test('e) Semanal anterior reduzido + este também reduzido → "O próximo repouso semanal tem de ser de 45h"', () => {
  // Semana anterior: Repouso 24H sex 13/11 16:00, Partida sáb 14/11 20:00 (28h → reduzido).
  const previous = [day(true, act('Partida', at(9, 6)), act('Pausa 24H', at(13, 16))), day(false, act('Partida', at(14, 20)))];
  const base = week();
  const { departure, days } = withDeparture([...previous, ...base.days], at(21, 22));
  const now = at(21, 23).getTime();

  const check = checkDepartureAfterRest(days, departure, TZ, now);
  assert.equal(check?.kind, 'reduced');
  assert.equal(check?.mustTakeRegularNext, true);
  assert.equal(mustTakeRegularWeeklyRest(days, now), true);

  const warnings = buildWarnings(days, computeWeekCounters(days, TZ, now)!, TZ, [], now);
  const w = warnings.find((x) => x.id === 'semanal-45h');
  assert.equal(w?.title, 'O próximo repouso semanal tem de ser de 45h');
  assert.equal(w?.severity, 0);

  // Sem o semanal reduzido anterior, não há aviso.
  const alone = withDeparture(week().days, at(21, 22));
  assert.equal(mustTakeRegularWeeklyRest(alone.days, now), false);
});

test('9H dupla (fracionado 3+9) também conta como semanal com 24h+', () => {
  const rest = act('Pausa 9H', at(20, 18));
  const base = [day(true, act('Partida', at(20, 6)), act('Repouso 3H+', at(20, 11)), rest)];
  const { departure, days } = withDeparture(base, at(21, 22));
  assert.equal(checkDepartureAfterRest(days, departure, TZ)?.kind, 'reduced');
});

test('Durante o repouso: passadas 24h sem Partida → cartão "vai contar como semanal"', () => {
  const { days } = week();
  assert.equal(ongoingDailyRestPast24h(days, plus(at(20, 18), 23).getTime()), null);
  const r = ongoingDailyRestPast24h(days, plus(at(20, 18), 26).getTime());
  assert.equal(r?.realMs, 26 * H);
  // Sem Partida ainda não é semanal: nada muda até gravar a Partida.
  assert.equal(r?.countedAsWeekly, null);
  assert.equal(buildCompensations(days, TZ, {}, plus(at(20, 18), 26).getTime()).length, 0);
});
