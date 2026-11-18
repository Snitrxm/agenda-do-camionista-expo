/**
 * Componentes base reutilizados em todos os ecrãs.
 *
 * @module ui/primitives
 */

import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Icon } from './Icon';
import { cardStyle, colors, fontSize, hairline, shadow, text } from './theme';

/** Cartão branco (cantos 16, sombra suave). */
export function Card({ style, children }: { style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  return <View style={[cardStyle, style]}>{children}</View>;
}

/** Título de secção em maiúsculas pequenas ("RESUMO DO DIA"). */
export function SectionLabel({ children, color = colors.textSecondary }: { children: React.ReactNode; color?: string }) {
  return <Text style={text(fontSize.caption, '600', color)}>{children}</Text>;
}

/** Título de secção com ícone à esquerda. */
export function SectionHeader({
  icon,
  title,
  iconColor = colors.primary,
  titleColor = colors.textSecondary,
}: {
  icon: string;
  title: string;
  iconColor?: string;
  titleColor?: string;
}) {
  return (
    <View style={styles.row8}>
      <Icon name={icon} size={fontSize.body} color={iconColor} />
      <SectionLabel color={titleColor}>{title}</SectionLabel>
    </View>
  );
}

/** Barra de progresso linear (0…1). */
export function ProgressBar({ value, tint, height = 4 }: { value: number; tint: string; height?: number }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View style={{ width: `${v * 100}%`, height: '100%', backgroundColor: tint, borderRadius: height / 2 }} />
    </View>
  );
}

/** Linha separadora fina (horizontal ou vertical). */
export function Divider({ vertical, style }: { vertical?: boolean; style?: ViewStyle }) {
  return <View style={[vertical ? styles.dividerV : styles.dividerH, style]} />;
}

/** Ponto colorido (8×8). */
export function Dot({ color, size = 8, style }: { color: string; size?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]} />;
}

/** Etiqueta pequena com fundo colorido. */
export function Tag({
  label,
  color,
  background,
  icon,
  radius = 6,
  size = fontSize.caption2,
  style,
}: {
  label: string;
  color: string;
  background: string;
  icon?: string;
  radius?: number;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.tag, { backgroundColor: background, borderRadius: radius }, style]}>
      {icon && <Icon name={icon} size={size} color={color} />}
      <Text style={text(size, '600', color)}>{label}</Text>
    </View>
  );
}

/** Botão principal de largura total, com estado "a carregar". */
export function PrimaryButton({
  title,
  loadingTitle,
  icon = 'checkmark.circle.fill',
  onPress,
  loading,
  color = colors.primary,
  style,
}: {
  title: string;
  loadingTitle: string;
  icon?: string;
  onPress: () => void;
  loading?: boolean;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [styles.primaryButton, { backgroundColor: loading ? colors.gray : color, opacity: pressed ? 0.7 : 1 }, style]}
    >
      {loading ? (
        <>
          <ActivityIndicator color="#fff" />
          <Text style={text(fontSize.body, '400', '#fff')}>{loadingTitle}</Text>
        </>
      ) : (
        <>
          <Icon name={icon} size={fontSize.title3} color="#fff" />
          <Text style={text(fontSize.headline, '600', '#fff')}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

/** Botão flutuante redondo com "+" (Novo dia, Nova Ação, Adicionar Foto). */
export function FloatingActionButton({
  title,
  onPress,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.7 : 1 }, style]}
    >
      <Icon name="plus" size={fontSize.title3} color="#fff" weight="semibold" />
      <Text style={text(fontSize.headline, '600', '#fff')}>{title}</Text>
    </Pressable>
  );
}

/** Estado vazio: ícone grande e mensagem. */
export function EmptyState({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={styles.empty}>
      <Icon name={icon} size={60} color={colors.textSecondary} />
      <Text style={text(fontSize.headline, '600', colors.textSecondary)}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row8: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { backgroundColor: colors.progressTrack, overflow: 'hidden' },
  dividerH: { height: hairline, alignSelf: 'stretch', backgroundColor: colors.separator },
  dividerV: { width: hairline, alignSelf: 'stretch', backgroundColor: colors.separator },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4 },
  primaryButton: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.primary,
    borderRadius: 30,
    ...shadow(0.2, 10, 5),
  },
  empty: { alignItems: 'center', gap: 16, paddingTop: 100 },
});
