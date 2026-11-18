/**
 * Campos partilhados pelos formulários "Criar Ação" e "Editar Ação":
 * campos extra de Carregamento/Descarga/Abastecimento e o editor de notas.
 */

import React from 'react';
import { KeyboardTypeOptions, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useStrings } from '../../../hooks/useStrings';
import { Segmented } from '../../../ui/Segmented';
import { colors, fontSize, shadow, text } from '../../../ui/theme';
import { ExtraFields, FieldSuggestions } from '../actionForm';

const UNITS = ['L', 'kg'];

interface Props {
  action: string;
  fields: ExtraFields;
  onChange: (patch: Partial<ExtraFields>) => void;
  /** Sugestões por baixo dos campos de empresa/posto (só ao criar). */
  suggestions?: FieldSuggestions;
}

/** Cartão com os campos extra do tipo de ação. */
export function ExtraFieldsCard({ action, fields: f, onChange, suggestions }: Props) {
  const t = useStrings().actions;
  return (
    <View style={styles.card}>
      <Text style={text(fontSize.caption, '600', colors.textSecondary)}>{t.extraTitles[action] ?? ''}</Text>

      {action === 'Carregamento' && (
        <View style={styles.fields}>
          <Field label={t.loadCompany}>
            <Input value={f.company} onChangeText={(company) => onChange({ company })} placeholder={t.loadCompanyPlaceholder} />
            {suggestions && <SuggestionChips items={suggestions.loadCompanies} onPick={(company) => onChange({ company })} />}
          </Field>
          <Field label={t.km}>
            <Input value={f.kmText} onChangeText={(kmText) => onChange({ kmText })} placeholder={t.kmLoadPlaceholder} keyboardType="number-pad" />
          </Field>
        </View>
      )}

      {action === 'Descarga' && (
        <View style={styles.fields}>
          <Field label={t.unloadCompany}>
            <Input value={f.company} onChangeText={(company) => onChange({ company })} placeholder={t.unloadCompanyPlaceholder} />
            {suggestions && <SuggestionChips items={suggestions.unloadCompanies} onPick={(company) => onChange({ company })} />}
          </Field>
          <Field label={t.unloadedQuantity}>
            <View style={styles.quantityRow}>
              <Input
                value={f.quantityText}
                onChangeText={(quantityText) => onChange({ quantityText })}
                placeholder={t.quantityPlaceholder}
                keyboardType="decimal-pad"
                flex
              />
              <Segmented
                values={UNITS}
                selectedIndex={Math.max(0, UNITS.indexOf(f.unit))}
                onChange={(i) => onChange({ unit: UNITS[i] })}
                style={styles.unitPicker}
              />
            </View>
          </Field>
          <Field label={t.km}>
            <Input value={f.kmText} onChangeText={(kmText) => onChange({ kmText })} placeholder={t.kmUnloadPlaceholder} keyboardType="number-pad" />
          </Field>
        </View>
      )}

      {action === 'Abastecimento' && (
        <View style={styles.fields}>
          <Field label={t.station}>
            <Input value={f.station} onChangeText={(station) => onChange({ station })} placeholder={t.stationPlaceholder} />
            {suggestions && <SuggestionChips items={suggestions.stations} onPick={(station) => onChange({ station })} />}
          </Field>
          <Field label={t.km}>
            <Input value={f.kmText} onChangeText={(kmText) => onChange({ kmText })} placeholder={t.kmFuelPlaceholder} keyboardType="number-pad" />
          </Field>
          <View style={styles.litersRow}>
            <LitersField label={t.diesel} value={f.dieselText} onChange={(dieselText) => onChange({ dieselText })} placeholder={t.dieselPlaceholder} />
            <LitersField label={t.adblue} value={f.adblueText} onChange={(adblueText) => onChange({ adblueText })} placeholder={t.adbluePlaceholder} />
          </View>
        </View>
      )}
    </View>
  );
}

/** Editor de notas (TextEditor) com texto de ajuda em itálico quando vazio. */
export function NotesEditor({ value, onChange, placeholder }: { value: string; onChange: (t: string) => void; placeholder?: string }) {
  return (
    <View style={styles.notes}>
      <TextInput value={value} onChangeText={onChange} multiline style={styles.notesInput} />
      {!!placeholder && value === '' && (
        <Text pointerEvents="none" style={styles.notesPlaceholder}>
          {placeholder}
        </Text>
      )}
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={text(14, '600', colors.darkGray)}>{label}</Text>
      {children}
    </View>
  );
}

function Input({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  flex,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  flex?: boolean;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textTertiary}
      keyboardType={keyboardType}
      style={[styles.input, flex && styles.flex]}
    />
  );
}

function LitersField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (t: string) => void; placeholder: string }) {
  return (
    <View style={[styles.field, styles.flex]}>
      <Text style={text(14, '600', colors.darkGray)}>{label}</Text>
      <View style={styles.litersInputRow}>
        <Input value={value} onChangeText={onChange} placeholder={placeholder} keyboardType="decimal-pad" flex />
        <Text style={text(fontSize.subheadline, '400', colors.textSecondary)}>L</Text>
      </View>
    </View>
  );
}

/** Valores já usados no dia, para preencher com um toque. */
function SuggestionChips({ items, onPick }: { items: string[]; onPick: (s: string) => void }) {
  if (items.length === 0) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} keyboardShouldPersistTaps="handled">
      {items.map((item) => (
        <Pressable key={item} onPress={() => onPick(item)} style={styles.chip}>
          <Text style={text(fontSize.footnote, '500', colors.tealDark)}>{item}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16, padding: 16, backgroundColor: colors.surface, borderRadius: 22, ...shadow(0.05, 8, 2) },
  fields: { gap: 14 },
  field: { gap: 8 },
  flex: { flex: 1 },
  input: { ...text(17), paddingHorizontal: 14, height: 50, backgroundColor: colors.inputBg, borderRadius: 14 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  unitPicker: { width: 100 },
  litersRow: { flexDirection: 'row', gap: 10 },
  litersInputRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chips: { gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.tealLight, borderRadius: 14 },
  notes: { backgroundColor: colors.fill, borderRadius: 8 },
  notesInput: { ...text(fontSize.body), minHeight: 100, textAlignVertical: 'top', paddingTop: 8, paddingHorizontal: 5 },
  notesPlaceholder: {
    ...text(fontSize.body, '400', colors.textSecondary),
    fontStyle: 'italic',
    position: 'absolute',
    top: 8,
    left: 5,
    right: 5,
  },
});
