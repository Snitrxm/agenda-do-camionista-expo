/**
 * Cartão de uma compensação de repouso semanal reduzido.
 * - Pendente: horas a compensar, prazo, como fica feita sozinha e botão "Feita".
 * - Feita: confirmação (aparece durante 2 dias).
 */

import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Compensation, formatDayMonth, formatHoursCompact, formatHoursMinutes } from '../../../domain/restTracking';
import { useStrings } from '../../../hooks/useStrings';
import { useCompensationStore } from '../../../stores/compensationStore';
import { Card } from '../../../ui/primitives';
import { Icon } from '../../../ui/Icon';
import { colors, fontSize, text } from '../../../ui/theme';

const H = 3600 * 1000;

export function CompensationCard({ compensation: c, tz }: { compensation: Compensation; tz: string }) {
  const s = useStrings();
  const markDone = useCompensationStore((st) => st.markDone);
  const amount = formatHoursCompact(c.amountMs);

  if (c.done) {
    return (
      <Card style={styles.doneCard}>
        <Icon name="checkmark.circle.fill" size={fontSize.title3} color={colors.restGreen} />
        <View style={styles.doneBody}>
          <Text style={text(fontSize.headline, '600')}>{s.home.compensationDone(amount)}</Text>
          <Text style={text(fontSize.caption, '400', colors.textSecondary)}>
            {c.paidBy
              ? s.home.compensationDetected(formatHoursMinutes(c.paidBy.realMs), formatDayMonth(c.paidBy.start, tz))
              : s.home.compensationMarked(c.doneAt != null ? formatDayMonth(c.doneAt, tz) : '')}
          </Text>
        </View>
      </Card>
    );
  }

  const deadline = formatDayMonth(c.deadline - 60000, tz);
  const confirmDone = () =>
    Alert.alert(s.home.markDoneTitle, s.home.markDoneMessage(amount), [
      { text: s.common.cancel, style: 'cancel' },
      { text: s.common.done, onPress: () => markDone(c.id) },
    ]);

  return (
    <Card style={styles.pendingCard}>
      <View style={styles.titleRow}>
        <Icon name="exclamationmark.triangle.fill" size={fontSize.body} color={colors.orange} />
        <Text style={[text(fontSize.headline, '600'), styles.flex]}>{s.home.compensationPending(amount)}</Text>
        <Pressable onPress={confirmDone} style={({ pressed }) => [styles.doneButton, { opacity: pressed ? 0.6 : 1 }]}>
          <Text style={text(fontSize.footnote, '600', colors.primary)}>{s.common.done}</Text>
        </Pressable>
      </View>
      <Text style={text(fontSize.subheadline, '400', colors.textSecondary)}>
        {c.provisional
          ? s.home.compensationProvisional(deadline)
          : s.home.compensationProgress(formatHoursCompact(c.rest.realMs), deadline)}
      </Text>
      <View style={styles.hint}>
        <Text style={text(fontSize.footnote, '400', colors.textSecondary)}>
          {/* 9h + X com 24h ou mais já conta como semanal: só um semanal de 45h + X a paga. */}
          {9 * H + c.amountMs >= 24 * H
            ? s.home.compensationHintWeeklyOnly(amount, formatHoursCompact(45 * H + c.amountMs))
            : s.home.compensationHint(formatHoursCompact(9 * H + c.amountMs), amount, formatHoursCompact(45 * H + c.amountMs))}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  doneCard: { gap: 6, marginHorizontal: 16, flexDirection: 'row', alignItems: 'flex-start' },
  doneBody: { flex: 1, gap: 4, marginLeft: 6 },
  pendingCard: { gap: 10, marginHorizontal: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
  doneButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: 'rgba(14,148,136,0.12)' },
  hint: { padding: 12, borderRadius: 10, backgroundColor: colors.fill },
});
