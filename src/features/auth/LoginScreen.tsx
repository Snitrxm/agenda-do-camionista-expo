/**
 * Ecrã de login: e-mail + senha e, se configurado, entrar com
 * Face ID / impressão digital (ver `useLogin` e `biometrics`).
 */

import MaskedViewBase from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStrings } from '../../hooks/useStrings';
import { Icon } from '../../ui/Icon';
import { colors, fontSize, shadow, text } from '../../ui/theme';
import { useLogin } from './hooks/useLogin';

// Os tipos do masked-view ainda não suportam o React 19.
const MaskedView = MaskedViewBase as unknown as React.ComponentType<any>;

const teal = (alpha: number) => `rgba(14,148,136,${alpha})`;

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const login = useLogin();
  const s = useStrings();
  const t = s.auth;

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={[teal(0.3), teal(0.1), colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topSpacer} />

        <View style={styles.header}>
          <GradientTruckIcon />
          <View style={styles.titles}>
            <Text style={text(fontSize.title, '700')}>{t.appName}</Text>
            <Text style={text(fontSize.subheadline, '400', colors.textSecondary)}>{t.tagline}</Text>
          </View>
        </View>

        <View style={styles.form}>
          <LabeledInput
            icon="envelope.fill"
            label={t.email}
            value={login.email}
            onChangeText={login.setEmail}
            placeholder={t.emailPlaceholder}
            keyboardType="email-address"
          />
          <LabeledInput
            icon="lock.fill"
            label={t.password}
            value={login.password}
            onChangeText={login.setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
          <Pressable onPress={() => router.push('/forgot-password')} hitSlop={8} style={styles.forgotLink}>
            {({ pressed }) => (
              <Text style={[text(fontSize.footnote, '600', colors.primary), { opacity: pressed ? 0.5 : 1 }]}>
                {s.passwordReset.forgotLink}
              </Text>
            )}
          </Pressable>

          <Pressable disabled={login.isLoading} onPress={login.signIn} style={({ pressed }) => [styles.loginButtonWrap, { opacity: pressed ? 0.7 : 1 }]}>
            <LinearGradient
              colors={login.isLoading ? [colors.gray, colors.gray] : [colors.primary, colors.cyan]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.loginButton}
            >
              {login.isLoading ? (
                <>
                  <ActivityIndicator color="#fff" />
                  <Text style={text(fontSize.body, '400', '#fff')}>{t.signingIn}</Text>
                </>
              ) : (
                <>
                  <Icon name="arrow.right.circle.fill" size={fontSize.title3} color="#fff" />
                  <Text style={text(fontSize.headline, '600', '#fff')}>{t.signIn}</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          {login.biometry && (
            <Pressable
              disabled={login.isLoading}
              onPress={login.signInWithBiometrics}
              style={({ pressed }) => [styles.biometryButton, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Icon name={login.biometry === 'faceid' ? 'faceid' : 'touchid'} size={fontSize.title3} color={colors.primary} />
              <Text style={text(fontSize.headline, '600', colors.primary)}>
                {t.signInWith(login.biometry === 'faceid' ? t.faceId : t.fingerprint)}
              </Text>
            </Pressable>
          )}

          <Pressable onPress={() => router.push('/register')} hitSlop={8} style={styles.registerLink}>
            {({ pressed }) => (
              <Text style={[text(fontSize.subheadline, '400', colors.textSecondary), { opacity: pressed ? 0.5 : 1 }]}>
                {t.noAccount} <Text style={text(fontSize.subheadline, '600', colors.primary)}>{t.createAccount}</Text>
              </Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Icon name="checkmark.shield.fill" size={fontSize.body} color={colors.primary} />
            <Text style={text(fontSize.caption, '400', colors.textSecondary)}>{t.dataSafe}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/** Ícone do camião com gradiente verde → ciano. */
function GradientTruckIcon() {
  return (
    <MaskedView maskElement={<Icon name="truck.box.fill" size={80} color="#000" />}>
      <LinearGradient colors={[colors.primary, colors.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.invisible}>
          <Icon name="truck.box.fill" size={80} color="#000" />
        </View>
      </LinearGradient>
    </MaskedView>
  );
}

function LabeledInput({
  icon,
  label,
  ...inputProps
}: {
  icon: string;
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: 'email-address';
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldLabel}>
        <Icon name={icon} size={fontSize.caption} color={colors.textSecondary} />
        <Text style={text(fontSize.caption, '600', colors.textSecondary)}>{label}</Text>
      </View>
      <TextInput {...inputProps} placeholderTextColor={colors.textTertiary} autoCapitalize="none" autoCorrect={false} style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: 32 },
  topSpacer: { height: 40 },
  header: { alignItems: 'center', gap: 16, paddingBottom: 20 },
  titles: { alignItems: 'center', gap: 4 },
  invisible: { opacity: 0 },
  form: { gap: 24, padding: 24, backgroundColor: colors.surface, borderRadius: 20, marginHorizontal: 16, ...shadow(0.1, 15, 5) },
  field: { gap: 8 },
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  input: {
    ...text(fontSize.body),
    padding: 16,
    backgroundColor: colors.fill,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: teal(0.3),
  },
  loginButtonWrap: { marginTop: 8 },
  loginButton: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    ...shadow(0.3, 8, 4),
    shadowColor: colors.primary,
  },
  biometryButton: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: teal(0.3),
  },
  registerLink: { alignItems: 'center' },
  forgotLink: { alignSelf: 'flex-end', marginTop: -12 },
  footer: { alignItems: 'center', paddingTop: 20 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
