/**
 * Nome apresentado de cada tipo de ação (identificador da API → texto).
 * Ações que não estão aqui mostram o próprio identificador.
 */
export const actionNames: Record<string, string> = {
  'Pausa 45M': 'Pausa 45 min',
  'Repouso 3H+': 'Repouso 3H+',
  'Pausa 9H': 'Repouso 9H',
  'Pausa 11H': 'Repouso 11H',
  'Pausa 24H': 'Repouso semanal 24H',
  'Pausa 45H': 'Repouso semanal 45H',
  'Pausa 45H + Compensação 21H': 'Repouso semanal 45H + compensação 21H',
  'Pausa 45H + 2 Compensações 21H': 'Repouso semanal 45H + 2 compensações 21H',
};
