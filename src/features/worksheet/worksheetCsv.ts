/**
 * Exportação da folha de serviço para CSV (separador ";" e BOM UTF-8,
 * para abrir corretamente no Excel em português).
 */

import { File, Paths } from 'expo-file-system';
import { sheetCells, WorkSheetRow } from './worksheetModel';

function escape(field: string): string {
  if (field.includes(';') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/** Gera o CSV da página 1 (uma linha por serviço). */
export function makeCsv(rows: WorkSheetRow[], motorista: string): string {
  const sep = ';';
  const lines: string[] = [
    ['Dia', 'Motorista', 'Cliente', 'Local de carga', 'Local de descarga', 'Descarga', 'Kms iniciais', 'Kms finais'].join(sep),
  ];
  for (const r of rows) {
    const c = sheetCells(r);
    lines.push(
      [c.day, motorista, c.client, c.loadPlace, c.unloadPlace, c.unloaded, c.kmStart, c.kmEnd]
        .map(escape)
        .join(sep)
    );
  }
  // BOM UTF-8 para o Excel abrir corretamente com acentos
  return '\uFEFF' + lines.join('\r\n') + '\r\n';
}

/** Grava o CSV na cache com o nome indicado e devolve o URI. */
export function writeCsvFile(content: string, fileName: string): string {
  const f = new File(Paths.cache, fileName);
  if (f.exists) f.delete();
  f.create();
  f.writeSync(content);
  return f.uri;
}
