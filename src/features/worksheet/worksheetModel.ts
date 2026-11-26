/**
 * Folha de serviço (modelo Agrotir "Registo Serviço Ibérico"): período
 * de … até … (datas escolhidas), linhas da tabela (cada Descarga ligada ao Carregamento por
 * descarregar), contadores e abastecimentos.
 *
 * Funções puras; o fuso horário é passado por parâmetro.
 */

import { isDayOpen } from '../../domain/days';
import { dateLocale, strings } from '../../i18n';
import { parseISO } from '../../lib/dateFormat';
import { DayActionStruct, DayStruct } from '../../types/models';
import { formatDecimal, formatInteger } from '../../lib/numbers';
import { addDays, capitalizedWords, formatDate, fromWall, partsInTz, startOfDay } from '../../lib/timezone';

/** Período da folha: de `from` até `until`, os dois dias incluídos. Para um só dia, a mesma data nos dois. */
export interface DateRange {
  from: Date;
  until: Date;
}

/** Por omissão: do dia 1 do mês atual até hoje (no fuso `tz`). */
export function defaultRange(now: Date, tz: string): DateRange {
  const p = partsInTz(now, tz);
  return { from: fromWall(p.year, p.month, 1, 12, 0, 0, tz), until: now };
}

/** Início do dia "De" e início do dia a seguir ao "Até" (intervalo [início, fim[). */
export function rangeBounds(range: DateRange, tz: string): [Date, Date] {
  return [startOfDay(range.from, tz), addDays(startOfDay(range.until, tz), 1, tz)];
}

/** Erro de validação das datas (`null` se estiverem certas): "Até" não pode ser antes de "De". */
export function rangeError(range: DateRange, tz: string): string | null {
  return startOfDay(range.until, tz) < startOfDay(range.from, tz) ? strings().worksheet.untilBeforeFrom : null;
}

const isSingleDay = (range: DateRange, tz: string) => startOfDay(range.from, tz).getTime() === startOfDay(range.until, tz).getTime();
const ddmmyyyy = (d: Date, tz: string) => formatDate(d, 'dd/MM/yyyy', tz, 'pt_PT');

/**
 * Período no cabeçalho do PDF (sempre em português):
 * `{ label: "Período:", value: "15/11/2026 a 16/11/2026" }` ou `{ label: "Dia:", value: "15/11/2026" }`.
 */
export function rangeHeader(range: DateRange, tz: string): { label: string; value: string } {
  if (isSingleDay(range, tz)) return { label: 'Dia:', value: ddmmyyyy(range.from, tz) };
  return { label: 'Período:', value: `${ddmmyyyy(range.from, tz)} a ${ddmmyyyy(range.until, tz)}` };
}

/** Título do período no ecrã ("15 nov. 2026 a 16 nov. 2026" ou "Domingo, 15 nov. 2026"). */
export function rangeTitle(range: DateRange, tz: string): string {
  const locale = dateLocale('pt_PT');
  if (isSingleDay(range, tz)) return capitalizedWords(formatDate(range.from, 'EEEE, d MMM yyyy', tz, locale));
  return strings().dates.range(formatDate(range.from, 'd MMM yyyy', tz, locale), formatDate(range.until, 'd MMM yyyy', tz, locale));
}

/**
 * Nome do ficheiro (sem extensão): "Registo servico 12-AB-34 15-11-2026 a 16-11-2026".
 * As datas levam "-" em vez de "/" (a "/" não é permitida em nomes de ficheiro).
 */
export function fileBaseName(plate: string | null, range: DateRange, tz: string): string {
  const d = (x: Date) => formatDate(x, 'dd-MM-yyyy', tz, 'pt_PT');
  return `Registo servico ${plate ?? 'matricula'} ${d(range.from)} a ${d(range.until)}`;
}

export interface WorkSheetRow {
  id: string;
  dayNumber: number;
  dayDate: Date;
  cliente: string | null;
  quantidadeText: string | null;
  localCarga: string | null;
  localDescarga: string | null;
  cargaDescargaText: string;
  kmInicial: number | null;
  kmFinal: number | null;
}

export interface WorkSheetCounts {
  abastecimentos: number;
  lavagens: number;
  oficina: number;
}

export interface FuelingEntry {
  dayNumber: number;
  posto: string;
  km: number | null;
  gasoleoL: number | null;
  adblueL: number | null;
}

const byDate = <T extends { date: string }>(arr: T[]) =>
  arr
    .map((a, i) => ({ a, i }))
    .sort((x, y) => (parseISO(x.a.date)?.getTime() ?? -Infinity) - (parseISO(y.a.date)?.getTime() ?? -Infinity) || x.i - y.i)
    .map((x) => x.a);

/** Dias cuja data cai entre "De" e "Até" (inclusive), por ordem de data. */
export function daysInRange(days: DayStruct[], range: DateRange, tz: string): DayStruct[] {
  const [start, end] = rangeBounds(range, tz);
  return byDate(
    days.filter((d) => {
      const date = parseISO(d.date);
      return !!date && date >= start && date < end;
    })
  );
}

