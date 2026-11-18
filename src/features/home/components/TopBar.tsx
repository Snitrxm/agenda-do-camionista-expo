/**
 * Barra do topo do Início com 3 atalhos: Condução, Folha de serviço e Ajustes.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStrings } from '../../../hooks/useStrings';
import { Icon } from '../../../ui/Icon';
import { colors, shadow, text } from '../../../ui/theme';

interface Props {
  onDrivingHours: () => void;
  onWorkSheet: () => void;
  onSettings: () => void;
}

export function TopBar({ onDrivingHours, onWorkSheet, onSettings }: Props) {
  const s = useStrings();
  return (
    <View style={styles.bar}>
      <TopBarButton icon="clock" title={s.home.topBarDriving} accessibilityLabel={s.home.topBarDrivingA11y} onPress={onDrivingHours} />
      <TopBarButton icon="doc.text" title={s.home.topBarWorksheet} accessibilityLabel={s.home.topBarWorksheet} onPress={onWorkSheet} />
      <TopBarButton icon="gearshape" title={s.home.topBarSettings} accessibilityLabel={s.home.topBarSettings} onPress={onSettings} />
    </View>
  );
}

function TopBarButton({
  icon,
  title,
  accessibilityLabel,
  onPress,
}: {
  icon: string;
  title: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <Icon name={icon} size={22} color={colors.teal} weight="semibold" />
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={styles.title}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: 22,
    ...shadow(0.05, 2, 1),
  },
  button: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 14 },
  buttonPressed: { backgroundColor: colors.tealLight },
  title: text(13, '600', 'rgb(17,17,20)'),
});
