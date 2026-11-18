/**
 * Barra de separadores no fundo do ecrã do dia (Geral / Ações / Fotos).
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStrings } from '../../../hooks/useStrings';
import { Icon } from '../../../ui/Icon';
import { colors, text } from '../../../ui/theme';
import { DayTab } from '../navigation';

const TABS: { tab: DayTab; label: 'general' | 'actions' | 'photos'; icon: string }[] = [
  { tab: 'Form', label: 'general', icon: 'doc.text.image' },
  { tab: 'Actions', label: 'actions', icon: 'clock' },
  { tab: 'Files', label: 'photos', icon: 'photo.stack' },
];

export function DayTabBar({ selected, onSelect }: { selected: DayTab; onSelect: (tab: DayTab) => void }) {
  const insets = useSafeAreaInsets();
  const s = useStrings();
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {TABS.map((item) => {
        const color = item.tab === selected ? colors.blue : '#999999';
        return (
          <Pressable key={item.tab} onPress={() => onSelect(item.tab)} style={styles.item}>
            <Icon name={item.icon} size={21} color={color} />
            <Text style={text(10, '500', color)}>{s.day.tabs[item.label]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(249,249,249,0.97)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.3)',
  },
  item: { flex: 1, height: 49, alignItems: 'center', justifyContent: 'center', gap: 2 },
});
