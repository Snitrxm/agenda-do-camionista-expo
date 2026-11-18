/**
 * Traduções da app (português e espanhol).
 *
 * - Os textos estão em dicionários por idioma: `i18n/pt/*` (fonte de verdade)
 *   e `i18n/es/*` (tem de ter exatamente as mesmas chaves — o TypeScript
 *   avisa se faltar alguma).
 * - Textos com valores variáveis são funções: `s.home.leaveAt(hora)`.
 * - Em componentes usar `useStrings()` (volta a desenhar ao mudar de idioma);
 *   fora de componentes (regras, alertas, PDFs) usar `strings()`.
 * - O idioma vem de um *provider* registado pelo `settingsStore`
 *   (escolha em Ajustes ou idioma do telemóvel). Por omissão: português.
 *
 * Para acrescentar um idioma: criar `i18n/<código>/` com os mesmos ficheiros,
 * juntá-lo a `DICTIONARIES` e a `Language`, e à lista de Ajustes.
 *
 * @module i18n
 */

import type { AppLocale } from '../lib/timezone';
import { es } from './es';
import { pt } from './pt';

export type Language = 'pt' | 'es';

/** Forma de todos os dicionários (igual à do português). */
export type Strings = typeof pt;

const DICTIONARIES: Record<Language, Strings> = { pt, es };

let languageProvider: () => Language = () => 'pt';

/** Regista a função que devolve o idioma atual. */
export function setLanguageProvider(provider: () => Language): void {
  languageProvider = provider;
}

/** Idioma atual. */
export function currentLanguage(): Language {
  return languageProvider();
}

/** Textos no idioma atual. */
export function strings(): Strings {
  return DICTIONARIES[languageProvider()];
}

/**
 * Locale para formatar datas: em espanhol `es`; em português a variante
 * indicada (a app usa pt_BR nas datas "da app" e pt_PT nos cartões novos).
 */
export function dateLocale(portugueseVariant: 'pt_BR' | 'pt_PT'): AppLocale {
  return languageProvider() === 'es' ? 'es' : portugueseVariant;
}
