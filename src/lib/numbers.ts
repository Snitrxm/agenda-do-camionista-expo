/**
 * Leitura e formatação de números à portuguesa (pt_PT):
 * vírgula decimal e espaço como separador de milhares
 * (só a partir de 5 dígitos: "4661" mas "46 610").
 *
 * @module lib/numbers
 */

/**
 * Lê um número decimal escrito pelo utilizador, aceitando vírgula ou ponto
 * e ignorando espaços. Devolve `null` se o texto não for um número.
 *
 * @example parseDecimal('511,79') // 511.79
 * @example parseDecimal('25 000') // 25000
 */
export function parseDecimal(text: string): number | null {
  const cleaned = text.replace(/ /g, '').replace(/,/g, '.');
  if (cleaned === '' || !/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(cleaned)) return null;
  const v = Number(cleaned);
  return isFinite(v) ? v : null;
}

/**
 * Lê um inteiro aproveitando só os algarismos do texto (ex.: quilómetros).
 *
 * @example parseDigits('46 610') // 46610
 */
export function parseDigits(text: string): number | null {
  const cleaned = text.replace(/[^0-9]/g, '');
  if (!cleaned) return null;
  const v = Number(cleaned);
  return isFinite(v) ? v : null;
}

/** Agrupa os milhares com espaço, só a partir de 5 dígitos (regra pt_PT). */
function groupThousands(intPart: string): string {
  if (intPart.length < 5) return intPart;
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Arredondamento "bancário" (metade para o par), como o NumberFormatter do iOS. */
function roundHalfEven(value: number, digits: number): number {
  const m = Math.pow(10, digits);
  const x = value * m;
  const r = Math.round(x);
  const isHalf = Math.abs(x % 1) === 0.5;
  const v = isHalf ? (r % 2 === 0 ? r : r - 1) : r;
  return v / m;
}

/**
 * Formata um decimal em pt_PT, sem zeros à direita.
 *
 * @param fractionDigits casas decimais máximas (por omissão 2)
 * @example formatDecimal(511.79)      // "511,79"
 * @example formatDecimal(25000, 0)    // "25 000"
 */
export function formatDecimal(value: number, fractionDigits = 2): string {
  const rounded = roundHalfEven(value, fractionDigits);
  const neg = rounded < 0;
  const abs = Math.abs(rounded);
  let [intPart, frac = ''] = abs.toFixed(fractionDigits).split('.');
  frac = frac.replace(/0+$/, '');
  const s = groupThousands(intPart) + (frac ? ',' + frac : '');
  return neg ? '-' + s : s;
}

/**
 * Formata um inteiro em pt_PT.
 *
 * @example formatInteger(46610) // "46 610"
 */
export function formatInteger(value: number): string {
  const neg = value < 0;
  const s = groupThousands(String(Math.abs(Math.trunc(value))));
  return neg ? '-' + s : s;
}
