/**
 * "Esqueceu a senha": pede o email, depois o código de 6 dígitos recebido
 * e a nova senha (ver `usePasswordReset`).
 */

import { router, useNavigation } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useStrings } from '../../hooks/useStrings';
import { Icon } from '../../ui/Icon';
import { ToolbarButton } from '../../ui/menus';
import { Card, PrimaryButton } from '../../ui/primitives';
import { colors, fontSize, text } from '../../ui/theme';
import { usePasswordReset } from './hooks/usePasswordReset';
import { MIN_PASSWORD_LENGTH } from './registration';

export function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const s = useStrings();
  const t = s.passwordReset;
  const reset = usePasswordReset();

  useLayoutEffect(() => {
    navigation.setOptions({ headerLeft: () => <ToolbarButton title={s.common.cancel} onPress={() => router.back()} /> });
  }, [navigation, s]);

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={56}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {reset.step === 'email' ? (
          <Card style={styles.card}>
            <Text style={styles.intro}>{t.emailIntro}</Text>
            <Field icon="envelope.fill" label={s.auth.email}>
              <Input
                value={reset.email}
                onChangeText={reset.setEmail}
                placeholder={s.auth.emailPlaceholder}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoFocus
                returnKeyType="send"
                onSubmitEditing={reset.sendCode}
              />
            </Field>
            <PrimaryButton title={t.sendCode} loadingTitle={t.sending} icon="paperplane.fill" onPress={reset.sendCode} loading={reset.isBusy} />
          </Card>
        ) : (
          <Card style={styles.card}>
            <Text style={styles.intro}>{t.codeSent(reset.email.trim())}</Text>
            <Field icon="lock.fill" label={t.code}>
              <Input
                value={reset.code}
                onChangeText={(v) => reset.setCode(v.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder={t.codePlaceholder}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                style={styles.codeInput}
              />
            </Field>
            <Field icon="lock.fill" label={t.newPassword}>
              <Input
                value={reset.password}
                onChangeText={reset.setPassword}
                placeholder={s.auth.passwordPlaceholder(MIN_PASSWORD_LENGTH)}
                secureTextEntry
                textContentType="newPassword"
              />
            </Field>
            <Field icon="lock.fill" label={s.auth.confirmPassword}>
              <Input
                value={reset.confirmPassword}
                onChangeText={reset.setConfirmPassword}
                placeholder={s.auth.confirmPasswordPlaceholder}
                secureTextEntry
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={reset.changePassword}
              />
            </Field>
            <PrimaryButton title={t.changePassword} loadingTitle={t.changing} onPress={reset.changePassword} loading={reset.isBusy} />
            <View style={styles.links}>
              <LinkButton label={t.resendCode} onPress={reset.sendCode} disabled={reset.isBusy} />
              <LinkButton label={t.changeEmail} onPress={reset.changeEmail} disabled={reset.isBusy} />
            </View>
          </Card>
        )}
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

function Input({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      autoCapitalize="none"
      autoCorrect={false}
      placeholderTextColor={colors.textTertiary}
      {...props}
      style={[styles.input, style]}
    />
  );
}

function LinkButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={8}>
      {({ pressed }) => <Text style={[text(fontSize.subheadline, '600', colors.primary), { opacity: pressed || disabled ? 0.5 : 1 }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  card: { gap: 20, padding: 24, borderRadius: 20 },
  intro: text(fontSize.subheadline, '400', colors.textSecondary),
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
  codeInput: { fontSize: 24, fontWeight: '700', letterSpacing: 8, textAlign: 'center' },
  links: { flexDirection: 'row', justifyContent: 'space-between' },
});
