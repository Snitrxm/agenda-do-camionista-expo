/// <reference types="node" />
// Testes da regra da amplitude depois de 3 reduzidas (domain/amplitude). Correr: npm test

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { countReducedRests, getDayLimit } from '../src/domain/amplitude';
import { DayActionStruct, DayStruct } from '../src/types/models';
import { formatDate, fromWall } from '../src/lib/timezone';

const TZ = 'Europe/Lisbon';
let seq = 0;
const at = (d: number, h: number, m = 0) => fromWall(2026, 11, d, h, m, 0, TZ); // 16/11/2026 = segunda
const hhmm = (ms: number | null) => (ms == null ? null : formatDate(new Date(ms), 'HH:mm', TZ));

function act(action: string, date: Date): DayActionStruct {
  const iso = date.toISOString();
  return { id: `a${++seq}`, dayId: 'd', action, date: iso, local: '', createdAt: iso, updatedAt: iso };
}
function day(weekStart: boolean, ...actions: DayActionStruct[]): DayStruct {
  return { id: `d${++seq}`, userId: 'u', date: actions[0].date, weekStart, createdAt: actions[0].date, updatedAt: actions[0].date, actions };
}
/** Dia normal com Partida às 06:00 e Repouso 9H às 20:00. */
const diaCom9h = (d: number, weekStart = false) => day(weekStart, act('Partida', at(d, 6)), act('Pausa 9H', at(d, 20)));

// segunda (início da semana), terça e quarta com Repouso 9H → 3 reduzidas
const semana = () => [diaCom9h(16, true), diaCom9h(17), diaCom9h(18)];

test('3 Repouso 9H na semana, dia seguinte Partida 06:00 sem Repouso 3H+ → limite 19:00, 9H indisponível', () => {
  const hoje = day(false, act('Partida', at(19, 6)));
  const days = [...semana(), hoje];
  const r = getDayLimit(hoje, days, TZ, at(19, 10).getTime());
  assert.equal(r.reducedRests, 3);
  assert.equal(r.blocked, true);
  assert.equal(r.limitHours, 13);
  assert.equal(hhmm(r.limit), '19:00');
  assert.equal(r.canTakeNineHourRest, false);
  assert.equal(hhmm(r.limit15h), '21:00'); // usado na mensagem "faça um Repouso 3H+ para ir até às 21:00"
});

test('… com Repouso 3H+ → limite 21:00 e Repouso 9H permitido', () => {
  const hoje = day(false, act('Partida', at(19, 6)), act('Repouso 3H+', at(19, 12)));
  const days = [...semana(), hoje];
  const r = getDayLimit(hoje, days, TZ, at(19, 16).getTime());
  assert.equal(r.reducedRests, 3);
  assert.equal(r.blocked, false);
  assert.equal(r.limitHours, 15);
  assert.equal(hhmm(r.limit), '21:00');
  assert.equal(r.canTakeNineHourRest, true);
});

test('Com só 2 reduzidas → limite 15h e 9H permitido', () => {
  const hoje = day(false, act('Partida', at(18, 6)));
  const days = [diaCom9h(16, true), diaCom9h(17), hoje];
  const r = getDayLimit(hoje, days, TZ, at(18, 10).getTime());
  assert.equal(r.reducedRests, 2);
  assert.equal(hhmm(r.limit), '21:00');
  assert.equal(r.canTakeNineHourRest, true);
});

test('Repouso 9H fracionado (com 3H+ antes) não conta como reduzida', () => {
  const fracionado = day(false, act('Partida', at(18, 6)), act('Repouso 3H+', at(18, 11)), act('Pausa 9H', at(18, 20)));
  const days = [diaCom9h(16, true), diaCom9h(17), fracionado];
  assert.equal(countReducedRests(days, TZ, at(19, 6).getTime()), 2);
});

test('Depois de um repouso semanal, as reduzidas voltam a 0', () => {
  const repouso = day(false, act('Partida', at(19, 6)), act('Pausa 45H', at(19, 18))); // termina sáb 21/11 15:00
  const hoje = day(false, act('Partida', at(21, 16)));
  const days = [...semana(), repouso, hoje];
  const r = getDayLimit(hoje, days, TZ, at(21, 18).getTime());
  assert.equal(r.reducedRests, 0);
  assert.equal(r.limitHours, 15);
  assert.equal(r.canTakeNineHourRest, true);
});
