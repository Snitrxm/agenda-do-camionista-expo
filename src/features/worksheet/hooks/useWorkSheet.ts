/**
 * Estado da Folha de serviço (período, data de referência, matrícula) e
 * exportação para PDF / CSV com partilha.
 *
 * Trabalha sobre um instantâneo dos dias tirado quando o ecrã abre.
 */

import * as Sharing from 'expo-sharing';
import { useMemo, useState } from 'react';
import { strings } from '../../../i18n';
import { capitalizedWords, formatDate } from '../../../lib/timezone';
import { getCurrentUser } from '../../../stores/authStore';
import { useDaysStore } from '../../../stores/daysStore';
import { timeZoneId, useSettingsStore } from '../../../stores/settingsStore';
import { makeCsv, writeCsvFile } from '../worksheetCsv';
import {
  buildFuelingEntries,
  buildRows,
  counts,
  daysInPeriod,
  filterByPlate,
  missingFinalKmWarnings,
  periodTitle,
  stepPeriod,
  trailerInPeriod,
  trucksInPeriod,
  WorkSheetPeriod,
} from '../worksheetModel';
import { makeWorkSheetPdf } from '../worksheetPdf';

export function useWorkSheet() {
  const [days] = useState(() => useDaysStore.getState().days);
  const tz = timeZoneId(useSettingsStore((s) => s.timeZone));
  const [period, setPeriod] = useState<WorkSheetPeriod>('month');
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [selectedTruckPlate, setSelectedTruckPlate] = useState<string | null>(null);
  const [lastSyncLabel] = useState(() => {
    const d = new Date();
    return strings().worksheet.todayAt(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
  });

  const inPeriod = useMemo(() => daysInPeriod(days, period, referenceDate, tz), [days, period, referenceDate, tz]);
  const trucks = trucksInPeriod(inPeriod);
  const trailer = trailerInPeriod(inPeriod);
  const filtered = filterByPlate(inPeriod, selectedTruckPlate);
  // `days` inteiro: a carga de uma descarga pode estar fora do período.
  const rows = useMemo(() => buildRows(filtered, tz, days), [filtered, tz, days]);
  const title = periodTitle(period, referenceDate, tz);

  /** "Registo servico <matrícula> <período>" */
  const fileBaseName = () => {
    const plate = selectedTruckPlate ?? trucks[0] ?? 'matricula';
    return `Registo servico ${plate} ${title.replace(/ /g, '-').replace(/,/g, '')}`;
  };

  const sharePdf = async () => {
    try {
      const uri = await makeWorkSheetPdf(
        {
          title,
          // O PDF é o modelo Agrotir: fica sempre em português.
          mes: capitalizedWords(formatDate(referenceDate, 'MMMM', undefined, 'pt_PT')),
          ano: formatDate(referenceDate, 'yyyy', undefined, 'pt_PT'),
          truckPlate: selectedTruckPlate ?? trucks[0] ?? null,
          trailerPlate: trailer,
          motorista: getCurrentUser()?.name ?? '—',
          rows: buildRows(filtered, tz, days),
          fuelings: buildFuelingEntries(filtered, tz),
        },
        `${fileBaseName()}.pdf`
      );
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    } catch (e) {
      console.log(e);
    }
  };

  const shareCsv = async () => {
    try {
      const uri = writeCsvFile(makeCsv(buildRows(filtered, tz, days), getCurrentUser()?.name ?? ''), `${fileBaseName()}.csv`);
      await Sharing.shareAsync(uri, { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text' });
    } catch (e) {
      console.log(e);
    }
  };

  return {
    period,
    setPeriod,
    title,
    trucks,
    trailer,
    selectedTruckPlate,
    setSelectedTruckPlate,
    rows,
    counts: counts(filtered),
    warnings: missingFinalKmWarnings(filtered, tz),
    lastSyncLabel,
    previous: () => setReferenceDate(stepPeriod(period, referenceDate, -1, tz)),
    next: () => setReferenceDate(stepPeriod(period, referenceDate, 1, tz)),
    sharePdf,
    shareCsv,
  };
}
