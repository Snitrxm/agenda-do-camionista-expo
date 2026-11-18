/**
 * Seletor de hora (HH:mm): compacto nativo no iOS, diálogo nativo no Android.
 *
 * @module ui/TimePicker
 */

import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import React from 'react';
import { Platform, Pressable, Text } from 'react-native';
import { colors, fontSize, text } from './theme';

export function TimePicker({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={value}
        mode="time"
        display="compact"
        locale="pt-PT"
        onChange={(_e, d) => d && onChange(d)}
      />
    );
  }
  const hh = String(value.getHours()).padStart(2, '0');
  const mm = String(value.getMinutes()).padStart(2, '0');
  return (
    <Pressable
      onPress={() =>
        DateTimePickerAndroid.open({
          value,
          mode: 'time',
          is24Hour: true,
          onChange: (e, d) => {
            if (e.type === 'set' && d) onChange(d);
          },
        })
      }
      style={{ paddingHorizontal: 11, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(118,118,128,0.12)' }}
    >
      <Text style={text(fontSize.body, '400', colors.text)}>
        {hh}:{mm}
      </Text>
    </Pressable>
  );
}
