/**
 * Calendário e formatação de datas com fuso horário explícito.
 *
 * Todas as funções recebem `tz` (identificador IANA, ex.: "Europe/Lisbon").
 * Quando `tz` é `undefined` usa-se o fuso do dispositivo.
 *
 * A formatação usa tabelas próprias de nomes em português (pt_PT / pt_BR)
 * para dar exatamente o mesmo texto em iOS e Android, independentemente
 * dos dados de locale do motor JavaScript.
 *
 * @module lib/timezone
 */

/** Componentes de uma data tal como aparecem num relógio de parede, num dado fuso. */
export interface WallParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number; // 1=Dom, 2=Seg, ..., 7=Sáb (igual ao Calendar do Swift)
}

const dtfCache = new Map<string, Intl.DateTimeFormat>();

function getDtf(tz: string): Intl.DateTimeFormat {
  let f = dtfCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    dtfCache.set(tz, f);
  }
  return f;
}

/** Decompõe um instante em ano/mês/dia/hora/minuto/segundo/dia da semana no fuso `tz`. */
export function partsInTz(date: Date, tz?: string): WallParts {
  if (!tz) {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      weekday: date.getDay() + 1,
    };
  }
  const out: Record<string, number> = {};
  for (const p of getDtf(tz).formatToParts(date)) {
    if (p.type !== 'literal') out[p.type] = parseInt(p.value, 10);
  }
  const hour = out.hour === 24 ? 0 : out.hour;
  const weekday = new Date(Date.UTC(out.year, out.month - 1, out.day)).getUTCDay() + 1;
  return {
    year: out.year,
    month: out.month,
    day: out.day,
    hour,
    minute: out.minute,
    second: out.second,
    weekday,
  };
}

function offsetMs(ms: number, tz: string): number {
  const p = partsInTz(new Date(ms), tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(ms / 1000) * 1000;
}

/** Converte uma hora "de parede" num fuso para um instante (Date). */
export function fromWall(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  tz?: string
): Date {
  if (!tz) return new Date(year, month - 1, day, hour, minute, second);
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  let t = guess - offsetMs(guess, tz);
  const o2 = offsetMs(t, tz);
  t = guess - o2;
  return new Date(t);
}

/** Meia-noite (00:00) do dia de `date`, no fuso `tz`. */
export function startOfDay(date: Date, tz?: string): Date {
  const p = partsInTz(date, tz);
  return fromWall(p.year, p.month, p.day, 0, 0, 0, tz);
}

/** Soma `n` dias de calendário mantendo a hora de parede (respeita mudanças de hora). */
export function addDays(date: Date, n: number, tz?: string): Date {
  const p = partsInTz(date, tz);
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day + n));
  return fromWall(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), p.hour, p.minute, p.second, tz);
}

