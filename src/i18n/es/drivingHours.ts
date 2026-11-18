import type { drivingHours as pt } from '../pt/drivingHours';

export const drivingHours: typeof pt = {
  searchPlaceholder: 'Buscar semana',
  empty: 'No hay semanas registradas',
  emptyHint: 'Las semanas aparecerán aquí cuando empiece a registrar días.',
  week: 'SEMANA',
  until: (date: string) => `hasta ${date}`,
  drivingTime: 'TIEMPO DE CONDUCCIÓN',
  statusExceeded: 'LÍMITE SUPERADO',
  statusNear: 'CASI EN EL LÍMITE',
  statusNormal: 'NORMAL',
  used: 'Utilizado',
  remaining: 'Restante',
};
