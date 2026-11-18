import type { actionNames as pt } from '../pt/actionNames';

export const actionNames: typeof pt = {
  Partida: 'Salida',
  Chegada: 'Llegada',
  'Pausa 15M': 'Pausa 15 min',
  'Pausa 30M': 'Pausa 30 min',
  'Pausa 45M': 'Pausa 45 min',
  'Repouso 3H+': 'Descanso 3H+',
  'Pausa 9H': 'Descanso 9H',
  'Pausa 11H': 'Descanso 11H',
  'Pausa 24H': 'Descanso semanal 24H',
  'Pausa 45H': 'Descanso semanal 45H',
  'Pausa 45H + Compensação 21H': 'Descanso semanal 45H + compensación 21H',
  'Pausa 45H + 2 Compensações 21H': 'Descanso semanal 45H + 2 compensaciones 21H',
  Carregamento: 'Carga',
  Descarga: 'Descarga',
  Abastecimento: 'Repostaje',
  Outros: 'Otros',
};
