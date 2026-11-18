/**
 * Ajustes: perfil, fuso horário, matrículas por omissão, backup, versão e sair.
 */

import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useNavigation } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useLayoutEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useStrings } from '../../hooks/useStrings';
import { exportBackupFile } from '../../storage/backup';
import { useAuthStore } from '../../stores/authStore';
import { APP_TIME_ZONES, timeZoneLabel, useSettingsStore } from '../../stores/settingsStore';
import { Icon } from '../../ui/Icon';
import { ToolbarButton } from '../../ui/menus';
import { Card, Divider, SectionHeader, SectionLabel } from '../../ui/primitives';
import { Segmented } from '../../ui/Segmented';
import { colors, fontSize, text } from '../../ui/theme';
import { LanguageCard } from './LanguageCard';
import { useSettingsForm } from './useSettingsForm';

export function SettingsScreen() {
  const navigation = useNavigation();
  const timeZone = useSettingsStore((s) => s.timeZone);
  const user = useAuthStore((s) => s.user);
  const settings = useSettingsForm();
  const s = useStrings();
  const t = s.settings;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <ToolbarButton title={s.common.close} onPress={() => router.back()} />,
      headerRight: () => (
        <ToolbarButton title={s.common.save} bold onPress={settings.save} loading={settings.isSaving} disabled={settings.isSaving} />
      ),
    });
  });

  const exportBackup = async () => {
    const uri = exportBackupFile(Constants.expoConfig?.version ?? '1.0');
    if (!uri) return;
    await Sharing.shareAsync(uri, { mimeType: 'application/json', UTI: 'public.json' }).catch(() => {});
  };

  const logout = () => {
    useAuthStore.getState().clearSession();
    router.back();
  };

  if (settings.isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text style={text(fontSize.subheadline, '400', colors.textSecondary)}>{t.loading}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
      <Card style={styles.gap16}>
        <SectionLabel>{t.profileTitle}</SectionLabel>
        <View style={styles.profileRow}>
          <LinearGradient colors={[colors.primary, colors.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
            <Icon name="person.fill" size={fontSize.title} color="#fff" />
          </LinearGradient>
          <View style={styles.profileBody}>
            <Text style={text(fontSize.title3, '700')}>{user?.name ?? t.defaultUserName}</Text>
            <Text style={text(fontSize.subheadline, '400', colors.textSecondary)}>{user?.email ?? t.defaultUserEmail}</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.gap16}>
        <SectionHeader icon="globe" title={t.timeZoneTitle} />
        <Segmented
          values={APP_TIME_ZONES.map(timeZoneLabel)}
          selectedIndex={APP_TIME_ZONES.indexOf(timeZone)}
          onChange={(i) => useSettingsStore.getState().setTimeZone(APP_TIME_ZONES[i])}
          style={styles.mt4}
        />
        <Text style={text(fontSize.caption, '400', colors.textSecondary)}>
          {t.timeZoneHint}
        </Text>
      </Card>

      <LanguageCard />

      <Card style={styles.gap16}>
        <SectionHeader icon="truck.box.fill" title={t.truckTitle} />
        <View style={styles.gap16}>
          <PlateField label={t.truckPlate} value={settings.form.defaultTruckPlate} placeholder={t.truckPlatePlaceholder} onChange={settings.setTruckPlate} />
          <Divider />
          <PlateField label={t.trailerPlate} value={settings.form.defaultTrailerPlate} placeholder={t.trailerPlatePlaceholder} onChange={settings.setTrailerPlate} />
          <View style={styles.row6}>
            <Icon name="info.circle.fill" size={fontSize.caption} color={colors.primary} />
            <Text style={[text(fontSize.caption, '400', colors.textSecondary), styles.flex]}>
              {t.platesHint}
            </Text>
          </View>
        </View>
      </Card>

      <Card style={styles.gap12}>
        <SectionHeader icon="icloud.and.arrow.up.fill" title={t.backupTitle} />
        <View style={styles.row10}>
          <Icon name="checkmark.circle.fill" size={fontSize.body} color={colors.primary} />
          <View style={styles.backupBody}>
            <Text style={text(fontSize.subheadline, '600')}>{t.savedAutomatically}</Text>
            <Text style={text(fontSize.caption, '400', colors.textSecondary)}>
              {t.backupHint}
            </Text>
          </View>
        </View>
        <Pressable onPress={exportBackup} style={({ pressed }) => [styles.exportButton, { opacity: pressed ? 0.6 : 1 }]}>
          <Icon name="square.and.arrow.up" size={fontSize.body} color={colors.primary} />
          <Text style={text(fontSize.body, '600', colors.primary)}>{t.exportBackup}</Text>
        </Pressable>
      </Card>

      <Card style={styles.gap16}>
        <SectionLabel>{t.aboutTitle}</SectionLabel>
        <View style={styles.gap12}>
          <InfoRow icon="info.circle.fill" label={t.version} value="1.0.0" />
          <Divider />
          <InfoRow icon="hammer.fill" label={t.build} value="2024.11" />
          <Divider />
          <InfoRow icon="gear.badge" label={t.environment} value={t.production} />
        </View>
      </Card>

      <Pressable onPress={logout} style={({ pressed }) => [styles.logoutButton, { opacity: pressed ? 0.7 : 1 }]}>
        <Icon name="rectangle.portrait.and.arrow.right" size={fontSize.title3} color="#fff" />
        <Text style={text(fontSize.headline, '600', '#fff')}>{t.signOut}</Text>
      </Pressable>
    </ScrollView>
  );
}

function PlateField({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (t: string) => void }) {
  return (
    <View style={styles.gap8}>
      <View style={styles.row6}>
        <Icon name="rectangle.fill" size={fontSize.caption} color={colors.textSecondary} />
        <Text style={text(fontSize.caption, '600', colors.textSecondary)}>{label}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        autoCapitalize="characters"
        autoCorrect={false}
        style={styles.plateInput}
      />
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Icon name={icon} size={fontSize.subheadline} color={colors.textSecondary} />
      <Text style={[text(fontSize.subheadline, '400', colors.textSecondary), styles.ml8]}>{label}</Text>
      <View style={styles.flex} />
      <Text style={text(fontSize.subheadline, '600')}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  content: { padding: 16, gap: 24 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: colors.background },
  flex: { flex: 1 },
  gap8: { gap: 8 },
  gap12: { gap: 12 },
  gap16: { gap: 16 },
  mt4: { marginTop: 4 },
  ml8: { marginLeft: 8 },
  row6: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  row10: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  profileBody: { gap: 4, flex: 1 },
  backupBody: { gap: 2, flex: 1 },
  plateInput: { ...text(fontSize.body), padding: 16, backgroundColor: colors.fill, borderRadius: 12 },
  exportButton: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(14,148,136,0.12)',
    borderRadius: 10,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  logoutButton: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: colors.red,
    borderRadius: 12,
  },
});
