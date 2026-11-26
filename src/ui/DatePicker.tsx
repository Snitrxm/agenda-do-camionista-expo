/**
 * Seletor de data (dd/MM/yyyy): compacto nativo no iOS, diálogo nativo no Android.
 *
 * @module ui/DatePicker
 */

import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, text } from './theme';

export function DatePicker({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  if (Platform.OS === 'ios') {
    return <DateTimePicker value={value} mode="date" display="compact" locale="pt-PT" onChange={(_e, d) => d && onChange(d)} />;
  }
  const label = `${String(value.getDate()).padStart(2, '0')}/${String(value.getMonth() + 1).padStart(2, '0')}/${value.getFullYear()}`;
  return (
    <Pressable
      onPress={() =>
        DateTimePickerAndroid.open({
          value,
          mode: 'date',
          onChange: (e, d) => {
            if (e.type === 'set' && d) onChange(d);
          },
        })
      }
      style={styles.button}
    >
      <Text style={text(fontSize.body, '400', colors.text)}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(118,118,128,0.12)' },
});
