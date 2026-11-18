/**
 * Lógica (sem UI) dos formulários de ações: campos extra, corpo dos pedidos,
 * sugestões e associação Descarga → Carregamento.
 */

import { parseISO } from '../../lib/dateFormat';
import { parseDecimal, parseDigits } from '../../lib/numbers';
import { CreateActionResponse, DayActionStruct } from '../../types/models';

/** Campos extra de Carregamento / Descarga / Abastecimento, tal como escritos. */
export interface ExtraFields {
  /** empresa de carga/descarga (`empresaLocal`) */
  company: string;
  quantityText: string;
  /** "L" ou "kg" */
  unit: string;
  /** posto de abastecimento */
  station: string;
  dieselText: string;
  adblueText: string;
  kmText: string;
}

export const EMPTY_EXTRA_FIELDS: ExtraFields = {
  company: '',
  quantityText: '',
  unit: 'L',
  station: '',
  dieselText: '',
  adblueText: '',
  kmText: '',
};

/** Campos extra preenchidos a partir de uma ação existente (editar). */
export function extraFieldsFromAction(a: DayActionStruct): ExtraFields {
  const decimalText = (v: number | null | undefined) => (v != null ? String(v).replace('.', ',') : '');
  return {
    company: a.empresaLocal ?? '',
    quantityText: decimalText(a.quantidade),
    unit: a.unidade ?? 'L',
    station: a.posto ?? '',
    dieselText: decimalText(a.gasoleoL),
    adblueText: decimalText(a.adblueL),
    kmText: a.km != null ? String(a.km) : '',
  };
}

/**
 * Campos extra a enviar à API para o tipo de ação.
 *
 * - Carregamento: o `cliente` é a própria empresa de carga.
 * - Descarga: `unloadClient` (cliente do carregamento por descarregar) só é
 *   usado ao criar.
 */
export function extraFieldsBody(action: string, f: ExtraFields, unloadClient?: string | null): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  const km = parseDigits(f.kmText);
  switch (action) {
    case 'Carregamento':
      if (f.company) {
        body.empresaLocal = f.company;
        body.cliente = f.company;
      }
      if (km != null) body.km = km;
      break;
    case 'Descarga': {
      if (unloadClient) body.cliente = unloadClient;
      if (f.company) body.empresaLocal = f.company;
      const qty = parseDecimal(f.quantityText);
      if (qty != null) body.quantidade = qty;
      body.unidade = f.unit;
      if (km != null) body.km = km;
      break;
    }
    case 'Abastecimento': {
      if (f.station) body.posto = f.station;
      const diesel = parseDecimal(f.dieselText);
      if (diesel != null) body.gasoleoL = diesel;
      const adblue = parseDecimal(f.adblueText);
      if (adblue != null) body.adblueL = adblue;
      if (km != null) body.km = km;
      break;
    }
  }
  return body;
}

/** Aplica os campos extra editados a uma ação (atualização local depois do PATCH). */
export function applyExtraFields(action: DayActionStruct, f: ExtraFields): DayActionStruct {
  const updated = { ...action };
  switch (updated.action) {
    case 'Carregamento':
      if (f.company) {
        updated.empresaLocal = f.company;
        updated.cliente = f.company;
      }
      updated.km = parseDigits(f.kmText);
      break;
    case 'Descarga':
      updated.empresaLocal = f.company || null;
      updated.quantidade = parseDecimal(f.quantityText);
      updated.unidade = f.unit;
      updated.km = parseDigits(f.kmText);
      break;
    case 'Abastecimento':
      updated.posto = f.station || null;
      updated.gasoleoL = parseDecimal(f.dieselText);
      updated.adblueL = parseDecimal(f.adblueText);
      updated.km = parseDigits(f.kmText);
      break;
  }
  return updated;
}

/**
 * Último Carregamento ainda por descarregar (por ordem cronológica, cada
 * Descarga fecha o Carregamento do mesmo cliente).
 */
export function findOpenLoad(dayActions: DayActionStruct[]): DayActionStruct | undefined {
  const ordered = dayActions
    .map((a, i) => ({ a, i }))
    .sort((x, y) => (parseISO(x.a.date)?.getTime() ?? -Infinity) - (parseISO(y.a.date)?.getTime() ?? -Infinity) || x.i - y.i)
    .map((x) => x.a);
  const open: DayActionStruct[] = [];
  for (const a of ordered) {
    if (a.action === 'Carregamento') open.push(a);
    else if (a.action === 'Descarga' && a.cliente != null) {
      const idx = open.findIndex((x) => x.cliente === a.cliente);
      if (idx >= 0) open.splice(idx, 1);
    }
  }
  return open[open.length - 1];
}

/** Sugestões (valores já usados no dia) para os campos de empresa e posto. */
export function fieldSuggestions(dayActions: DayActionStruct[]) {
  const values = (action: string, key: 'empresaLocal' | 'posto') =>
    Array.from(
      new Set(
        dayActions
          .filter((a) => a.action === action)
          .map((a) => (a[key] ?? '').trim())
          .filter((v) => v.length > 0)
      )
    );
  return {
    loadCompanies: values('Carregamento', 'empresaLocal'),
    unloadCompanies: values('Descarga', 'empresaLocal'),
    stations: values('Abastecimento', 'posto'),
  };
}

export type FieldSuggestions = ReturnType<typeof fieldSuggestions>;

/** Coordenada como texto ao estilo Swift (`0` → `"0.0"`), como a API espera. */
export function coordinateString(v: number): string {
  return Number.isInteger(v) ? v.toFixed(1) : String(v);
}

/** Ação nova a partir da resposta da API, completando com o que foi enviado. */
export function actionFromResponse(r: CreateActionResponse, dayId: string, sent: Record<string, unknown>): DayActionStruct {
  return {
    id: r.id,
    dayId,
    action: r.action,
    date: r.date,
    local: r.local,
    latitude: r.latitude,
    longitude: r.longitude,
    additionalInformations: r.additionalInformations,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    cliente: r.cliente ?? (sent.cliente as string | undefined),
    empresaLocal: r.empresaLocal ?? (sent.empresaLocal as string | undefined),
    quantidade: r.quantidade ?? (sent.quantidade as number | undefined),
    unidade: r.unidade ?? (sent.unidade as string | undefined),
    posto: r.posto ?? (sent.posto as string | undefined),
    gasoleoL: r.gasoleoL ?? (sent.gasoleoL as number | undefined),
    adblueL: r.adblueL ?? (sent.adblueL as number | undefined),
    km: r.km ?? (sent.km as number | undefined),
  };
}
