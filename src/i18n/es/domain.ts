import type { domain as pt } from '../pt/domain';

export const domain: typeof pt = {
  warnings: {
    reducedUsedTitle: 'Ya ha usado los 3 descansos reducidos',
    reducedUsedText: 'Hasta el descanso semanal: solo 11h o fraccionado 3+9.',
    oneReducedLeftTitle: 'Solo queda 1 descanso reducido',
    oneReducedLeftText: 'Hasta el próximo descanso semanal. Después: 11h o fraccionado 3+9.',
    oneExtendedDayLeftTitle: 'Solo queda 1 día de 10h',
    oneExtendedDayLeftText: 'Esta semana (hasta el domingo). Vuelve a tener 2 el lunes.',
    weeklyRestSoonTitle: 'Último día antes del descanso semanal',
    weeklyRestSoonText: (when: string) => `Tiene que empezar antes de ${when}.`,
    regularWeeklyRestNextTitle: 'El próximo descanso semanal tiene que ser de 45h',
    regularWeeklyRestNextText: 'Los dos últimos descansos semanales fueron reducidos.',
    compensationPendingTitle: (hours: string, deadline: string) => `Compensación pendiente: ${hours} · hasta ${deadline}`,
    compensationPendingText: 'Descanso semanal reducido: añada estas horas a un descanso de 9h o más antes del plazo.',
  },
  restLabel: {
    real: (duration: string) => `Real: ${duration}`,
    countedAsNormal: (real: string) => `${real} · contó como normal ✓`,
    incomplete: (real: string) => `${real} · incompleto`,
    compensate: (real: string, hours: string) => `${real} · compensar ${hours}`,
    ok: (real: string) => `${real} ✓`,
    countedAsWeeklyReduced: (real: string) => `${real} · contó como semanal reducido`,
    countedAsWeeklyNormal: (real: string) => `${real} · contó como semanal normal ✓`,
  },
  nineHourRestUnavailable: 'Ya ha usado los 3 descansos reducidos · hasta el descanso semanal solo 11h o fraccionado 3+9',
  amplitudeNeedsDeparture: 'Cree una acción de Salida para calcular la amplitud',
};
