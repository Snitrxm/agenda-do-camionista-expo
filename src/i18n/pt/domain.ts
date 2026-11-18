/** Textos gerados pelas regras de negócio (avisos, etiquetas, motivos). */
export const domain = {
  warnings: {
    reducedUsedTitle: 'Já usou as 3 reduzidas',
    reducedUsedText: 'Até ao repouso semanal: só 11h ou fracionado 3+9.',
    oneReducedLeftTitle: 'Só resta 1 reduzida',
    oneReducedLeftText: 'Até ao próximo repouso semanal. Depois: 11h ou fracionado 3+9.',
    oneExtendedDayLeftTitle: 'Só resta 1 dia de 10h',
    oneExtendedDayLeftText: 'Esta semana (até domingo). Volta a ter 2 na segunda-feira.',
    weeklyRestSoonTitle: 'Último dia antes do repouso semanal',
    weeklyRestSoonText: (when: string) => `Tem de começar até ${when}.`,
  },
  restLabel: {
    real: (duration: string) => `Real: ${duration}`,
    countedAsNormal: (real: string) => `${real} · contou como normal ✓`,
    incomplete: (real: string) => `${real} · incompleto`,
    compensate: (real: string, hours: string) => `${real} · compensar ${hours}`,
    ok: (real: string) => `${real} ✓`,
  },
  nineHourRestUnavailable: 'Já usou as 3 reduzidas · até ao repouso semanal só 11h ou fracionado 3+9',
  amplitudeNeedsDeparture: 'Crie uma ação de Partida para calcular a amplitude',
};
