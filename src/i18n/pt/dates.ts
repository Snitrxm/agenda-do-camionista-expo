/** Padrões de data com texto (ver `formatDate` em lib/timezone). */
export const dates = {
  invalidDate: 'Data inválida',
  /** "17/11/26 às 19:00" */
  dateTimeAt: "dd/MM/yy 'às' HH:mm",
  /** "terça 17/11 às 19:00" */
  weekdayDateTimeAt: "EEE dd/MM 'às' HH:mm",
  /** "16 a 22 nov. 2026" */
  range: (start: string, end: string) => `${start} a ${end}`,
};
