/**
 * Formulário "Criar Ação": tipo de ação, localização (detetada), campos
 * extra (carga/descarga/abastecimento), observações e botão fixo "Criar Ação".
 */

import { router, useNavigation } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ACTION_TYPES, ACTIONS_WITH_EXTRA_FIELDS, actionDisplayName } from '../../domain/actionTypes';
import { nineHourRestUnavailableReason } from '../../domain/amplitude';
import { useStrings } from '../../hooks/useStrings';
import { Icon } from '../../ui/Icon';
import { MenuPickerButton, openMenu, ToolbarButton } from '../../ui/menus';
import { Card, PrimaryButton, SectionLabel } from '../../ui/primitives';
import { colors, fontSize, text } from '../../ui/theme';
import { ExtraFieldsCard, NotesEditor } from './components/ActionFields';
import { useCreateAction } from './hooks/useCreateAction';

export function CreateActionScreen({ dayId }: { dayId: string }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const form = useCreateAction(dayId);
  const s = useStrings();
  const t = s.actions;

  useLayoutEffect(() => {
    navigation.setOptions({ headerLeft: () => <ToolbarButton title={s.common.cancel} onPress={() => router.back()} /> });
  }, [navigation, s]);

  const chooseActionType = () => {
    const elevenHourDisabled = form.isElevenHourRestDisabled();
    openMenu(
      ACTION_TYPES.map((name) => {
        const nineUnavailable = name === 'Pausa 9H' && form.isNineHourRestDisabled;
        return {
          label: nineUnavailable ? t.unavailableSuffix(actionDisplayName(name)) : actionDisplayName(name),
          value: name,
          disabled: (name === 'Pausa 11H' && elevenHourDisabled) || nineUnavailable,
        };
      }),
      form.setActionType,
      form.isNineHourRestDisabled ? t.nineHourMenuTitle(nineHourRestUnavailableReason()) : undefined
    );
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={56}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
        <Card style={styles.gap16}>
          <SectionLabel>{t.typeTitle}</SectionLabel>
          <MenuPickerButton label={actionDisplayName(form.actionType)} onPress={chooseActionType} />
        </Card>

        <Card style={styles.gap16}>
          <View style={styles.row}>
            <SectionLabel>{t.locationTitle}</SectionLabel>
            <View style={styles.flex} />
            {form.isLocationDetected ? (
              <View style={styles.row4}>
                <Icon name="location.fill" size={fontSize.caption2} color={colors.primary} />
                <Text style={text(fontSize.caption2, '400', colors.textSecondary)}>{t.locationDetected}</Text>
              </View>
            ) : (
              <View style={styles.row4}>
                <ActivityIndicator size="small" style={styles.smallSpinner} />
                <Text style={text(fontSize.caption2, '400', colors.textSecondary)}>{t.locationDetecting}</Text>
              </View>
            )}
          </View>
          <View style={styles.gap12}>
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
            {form.local !== '' && <Text style={styles.hint}>{t.localHintCreate}</Text>}
          </View>
        </Card>

        {ACTIONS_WITH_EXTRA_FIELDS.includes(form.actionType) && (
          <ExtraFieldsCard action={form.actionType} fields={form.extra} onChange={form.updateExtra} suggestions={form.suggestions} />
        )}

        <Card style={styles.gap16}>
          <SectionLabel>{t.notesTitle}</SectionLabel>
          <NotesEditor
            value={form.notes}
            onChange={form.setNotes}
            placeholder={t.notesPlaceholder}
          />
        </Card>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 8 + insets.bottom }]}>
        <PrimaryButton title={t.create} loadingTitle={t.creating} onPress={form.submit} loading={form.isSaving} color={colors.teal} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: 16, gap: 24, paddingBottom: 16 + 72 },
  gap12: { gap: 12 },
  gap16: { gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  row4: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  row8: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallSpinner: { transform: [{ scale: 0.7 }] },
  localInput: { ...text(fontSize.body), flex: 1, padding: 0 },
  hint: { ...text(fontSize.caption, '400', colors.textSecondary), fontStyle: 'italic' },
  footer: { paddingHorizontal: 16, paddingTop: 0, backgroundColor: colors.background },
});
