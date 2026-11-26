/**
 * Alerta "Esteve Xh em repouso" depois de gravar (ou corrigir) uma Partida
 * que fecha um repouso diário (9H/11H) de 24h ou mais, que por isso conta
 * como repouso semanal.
 *
 * O tipo semanal é calculado a partir do repouso real (ver
 * `domain/restTracking`), por isso "Confirmar" só fecha o alerta: a semana,
 * as reduzidas e a compensação já refletem o semanal. "Corrigir horas" abre
 * a edição da Partida ou do repouso, para o caso de a hora estar errada.
 */

import { router } from 'expo-router';
import { Alert } from 'react-native';
import { checkDepartureAfterRest, formatDayMonth, formatHoursCompact, formatHoursMinutes } from '../../domain/restTracking';
import { strings } from '../../i18n';
import { useDaysStore } from '../../stores/daysStore';
import { currentTimeZoneId } from '../../stores/settingsStore';
import { DayActionStruct } from '../../types/models';

/** Abre "Editar Ação"; o dia vem do store (o `dayId` da ação pode não vir da API). */
function editAction(a: DayActionStruct) {
  const day = useDaysStore.getState().days.find((d) => (d.actions ?? []).some((x) => x.id === a.id));
  router.push({ pathname: '/edit-action', params: { dayId: day?.id ?? a.dayId, actionId: a.id } });
}

/**
 * Mostra o alerta se a Partida fechar um repouso diário de 24h ou mais.
 * Lê os dias já atualizados do `daysStore`.
 */
export function alertIfRestWasWeekly(departure: DayActionStruct): void {
  if (departure.action !== 'Partida') return;
  const tz = currentTimeZoneId();
  const check = checkDepartureAfterRest(useDaysStore.getState().days, departure, tz);
  if (!check) return;

  const t = strings().actions;
  const body = [
    check.kind === 'reduced'
      ? t.restWasWeeklyReduced(formatHoursCompact(check.compensationMs), formatDayMonth(check.deadline - 60000, tz))
      : t.restWasWeeklyNormal,
    check.mustTakeRegularNext ? t.nextWeeklyMustBe45h : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const askWhichToFix = () =>
    Alert.alert(t.fixWhichTitle, undefined, [
      { text: t.fixDeparture, onPress: () => editAction(departure) },
      { text: t.fixRest, onPress: () => editAction(check.rest.action) },
      { text: strings().common.cancel, style: 'cancel' },
    ]);

  Alert.alert(t.restWasWeeklyTitle(formatHoursMinutes(check.rest.realMs)), body, [
    { text: t.fixHours, onPress: askWhichToFix },
    { text: t.confirm, style: 'default' },
  ]);
}
