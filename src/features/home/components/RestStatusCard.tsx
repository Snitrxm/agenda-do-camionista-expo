/**
 * Cartão de repouso do Início:
 * - repouso diário em curso → "EM REPOUSO · Pode sair … · faltam Xh";
 * - repouso já cumprido (sem Partida) → "REPOUSO CUMPRIDO · Já pode iniciar o dia";
 * - sem repouso em curso → prazo do repouso semanal ("Tem de começar até …").
 *
 * Durante um repouso SEMANAL não aparece (o cartão `WeeklyRestCard` do topo já o mostra).
 */

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { formatHoursMinutes, ongoingRest } from '../../../domain/restTracking';
import { weeklyRestDeadline } from '../../../domain/week';
import { useStrings } from '../../../hooks/useStrings';
import { dateLocale } from '../../../i18n';
import { formatAppDate } from '../../../lib/dateFormat';
import { formatDate } from '../../../lib/timezone';
import { DayStruct } from '../../../types/models';
import { Card, SectionHeader } from '../../../ui/primitives';
import { colors, fontSize, text } from '../../../ui/theme';

export function RestStatusCard({ days, now, tz }: { days: DayStruct[]; now: number; tz: string }) {
  const s = useStrings();
  const rest = ongoingRest(days, now);
  if (rest?.weekly) return null;

  if (rest) {
    const finished = now >= rest.end;
    return (
      <Card style={styles.card}>
        {finished ? (
          <>
            <SectionHeader icon="checkmark.circle.fill" iconColor={colors.restGreen} titleColor={colors.restGreen} title={s.home.restDone} />
            <Text style={text(fontSize.headline, '600')}>{s.home.canStartDay}</Text>
            <Text style={text(fontSize.caption, '400', colors.textSecondary)}>{s.home.restingFor(formatHoursMinutes(now - rest.start))}</Text>
          </>
        ) : (
          <>
            <SectionHeader icon="bed.double.fill" iconColor={colors.restGreen} title={rest.weekly ? s.home.inWeeklyRest : s.home.inRest} />
            <Text style={text(fontSize.headline, '600')}>
              {s.home.leaveAt(formatDate(new Date(rest.end), s.dates.weekdayDateTimeAt, tz, dateLocale('pt_PT')))}
            </Text>
            <Text style={text(fontSize.caption, '400', colors.textSecondary)}>{s.home.timeLeft(formatHoursMinutes(rest.end - now))}</Text>
          </>
        )}
      </Card>
    );
  }

  const deadline = weeklyRestDeadline(days);
  return (
    <Card style={styles.card}>
      <SectionHeader icon="truck.box.fill" title={s.home.weeklyRest} />
      {deadline ? (
        <Text style={text(fontSize.headline, '600')}>{s.home.mustStartBy(formatAppDate(deadline, 'EEE dd/MM, HH:mm'))}</Text>
      ) : (
        <Text style={text(fontSize.subheadline, '400', colors.textSecondary)}>
          {s.home.enableWeekStart}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, marginHorizontal: 16 },
});
