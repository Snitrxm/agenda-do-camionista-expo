/**
 * Formatação de datas "da app" (locale pt_BR, como na versão Swift) e
 * conversões ISO 8601.
 *
 * O fuso horário usado depende da data:
 * - até 25/09/2026 00:00 (Lisboa) → sempre Europe/Lisbon;
 * - depois disso → o fuso escolhido em Ajustes (Lisboa ou Madrid).
 *
 * O fuso escolhido é fornecido por `setAppTimeZoneProvider`, registado pelo
 * store de definições. Assim este módulo (e as regras em `domain/`) não
 * dependem de React nem do armazenamento e podem ser testados em Node.
 *
 * @module lib/dateFormat
 */

import { dateLocale, strings } from '../i18n';
import { formatDate, fromWall } from './timezone';

const LISBON = 'Europe/Lisbon';

/** A partir desta data passa a valer o fuso escolhido em Ajustes. */
const TIME_ZONE_RULE_CUTOFF: Date = fromWall(2026, 9, 25, 0, 0, 0, LISBON);

let appTimeZoneProvider: () => string = () => LISBON;

/** Regista a função que devolve o fuso escolhido pelo utilizador (IANA). */
export function setAppTimeZoneProvider(provider: () => string): void {
  appTimeZoneProvider = provider;
}

/** Fuso horário escolhido pelo utilizador (IANA). */
export function appTimeZone(): string {
  return appTimeZoneProvider();
}

/** Converte uma string ISO 8601 em `Date`; `null` se for vazia ou inválida. */
export function parseISO(isoString: string | null | undefined): Date | null {
  if (!isoString) return null;
  const t = Date.parse(isoString);
  return isNaN(t) ? null : new Date(t);
}

/** Fuso a usar para mostrar uma data (regra da data de corte acima). */
function displayTimeZoneFor(date: Date): string {
  return date.getTime() > TIME_ZONE_RULE_CUTOFF.getTime() ? appTimeZone() : LISBON;
}

/**
 * Formata uma data (ou string ISO) para mostrar na app.
 *
 * @param pattern padrão de `formatDate` (por omissão `"dd/MM/yy - EEEE"`)
 * @returns o texto formatado, ou `"Data inválida"` se a string não for uma data
 * @example formatAppDate('2026-11-17T20:30:00Z')            // "17/11/26 - terça-feira"
 * @example formatAppDate(date, "dd/MM/yy 'às' HH:mm")       // "17/11/26 às 20:30"
 */
export function formatAppDate(date: Date | string, pattern?: string): string {
  let d: Date | null;
  if (typeof date === 'string') {
    d = parseISO(date);
    if (!d) return strings().dates.invalidDate;
  } else {
    d = date;
  }
  return formatDate(d, pattern ?? 'dd/MM/yy - EEEE', displayTimeZoneFor(d), dateLocale('pt_BR'));
}

/** Minutos → "HH:MM" (ex.: 545 → "09:05"). */
export function minutesToClock(minutes: number): string {
  const h = Math.trunc(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Agora em ISO 8601 sem frações de segundo (formato enviado ao criar dias/ações). */
export function nowISO8601(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/** ISO 8601 com milissegundos (formato enviado ao editar ações). */
export function toISOWithMillis(date: Date): string {
  return date.toISOString();
}
