/**
 * Cartão do topo do Início durante um repouso semanal: horas de repouso,
 * barra com marcas nas 24h e 45h e quanto ficaria a compensar se saísse agora.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatDayTime, formatHoursCompact, formatHoursMinutes, RestPeriod } from '../../../domain/restTracking';
import { useStrings } from '../../../hooks/useStrings';
import { Card } from '../../../ui/primitives';
import { Icon } from '../../../ui/Icon';
import { colors, fontSize, text } from '../../../ui/theme';

const H = 3600 * 1000;
const MARK_24H = `${(24 / 45) * 100}%` as const;

export function WeeklyRestCard({ rest, now, tz }: { rest: RestPeriod; now: number; tz: string }) {
  const s = useStrings();
  const elapsed = Math.max(0, now - rest.start);
  const reached45h = elapsed >= 45 * H;
  const progress = Math.min(elapsed / (45 * H), 1);
  const at45h = rest.start + 45 * H;
  const local = rest.action.local?.trim();

  return (
    <Card style={styles.card}>
      <View style={styles.titleRow}>
        <Icon name="bed.double.fill" size={fontSize.body} color={colors.restGreen} />
        <Text style={text(fontSize.caption, '700', colors.restGreen)}>{s.home.inWeeklyRest}</Text>
      </View>
      <Text style={text(fontSize.caption, '400', colors.textSecondary)}>
        {s.home.since(formatDayTime(rest.start, tz))}
        {local ? ` · ${local}` : ''}
      </Text>

      <Text style={text(40, '700')}>{formatHoursMinutes(elapsed)}</Text>

      {/* Barra 0 → 45h com marcas nas 24h e 45h */}
      <View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: reached45h ? colors.green : colors.orange }]} />
        </View>
        <View style={[styles.mark, { left: MARK_24H }]} />
        <View style={[styles.mark, { right: 0 }]} />
      </View>
      <View style={styles.legend}>
        <Text style={[styles.legendText, { left: 0 }]}>0h</Text>
        <Text style={[styles.legendText, { left: MARK_24H, transform: [{ translateX: -10 }] }]}>24h</Text>
        <Text style={[styles.legendText, { right: 0 }]}>{s.home.weeklyRest45hAt(formatDayTime(at45h, tz))}</Text>
      </View>

      {reached45h ? (
        <View style={[styles.box, { backgroundColor: colors.restGreenBg }]}>
          <Text style={text(fontSize.subheadline, '600', colors.restGreen)}>{s.home.reached45h}</Text>
        </View>
      ) : (
        <View style={[styles.box, { backgroundColor: colors.warningBg }]}>
          <Text style={text(fontSize.subheadline, '400', colors.warningText)}>
            {s.home.leaveNowPrefix}
            <Text style={styles.bold}>{formatHoursCompact(45 * H - elapsed)}</Text>
            {s.home.leaveNowSuffix(formatDayTime(at45h, tz))}
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14, marginHorizontal: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.progressTrack, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  mark: { position: 'absolute', top: -3, width: 2, height: 14, backgroundColor: colors.text, opacity: 0.35 },
  legend: { height: 16 },
  legendText: { ...text(fontSize.caption2, '400', colors.textSecondary), position: 'absolute' },
  box: { padding: 12, borderRadius: 10 },
  bold: { fontWeight: '700' },
});
