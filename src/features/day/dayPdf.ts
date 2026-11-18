/**
 * PDF "Resumo do dia" (tamanho Letter, 1 página): dados do dia e lista das ações.
 * Gerado a partir do menu de toque longo na lista de dias.
 */

import { actionTitle } from '../../domain/actionTypes';
import { strings } from '../../i18n';
import { formatAppDate } from '../../lib/dateFormat';
import { totalKm } from '../../domain/days';
import { DayStruct } from '../../types/models';
import { htmlDocument, renderPdf, text } from '../../lib/pdf';

export async function createDayPdf(day: DayStruct): Promise<string> {
  const pageWidth = 612;
  const pageHeight = 792;
  const t = strings().day.pdf;
  const parts: string[] = [];
  let currentY = 20;

  parts.push(text(t.title(formatAppDate(day.date)), 20, currentY, pageWidth - 40, 30, { size: 24, weight: 700 }));
  currentY += 40;

  const details = [
    t.id(day.id),
    t.date(formatAppDate(day.date)),
    t.weekStart(day.weekStart),
    t.startKm(day.departureKm ?? 0),
    t.endKm(day.arriveKm ?? 0),
    t.totalKm(totalKm(day.departureKm ?? 0, day.arriveKm ?? 0)),
    t.drivingMinutes(day.drivingMinutes ?? 0),
    t.truckPlate(day.truckPlate),
    t.trailerPlate(day.trailerPlate),
    t.notes(day.observations),
  ].join('\n');
  parts.push(text(details, 20, currentY, pageWidth - 40, 200, { size: 16, lines: 99 }));
  currentY += 220;

  parts.push(text(t.actionsTitle, 20, currentY, pageWidth - 40, 30, { size: 24, weight: 700 }));
  currentY += 40;

  for (const action of day.actions ?? []) {
    const actionDetails = [
      t.action(actionTitle(action.action)),
      t.date(formatAppDate(action.date)),
      t.local(action.local),
      t.info(action.additionalInformations ?? ''),
    ].join('\n');
    parts.push(text(actionDetails, 20, currentY, pageWidth - 40, 100, { size: 16, lines: 99 }));
    currentY += 120;
  }

  return renderPdf(htmlDocument([parts.join('')], pageWidth, pageHeight), pageWidth, pageHeight, t.fileName);
}
