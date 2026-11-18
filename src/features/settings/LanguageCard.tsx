/**
 * Cartão "IDIOMA" dos Ajustes: Automático (idioma do telemóvel), Português ou Español.
 */

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useStrings } from '../../hooks/useStrings';
import { LANGUAGE_PREFERENCES, useSettingsStore } from '../../stores/settingsStore';
import { Card, SectionHeader } from '../../ui/primitives';
import { Segmented } from '../../ui/Segmented';
import { colors, fontSize, text } from '../../ui/theme';

export function LanguageCard() {
  const s = useStrings();
  const preference = useSettingsStore((st) => st.languagePreference);
  const labels = { auto: s.settings.languageAuto, pt: 'Português', es: 'Español' };
  return (
    <Card style={styles.card}>
      <SectionHeader icon="globe" title={s.settings.languageTitle} />
      <Segmented
        values={LANGUAGE_PREFERENCES.map((p) => labels[p])}
        selectedIndex={LANGUAGE_PREFERENCES.indexOf(preference)}
        onChange={(i) => useSettingsStore.getState().setLanguagePreference(LANGUAGE_PREFERENCES[i])}
        style={styles.segmented}
      />
      <Text style={text(fontSize.caption, '400', colors.textSecondary)}>{s.settings.languageHint}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16 },
  segmented: { marginTop: 4 },
});
