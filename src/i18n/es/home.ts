import type { home as pt } from '../pt/home';

export const home: typeof pt = {
  noDays: 'No hay días registrados',
  noDaysHint: 'Toque en "Nuevo día" para registrar el primer día.',
  noSearchResults: 'No se ha encontrado ningún día',
  recentDays: 'DÍAS RECIENTES',
  newDay: 'Nuevo día',
  searchPlaceholder: 'Buscar día, cliente o lugar',

  topBarDriving: 'Conducción',
  topBarDrivingA11y: 'Conducción semanal',
  topBarWorksheet: 'Hoja de servicio',
  topBarSettings: 'Ajustes',

  warnings: 'Avisos',
  warningsA11y: (count: number) => `${count} ${count === 1 ? 'aviso' : 'avisos'}. Toque para ver.`,
  warningsCount: (count: number) => `${count} AVISOS`,

  dayInProgress: 'DÍA EN CURSO',
  since: (time: string) => `desde ${time}`,
  amplitude: 'AMPLITUD',
  canGoUntil: 'puede seguir hasta',
  limitChip: (hours: string, time: string) => `${hours} → ${time}`,
  reducedUsedNeedSplit: (time: string) =>
    `Ya ha usado los 3 descansos reducidos · haga un Descanso 3H+ para seguir hasta las ${time}`,
  splitReady: (time: string) => `3+9 listo · hasta ${time}`,
  openDay: 'Abrir el día',

  thisWeek: 'ESTA SEMANA',
  reducedRests: 'REDUCIDOS 9H',
  normalRests: 'DESCANSO 11H',
  extendedDriving: 'COND. 10H',
  workDays: 'DÍAS',

  drivingLimits: 'Límites de conducción',
  weekly: 'SEMANAL',
  biweekly: 'BISEMANAL',
  drivingLegend: 'Verde hasta 80%, naranja hasta 95%, rojo por encima.',

  restDone: 'DESCANSO CUMPLIDO',
  canStartDay: 'Ya puede iniciar el día',
  restingFor: (duration: string) => `Descansando desde hace ${duration}`,
  inWeeklyRest: 'EN DESCANSO SEMANAL',
  inRest: 'EN DESCANSO',
  leaveAt: (when: string) => `Puede salir ${when}`,
  timeLeft: (duration: string) => `faltan ${duration}`,
  weeklyRest: 'DESCANSO SEMANAL',
  mustStartBy: (when: string) => `Tiene que empezar antes de ${when}`,
  enableWeekStart: 'Active el inicio de semana y añada una acción de salida para calcularlo.',

  weeklyRest45hAt: (when: string) => `45h ${when}`,
  reached45h: 'Ya ha cumplido las 45h',
  leaveNowPrefix: 'Si sale ahora, tendrá que compensar ',
  leaveNowSuffix: (when: string) => `. A las ${when} completa las 45h y no compensa nada.`,
  past24hPrefix: 'Ya pasó de las 24h: va a contar como descanso semanal. Si sale ahora, compensa ',
  past45h: 'Ya pasó de las 45h: va a contar como descanso semanal normal.',

  compensationDone: (amount: string) => `Compensación de ${amount} hecha`,
  compensationDetected: (duration: string, date: string) => `Detectada automáticamente · descanso de ${duration} el ${date}`,
  compensationMarked: (date: string) => `Marcada como hecha el ${date}`,
  markDoneTitle: '¿Marcar como hecha?',
  markDoneMessage: (amount: string) => `La compensación de ${amount} quedará marcada como hecha.`,
  compensationPending: (amount: string) => `Compensación pendiente: ${amount}`,
  compensationProvisional: (deadline: string) => `Provisional (descanso en curso) · hasta ${deadline}`,
  compensationProgress: (done: string, deadline: string) => `45h − ${done} hechas · hasta ${deadline}`,
  compensationHint: (daily: string, amount: string, weekly: string) =>
    `Se marca sola cuando haga un descanso de ${daily} o más (9h + ${amount}), o uno semanal de ${weekly} (45h + ${amount}).`,
  compensationHintWeeklyOnly: (amount: string, weekly: string) =>
    `Se marca sola cuando haga un descanso semanal de ${weekly} (45h + ${amount}).`,

  generatePdf: 'Generar PDF',
  deleteDay: 'Eliminar',
  confirmDeleteDay: '¿Seguro que desea eliminar este día?',
  actionsCount: (count: number) => `${count} acciones`,
  weekStart: 'Inicio de semana',
  endsAt: (when: string) => `Termina: ${when}`,
};
