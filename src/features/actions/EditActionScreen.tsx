/**
 * Formulário "Editar Ação": local, campos extra, hora e observações.
 */

import { router, useNavigation } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ACTIONS_WITH_EXTRA_FIELDS, actionTitle } from '../../domain/actionTypes';
import { useStrings } from '../../hooks/useStrings';
import { formatAppDate } from '../../lib/dateFormat';
import { useDaysStore } from '../../stores/daysStore';
import { Icon } from '../../ui/Icon';
import { ToolbarButton } from '../../ui/menus';
import { Card, PrimaryButton, SectionLabel } from '../../ui/primitives';
import { TimePicker } from '../../ui/TimePicker';
import { colors, fontSize, text } from '../../ui/theme';
import { ExtraFieldsCard, NotesEditor } from './components/ActionFields';
import { useEditAction } from './hooks/useEditAction';

/** Ícone do cabeçalho (mesmas regras de `includes` da versão original). */
function headerIcon(action: string): { icon: string; color: string } {
  if (action.includes('Partida')) return { icon: 'arrow.up.circle.fill', color: colors.green };
  if (action.includes('Chegada')) return { icon: 'arrow.down.circle.fill', color: colors.red };
  if (action.includes('Pausa')) return { icon: 'pause.circle.fill', color: colors.orange };
  if (action.includes('Carga')) return { icon: 'arrow.up.doc.fill', color: colors.pink };
  if (action.includes('Descarga')) return { icon: 'arrow.down.doc.fill', color: colors.purple };
  return { icon: 'circle.fill', color: colors.blue };
}

export function EditActionScreen({ dayId, actionId }: { dayId: string; actionId: string }) {
  const navigation = useNavigation();
  const action = useDaysStore((s) => s.days.find((d) => d.id === dayId)?.actions?.find((a) => a.id === actionId));
  const form = useEditAction(dayId, action);
  const s = useStrings();
  const t = s.actions;

  useLayoutEffect(() => {
    navigation.setOptions({ headerLeft: () => <ToolbarButton title={s.common.cancel} onPress={() => router.back()} /> });
  }, [navigation, s]);

  if (!action) return null;
  const { icon, color } = headerIcon(action.action);

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={56}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
        <Card style={styles.gap16}>
          <SectionLabel>{t.infoTitle}</SectionLabel>
          <View style={styles.row12}>
            <View style={styles.iconBox}>
              <Icon name={icon} size={fontSize.title2} color={color} />
            </View>
            <View style={styles.titleBody}>
              <Text style={text(fontSize.headline, '600')}>{actionTitle(action.action)}</Text>
              <Text style={text(fontSize.caption, '400', colors.textSecondary)}>
                {t.createdAt(formatAppDate(action.createdAt, s.dates.dateTimeAt))}
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.gap16}>
          <SectionLabel>{t.locationTitle}</SectionLabel>
          <View style={styles.row8}>
            <Icon name="mappin.circle.fill" size={fontSize.title2} color={colors.primary} />
            <TextInput
              value={form.local}
              onChangeText={form.setLocal}
              placeholder={t.localPlaceholder}
              placeholderTextColor={colors.textTertiary}
              style={styles.localInput}
            />
          </View>
          {form.local !== '' && <Text style={styles.hint}>{t.localHintEdit}</Text>}
        </Card>

        {ACTIONS_WITH_EXTRA_FIELDS.includes(action.action) && (
          <ExtraFieldsCard action={action.action} fields={form.extra} onChange={form.updateExtra} />
        )}

        <Card style={styles.gap16}>
          <SectionLabel>{t.dateTimeTitle}</SectionLabel>
          <View style={styles.row8}>
            <Icon name="clock.fill" size={fontSize.title2} color={colors.primary} />
            <TimePicker value={form.date} onChange={form.setDate} />
            <View style={styles.flex} />
            <Text style={text(fontSize.title3, '700', colors.primary)}>{formatAppDate(form.date, 'HH:mm')}</Text>
          </View>
          <Text style={styles.hint}>{t.dateTimeHint}</Text>
        </Card>

        <Card style={styles.gap16}>
          <SectionLabel>{t.notesTitle}</SectionLabel>
          <NotesEditor value={form.notes} onChange={form.setNotes} />
        </Card>

        <PrimaryButton
          title={t.saveChanges}
          loadingTitle={t.saving}
          onPress={form.submit}
          loading={form.isSaving}
          style={styles.saveButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 24 },
  flex: { flex: 1 },
  gap16: { gap: 16 },
  row8: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  row12: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, alignItems: 'center' },
  titleBody: { gap: 4, flex: 1 },
  localInput: { ...text(fontSize.body), flex: 1, padding: 0 },
  hint: { ...text(fontSize.caption, '400', colors.textSecondary), fontStyle: 'italic' },
  saveButton: { marginHorizontal: 16 },
});
