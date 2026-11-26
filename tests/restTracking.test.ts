/// <reference types="node" />
// Testes do repouso real e da compensação automática (domain/restTracking).
// Correr: npm test

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DayActionStruct, DayStruct } from '../src/types/models';
import { buildCompensations, getRestLabel, ongoingWeeklyRest, visibleCompensations } from '../src/domain/restTracking';
import { fromWall } from '../src/lib/timezone';

const TZ = 'Europe/Lisbon';
const H = 3600 * 1000;
let seq = 0;

// 2026-11-20 é sexta-feira
const at = (d: number, h: number, m = 0) => fromWall(2026, 11, d, h, m, 0, TZ);
const plus = (base: Date, hours: number) => new Date(base.getTime() + hours * H);

function act(action: string, date: Date): DayActionStruct {
  const iso = date.toISOString();
  return { id: `a${++seq}`, dayId: 'd', action, date: iso, local: 'Viana do Castelo - Portugal', createdAt: iso, updatedAt: iso };
}
const day = (...actions: DayActionStruct[]): DayStruct => ({
  id: `d${++seq}`,
  userId: 'u',
  date: actions[0].date,
  weekStart: false,
  createdAt: actions[0].date,
  updatedAt: actions[0].date,
  actions,
});

test('a) Semanal 24H às sex 16:00, Partida sáb 20:00 → compensação 17h', () => {
  const rest = act('Pausa 24H', at(20, 16));
  const days = [day(act('Partida', at(20, 6)), rest), day(act('Partida', at(21, 20)))];
  const [c] = buildCompensations(days, TZ, {}, at(22, 12).getTime());
  assert.equal(c.amountMs, 17 * H);
  assert.equal(c.done, false);
  assert.equal(c.provisional, false);
  assert.equal(getRestLabel(rest, days)?.text, 'Real: 28h00 · compensar 17h');
  assert.equal(getRestLabel(rest, days)?.kind, 'compensate');
});

test('b) Semanal 24H, Partida 46h depois → sem compensação, "contou como normal"', () => {
  const rest = act('Pausa 24H', at(20, 16));
  const days = [day(act('Partida', at(20, 6)), rest), day(act('Partida', plus(at(20, 16), 46)))];
  assert.equal(buildCompensations(days, TZ, {}, at(25, 12).getTime()).length, 0);
  const l = getRestLabel(rest, days);
  assert.equal(l?.kind, 'counted-as-normal');
  assert.equal(l?.text, 'Real: 46h00 · contou como normal ✓');
});

// Um repouso diário de 24h+ já conta como semanal (ver weeklyFromDailyRest.test.ts),
// por isso o pagamento por um repouso diário só acontece com compensações < 15h.
test('c) Compensação de 12h pendente e repouso real de 22h → feita sozinha', () => {
  const rest24 = act('Pausa 24H', at(20, 16));
  const p1 = plus(at(20, 16), 33); // 33h → 12h a compensar
  const rest9 = act('Pausa 9H', at(23, 18));
  const days = [day(act('Partida', at(20, 6)), rest24), day(act('Partida', p1), rest9), day(act('Partida', plus(at(23, 18), 22)))];
  const [c] = buildCompensations(days, TZ, {}, at(26, 12).getTime());
  assert.equal(c.amountMs, 12 * H);
  assert.equal(c.done, true);
  assert.equal(c.paidBy?.action.id, rest9.id);
  assert.equal(c.doneAt, plus(at(23, 18), 22).getTime());
});

test('d) Compensação de 17h pendente e repouso real de 20h → continua pendente', () => {
  const rest24 = act('Pausa 24H', at(20, 16));
  const rest9 = act('Pausa 9H', at(23, 18));
  const days = [day(act('Partida', at(20, 6)), rest24), day(act('Partida', at(21, 20)), rest9), day(act('Partida', plus(at(23, 18), 20)))];
  const [c] = buildCompensations(days, TZ, {}, at(26, 12).getTime());
  assert.equal(c.done, false);
});

