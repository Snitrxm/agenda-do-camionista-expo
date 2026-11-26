/// <reference types="node" />
// Testes da folha de serviço: linhas por dia e km (features/worksheet/worksheetModel).

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildRows,
  daysInRange,
  fileBaseName,
  missingFinalKmWarnings,
  rangeError,
  rangeHeader,
  sheetCells,
} from '../src/features/worksheet/worksheetModel';
import { fromWall } from '../src/lib/timezone';
import { DayActionStruct, DayStruct } from '../src/types/models';

const TZ = 'Europe/Lisbon';
let seq = 0;
const at = (y: number, m: number, d: number, h: number, min = 0) => fromWall(y, m, d, h, min, 0, TZ).toISOString();

function act(action: string, date: string, extra: Partial<DayActionStruct> = {}): DayActionStruct {
  return { id: `a${++seq}`, dayId: '', action, date, local: '', createdAt: date, updatedAt: date, ...extra };
}
function day(date: string, departureKm: number | null, arriveKm: number | null, actions: DayActionStruct[]): DayStruct {
  const id = `d${++seq}`;
  return {
    id,
    userId: 'u',
    date,
    weekStart: false,
    departureKm,
    arriveKm,
    createdAt: date,
    updatedAt: date,
    actions: actions.map((a) => ({ ...a, dayId: id })),
  };
}
/** Linha como na tabela do PDF: Dia | Cliente | Local de carga | Local de descarga | Descarga | Km ini | Km fin */
const table = (days: DayStruct[], all = days) =>
  buildRows(days, TZ, all).map((r) => {
    const c = sheetCells(r);
    return [c.day, c.client, c.loadPlace, c.unloadPlace, c.unloaded, c.kmStart, c.kmEnd];
  });

const load = (date: string, company: string) => act('Carregamento', date, { cliente: 'Lactogal', empresaLocal: company });

test('c) Dia 16 com descarga e nova carga não descarregada → 2 linhas (descarga com km inicial; nova carga com "–" e km final)', () => {
  const d15 = day(at(2026, 11, 15, 6), 46500, 46610, [
    act('Partida', at(2026, 11, 15, 6)),
    load(at(2026, 11, 15, 9), 'Lactogal Modivas'),
    act('Chegada', at(2026, 11, 15, 18)),
  ]);
  const d16 = day(at(2026, 11, 16, 6), 46610, 47000, [
    act('Partida', at(2026, 11, 16, 6)),
    act('Descarga', at(2026, 11, 16, 9), { cliente: 'Lactogal', empresaLocal: 'Inleit', local: 'Curtis - España', quantidade: 25000, unidade: 'L' }),
    load(at(2026, 11, 16, 13), 'Lactogal Lugo'),
    act('Chegada', at(2026, 11, 16, 19)),
  ]);
  assert.deepEqual(table([d15, d16]), [
    ['15', 'Lactogal', 'Lactogal Modivas', '–', '–', '46 500', '46 610'],
    ['16', 'Lactogal', 'Lactogal Modivas', 'Inleit, Curtis', '25 000 L', '46 610', '–'],
    ['16', 'Lactogal', 'Lactogal Lugo', '–', '–', '–', '47 000'],
  ]);
});

test('Carga a 30/11 e descarga a 1/12 → folha de dezembro tem o cliente e o local de carga de 30/11', () => {
  const d30 = day(at(2026, 11, 30, 6), 46000, 46300, [act('Partida', at(2026, 11, 30, 6)), load(at(2026, 11, 30, 10), 'Lactogal Modivas')]);
  const d1 = day(at(2026, 12, 1, 6), 46300, 46700, [
    act('Partida', at(2026, 12, 1, 6)),
    act('Descarga', at(2026, 12, 1, 9), { cliente: 'Lactogal', empresaLocal: 'Inleit', local: 'Curtis - España', quantidade: 25000, unidade: 'L' }),
  ]);
  const all = [d30, d1];
  const december = daysInRange(all, { from: new Date(at(2026, 12, 1, 12)), until: new Date(at(2026, 12, 31, 12)) }, TZ);
  assert.deepEqual(
    december.map((d) => d.id),
    [d1.id]
  );
  assert.deepEqual(table(december, all), [['1', 'Lactogal', 'Lactogal Modivas', 'Inleit, Curtis', '25 000 L', '46 300', '46 700']]);
});

test('c) Carga e descarga da mesma carga no mesmo dia (sem nova carga) → 1 linha com os dois km', () => {
  const d = day(at(2026, 11, 17, 6), 47000, 47350, [
    act('Partida', at(2026, 11, 17, 6)),
    load(at(2026, 11, 17, 8), 'Lactogal Modivas'),
    act('Descarga', at(2026, 11, 17, 12), { cliente: 'Lactogal', empresaLocal: 'Inleit', local: 'Curtis - España', quantidade: 24000, unidade: 'L' }),
    act('Chegada', at(2026, 11, 17, 18)),
  ]);
  assert.deepEqual(table([d]), [['17', 'Lactogal', 'Lactogal Modivas', 'Inleit, Curtis', '24 000 L', '47 000', '47 350']]);
});

