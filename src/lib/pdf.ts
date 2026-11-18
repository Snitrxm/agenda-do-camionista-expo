/**
 * Desenho de PDFs a partir de HTML com coordenadas absolutas (em pontos).
 *
 * Cada função devolve um pedaço de HTML posicionado com `position:absolute`,
 * o que permite reproduzir ao milímetro os modelos em papel (folha de
 * serviço Agrotir, resumo do dia). `htmlDocument` junta as páginas e
 * `renderPdf` gera o ficheiro com expo-print.
 *
 * @module lib/pdf
 */

import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';

/** Escapa texto para HTML. */
export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Opções de texto: tamanho em pt, peso, cor, alinhamento e nº de linhas. */
export interface TextOpts {
  size: number;
  weight?: number;
  italic?: boolean;
  color?: string;
  align?: 'left' | 'center' | 'right';
  lines?: number; // 1 = truncar; >1 = quebra de linha
}

/** Caixa de texto em (x, y) com largura `w` e altura `h`. */
export function text(t: string, x: number, y: number, w: number, h: number, o: TextOpts): string {
  const single = (o.lines ?? 1) === 1;
  const style = [
    `left:${x}px`,
    `top:${y}px`,
    `width:${w}px`,
    `height:${h}px`,
    `font-size:${o.size}px`,
    `font-weight:${o.weight ?? 400}`,
    o.italic ? 'font-style:italic' : '',
    `color:${o.color ?? '#000'}`,
    `text-align:${o.align ?? 'left'}`,
    single ? 'white-space:pre;text-overflow:ellipsis' : 'white-space:pre-wrap;word-wrap:break-word',
  ]
    .filter(Boolean)
    .join(';');
  return `<div class="t" style="${style}">${esc(t)}</div>`;
}

/** Linha horizontal ou vertical com espessura `width`. */
export function line(x1: number, y1: number, x2: number, y2: number, width: number, color: string): string {
  if (x1 === x2) {
    return `<div class="l" style="left:${x1 - width / 2}px;top:${Math.min(y1, y2)}px;width:${width}px;height:${Math.abs(y2 - y1)}px;background:${color}"></div>`;
  }
  return `<div class="l" style="left:${Math.min(x1, x2)}px;top:${y1 - width / 2}px;width:${Math.abs(x2 - x1)}px;height:${width}px;background:${color}"></div>`;
}

/** Contorno de retângulo (traço centrado na aresta, como o UIBezierPath). */
export function strokeRect(x: number, y: number, w: number, h: number, width = 1, color = '#000'): string {
  return `<div class="l" style="left:${x - width / 2}px;top:${y - width / 2}px;width:${w + width}px;height:${h + width}px;border:${width}px solid ${color}"></div>`;
}

/** Retângulo preenchido. */
export function fillRect(x: number, y: number, w: number, h: number, color: string): string {
  return `<div class="l" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${color}"></div>`;
}

/** Imagem (URL ou data URI). */
export function image(src: string, x: number, y: number, w: number, h: number): string {
  return `<img class="l" src="${src}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px" />`;
}

/** Junta as páginas num documento HTML com o tamanho de página indicado. */
export function htmlDocument(pages: string[], width: number, height: number): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
<meta name="viewport" content="width=${width}, initial-scale=1" />
<style>
@page { size: ${width}px ${height}px; margin: 0; }
html, body { margin: 0; padding: 0; }
body { font-family: -apple-system, 'Helvetica Neue', Roboto, Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { position: relative; width: ${width}px; height: ${height}px; overflow: hidden; page-break-after: always; break-after: page; }
.page:last-child { page-break-after: auto; break-after: auto; }
.t { position: absolute; overflow: hidden; line-height: 1.19; box-sizing: border-box; }
.l { position: absolute; box-sizing: border-box; }
</style></head><body>
${pages.map((p) => `<div class="page">${p}</div>`).join('\n')}
</body></html>`;
}

/** Gera o PDF e copia-o para a cache com o nome indicado. Devolve o URI. */
export async function renderPdf(html: string, width: number, height: number, fileName: string): Promise<string> {
  const { uri } = await Print.printToFileAsync({ html, width, height, margins: { left: 0, right: 0, top: 0, bottom: 0 } });
  const src = new File(uri);
  const dest = new File(Paths.cache, fileName);
  if (dest.exists) dest.delete();
  src.moveSync(dest);
  return dest.uri;
}
