/** Início (cartões, avisos, lista de dias, pesquisa). */
export const home = {
  // Ecrã
  noDays: 'Nenhum dia cadastrado',
  recentDays: 'DIAS RECENTES',
  newDay: 'Novo dia',
  searchPlaceholder: 'Pesquisar dia, cliente ou local',

  // Barra do topo
  topBarDriving: 'Condução',
  topBarDrivingA11y: 'Condução semanal',
  topBarWorksheet: 'Folha de serviço',
  topBarSettings: 'Ajustes',

  // Avisos
  warnings: 'Avisos',
  warningsA11y: (count: number) => `${count} ${count === 1 ? 'aviso' : 'avisos'}. Toque para ver.`,
  warningsCount: (count: number) => `${count} AVISOS`,

  // Dia em curso
  dayInProgress: 'DIA EM CURSO',
  since: (time: string) => `desde ${time}`,
  amplitude: 'AMPLITUDE',
  canGoUntil: 'pode ir até',
  limitChip: (hours: string, time: string) => `${hours} → ${time}`,
  reducedUsedNeedSplit: (time: string) => `Já usou as 3 reduzidas · faça um Repouso 3H+ para ir até às ${time}`,
  splitReady: (time: string) => `3+9 pronto · até ${time}`,
  openDay: 'Abrir o dia',

  // Esta semana
  thisWeek: 'ESTA SEMANA',
  reducedRests: 'REDUZIDAS 9H',
  normalRests: 'REPOUSO 11H',
  extendedDriving: 'COND. 10H',
  workDays: 'DIAS',

  // Limites de condução
  drivingLimits: 'Limites de condução',
  weekly: 'SEMANAL',
  biweekly: 'BISSEMANAL',
  drivingLegend: 'Verde até 80%, laranja até 95%, vermelho acima.',

  // Cartão de repouso
  restDone: 'REPOUSO CUMPRIDO',
  canStartDay: 'Já pode iniciar o dia',
  restingFor: (duration: string) => `Em repouso há ${duration}`,
  inWeeklyRest: 'EM REPOUSO SEMANAL',
  inRest: 'EM REPOUSO',
  leaveAt: (when: string) => `Pode sair ${when}`,
  timeLeft: (duration: string) => `faltam ${duration}`,
  weeklyRest: 'REPOUSO SEMANAL',
  mustStartBy: (when: string) => `Tem de começar até ${when}`,
  enableWeekStart: 'Habilite o início da semana e adicione uma ação de partida para calcular.',

  // Repouso semanal em curso (topo)
  weeklyRest45hAt: (when: string) => `45h ${when}`,
  reached45h: 'Já cumpriu as 45h',
  leaveNowPrefix: 'Se sair agora, fica a compensar ',
  leaveNowSuffix: (when: string) => `. Às ${when} completa as 45h e não compensa nada.`,
  past24hPrefix: 'Já passou das 24h: vai contar como repouso semanal. Se sair agora, compensa ',
  past45h: 'Já passou das 45h: vai contar como repouso semanal normal.',

  // Compensação
  compensationDone: (amount: string) => `Compensação de ${amount} feita`,
  compensationDetected: (duration: string, date: string) => `Detetada sozinha · repouso de ${duration} em ${date}`,
  compensationMarked: (date: string) => `Marcada como feita em ${date}`,
  markDoneTitle: 'Marcar como feita?',
  markDoneMessage: (amount: string) => `A compensação de ${amount} fica marcada como feita.`,
  compensationPending: (amount: string) => `Compensação pendente: ${amount}`,
  compensationProvisional: (deadline: string) => `Provisória (repouso em curso) · até ${deadline}`,
  compensationProgress: (done: string, deadline: string) => `45h − ${done} feitas · até ${deadline}`,
  compensationHint: (daily: string, amount: string, weekly: string) =>
    `Fica feita sozinha quando fizer um repouso de ${daily} ou mais (9h + ${amount}), ou um semanal de ${weekly} (45h + ${amount}).`,
  compensationHintWeeklyOnly: (amount: string, weekly: string) =>
    `Fica feita sozinha quando fizer um semanal de ${weekly} (45h + ${amount}).`,

  // Linha de um dia
  generatePdf: 'Gerar PDF',
  deleteDay: 'Delete',
  confirmDeleteDay: 'Tem certeza que deseja excluir este dia?',
  actionsCount: (count: number) => `${count} ações`,
  weekStart: 'Início da semana',
  endsAt: (when: string) => `Termina: ${when}`,
};
