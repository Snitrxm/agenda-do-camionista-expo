/**
 * Exportação manual de backup (JSON) a partir dos Ajustes.
 *
 * @module storage/backup
 */

import { File, Paths } from 'expo-file-system';
import { getCurrentUser } from '../stores/authStore';
import { loadDaysCache } from './daysCache';
import { stableStringify, writeTextFile } from './files';

/**
 * Gera `agenda-camionista-backup-AAAA-MM-DD.json` na cache (para partilhar)
 * e uma cópia fixa `Documents/backup.json`.
 *
 * @returns URI do ficheiro a partilhar, ou `null` em caso de erro
 */
export function exportBackupFile(appVersion: string): string | null {
  try {
    const payload = {
      app: 'Agenda do Camionista',
      version: appVersion,
      exportedAt: new Date().toISOString(),
      user: getCurrentUser(),
      days: loadDaysCache(),
    };
    const text = stableStringify(payload);
    const d = new Date();
    const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const out = new File(Paths.cache, `agenda-camionista-backup-${ymd}.json`);
    writeTextFile(out, text);
    try {
      writeTextFile(new File(Paths.document, 'backup.json'), text);
    } catch {}
    return out.uri;
  } catch (e) {
    if (__DEV__) console.log('[backup] erro ao exportar:', e);
    return null;
  }
}
