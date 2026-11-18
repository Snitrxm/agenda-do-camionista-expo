/**
 * Barra de pesquisa flutuante no fundo do Início.
 */

import React from 'react';
import { StyleProp, StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import { useStrings } from '../../../hooks/useStrings';
import { Icon } from '../../../ui/Icon';
import { colors, fontSize, shadow, text } from '../../../ui/theme';

/** Altura da barra (usada para posicionar o botão "Novo dia" por cima). */
export const SEARCH_BAR_HEIGHT = 48;

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  style?: StyleProp<ViewStyle>;
}

export function SearchBar({ value, onChangeText, style }: Props) {
  const s = useStrings();
  return (
    <View style={[styles.bar, style]}>
      <Icon name="magnifyingglass" size={fontSize.body} color={colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={s.home.searchPlaceholder}
        placeholderTextColor={colors.textSecondary}
        returnKeyType="search"
        autoCorrect={false}
        clearButtonMode="while-editing"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: SEARCH_BAR_HEIGHT,
    borderRadius: SEARCH_BAR_HEIGHT / 2,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    ...shadow(0.12, 10, 3),
  },
  input: { ...text(fontSize.body), flex: 1, padding: 0 },
});
