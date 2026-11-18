/**
 * Controlo segmentado (UISegmentedControl nativo no iOS).
 *
 * @module ui/Segmented
 */

import SegmentedControlBase from '@react-native-segmented-control/segmented-control';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

const SegmentedControl = SegmentedControlBase as unknown as React.ComponentType<any>;

export function Segmented({
  values,
  selectedIndex,
  onChange,
  style,
}: {
  values: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SegmentedControl
      values={values}
      selectedIndex={selectedIndex}
      onChange={(e: { nativeEvent: { selectedSegmentIndex: number } }) => onChange(e.nativeEvent.selectedSegmentIndex)}
      style={[{ height: 32 }, style]}
    />
  );
}
