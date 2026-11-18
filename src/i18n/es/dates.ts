import type { dates as pt } from '../pt/dates';

export const dates: typeof pt = {
  invalidDate: 'Fecha no válida',
  dateTimeAt: "dd/MM/yy 'a las' HH:mm",
  weekdayDateTimeAt: "EEE dd/MM 'a las' HH:mm",
  range: (start: string, end: string) => `${start} al ${end}`,
};