/** Soma `n` meses de calendário; o dia é limitado ao último dia do mês de destino. */
export function addMonths(date: Date, n: number, tz?: string): Date {
  const p = partsInTz(date, tz);
  let y = p.year;
  let m = p.month - 1 + n;
  y += Math.floor(m / 12);
  m = ((m % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return fromWall(y, m + 1, Math.min(p.day, lastDay), p.hour, p.minute, p.second, tz);
}

/** `true` se os dois instantes caem no mesmo dia de calendário no fuso `tz`. */
export function isSameDay(a: Date, b: Date, tz?: string): boolean {
  const pa = partsInTz(a, tz);
  const pb = partsInTz(b, tz);
  return pa.year === pb.year && pa.month === pb.month && pa.day === pb.day;
}

/** `true` se `date` é hoje no fuso `tz`. */
export function isToday(date: Date, tz?: string): boolean {
  return isSameDay(date, new Date(), tz);
}

/** Equivalente a calendar.ordinality(of: .day, in: .era, for:). */
export function dayOrdinal(date: Date, tz?: string): number {
  const p = partsInTz(date, tz);
  return Math.floor(Date.UTC(p.year, p.month - 1, p.day) / 86400000);
}

// ---------------------------------------------------------------------------
// Formatação
// ---------------------------------------------------------------------------

/** Locales suportados pela formatação (`es` = espanhol de Espanha). */
export type AppLocale = 'pt_BR' | 'pt_PT' | 'es';

const PT_WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const PT_MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const PT_MONTHS_SHORT = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];

const WEEKDAYS_FULL: Record<AppLocale, string[]> = {
  pt_BR: PT_WEEKDAYS,
  pt_PT: PT_WEEKDAYS,
  es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
};
const WEEKDAYS_SHORT: Record<AppLocale, string[]> = {
  pt_BR: ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'],
  pt_PT: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  es: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
};
const MONTHS_FULL: Record<AppLocale, string[]> = {
  pt_BR: PT_MONTHS,
  pt_PT: PT_MONTHS,
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
};
const MONTHS_SHORT: Record<AppLocale, string[]> = {
  pt_BR: PT_MONTHS_SHORT,
  pt_PT: PT_MONTHS_SHORT,
  es: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'],
};

/** Nomes curtos dos dias da semana, a começar ao domingo. */
export function shortWeekdaySymbols(locale: AppLocale): string[] {
  return WEEKDAYS_SHORT[locale];
}

const pad = (n: number, len = 2) => String(n).padStart(len, '0');

/**
 * Formata uma data com um padrão ao estilo Unicode/DateFormatter.
 *
 * Tokens suportados: `yyyy yy MMMM MMM MM M dd d EEEE EEE HH H mm m ss s`
 * e texto literal entre plicas (ex.: `"dd/MM 'às' HH:mm"`).
 *
 * @example formatDate(new Date(), "EEE dd/MM 'às' HH:mm", 'Europe/Lisbon', 'pt_PT')
 *          // "terça 17/11 às 20:30"
 */
export function formatDate(date: Date, pattern: string, tz?: string, locale: AppLocale = 'pt_BR'): string {
  const p = partsInTz(date, tz);
  let out = '';
  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i];
    if (ch === "'") {
      const end = pattern.indexOf("'", i + 1);
      const lit = end === -1 ? pattern.slice(i + 1) : pattern.slice(i + 1, end);
      out += lit;
      i = end === -1 ? pattern.length : end + 1;
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      let j = i;
      while (j < pattern.length && pattern[j] === ch) j++;
      const count = j - i;
      out += token(ch, count, p, locale);
      i = j;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

function token(ch: string, count: number, p: WallParts, locale: AppLocale): string {
  switch (ch) {
    case 'y':
      return count === 2 ? pad(p.year % 100) : String(p.year);
    case 'M':
      if (count >= 4) return MONTHS_FULL[locale][p.month - 1];
      if (count === 3) return MONTHS_SHORT[locale][p.month - 1];
      return count === 2 ? pad(p.month) : String(p.month);
    case 'd':
      return count === 2 ? pad(p.day) : String(p.day);
    case 'E':
      return count >= 4 ? WEEKDAYS_FULL[locale][p.weekday - 1] : WEEKDAYS_SHORT[locale][p.weekday - 1];
    case 'H':
      return count === 2 ? pad(p.hour) : String(p.hour);
    case 'm':
      return count === 2 ? pad(p.minute) : String(p.minute);
    case 's':
      return count === 2 ? pad(p.second) : String(p.second);
    default:
      return ch.repeat(count);
  }
}

/** Põe em maiúscula a primeira letra de cada palavra ("segunda-feira, 17 nov." → "Segunda-Feira, 17 Nov."). */
export function capitalizedWords(s: string): string {
  return s
    .toLowerCase()
    .replace(/(^|[^A-Za-zÀ-ÖØ-öø-ÿ0-9])([A-Za-zÀ-ÖØ-öø-ÿ])/g, (_m, pre: string, ch: string) => pre + ch.toUpperCase());
}
