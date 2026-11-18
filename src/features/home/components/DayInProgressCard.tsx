/**
 * Cartão "DIA EM CURSO": amplitude desde a Partida, hora limite e atalho
 * para abrir o dia. Aplica a regra das 3 reduzidas (limite 13h).
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getDayLimit } from '../../../domain/amplitude';
import { findDeparture } from '../../../domain/days';
import { hasThreeHourRest } from '../../../domain/fractionedRest';
import { useStrings } from '../../../hooks/useStrings';
import { formatAppDate, parseISO } from '../../../lib/dateFormat';
import { DayStruct } from '../../../types/models';
import { Card, ProgressBar, Tag } from '../../../ui/primitives';
import { colors, fontSize, text } from '../../../ui/theme';
import { openDay } from '../../day/navigation';

const H = 3600000;

interface Props {
  day: DayStruct;
  days: DayStruct[];
  now: Date;
  tz: string;
}

export function DayInProgressCard({ day, days, now, tz }: Props) {
  const s = useStrings();
  const departure = findDeparture(day);
  const departureDate = departure ? parseISO(departure.date) : null;
  const local = departure?.local ?? '';

  const amplitudeMinutes = departureDate ? Math.max(0, Math.trunc((now.getTime() - departureDate.getTime()) / 60000)) : 0;
  const hours = Math.trunc(amplitudeMinutes / 60);
  const mins = amplitudeMinutes % 60;

  const limit15h = departureDate ? new Date(departureDate.getTime() + 15 * H) : null;
  const limit13h = departureDate ? new Date(departureDate.getTime() + 13 * H) : null;
  const hhmm = (d: Date) => formatAppDate(d, 'HH:mm');

  // Com 3 reduzidas usadas e sem Repouso 3H+, o limite do dia passa a 13h.
  const dayLimit = getDayLimit(day, days, tz, now.getTime());
  const limit = dayLimit.blocked ? limit13h : limit15h;
  const progress = Math.min(amplitudeMinutes / (dayLimit.limitHours * 60), 1);
  const progressTint =
    progress >= 1 ? colors.red : progress >= (dayLimit.limitHours - 2) / dayLimit.limitHours ? colors.orange : colors.primary;

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={text(fontSize.caption, '600', colors.primary)}>{s.home.dayInProgress}</Text>
        <View style={styles.flex} />
        <Text style={text(fontSize.caption, '400', colors.textSecondary)}>
          {s.home.since(departureDate ? formatAppDate(departureDate, 'HH:mm') : '--:--')}
          {local ? ` · ${local}` : ''}
        </Text>
      </View>

      <View style={styles.amplitudeRow}>
        <View style={styles.gap4}>
          <Text style={text(fontSize.caption2, '600', colors.textSecondary)}>{s.home.amplitude}</Text>
          <Text style={text(44, '700')}>
            {hours}h{String(mins).padStart(2, '0')}
          </Text>
        </View>
        <View style={styles.flex} />
        {limit && (
          <View style={styles.limit}>
            <Text style={text(fontSize.caption, '400', colors.textSecondary)}>{s.home.canGoUntil}</Text>
            <Text style={text(fontSize.title3, '700')}>{hhmm(limit)}</Text>
          </View>
        )}
      </View>

      <ProgressBar value={progress} tint={progressTint} />

      <View style={styles.chips}>
        {limit13h && <LimitChip label={s.home.limitChip('13h', hhmm(limit13h))} />}
        {limit15h && !dayLimit.blocked && <LimitChip label={s.home.limitChip('15h', hhmm(limit15h))} />}
      </View>

      {dayLimit.blocked && limit15h && (
        <Text style={text(fontSize.caption, '400', colors.textSecondary)}>
          {s.home.reducedUsedNeedSplit(hhmm(limit15h))}
        </Text>
      )}

      {hasThreeHourRest(day.actions ?? []) && limit15h && (
        <Tag
          icon="bed.double.fill"
          label={s.home.splitReady(hhmm(limit15h))}
          color={colors.restGreen}
          background={colors.restGreenBg}
          size={fontSize.caption}
          radius={8}
          style={styles.splitTag}
        />
      )}

      <Pressable onPress={() => openDay(day, 'Actions')} style={({ pressed }) => [styles.openButton, { opacity: pressed ? 0.7 : 1 }]}>
        <Text style={text(fontSize.headline, '600', '#fff')}>{s.home.openDay}</Text>
      </Pressable>
    </Card>
  );
}

function LimitChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={text(fontSize.caption, '400', colors.primary)}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16, marginHorizontal: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'baseline' },
  flex: { flex: 1 },
  gap4: { gap: 4 },
  amplitudeRow: { flexDirection: 'row', alignItems: 'flex-end' },
  limit: { alignItems: 'flex-end', gap: 2, paddingBottom: 8 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(14,148,136,0.12)', borderRadius: 8 },
  splitTag: { paddingHorizontal: 10, paddingVertical: 6 },
  openButton: { paddingVertical: 14, backgroundColor: colors.primary, borderRadius: 12, alignItems: 'center' },
});
