/**
 * Cache local de todos os dias e ações (`Documents/days.json`).
 *
 * Permite abrir a app com dados mesmo sem rede e entra no backup automático
 * do iCloud / Android. Também guarda campos que o backend ainda não devolve
 * (cliente, empresa, quantidade, km, posto, gasóleo, AdBlue, unidade): ver
 * `mergeWithCache`.
 *
 * @module storage/daysCache
 */

import { File, Paths } from 'expo-file-system';
import { DayActionStruct, DayStruct } from '../types/models';
import { stableStringify, writeTextFile } from './files';

const cacheFile = () => new File(Paths.document, 'days.json');

/** Guarda a lista completa de dias (erros são ignorados). */
export function saveDaysCache(days: DayStruct[]): void {
  try {
    writeTextFile(cacheFile(), stableStringify(days));
  } catch (e) {
    if (__DEV__) console.log('[daysCache] erro ao guardar dias:', e);
  }
}

/** Lê os dias guardados; `[]` se não houver cache ou estiver corrompida. */
export function loadDaysCache(): DayStruct[] {
  try {
    const f = cacheFile();
    if (!f.exists) return [];
    return JSON.parse(f.textSync()) as DayStruct[];
  } catch (e) {
    if (__DEV__) console.log('[daysCache] erro ao ler dias:', e);
    return [];
  }
}

/** Campos das ações que só existem localmente enquanto o backend não os devolver. */
const LOCAL_ONLY_FIELDS = ['cliente', 'empresaLocal', 'quantidade', 'unidade', 'posto', 'gasoleoL', 'adblueL', 'km'] as const;

/**
 * Junta os dias vindos do backend com os da cache: para cada ação com o
 * mesmo id, os campos locais que o backend devolveu vazios são preservados.
 * A lista e a ordem são as do backend.
 */
export function mergeWithCache(remote: DayStruct[], local: DayStruct[]): DayStruct[] {
  const localById = new Map(local.map((d) => [d.id, d]));
  return remote.map((remoteDay) => {
    const localDay = localById.get(remoteDay.id);
    if (!localDay) return remoteDay;
    const localActionsById = new Map((localDay.actions ?? []).map((a) => [a.id, a]));
    const actions = (remoteDay.actions ?? []).map((remoteAction): DayActionStruct => {
      const localAction = localActionsById.get(remoteAction.id);
      if (!localAction) return remoteAction;
      const merged: DayActionStruct = { ...remoteAction };
      for (const field of LOCAL_ONLY_FIELDS) {
        if (merged[field] == null) (merged as unknown as Record<string, unknown>)[field] = localAction[field];
      }
      return merged;
    });
    return { ...remoteDay, actions };
  });
}
