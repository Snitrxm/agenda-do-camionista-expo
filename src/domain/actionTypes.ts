/**
 * Tipos de ação que o motorista pode registar e as suas propriedades.
 *
 * Os identificadores (ex.: `"Pausa 9H"`) são os valores guardados na API e
 * NÃO podem mudar. O texto mostrado ao utilizador vem de `actionDisplayName`
 * (ex.: `"Pausa 9H"` → `"Repouso 9H"`).
 *
 * Glossário:
 * - **Pausa** curta: 15, 30 ou 45 min durante a condução.
 * - **Repouso diário**: 9H (reduzido, "reduzida") ou 11H (normal).
 * - **Repouso 3H+**: 1.ª parte de um repouso fracionado 3+9.
 * - **Repouso semanal**: 24H (reduzido, gera compensação) ou 45H (normal),
 *   eventualmente com compensações de 21H acopladas.
 *
 * @module domain/actionTypes
 */

import { currentLanguage, strings } from '../i18n';

/** Lista de ações, pela ordem em que aparecem no menu "Criar Ação". */
export const ACTION_TYPES = [
  'Partida',
  'Chegada',
  'Pausa 15M',
  'Pausa 30M',
  'Pausa 45M',
  'Repouso 3H+',
  'Pausa 9H',
  'Pausa 11H',
  'Pausa 24H',
  'Pausa 45H',
  'Pausa 45H + Compensação 21H',
  'Pausa 45H + 2 Compensações 21H',
  'Carregamento',
  'Descarga',
  'Abastecimento',
  'Outros',
] as const;

/** Ações com campos extra (empresa, quantidade, km, combustível…). */
export const ACTIONS_WITH_EXTRA_FIELDS = ['Carregamento', 'Descarga', 'Abastecimento'];

/** Pausas curtas durante a condução. */
export const SHORT_BREAKS = new Set<string>(['Pausa 15M', 'Pausa 30M', 'Pausa 45M']);

/**
 * Repousos que encerram o dia (diários e semanais).
 * Um dia com Partida e sem nenhum destes nem Chegada está "em aberto".
 */
export const DAY_ENDING_RESTS = new Set<string>([
  'Pausa 9H',
  'Pausa 11H',
  'Pausa 24H',
  'Pausa 45H',
  'Pausa 45H + Compensação 21H',
  'Pausa 45H + 2 Compensações 21H',
]);

/** Repousos diários. */
export const DAILY_RESTS = new Set<string>(['Pausa 9H', 'Pausa 11H']);

/** Repousos semanais — terminam a semana de trabalho e repõem os contadores. */
export const WEEKLY_RESTS = new Set<string>([
  'Pausa 24H',
  'Pausa 45H',
  'Pausa 45H + Compensação 21H',
  'Pausa 45H + 2 Compensações 21H',
]);

/**
 * Duração principal do repouso semanal (sem as compensações acopladas), em horas.
 * Usada para saber quando "termina" a semana. 0 para outras ações.
 */
export function weeklyRestHours(action: string): number {
  switch (action) {
    case 'Pausa 24H':
      return 24;
    case 'Pausa 45H':
    case 'Pausa 45H + Compensação 21H':
    case 'Pausa 45H + 2 Compensações 21H':
      return 45;
    default:
      return 0;
  }
}

/**
 * Horas registadas de cada repouso, para comparar com o repouso real
 * (abaixo disto o repouso fica "incompleto").
 */
export const REST_REGISTERED_HOURS: Record<string, number> = {
  'Pausa 9H': 9,
  'Pausa 11H': 11,
  'Pausa 24H': 24,
  'Pausa 45H': 45,
  'Pausa 45H + Compensação 21H': 45,
  'Pausa 45H + 2 Compensações 21H': 45,
};

/** Duração total de cada repouso, incluindo compensações acopladas (horas). */
export const REST_TOTAL_HOURS: Record<string, number> = {
  'Repouso 3H+': 3,
  'Pausa 9H': 9,
  'Pausa 11H': 11,
  'Pausa 24H': 24,
  'Pausa 45H': 45,
  'Pausa 45H + Compensação 21H': 66,
  'Pausa 45H + 2 Compensações 21H': 87,
};

/** Duração de cada pausa/repouso em minutos (para "Termina: …"). */
export const BREAK_MINUTES: Record<string, number> = {
  'Pausa 15M': 15,
  'Pausa 30M': 30,
  'Pausa 45M': 45,
  ...Object.fromEntries(Object.entries(REST_TOTAL_HOURS).map(([k, h]) => [k, h * 60])),
};

/** Nome apresentado (no idioma atual) para o identificador guardado. */
export function actionDisplayName(action: string): string {
  return strings().actionNames[action] ?? action;
}

/**
 * Título da ação no formulário "Editar Ação": em português mostra o
 * identificador tal como está guardado (como na versão original); noutros
 * idiomas, o nome traduzido.
 */
export function actionTitle(action: string): string {
  return currentLanguage() === 'pt' ? action : actionDisplayName(action);
}
