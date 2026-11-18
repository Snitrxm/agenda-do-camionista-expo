/**
 * Condução semanal: uma ficha por semana com as horas de condução
 * (máximo 56h), estado (normal / quase no limite / excedido) e pesquisa.
 */

import { router, useNavigation } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchDrivingHours } from '../../api/days';
import { useStrings } from '../../hooks/useStrings';
import { WeeklyDrivingHoursStruct } from '../../types/models';
import { Icon } from '../../ui/Icon';
import { ToolbarButton } from '../../ui/menus';
import { Card, Divider, Dot, ProgressBar, SectionLabel } from '../../ui/primitives';
import { colors, fontSize, text } from '../../ui/theme';

const WEEKLY_LIMIT_MINUTES = 56 * 60;

export function WeeklyDrivingHoursScreen() {
  const navigation = useNavigation();
  const s = useStrings();
  const [weeks, setWeeks] = useState<WeeklyDrivingHoursStruct[]>([]);
  const [query, setQuery] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <ToolbarButton title={s.common.close} onPress={() => router.back()} />,
      headerSearchBarOptions: {
        placeholder: s.drivingHours.searchPlaceholder,
        onChangeText: (e: { nativeEvent: { text: string } }) => setQuery(e.nativeEvent.text),
        onCancelButtonPress: () => setQuery(''),
        cancelButtonText: s.common.cancel,
        placement: 'stacked',
        allowToolbarIntegration: false,
        hideWhenScrolling: false,
      },
    });
  }, [navigation, s]);

  useEffect(() => {
    fetchDrivingHours()
      .then((r) => setWeeks(r.weekly))
      .catch((e) => console.log(e));
  }, []);

  // Pesquisa pelo texto do início da semana.
  const filtered = query ? weeks.filter((w) => w.weekStart.toLocaleLowerCase('pt').includes(query.toLocaleLowerCase('pt'))) : weeks;

  if (filtered.length === 0) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.screen} contentContainerStyle={styles.empty}>
        <Icon name="chart.bar.xaxis" size={60} color={colors.textSecondary} />
        <Text style={text(fontSize.headline, '600', colors.textSecondary)}>{s.drivingHours.empty}</Text>
        <Text style={styles.emptyText}>{s.drivingHours.emptyHint}</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.screen} contentContainerStyle={styles.list}>
      {filtered.map((w) => (
        <WeekCard key={w.weekStart} week={w} />
      ))}
    </ScrollView>
  );
}

function WeekCard({ week }: { week: WeeklyDrivingHoursStruct }) {
  const s = useStrings();
  const minutes = week.drivingMinutes;
  const hours = Math.trunc(minutes / 60);
  const mins = minutes % 60;
  const progress = Math.min(minutes / WEEKLY_LIMIT_MINUTES, 1);
  const color = progress >= 1 ? colors.red : progress >= 0.9 ? colors.orange : colors.primary;
  const status = progress >= 1 ? s.drivingHours.statusExceeded : progress >= 0.9 ? s.drivingHours.statusNear : s.drivingHours.statusNormal;
  const remaining = WEEKLY_LIMIT_MINUTES - minutes;

  return (
    <Card style={styles.gap16}>
      <View style={styles.row}>
        <View style={styles.weekTitle}>
          <SectionLabel>{s.drivingHours.week}</SectionLabel>
          <Text style={text(fontSize.headline, '600')}>{week.weekStart}</Text>
          <Text style={text(fontSize.subheadline, '400', colors.textSecondary)}>{s.drivingHours.until(week.weekEnd)}</Text>
        </View>
        <Icon name="calendar.badge.clock" size={fontSize.largeTitle} color={colors.primary} />
      </View>

      <Divider />

      <View style={styles.gap12}>
        <View style={styles.row}>
          <SectionLabel>{s.drivingHours.drivingTime}</SectionLabel>
          <View style={styles.flex} />
          <View style={styles.status}>
            <Dot color={color} />
            <Text style={text(fontSize.caption, '600', color)}>{status}</Text>
          </View>
        </View>

        <View style={styles.valueRow}>
          <Text style={text(56, '700', color)}>
            {hours}:{String(mins).padStart(2, '0')}
          </Text>
          <Text style={text(fontSize.title2, '400', colors.textSecondary)}>/ 56:00</Text>
        </View>

        <ProgressBar value={progress} tint={color} height={8} />

        <View style={styles.usage}>
          <View style={styles.gap2}>
            <Text style={text(fontSize.caption, '400', colors.textSecondary)}>{s.drivingHours.used}</Text>
            <Text style={text(fontSize.subheadline, '600')}>
              {hours}h {mins}m
            </Text>
          </View>
          <Divider vertical style={styles.usageDivider} />
          <View style={styles.gap2}>
            <Text style={text(fontSize.caption, '400', colors.textSecondary)}>{s.drivingHours.remaining}</Text>
            <Text style={text(fontSize.subheadline, '600', remaining > 0 ? colors.green : colors.red)}>
              {Math.trunc(remaining / 60)}h {remaining % 60}m
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  empty: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emptyText: { ...text(fontSize.subheadline, '400', colors.textSecondary), textAlign: 'center', paddingHorizontal: 16 },
  list: { padding: 16, gap: 16 },
  flex: { flex: 1 },
  gap2: { gap: 2 },
  gap12: { gap: 12 },
  gap16: { gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  weekTitle: { gap: 4, flex: 1 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  usage: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  usageDivider: { height: 30, alignSelf: 'center' },
});