test('d) Jornada terminada sem km de chegada → "Falta o km final do dia X"', () => {
  const closedNoKm = day(at(2026, 11, 18, 6), 47350, null, [act('Partida', at(2026, 11, 18, 6)), act('Pausa 11H', at(2026, 11, 18, 19))]);
  const closedKmZero = day(at(2026, 11, 19, 6), 47600, 0, [act('Partida', at(2026, 11, 19, 6)), act('Chegada', at(2026, 11, 19, 18))]);
  const closedOk = day(at(2026, 11, 20, 6), 47900, 48200, [act('Partida', at(2026, 11, 20, 6)), act('Chegada', at(2026, 11, 20, 18))]);
  const stillOpen = day(at(2026, 11, 21, 6), 48200, null, [act('Partida', at(2026, 11, 21, 6))]);
  assert.deepEqual(missingFinalKmWarnings([closedNoKm, closedKmZero, closedOk, stillOpen], TZ), [
    'Falta o km final do dia 18',
    'Falta o km final do dia 19',
  ]);
});

test('Dia sem cargas nem descargas → 1 linha só com dia e km', () => {
  const d = day(at(2026, 11, 22, 6), 48200, 48500, [act('Partida', at(2026, 11, 22, 6)), act('Chegada', at(2026, 11, 22, 18))]);
  assert.deepEqual(table([d]), [['22', '', '', '', '', '48 200', '48 500']]);
});

test('Linhas por ordem de hora; descarga sem cliente usa a carga mais antiga por descarregar', () => {
  const d = day(at(2026, 11, 23, 6), 1000, 1500, [
    act('Partida', at(2026, 11, 23, 6)),
    act('Carregamento', at(2026, 11, 23, 7), { cliente: 'Mimosa', empresaLocal: 'Mimosa Porto' }),
    act('Carregamento', at(2026, 11, 23, 8), { cliente: 'Lactogal', empresaLocal: 'Lactogal Modivas' }),
    act('Descarga', at(2026, 11, 23, 12), { empresaLocal: 'Inleit', quantidade: 10000, unidade: 'kg' }),
  ]);
  assert.deepEqual(table([d]), [
    ['23', 'Lactogal', 'Lactogal Modivas', '–', '–', '1000', '–'],
    ['23', 'Mimosa', 'Mimosa Porto', 'Inleit', '10 000 kg', '–', '1500'],
  ]);
});


// Exemplo do pedido: dia 15 carga Lactogal em Lactogal Modivas; dia 16 descarga em Inleit (Curtis), 25 000 L.
function example() {
  const d15 = day(at(2026, 11, 15, 6), 46500, 46610, [
    act('Partida', at(2026, 11, 15, 6)),
    load(at(2026, 11, 15, 9), 'Lactogal Modivas'),
    act('Chegada', at(2026, 11, 15, 18)),
  ]);
  const d16 = day(at(2026, 11, 16, 6), 46610, 47000, [
    act('Partida', at(2026, 11, 16, 6)),
    act('Descarga', at(2026, 11, 16, 9), { empresaLocal: 'Inleit', local: 'Curtis - España', quantidade: 25000, unidade: 'L' }),
    act('Chegada', at(2026, 11, 16, 19)),
  ]);
  return [d15, d16];
}
const range = (from: [number, number], until: [number, number]) => ({
  from: new Date(at(2026, from[0], from[1], 12)),
  until: new Date(at(2026, until[0], until[1], 12)),
});

test('a) De 15/11 a 16/11 com o exemplo → as 2 linhas iguais à tabela', () => {
  const all = example();
  const r = range([11, 15], [11, 16]);
  assert.deepEqual(table(daysInRange(all, r, TZ), all), [
    ['15', 'Lactogal', 'Lactogal Modivas', '–', '–', '46 500', '46 610'],
    ['16', 'Lactogal', 'Lactogal Modivas', 'Inleit, Curtis', '25 000 L', '46 610', '47 000'],
  ]);
  assert.equal(rangeError(r, TZ), null);
  assert.deepEqual(rangeHeader(r, TZ), { label: 'Período:', value: '15/11/2026 a 16/11/2026' });
  assert.equal(fileBaseName('12-AB-34', r, TZ), 'Registo servico 12-AB-34 15-11-2026 a 16-11-2026');
});

test('b) De 16/11 a 16/11 → 1 linha, com cliente e local de carga do dia 15', () => {
  const all = example();
  const r = range([11, 16], [11, 16]);
  const only16 = daysInRange(all, r, TZ);
  assert.equal(only16.length, 1);
  assert.deepEqual(table(only16, all), [['16', 'Lactogal', 'Lactogal Modivas', 'Inleit, Curtis', '25 000 L', '46 610', '47 000']]);
  assert.deepEqual(rangeHeader(r, TZ), { label: 'Dia:', value: '16/11/2026' });
});

test('d) "Até" antes de "De" → erro (o ecrã desativa os botões)', () => {
  assert.equal(rangeError(range([11, 16], [11, 15]), TZ), '"Até" não pode ser antes de "De".');
  // Mesmo dia com horas diferentes não é erro.
  assert.equal(rangeError({ from: new Date(at(2026, 11, 16, 20)), until: new Date(at(2026, 11, 16, 8)) }, TZ), null);
});
