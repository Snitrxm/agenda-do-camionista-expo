/**
 * Secção "ESTA SEMANA": reduzidas 9H, repousos 11H e dias de condução de 10H.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WeekCounters } from '../../../domain/week';
import { useStrings } from '../../../hooks/useStrings';
import { Card } from '../../../ui/primitives';
import { colors, fontSize, text } from '../../../ui/theme';

export function WeekCountersSection({ counters }: { counters: WeekCounters }) {
  const s = useStrings();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{s.home.thisWeek}</Text>
      <View style={styles.row}>
        <CounterCard title={s.home.reducedRests} value={counters.reducedRests} total={3} />
        <CounterCard title={s.home.normalRests} value={counters.normalRests} />
        <CounterCard title={s.home.extendedDriving} value={counters.extendedDrivingDays} total={2} />
      </View>
    </View>
  );
}

function CounterCard({ title, value, total }: { title: string; value: number; total?: number }) {
  return (
    <Card style={styles.card}>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={text(fontSize.caption, '600', colors.textSecondary)}>
        {title}
      </Text>
      <View style={styles.valueRow}>
        <Text style={text(36, '700')}>{value}</Text>
        {total !== undefined && <Text style={text(fontSize.title3, '400', colors.textSecondary)}>/{total}</Text>}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12, paddingTop: 16 },
  sectionTitle: { ...text(fontSize.subheadline, '600', colors.textSecondary), paddingHorizontal: 16 },
  row: { flexDirection: 'row', gap: 12, paddingHorizontal: 16 },
  card: { flex: 1, minHeight: 100, gap: 8 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
});
