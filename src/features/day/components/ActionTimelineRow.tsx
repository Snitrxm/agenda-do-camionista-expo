/**
 * Uma ação na linha do tempo do separador "Ações".
 * Toque → editar. Toque longo → menu "Excluir".
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { actionDisplayName } from '../../../domain/actionTypes';
import { useStrings } from '../../../hooks/useStrings';
import { formatAppDate } from '../../../lib/dateFormat';
import { DayActionStruct } from '../../../types/models';
import { Icon } from '../../../ui/Icon';
import { Tag } from '../../../ui/primitives';
import { colors, fontSize, text } from '../../../ui/theme';
import { actionBadge, actionColor, actionDetailLine, actionIcon } from '../actionPresentation';

interface Props {
  action: DayActionStruct;
  dayActions: DayActionStruct[];
  isLast: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export function ActionTimelineRow({ action, dayActions, isLast, onPress, onLongPress }: Props) {
  const s = useStrings();
  const color = actionColor(action.action);
  const badge = actionBadge(action, dayActions);

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.row}>
      <View style={styles.rail}>
        <View style={[styles.iconCircle, { backgroundColor: color }]}>
          <Icon name={actionIcon(action.action)} size={14} color="#fff" weight="semibold" />
        </View>
        {!isLast && <View style={styles.line} />}
      </View>

      <View style={styles.body}>
        <View style={styles.gap4}>
          <Text style={text(22, '700')}>{formatAppDate(action.date, 'HH:mm')}</Text>
          <Text style={text(fontSize.subheadline, '600', color)}>{actionDisplayName(action.action)}</Text>
        </View>
        {badge?.kind === 'split-first-part' && (
          <Tag label={s.day.actionsTab.splitFirstPart} color={colors.restGreen} background={colors.restGreenBg} />
        )}
        {badge?.kind === 'split-nine-hour' && <Tag label={s.day.actionsTab.splitNineHour} color={colors.restGreen} background={colors.restGreenBg} />}
        {badge?.kind === 'reduced' && (
          <Tag label={s.day.actionsTab.reduced(badge.index)} color={colors.orange} background="rgba(255,149,0,0.15)" />
        )}
        <Text numberOfLines={3} style={text(fontSize.subheadline, '400', colors.textSecondary)}>
          {actionDetailLine(action)}
        </Text>
        {!!action.additionalInformations && (
          <Text numberOfLines={2} style={text(fontSize.caption, '400', colors.textSecondary)}>
            {action.additionalInformations}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch' },
  rail: { width: 40, marginRight: 12, alignItems: 'center' },
  iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  line: { width: 2, flex: 1, minHeight: 60, backgroundColor: 'rgba(142,142,147,0.3)' },
  body: { flex: 1, gap: 8, paddingBottom: 16 },
  gap4: { gap: 4 },
});
