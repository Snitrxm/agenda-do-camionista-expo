/**
 * PDF da folha de serviço "Registo Serviço Ibérico" (modelo Agrotir
 * MOG.AGT.026.00), A4 horizontal, 2 páginas:
 * 1. tabela de serviços (dia, motorista, cliente, carga, descarga, km);
 * 2. abastecimentos, lavagens, manutenções e observações.
 */

import { AGROTIR_LOGO_BASE64 } from '../../assets/agrotirLogo';
import { formatDecimal, formatInteger } from '../../lib/numbers';
import { fillRect, htmlDocument, image, line, renderPdf, strokeRect, text } from '../../lib/pdf';
import { FuelingEntry, sheetCells, WorkSheetRow } from './worksheetModel';

const PAGE_W = 842;
const PAGE_H = 595;
const margin = 20;
const GRAY_LINE = 'rgb(153,153,153)'; // UIColor(white: 0.6)
const HEADER_FILL = 'rgb(235,235,235)'; // UIColor(white: 0.92)

export interface WorkSheetPdfContext {
  title: string;
  mes: string;
  ano: string;
  truckPlate: string | null;
  trailerPlate: string | null;
  motorista: string;
  rows: WorkSheetRow[];
  fuelings: FuelingEntry[];
}

type Col = [string, number];
const sumW = (cols: Col[]) => cols.reduce((a, c) => a + c[1], 0);

function labelBox(out: string[], label: string, value: string, x: number, y: number, width: number, height: number) {
  const labelW = 64;
  out.push(text(label, x, y + 3, labelW, height, { size: 10, weight: 600 }));
  out.push(strokeRect(x + labelW, y, width - labelW, height, 0.6, '#000'));
  out.push(text(value, x + labelW + 4, y + 3, width - labelW - 8, height, { size: 10, weight: 700 }));
}

function topHeader(out: string[], showMatricula: boolean, data: WorkSheetPdfContext) {
  const y = 20;
  out.push(image(`data:image/jpeg;base64,${AGROTIR_LOGO_BASE64}`, margin, y - 4, 44, 44));

  const d = new Date();
  const todayStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  out.push(text('MOG.AGT.026.00 – Registo Serviço Ibérico', PAGE_W - margin - 260, y, 260, 14, { size: 10, align: 'right' }));
  out.push(text(`Data: ${todayStr}`, PAGE_W - margin - 260, y + 14, 260, 14, { size: 10, align: 'right' }));

  if (showMatricula) {
    const boxW = 150;
    const boxH = 20;
    const boxesX = PAGE_W / 2 - boxW - 20;
    labelBox(out, 'Matrícula:', data.truckPlate ?? '', boxesX, y - 2, boxW, boxH);
    labelBox(out, 'Mês:', data.mes, boxesX, y + boxH + 2, boxW, boxH);
    labelBox(out, 'Cisterna:', data.trailerPlate ?? '', PAGE_W / 2 + 20, y - 2, boxW, boxH);
    labelBox(out, 'Ano:', data.ano, PAGE_W / 2 + 20, y + boxH + 2, boxW, boxH);
  } else {
    out.push(text('(*) A compilação é da falha da aplicação "a-trans"', margin + 150, y + 10, 400, 14, { size: 9 }));
  }
}

function footer(out: string[], pageNumber: number) {
  const y = PAGE_H - 28;
  out.push(text('Elaborado por: Responsável de Qualidade', margin, y, 260, 14, { size: 10 }));
  out.push(text(`Página ${pageNumber} de 2`, PAGE_W / 2 - 60, y, 120, 14, { size: 10, align: 'center' }));
  out.push(text('Aprovado por: Gestão de Topo', PAGE_W - margin - 260, y, 260, 14, { size: 10, align: 'right' }));
}

function tableHeader(out: string[], cols: Col[], originX: number, y: number, height: number) {
  const totalW = sumW(cols);
  out.push(fillRect(originX, y, totalW, height, HEADER_FILL));
  let x = originX;
  cols.forEach(([title, w], i) => {
    if (i > 0) out.push(line(x, y, x, y + height, 0.5, '#000'));
    out.push(text(title, x + 3, y + 3, w - 6, height - 6, { size: 9, weight: 600, align: 'center', lines: 2 }));
    x += w;
  });
  out.push(line(originX, y + height, originX + totalW, y + height, 0.5, '#000'));
}

function emptyRow(out: string[], cols: Col[], originX: number, y: number, height: number) {
  let x = originX;
  cols.forEach(([, w], i) => {
    if (i > 0) out.push(line(x, y, x, y + height, 0.4, GRAY_LINE));
    x += w;
  });
  out.push(line(originX, y + height, originX + sumW(cols), y + height, 0.4, GRAY_LINE));
}

function rowValues(out: string[], cols: Col[], values: string[], originX: number, y: number, height: number, centered: (i: number) => boolean) {
  let x = originX;
  cols.forEach(([, w], i) => {
    out.push(text(values[i] ?? '', x + 3, y + 4, w - 6, height - 6, { size: 9, align: centered(i) ? 'center' : 'left' }));
    x += w;
  });
}

