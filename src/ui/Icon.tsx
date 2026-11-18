/**
 * Ícone multiplataforma. Recebe o nome de um SF Symbol:
 * - iOS → SF Symbol nativo (expo-symbols);
 * - Android → equivalente em Material Community Icons (tabela `ANDROID_MAP`).
 *
 * Ao usar um ícone novo, acrescentar a correspondência em `ANDROID_MAP`.
 *
 * @module ui/Icon
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SymbolView, SymbolWeight } from 'expo-symbols';
import React from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';

const ANDROID_MAP: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  'truck.box.fill': 'truck',
  'envelope.fill': 'email',
  'lock.fill': 'lock',
  'arrow.right.circle.fill': 'arrow-right-circle',
  'checkmark.shield.fill': 'shield-check',
  plus: 'plus',
  magnifyingglass: 'magnify',
  'bed.double.fill': 'bed-double',
  'cup.and.saucer.fill': 'coffee',
  faceid: 'face-recognition',
  touchid: 'fingerprint',
  'sunrise.fill': 'weather-sunset-up',
  'star.fill': 'star',
  'arrow.right': 'arrow-right',
  clock: 'clock-outline',
  equal: 'equal',
  'pause.circle.fill': 'pause-circle',
  doc: 'file-document-outline',
  trash: 'trash-can-outline',
  'chevron.down': 'chevron-down',
  'chevron.up': 'chevron-up',
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  'chevron.up.chevron.down': 'unfold-more-horizontal',
  'exclamationmark.triangle.fill': 'alert',
  'info.circle.fill': 'information',
  'info.circle': 'information-outline',
  'doc.text': 'file-document-outline',
  gearshape: 'cog-outline',
  'person.fill': 'account',
  globe: 'web',
  'rectangle.fill': 'rectangle',
  'icloud.and.arrow.up.fill': 'cloud-upload',
  'checkmark.circle.fill': 'check-circle',
  'square.and.arrow.up': 'export-variant',
  'square.and.arrow.down': 'download',
  'hammer.fill': 'hammer',
  'gear.badge': 'cog',
  'rectangle.portrait.and.arrow.right': 'logout',
  'chart.bar.xaxis': 'chart-bar',
  'calendar.badge.clock': 'calendar-clock',
  tablecells: 'table',
  'paperplane.fill': 'send',
  'icloud.fill': 'cloud',
  map: 'map-outline',
  'doc.text.image': 'file-image-outline',
  'photo.stack': 'image-multiple-outline',
  'clock.badge.exclamationmark': 'clock-alert-outline',
  calendar: 'calendar',
  'location.fill': 'navigation',
  'mappin.circle.fill': 'map-marker-circle',
  'mappin.and.ellipse': 'map-marker',
  'clock.fill': 'clock',
  'arrow.up': 'arrow-up',
  'arrow.down': 'arrow-down',
  pause: 'pause',
  'arrow.up.doc': 'file-upload-outline',
  'arrow.down.doc': 'file-download-outline',
  'arrow.up.doc.fill': 'file-upload',
  'arrow.down.doc.fill': 'file-download',
  circle: 'circle-outline',
  'circle.fill': 'circle',
  'arrow.up.circle.fill': 'arrow-up-circle',
  'arrow.down.circle.fill': 'arrow-down-circle',
};

interface Props {
  name: string;
  /** Tamanho da fonte equivalente (ex.: .title2 = 22) */
  size: number;
  color: string;
  weight?: SymbolWeight;
  style?: StyleProp<ViewStyle>;
}

export function Icon({ name, size, color, weight, style }: Props) {
  if (Platform.OS === 'ios') {
    const box = Math.round(size * 1.2);
    return (
      <SymbolView
        name={name as never}
        size={box}
        tintColor={color}
        weight={weight}
        resizeMode="scaleAspectFit"
        style={[{ width: box, height: box }, style]}
      />
    );
  }
  return (
    <MaterialCommunityIcons
      name={ANDROID_MAP[name] ?? 'circle-outline'}
      size={Math.round(size * 1.15)}
      color={color}
      style={style as never}
    />
  );
}
