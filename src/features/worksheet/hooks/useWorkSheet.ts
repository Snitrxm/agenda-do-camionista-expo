/**
 * Estado da Folha de serviço (datas De / Até, matrícula) e exportação para
 * PDF / CSV com partilha. Com "Até" antes de "De" há erro e não exporta.
 *
 * Trabalha sobre um instantâneo dos dias tirado quando o ecrã abre.
 */

import * as Sharing from 'expo-sharing';
import { useMemo, useState } from 'react';
import { strings } from '../../../i18n';
import { getCurrentUser } from '../../../stores/authStore';
import { useDaysStore } from '../../../stores/daysStore';
import { timeZoneId, useSettingsStore } from '../../../stores/settingsStore';
import { makeCsv, writeCsvFile } from '../worksheetCsv';
import {
  buildFuelingEntries,
  buildRows,
  counts,
  DateRange,
  daysInRange,
  defaultRange,
  fileBaseName,
  filterByPlate,
  missingFinalKmWarnings,
  rangeError,
  rangeHeader,
  rangeTitle,
  trailerInPeriod,
  trucksInPeriod,
} from '../worksheetModel';
import { makeWorkSheetPdf } from '../worksheetPdf';

export function useWorkSheet() {
  const [days] = useState(() => useDaysStore.getState().days);
  const tz = timeZoneId(useSettingsStore((s) => s.timeZone));
  const [range, setRange] = useState<DateRange>(() => defaultRange(new Date(), tz));
  const [selectedTruckPlate, setSelectedTruckPlate] = useState<string | null>(null);
  const [lastSyncLabel] = useState(() => {
    const d = new Date();
    return strings().worksheet.todayAt(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
  });

  const error = rangeError(range, tz);
  const inPeriod = useMemo(() => (error ? [] : daysInRange(days, range, tz)), [days, range, tz, error]);
  const trucks = trucksInPeriod(inPeriod);
  const trailer = trailerInPeriod(inPeriod);
  const filtered = filterByPlate(inPeriod, selectedTruckPlate);
  // `days` inteiro: a carga de uma descarga pode estar fora do período.
  const rows = useMemo(() => buildRows(filtered, tz, days), [filtered, tz, days]);
  const truckPlate = selectedTruckPlate ?? trucks[0] ?? null;

  const sharePdf = async () => {
    if (error) return;
    try {
      const header = rangeHeader(range, tz);
      const uri = await makeWorkSheetPdf(
        {
          title: rangeTitle(range, tz),
          periodLabel: header.label,
          periodValue: header.value,
          truckPlate,
          trailerPlate: trailer,
          motorista: getCurrentUser()?.name ?? '—',
          rows: buildRows(filtered, tz, days),
          fuelings: buildFuelingEntries(filtered, tz),
        },
        `${fileBaseName(truckPlate, range, tz)}.pdf`
      );
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    } catch (e) {
      console.log(e);
    }
  };

  const shareCsv = async () => {
    if (error) return;
    try {
      const uri = writeCsvFile(makeCsv(buildRows(filtered, tz, days), getCurrentUser()?.name ?? ''), `${fileBaseName(truckPlate, range, tz)}.csv`);
      await Sharing.shareAsync(uri, { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text' });
    } catch (e) {
      console.log(e);
    }
  };

  return {
    range,
    setFrom: (from: Date) => setRange((r) => ({ ...r, from })),
    setUntil: (until: Date) => setRange((r) => ({ ...r, until })),
    /** "Até" antes de "De": mensagem de erro; os botões de exportar ficam desativados */
    error,
    title: rangeTitle(range, tz),
    trucks,
    trailer,
    selectedTruckPlate,
    setSelectedTruckPlate,
    rows,
    counts: counts(filtered),
    warnings: missingFinalKmWarnings(filtered, tz),
    lastSyncLabel,
    sharePdf,
    shareCsv,
  };
}