test('e) Repouso 11H com Partida 10h20 depois → "incompleto"', () => {
  const rest = act('Pausa 11H', at(20, 20));
  const days = [day(act('Partida', at(20, 6)), rest), day(act('Partida', plus(at(20, 20), 10 + 20 / 60)))];
  const l = getRestLabel(rest, days);
  assert.equal(l?.kind, 'incomplete');
  assert.equal(l?.text, 'Real: 10h20 · incompleto');
});

// Extras
test('Sem Partida seguinte: sem etiqueta; compensação provisória de 21h; repouso semanal em curso', () => {
  const rest = act('Pausa 24H', at(20, 16));
  const days = [day(act('Partida', at(20, 6)), rest)];
  const now = at(21, 18).getTime();
  assert.equal(getRestLabel(rest, days), null);
  const [c] = buildCompensations(days, TZ, {}, now);
  assert.equal(c.provisional, true);
  assert.equal(c.amountMs, 21 * H);
  assert.equal(ongoingWeeklyRest(days, now)?.realMs, 26 * H);
});

test('Várias pendentes: paga primeiro a de prazo mais curto; um repouso paga só uma', () => {
  const r1 = act('Pausa 24H', at(6, 16)); // semana anterior → prazo mais curto
  const r2 = act('Pausa 24H', at(13, 16));
  const big = act('Pausa 9H', at(18, 18));
  const days = [
    day(act('Partida', at(6, 6)), r1),
    day(act('Partida', plus(at(6, 16), 33))), // 33h → 12h
    day(act('Partida', at(13, 6)), r2),
    day(act('Partida', plus(at(13, 16), 33)), big), // 33h → 12h
    day(act('Partida', plus(at(18, 18), 22))), // 22h ≥ 9h + 12h
  ];
  const comps = buildCompensations(days, TZ, {}, at(25, 12).getTime());
  assert.equal(comps.find((c) => c.id === r1.id)?.done, true);
  assert.equal(comps.find((c) => c.id === r2.id)?.done, false);
});

test('Semanal posterior de 45h + X paga; feita desaparece ao fim de 2 dias; Feita manual', () => {
  const r24 = act('Pausa 24H', at(6, 16));
  const r45 = act('Pausa 45H', at(13, 16));
  const end = plus(at(13, 16), 62);
  const days = [day(act('Partida', at(6, 6)), r24), day(act('Partida', at(7, 20)), r45), day(act('Partida', end))];
  const [c] = buildCompensations(days, TZ, {}, end.getTime() + H);
  assert.equal(c.done, true);
  assert.equal(visibleCompensations([c], end.getTime() + 47 * H).length, 1);
  assert.equal(visibleCompensations([c], end.getTime() + 49 * H).length, 0);

  const days2 = [day(act('Partida', at(6, 6)), r24), day(act('Partida', at(7, 20)))];
  const [m] = buildCompensations(days2, TZ, { [r24.id]: { date: at(9, 10).toISOString() } }, at(9, 12).getTime());
  assert.equal(m.done, true);
  assert.equal(m.markedManually, true);
});

test('Repouso fora do prazo não paga a compensação', () => {
  const r24 = act('Pausa 24H', at(2, 16)); // semana de 2/11 → prazo até 29/11
  const late = act('Pausa 9H', fromWall(2026, 12, 1, 18, 0, 0, TZ));
  const days = [
    day(act('Partida', at(2, 6)), r24),
    day(act('Partida', at(3, 20))),
    day(act('Partida', fromWall(2026, 12, 1, 6, 0, 0, TZ)), late),
    day(act('Partida', plus(fromWall(2026, 12, 1, 18, 0, 0, TZ), 40))),
  ];
  const [c] = buildCompensations(days, TZ, {}, fromWall(2026, 12, 5, 0, 0, 0, TZ).getTime());
  assert.equal(c.done, false);
});