function page1(data: WorkSheetPdfContext): string {
  const out: string[] = [];
  topHeader(out, true, data);

  const tableTop = 80;
  const cols: Col[] = [
    ['Dia', 40],
    ['Motorista', 110],
    ['Cliente', 110],
    ['Local de carga', 155],
    ['Local de descarga', 155],
    ['Descarga\n(Kg ou L)', 95],
    ['Kms iniciais', 65],
    ['Kms finais', 65],
  ];
  const tableWidth = sumW(cols);
  const headerH = 30;
  const rowH = 20;
  const originX = margin + (PAGE_W - 2 * margin - tableWidth) / 2;

  tableHeader(out, cols, originX, tableTop, headerH);
  const availableH = PAGE_H - tableTop - headerH - 40;
  const maxRows = Math.floor(availableH / rowH);
  const totalRows = Math.max(22, Math.min(data.rows.length, maxRows));

  let y = tableTop + headerH;
  for (let i = 0; i < totalRows; i++) {
    emptyRow(out, cols, originX, y, rowH);
    const r = data.rows[i];
    if (r) {
      const c = sheetCells(r);
      rowValues(
        out,
        cols,
        [c.day, data.motorista, c.client, c.loadPlace, c.unloadPlace, c.unloaded, c.kmStart, c.kmEnd],
        originX,
        y,
        rowH,
        (i2) => i2 === 0 || i2 >= 5
      );
    }
    y += rowH;
  }
  out.push(strokeRect(originX, tableTop, tableWidth, headerH + totalRows * rowH, 0.8, '#000'));
  footer(out, 1);
  return out.join('');
}

function sectionTitle(out: string[], title: string, x: number, y: number, width: number) {
  out.push(text(title, x, y, width, 16, { size: 11, weight: 700, align: 'center' }));
}

function page2(data: WorkSheetPdfContext): string {
  const out: string[] = [];
  topHeader(out, false, data);

  const topY = 70;
  const usable = PAGE_W - 2 * margin;
  const gap = 12;
  const halfW = (usable - gap) / 2;

  sectionTitle(out, '(*) Abastecimentos', margin, topY, halfW);
  sectionTitle(out, '(*) Lavagens', margin + halfW + gap, topY, halfW);

  const fuelCols: Col[] = [
    ['Dia', 30],
    ['Posto de abastecimento', halfW - 30 - 60 - 55 - 55 - 55],
    ['Quilómetros', 60],
    ['Gasóleo (L)', 55],
    ['Adblue (L)', 55],
    ['Motorista', 55],
  ];
  const rowH = 20;
  const headerH = 22;
  const tableTopY = topY + 18;
  const fuelOriginX = margin;
  tableHeader(out, fuelCols, fuelOriginX, tableTopY, headerH);

  let fuelY = tableTopY + headerH;
  const fuelRows = 10;
  for (let i = 0; i < fuelRows; i++) {
    emptyRow(out, fuelCols, fuelOriginX, fuelY, rowH);
    const e = data.fuelings[i];
    if (e) {
      rowValues(
        out,
        fuelCols,
        [
          String(e.dayNumber),
          e.posto,
          e.km != null ? formatInteger(e.km) : '',
          e.gasoleoL != null ? formatDecimal(e.gasoleoL) : '',
          e.adblueL != null ? formatDecimal(e.adblueL) : '',
          data.motorista,
        ],
        fuelOriginX,
        fuelY,
        rowH,
        (i2) => i2 === 0 || i2 >= 2
      );
    }
    fuelY += rowH;
  }
  out.push(strokeRect(fuelOriginX, tableTopY, sumW(fuelCols), headerH + fuelRows * rowH, 1, '#000'));

  // Lavagens (direita) — a moldura sai cinzenta como no original
  const washCols: Col[] = [
    ['Dia', 30],
    ['Posto de Lavagem', halfW * 0.45],
    ['Observações', halfW - 30 - halfW * 0.45],
  ];
  const washOriginX = margin + halfW + gap;
  tableHeader(out, washCols, washOriginX, tableTopY, headerH);
  let washY = tableTopY + headerH;
  for (let i = 0; i < fuelRows; i++) {
    emptyRow(out, washCols, washOriginX, washY, rowH);
    washY += rowH;
  }
  out.push(strokeRect(washOriginX, tableTopY, sumW(washCols), headerH + fuelRows * rowH, 1, GRAY_LINE));

  // Registo de manutenções e/ou reparações
  const maintTopY = Math.max(fuelY, washY) + 16;
  sectionTitle(out, 'Registo de manutenções e/ou reparações', margin, maintTopY, usable);
  const maintCols: Col[] = [
    ['Dia', 40],
    ['Oficina', 150],
    ['Trabalho realizado', usable - 40 - 150 - 170],
    ['Quilómetros da viatura', 170],
  ];
  const maintHeadY = maintTopY + 18;
  tableHeader(out, maintCols, margin, maintHeadY, headerH);
  let mY = maintHeadY + headerH;
  const maintRows = 6;
  for (let i = 0; i < maintRows; i++) {
    emptyRow(out, maintCols, margin, mY, rowH);
    mY += rowH;
  }
  out.push(strokeRect(margin, maintHeadY, usable, headerH + maintRows * rowH, 1, GRAY_LINE));

  // Sugestões / Observações
  const sugTopY = mY + 10;
  out.push(text('Sugestões/observações:', margin + 6, sugTopY + 4, 300, 14, { size: 10, weight: 600 }));
  out.push(strokeRect(margin, sugTopY, usable, 60, 1, GRAY_LINE));

  footer(out, 2);
  return out.join('');
}

export async function makeWorkSheetPdf(context: WorkSheetPdfContext, fileName: string): Promise<string> {
  const html = htmlDocument([page1(context), page2(context)], PAGE_W, PAGE_H);
  return renderPdf(html, PAGE_W, PAGE_H, fileName);
}
