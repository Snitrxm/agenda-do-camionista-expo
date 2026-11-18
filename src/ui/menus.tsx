/**
 * Menus e botões de barra de navegação.
 *
 * - `openMenu`: lista de opções nativa (ActionSheet no iOS; no Android um
 *   diálogo próprio, desenhado por `AndroidMenuHost`, que tem de estar
 *   montado no layout raiz).
 * - `MenuPickerButton`: botão "valor ⌃⌄" que abre um menu (seletor).
 * - `ToolbarButton`: botão de texto do cabeçalho (Fechar, Cancelar, Guardar).
 *
 * @module ui/menus
 */

import React, { useEffect, useState } from 'react';
import { ActionSheetIOS, ActivityIndicator, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { strings } from '../i18n';
import { Icon } from './Icon';
import { colors, fontSize, text } from './theme';

/** Botão de texto da toolbar (Fechar / Cancelar / Guardar). */
export function ToolbarButton({
  title,
  onPress,
  color = colors.primary,
  bold,
  disabled,
  loading,
}: {
  title: string;
  onPress: () => void;
  color?: string;
  bold?: boolean;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={10} style={{ paddingHorizontal: 6 }}>
      {({ pressed }) =>
        loading ? (
          <ActivityIndicator color={color} />
        ) : (
          <Text style={[text(fontSize.body, bold ? '600' : '400', color), { opacity: pressed ? 0.3 : 1 }]}>{title}</Text>
        )
      }
    </Pressable>
  );
}

export interface MenuOption {
  label: string;
  value: string;
  disabled?: boolean;
  destructive?: boolean;
}

/** Abre um menu nativo de opções (equivalente ao Picker .menu / Menu do SwiftUI). */
export function openMenu(options: MenuOption[], onSelect: (value: string) => void, title?: string) {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        options: [...options.map((o) => o.label), strings().common.cancel],
        cancelButtonIndex: options.length,
        disabledButtonIndices: options.map((o, i) => (o.disabled ? i : -1)).filter((i) => i >= 0),
        destructiveButtonIndex: options.map((o, i) => (o.destructive ? i : -1)).filter((i) => i >= 0),
      },
      (idx) => {
        if (idx < options.length) onSelect(options[idx].value);
      }
    );
  } else {
    menuHost?.(options, onSelect, title);
  }
}

/** Função registada pelo `AndroidMenuHost` montado. */
let menuHost: ((o: MenuOption[], cb: (v: string) => void, title?: string) => void) | null = null;
export function registerMenuHost(fn: typeof menuHost) {
  menuHost = fn;
}

/** Botão de Picker estilo .menu: texto em cor de acento + chevrons. */
export function MenuPickerButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}>
      {({ pressed }) => (
        <>
          <Text style={[text(fontSize.body, '400', colors.blue), { opacity: pressed ? 0.3 : 1 }]}>{label}</Text>
          <Icon name="chevron.up.chevron.down" size={12} color={colors.blue} weight="semibold" />
        </>
      )}
    </Pressable>
  );
}


/** Desenha os menus abertos com `openMenu` no Android. Montar uma vez no layout raiz. */
export function AndroidMenuHost() {
  const [state, setState] = useState<{ options: MenuOption[]; cb: (v: string) => void; title?: string } | null>(null);

  useEffect(() => {
    registerMenuHost((options, cb, title) => setState({ options, cb, title }));
    return () => registerMenuHost(null);
  }, []);

  return (
    <Modal visible={!!state} transparent animationType="fade" onRequestClose={() => setState(null)}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 32 }} onPress={() => setState(null)}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, maxHeight: '80%', overflow: 'hidden' }}>
          {state?.title ? <Text style={[text(fontSize.footnote, '600', colors.textSecondary), { padding: 16 }]}>{state.title}</Text> : null}
          <ScrollView>
            {state?.options.map((o) => (
              <Pressable
                key={o.value}
                disabled={o.disabled}
                onPress={() => {
                  const cb = state.cb;
                  setState(null);
                  cb(o.value);
                }}
                style={({ pressed }) => ({ paddingVertical: 14, paddingHorizontal: 20, backgroundColor: pressed ? colors.fill : '#fff' })}
              >
                <Text style={text(fontSize.body, '400', o.disabled ? colors.textTertiary : o.destructive ? colors.red : colors.text)}>{o.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}
