/**
 * Como cada ação aparece na linha do tempo do dia: ícone, cor, linha de
 * detalhe e etiqueta (fracionado / reduzida X de 3).
 *
 * Nota: as regras de ícone/cor usam `includes` sobre o identificador, por isso
 * "Carregamento"/"Descarga"/"Abastecimento" ficam com o ícone e cor genéricos
 * (azul), tal como na versão original.
 */

import { isFractionedNineHourRest } from '../../domain/fractionedRest';
import { strings } from '../../i18n';
import { parseISO } from '../../lib/dateFormat';
import { formatDecimal, formatInteger } from '../../lib/numbers';
import { DayActionStruct } from '../../types/models';
import { colors } from '../../ui/theme';

/** Ícone (SF Symbol) da ação na linha do tempo. */
export function actionIcon(action: string): string {
  if (action === 'Repouso 3H+') return 'bed.double.fill';
  if (action.includes('Partida')) return 'arrow.up';
  if (action.includes('Chegada')) return 'arrow.down';
  if (action.includes('Pausa')) return 'pause';
  if (action.includes('Carga')) return 'arrow.up.doc';
  if (action.includes('Descarga')) return 'arrow.down.doc';
  return 'circle';
}

/** Cor da ação na linha do tempo. */
export function actionColor(action: string): string {
  if (action === 'Repouso 3H+') return colors.restGreen;
  if (action.includes('Partida')) return colors.green;
  if (action.includes('Chegada')) return colors.red;
  if (action.includes('Pausa')) return colors.orange;
  if (action.includes('Carga')) return colors.pink;
  if (action.includes('Descarga')) return colors.purple;
  return colors.blue;
}

/** "Empresa, local" / "Empresa" / "local" / null. */
function joinCompanyAndPlace(company: string | null | undefined, local: string): string | null {
  const c = company ?? '';
  if (c && local) return `${c}, ${local}`;
  if (c) return c;
  if (local) return local;
  return null;
}

/** Linha de detalhe da ação (cliente, quantidade, empresa/local, km, combustível…). */
export function actionDetailLine(a: DayActionStruct): string {
  const parts: string[] = [];
  switch (a.action) {
    case 'Carregamento': {
      if (a.cliente) parts.push(a.cliente);
      const place = joinCompanyAndPlace(a.empresaLocal, a.local);
      if (place) parts.push(place);
      if (a.km != null) parts.push(`km ${formatInteger(a.km)}`);
      return parts.join(' · ');
    }
    case 'Descarga': {
      if (a.cliente) parts.push(a.cliente);
      if (a.quantidade != null) parts.push(`${formatDecimal(a.quantidade)} ${a.unidade ?? 'L'}`);
      const place = joinCompanyAndPlace(a.empresaLocal, a.local);
      if (place) parts.push(place);
      if (a.km != null) parts.push(`km ${formatInteger(a.km)}`);
      return parts.join(' · ');
    }
    case 'Abastecimento': {
      const place = joinCompanyAndPlace(a.posto, a.local);
      if (place) parts.push(place);
      if (a.km != null) parts.push(`km ${formatInteger(a.km)}`);
      if (a.gasoleoL != null) parts.push(strings().day.actionsTab.diesel(formatDecimal(a.gasoleoL)));
      if (a.adblueL != null) parts.push(strings().day.actionsTab.adblue(formatDecimal(a.adblueL)));
      return parts.join(' · ');
    }
    default:
      return a.local;
  }
}

/** Etiqueta da ação na linha do tempo, ou `null`. */
export type ActionBadge = { kind: 'split-first-part' } | { kind: 'split-nine-hour' } | { kind: 'reduced'; index: number };

/**
 * - Repouso 3H+ → "Conta como 1.ª parte do fracionado"
 * - Repouso 9H fracionado → "Fracionado 3+9"
 * - Repouso 9H não fracionado → "Reduzida (N de 3)", N = ordem entre os 9H não fracionados do dia
 */
export function actionBadge(action: DayActionStruct, dayActions: DayActionStruct[]): ActionBadge | null {
  if (action.action === 'Repouso 3H+') return { kind: 'split-first-part' };
  if (action.action !== 'Pausa 9H') return null;
  if (isFractionedNineHourRest(action, dayActions)) return { kind: 'split-nine-hour' };
  const reduced = dayActions
    .filter((a) => a.action === 'Pausa 9H' && !isFractionedNineHourRest(a, dayActions))
    .map((a, i) => ({ a, i }))
    .sort((x, y) => (parseISO(x.a.date)?.getTime() ?? -Infinity) - (parseISO(y.a.date)?.getTime() ?? -Infinity) || x.i - y.i)
    .map((x) => x.a);
  const idx = reduced.findIndex((a) => a.id === action.id);
  return idx >= 0 ? { kind: 'reduced', index: idx + 1 } : null;
}
