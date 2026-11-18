/**
 * Cartão "Limites de condução": horas semanais (máx. 56h) e bissemanais (máx. 90h).
 * Verde até 80%, laranja até 95%, vermelho acima.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useStrings } from '../../../hooks/useStrings';
import { Card, ProgressBar } from '../../../ui/primitives';
import { colors, fontSize, text } from '../../../ui/theme';

const tintFor = (progress: number) => (progress >= 0.95 ? colors.red : progress >= 0.8 ? colors.orange : colors.green);

export function DrivingLimitsCard({ weekMinutes, biweekMinutes }: { weekMinutes: number; biweekMinutes: number }) {
  const s = useStrings();
  return (
    <Card style={styles.card}>
      <Text style={text(fontSize.title3, '600')}>{s.home.drivingLimits}</Text>
      <View style={styles.row}>
        <LimitColumn label={s.home.weekly} minutes={weekMinutes} limitHours={56} />
        <LimitColumn label={s.home.biweekly} minutes={biweekMinutes} limitHours={90} />
      </View>
      <Text style={text(fontSize.caption, '400', colors.textSecondary)}>{s.home.drivingLegend}</Text>
    </Card>
  );
}

function LimitColumn({ label, minutes, limitHours }: { label: string; minutes: number; limitHours: number }) {
  const progress = minutes / (limitHours * 60);
  return (
    <View style={styles.column}>
      <Text style={text(fontSize.caption, '600', colors.textSecondary)}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={text(28, '700')}>
          {Math.trunc(minutes / 60)}:{String(minutes % 60).padStart(2, '0')}
        </Text>
        <Text style={text(fontSize.subheadline, '400', colors.textSecondary)}>/ {limitHours}:00</Text>
      </View>
      <ProgressBar value={Math.min(progress, 1)} tint={tintFor(progress)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16, marginHorizontal: 16 },
  row: { flexDirection: 'row', gap: 24 },
  column: { flex: 1, gap: 8 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
});
