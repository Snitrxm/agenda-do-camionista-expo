/**
 * Utilitários de ficheiros locais (expo-file-system).
 *
 * @module storage/files
 */

import { File } from 'expo-file-system';

/** JSON com chaves ordenadas e indentação de 2 espaços (ficheiros legíveis e estáveis). */
export function stableStringify(value: unknown): string {
  return JSON.stringify(
    value,
    (_k, v) => {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        return Object.keys(v)
          .sort()
          .reduce<Record<string, unknown>>((acc, k) => {
            acc[k] = (v as Record<string, unknown>)[k];
            return acc;
          }, {});
      }
      return v;
    },
    2
  );
}

/** Escreve texto num ficheiro, substituindo o conteúdo anterior. */
export function writeTextFile(file: File, text: string): void {
  if (file.exists) file.delete();
  file.create();
  file.writeSync(text);
}
