/**
 * Tokens de design: cores, tamanhos de letra e sombras.
 *
 * Os valores reproduzem os do iOS/SwiftUI usados na app original
 * (cores de sistema, tamanhos do Dynamic Type "Large"), para que o aspeto
 * seja igual em iPhone e Android.
 *
 * @module ui/theme
 */

import { Platform, StyleSheet, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  // Cor principal — RGB(14, 148, 136)
  primary: '#0E9488',
  primaryLight: '#14B8A6',
  primaryDark: '#0B766D',

  /** Fundo dos ecrãs (cinzento claro). */
  background: '#F2F2F7',
  /** Fundo dos cartões. */
  surface: '#FFFFFF',
  /** Fundo de campos de texto e caixas secundárias. */
  fill: '#F2F2F7',
  fillStrong: '#E5E5EA',
  text: '#000000',
  textSecondary: 'rgba(60,60,67,0.6)',
  textTertiary: 'rgba(60,60,67,0.3)',
  separator: 'rgba(60,60,67,0.29)',
  progressTrack: 'rgba(120,120,128,0.2)',

  green: '#34C759',
  orange: '#FF9500',
  red: '#FF3B30',
  blue: '#007AFF',
  pink: '#FF2D55',
  purple: '#AF52DE',
  cyan: '#32ADE6',
  yellow: '#FFCC00',
  gray: '#8E8E93',
  darkGray: '#555555',

  /** Verde dos repousos / fracionado 3+9. */
  restGreen: 'rgb(29,122,69)',
  restGreenBg: 'rgb(227,244,234)',
  /** Verde-petróleo (barra do topo, folha de serviço, início da semana). */
  teal: 'rgb(67,145,138)',
  tealDark: 'rgb(47,127,118)',
  tealLight: 'rgb(232,243,241)',
  /** Fundo dos campos nos formulários de ações. */
  inputBg: 'rgb(242,242,247)',

  /** Avisos (cápsula, etiquetas de repouso). */
  warningText: '#B85A12',
  warningBg: '#FFF4E5',
  dangerText: '#C42B2B',
  dangerBg: '#FDECEB',
};

/** Tamanhos de letra (Dynamic Type do iOS, tamanho padrão). */
export const fontSize = {
  largeTitle: 34,
  title: 28,
  title2: 22,
  title3: 20,
  headline: 17,
  body: 17,
  callout: 16,
  subheadline: 15,
  footnote: 13,
  caption: 12,
  caption2: 11,
};

type FontWeight = TextStyle['fontWeight'];

/** Estilo de texto: tamanho, peso e cor. */
export function text(size: number, weight: FontWeight = '400', color: string = colors.text): TextStyle {
  return { fontSize: size, fontWeight: weight, color };
}

/** Sombra suave equivalente a `.shadow(color: .black.opacity(o), radius: r, y: y)`. */
export function shadow(opacity: number, radius: number, y: number): ViewStyle {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: '#000',
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: y },
    };
  }
  return { boxShadow: `0px ${y}px ${radius * 2}px rgba(0,0,0,${opacity})` } as ViewStyle;
}

/** Cartão branco com cantos de 16 e sombra suave. */
export const cardStyle: ViewStyle = {
  backgroundColor: colors.surface,
  borderRadius: 16,
  padding: 16,
  ...shadow(0.05, 8, 2),
};

export const hairline = StyleSheet.hairlineWidth;
