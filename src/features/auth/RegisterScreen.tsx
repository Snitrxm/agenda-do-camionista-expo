/**
 * Criar conta: nome, e-mail, senha e confirmação. Depois de criada, a app
 * entra logo na nova conta (ver `useRegister`).
 */

import { router, useNavigation } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useStrings } from '../../hooks/useStrings';
import { Icon } from '../../ui/Icon';
import { ToolbarButton } from '../../ui/menus';
import { Card, PrimaryButton } from '../../ui/primitives';
import { colors, fontSize, text } from '../../ui/theme';
import { useRegister } from './hooks/useRegister';
import { MIN_PASSWORD_LENGTH } from './registration';

export function RegisterScreen() {
  const navigation = useNavigation();
  const { form, update, isSaving, submit } = useRegister();
  const s = useStrings();
  const t = s.auth;

  useLayoutEffect(() => {
    navigation.setOptions({ headerLeft: () => <ToolbarButton title={s.common.cancel} onPress={() => router.back()} /> });
  }, [navigation, s]);

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={56}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Field icon="person.fill" label={t.name}>
            <TextInput
              value={form.name}
              onChangeText={(name) => update({ name })}
              placeholder={t.namePlaceholder}
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
              textContentType="name"
              style={styles.input}
            />
          </Field>
          <Field icon="envelope.fill" label={t.email}>
            <TextInput
              value={form.email}
              onChangeText={(email) => update({ email })}
              placeholder={t.emailPlaceholder}
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              style={styles.input}
            />
          </Field>
          <Field icon="lock.fill" label={t.password}>
            <TextInput
              value={form.password}
              onChangeText={(password) => update({ password })}
              placeholder={t.passwordPlaceholder(MIN_PASSWORD_LENGTH)}
              placeholderTextColor={colors.textTertiary}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              style={styles.input}
            />
          </Field>
          <Field icon="lock.fill" label={t.confirmPassword}>
            <TextInput
              value={form.confirmPassword}
              onChangeText={(confirmPassword) => update({ confirmPassword })}
              placeholder={t.confirmPasswordPlaceholder}
              placeholderTextColor={colors.textTertiary}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={submit}
              style={styles.input}
            />
          </Field>

          <PrimaryButton title={t.createAccount} loadingTitle={t.creating} icon="person.fill" onPress={submit} loading={isSaving} style={styles.button} />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <View style={styles.label}>
        <Icon name={icon} size={fontSize.caption} color={colors.textSecondary} />
        <Text style={text(fontSize.caption, '600', colors.textSecondary)}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  card: { gap: 20, padding: 24, borderRadius: 20 },
  field: { gap: 8 },
  label: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  input: {
    ...text(fontSize.body),
    padding: 16,
    backgroundColor: colors.fill,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(14,148,136,0.3)',
  },
  button: { marginTop: 4 },
});