export function trucksInPeriod(daysIn: DayStruct[]): string[] {
  return Array.from(new Set(daysIn.map((d) => (d.truckPlate ?? '').trim()).filter((v) => v.length > 0)));
}

export function trailerInPeriod(daysIn: DayStruct[]): string | null {
  return daysIn.map((d) => (d.trailerPlate ?? '').trim()).find((v) => v.length > 0) ?? null;
}

export function filterByPlate(daysIn: DayStruct[], plate: string | null): DayStruct[] {
  return plate == null ? daysIn : daysIn.filter((d) => d.truckPlate === plate);
}

function cityFromLocal(local: string): string {
  const trimmed = local.trim();
  if (!trimmed) return '';
  const idx = trimmed.indexOf('-');
  const parts = idx === -1 ? [trimmed] : [trimmed.slice(0, idx).trim(), trimmed.slice(idx + 1).trim()];
  const first = parts[0] ?? '';
  if (!first && parts.length > 1) return parts[1];
  return first;
}

function localText(a: DayActionStruct | null | undefined): string | null {
  if (!a) return null;
  const empresa = (a.empresaLocal ?? '').trim();
  const cidade = cityFromLocal(a.local);
  const localTrimmed = a.local.trim();
  if (empresa && cidade) return `${empresa}, ${cidade}`;
  if (empresa && localTrimmed) return `${empresa}, ${localTrimmed}`;
  if (empresa) return empresa;
  if (cidade) return cidade;
  if (localTrimmed) return localTrimmed;
  return null;
}

function quantidadeText(a: DayActionStruct): string | null {
  if (a.quantidade == null) return null;
  return `${formatDecimal(a.quantidade, 0)} ${a.unidade ?? 'L'}`;
}

let rowSeq = 0;

/** km do dia: `null` quando não foi registado (vazio ou 0, que é o que o formulário grava quando vazio). */
const dayKm = (km: number | null | undefined): number | null => (km == null || km === 0 ? null : km);

/** Uma ação com o dia (registo) a que pertence, para ordenar e associar. */
interface DatedAction {
  action: DayActionStruct;
  dayId: string;
  time: number;
}

/**
 * Associa cada Descarga ao seu Carregamento, percorrendo TODAS as ações de
 * TODOS os dias por ordem de hora (a carga pode ter sido noutro dia, semana
 * ou mês, fora do período da folha).
 *
 * Carregamento correspondente: o mais antigo por descarregar do mesmo
 * cliente; se a Descarga não tiver cliente, o mais antigo por descarregar.
 *
 * @returns `loadFor`: id da Descarga → Carregamento;
 *          `unloadedOnDay`: id do Carregamento → id do dia em que foi descarregado.
 */
function matchUnloadsToLoads(allDays: DayStruct[]) {
  const timeline: DatedAction[] = allDays
    .flatMap((d) => (d.actions ?? []).map((action) => ({ action, dayId: d.id, time: parseISO(action.date)?.getTime() ?? -Infinity })))
    .map((x, i) => ({ x, i }))
    .sort((a, b) => a.x.time - b.x.time || a.i - b.i)
    .map((y) => y.x);

  const pending: DatedAction[] = [];
  const loadFor = new Map<string, DayActionStruct>();
  const unloadedOnDay = new Map<string, string>();

  for (const item of timeline) {
    if (item.action.action === 'Carregamento') {
      pending.push(item);
    } else if (item.action.action === 'Descarga') {
      const client = item.action.cliente;
      const idx = client ? pending.findIndex((p) => p.action.cliente === client) : pending.length > 0 ? 0 : -1;
      if (idx >= 0) {
        const [load] = pending.splice(idx, 1);
        loadFor.set(item.action.id, load.action);
        unloadedOnDay.set(load.action.id, item.dayId);
      }
    }
  }
  return { loadFor, unloadedOnDay };
}

/**
 * Linhas da folha de serviço para os dias do período (já filtrados).
 *
 * Cada dia mostra o que aconteceu nesse dia, por ordem de hora:
 * - cada **Descarga** dá uma linha; o cliente e o local de carga vêm do
 *   Carregamento correspondente (procurado em `allDays`, ver `matchUnloadsToLoads`);
 * - cada **Carregamento** ainda por descarregar no fim do seu dia dá uma
 *   linha nesse dia, com local de descarga "–" e sem quantidade;
 * - um dia sem cargas nem descargas dá uma linha só com o dia e os km.
 *
 * Km (sempre os do dia, nunca os das ações): com uma linha, os dois km
 * nessa linha; com várias, km iniciais só na 1.ª e km finais só na última.
 *
 * @param allDays todos os dias do utilizador (histórico para associar cargas)
 */
