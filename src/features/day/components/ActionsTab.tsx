/**
 * Separador "Ações": total de ações e linha do tempo; botão "Nova Ação".
 */

import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { deleteAction } from '../../../api/actions';
import { getErrorMessage } from '../../../api/client';
import { useStrings } from '../../../hooks/useStrings';
import { useDaysStore } from '../../../stores/daysStore';
import { DayActionStruct, DayStruct } from '../../../types/models';
import { openMenu } from '../../../ui/menus';
import { Card, Dot, EmptyState, FloatingActionButton, SectionLabel } from '../../../ui/primitives';
import { colors, fontSize, text } from '../../../ui/theme';
import { ActionTimelineRow } from './ActionTimelineRow';

export function ActionsTab({ day }: { day: DayStruct }) {
  const s = useStrings();
  const actions = day.actions ?? [];

  const confirmDelete = (action: DayActionStruct) =>
    Alert.alert(s.common.confirmDeleteTitle, s.day.actionsTab.deleteMessage, [
      { text: s.common.cancel, style: 'cancel' },
      {
        text: s.common.delete,
        style: 'destructive',
        onPress: () =>
          deleteAction(action.id)
            .then(() => useDaysStore.getState().removeAction(day.id, action.id))
            .catch((e) => Alert.alert(s.common.errorTitle, getErrorMessage(e))),
      },
    ]);

  return (
    <View style={styles.flex}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {actions.length === 0 ? (
          <EmptyState icon="clock.badge.exclamationmark" title={s.day.actionsTab.empty} />
        ) : (
          <>
            <Card style={styles.summary}>
              <SectionLabel>{s.day.actionsTab.totalToday}</SectionLabel>
              <Text style={text(56, '700')}>{actions.length}</Text>
              <View style={styles.dots}>
                <Dot color={colors.green} />
                <Dot color={colors.green} />
                <Dot color={colors.orange} />
              </View>
              <Text style={text(fontSize.subheadline, '400', colors.textSecondary)}>{s.day.actionsTab.completed(actions.length)}</Text>
            </Card>
            <View style={styles.timeline}>
              {actions.map((action, index) => (
                <ActionTimelineRow
                  key={action.id}
                  action={action}
                  dayActions={actions}
                  isLast={index === actions.length - 1}
                  onPress={() => router.push({ pathname: '/edit-action', params: { dayId: day.id, actionId: action.id } })}
                  onLongPress={() => openMenu([{ label: s.common.delete, value: 'delete', destructive: true }], () => confirmDelete(action))}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
      <FloatingActionButton title={s.day.actionsTab.newAction} onPress={() => router.push({ pathname: '/create-action', params: { dayId: day.id } })} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { backgroundColor: colors.background },
  content: { gap: 24, paddingBottom: 80 },
  summary: { gap: 16, marginHorizontal: 16, marginTop: 16 },
  dots: { flexDirection: 'row', gap: 8 },
  timeline: { paddingHorizontal: 16 },
});