export function buildRows(daysFiltered: DayStruct[], tz: string, allDays: DayStruct[] = daysFiltered): WorkSheetRow[] {
  const { loadFor, unloadedOnDay } = matchUnloadsToLoads(allDays);
  const rows: WorkSheetRow[] = [];

  for (const day of daysFiltered) {
    const dayDate = parseISO(day.date) ?? new Date();
    const dayNum = partsInTz(dayDate, tz).day;
    const mk = (r: Omit<WorkSheetRow, 'id' | 'dayNumber' | 'dayDate'>): WorkSheetRow => ({
      id: `r${rowSeq++}`,
      dayNumber: dayNum,
      dayDate,
      ...r,
    });

    const dayRows: WorkSheetRow[] = [];
    for (const action of byDate(day.actions ?? [])) {
      if (action.action === 'Descarga') {
        const load = loadFor.get(action.id) ?? null;
        dayRows.push(
          mk({
            cliente: load?.cliente ?? load?.empresaLocal ?? action.cliente ?? action.empresaLocal ?? null,
            quantidadeText: quantidadeText(action),
            localCarga: localText(load),
            localDescarga: localText(action),
            cargaDescargaText: `${localText(load) ?? '–'} → ${localText(action) ?? '–'}`,
            kmInicial: null,
            kmFinal: null,
          })
        );
      } else if (action.action === 'Carregamento' && unloadedOnDay.get(action.id) !== day.id) {
        // Ainda não descarregado no fim deste dia.
        dayRows.push(
          mk({
            cliente: action.cliente ?? action.empresaLocal ?? null,
            quantidadeText: null,
            localCarga: localText(action),
            localDescarga: null,
            cargaDescargaText: `${localText(action) ?? '–'} → –`,
            kmInicial: null,
            kmFinal: null,
          })
        );
      }
    }

    const departureKm = dayKm(day.departureKm);
    const arriveKm = dayKm(day.arriveKm);
    if (dayRows.length === 0) {
      dayRows.push(
        mk({
          cliente: null,
          quantidadeText: null,
          localCarga: null,
          localDescarga: null,
          cargaDescargaText: '–',
          kmInicial: departureKm,
          kmFinal: arriveKm,
        })
      );
    } else {
      dayRows[0] = { ...dayRows[0], kmInicial: departureKm };
      dayRows[dayRows.length - 1] = { ...dayRows[dayRows.length - 1], kmFinal: arriveKm };
    }
    rows.push(...dayRows);
  }
  return rows;
}

/** Texto de cada coluna de uma linha, tal como sai no PDF e no CSV. */
export interface SheetCells {
  day: string;
  client: string;
  loadPlace: string;
  /** "–" quando a carga ainda não foi descarregada */
  unloadPlace: string;
  /** quantidade descarregada ("25 000 L"); "–" quando a carga ainda não foi descarregada */
  unloaded: string;
  kmStart: string;
  kmEnd: string;
}

/** Converte uma linha nas colunas da folha (km em falta ou omitidos → "–"). */
export function sheetCells(r: WorkSheetRow): SheetCells {
  return {
    day: String(r.dayNumber),
    client: r.cliente ?? '',
    loadPlace: r.localCarga ?? '',
    unloadPlace: r.localDescarga ?? (r.localCarga ? '–' : ''),
    unloaded: r.quantidadeText ?? (r.localCarga ? '–' : ''),
    kmStart: r.kmInicial != null ? formatInteger(r.kmInicial) : '–',
    kmEnd: r.kmFinal != null ? formatInteger(r.kmFinal) : '–',
  };
}

/**
 * Avisos da folha: jornadas terminadas (com Partida e já fechadas por
 * Chegada ou repouso) sem km de chegada.
 *
 * @returns ex.: `["Falta o km final do dia 16"]`
 */
export function missingFinalKmWarnings(daysFiltered: DayStruct[], tz: string): string[] {
  return daysFiltered
    .filter((d) => (d.actions ?? []).some((a) => a.action === 'Partida') && !isDayOpen(d) && dayKm(d.arriveKm) == null)
    .map((d) => strings().worksheet.missingFinalKm(partsInTz(parseISO(d.date) ?? new Date(), tz).day));
}

export function counts(daysFiltered: DayStruct[]): WorkSheetCounts {
  const c = { abastecimentos: 0, lavagens: 0, oficina: 0 };
  for (const d of daysFiltered) {
    for (const a of d.actions ?? []) {
      if (a.action === 'Abastecimento') c.abastecimentos++;
      else if (a.action === 'Lavagem') c.lavagens++;
      else if (a.action === 'Oficina') c.oficina++;
    }
  }
  return c;
}

export function buildFuelingEntries(daysFiltered: DayStruct[], tz: string): FuelingEntry[] {
  const out: FuelingEntry[] = [];
  for (const day of daysFiltered) {
    const dayNum = partsInTz(parseISO(day.date) ?? new Date(), tz).day;
    for (const a of day.actions ?? []) {
      if (a.action !== 'Abastecimento') continue;
      const cidade = cityFromLocal(a.local);
      const posto = a.posto ?? '';
      const label = posto && cidade ? `${posto}, ${cidade}` : posto ? posto : cidade;
      out.push({ dayNumber: dayNum, posto: label, km: a.km ?? null, gasoleoL: a.gasoleoL ?? null, adblueL: a.adblueL ?? null });
    }
  }
  return out;
}
