/**
 * Separador "Geral" do dia: trajeto, resumo, início da semana, camião,
 * quilómetros, tempo de condução, amplitudes e notas.
 *
 * Os campos editáveis gravam automaticamente (ver `useDayForm`).
 */

import React from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { getDayLimit } from '../../../domain/amplitude';
import { amplitudeLimitText, formatDuration, lastEndingRest, totalKm } from '../../../domain/days';
import { hasThreeHourRest } from '../../../domain/fractionedRest';
import { formatAppDate } from '../../../lib/dateFormat';
import { useStrings } from '../../../hooks/useStrings';
import { useDaysStore } from '../../../stores/daysStore';
import { currentTimeZoneId } from '../../../stores/settingsStore';
import { DayStruct } from '../../../types/models';
import { Icon } from '../../../ui/Icon';
import { Card, Divider, Dot, SectionLabel } from '../../../ui/primitives';
import { TimePicker } from '../../../ui/TimePicker';
import { colors, fontSize, text } from '../../../ui/theme';
import { DayFormValues, kmOrZero, useDayForm } from '../hooks/useDayForm';

export function GeneralTab({ day }: { day: DayStruct }) {
  const { values, update } = useDayForm(day);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets
    >
      {/* Tocar fora de um campo fecha o teclado */}
      <Pressable onPress={Keyboard.dismiss} style={styles.content0} accessible={false}>
        <RouteCard day={day} />
        <DaySummaryCard values={values} />
        <WeekStartCard value={values.weekStart} onChange={(weekStart) => update({ weekStart })} />
        <TruckCard values={values} update={update} />
        <KilometersCard values={values} update={update} />
        <DrivingTimeCard minutes={values.drivingMinutes} onChange={(drivingMinutes) => update({ drivingMinutes })} />
        <AmplitudesCard day={day} />
        <NotesCard value={values.observations} onChange={(observations) => update({ observations })} />
      </Pressable>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Secções
// ---------------------------------------------------------------------------

/** Linha "rótulo …… valor". */
function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.formRow}>
      <Text style={text(fontSize.body)}>{label}</Text>
      <View style={styles.flex} />
      {children}
    </View>
  );
}

/** Trajeto: Partida e "Chegada" (último repouso de fecho do dia). */
function RouteCard({ day }: { day: DayStruct }) {
  const s = useStrings();
  const t = s.day.general;
  const actions = day.actions ?? [];
  const departure = actions.find((a) => a.action === 'Partida');
  const arrival = lastEndingRest(actions);
  return (
    <Card style={styles.card16}>
      <View style={styles.formRow}>
        <SectionLabel>{t.routeTitle}</SectionLabel>
        <View style={styles.flex} />
        <View style={styles.row4}>
          <Dot color={colors.orange} />
          <Text style={text(fontSize.caption, '600', colors.orange)}>{t.open}</Text>
        </View>
      </View>
      <View style={styles.gap12}>
        {departure && (
          <View style={styles.stop}>
            <Dot color={colors.green} style={styles.stopDot} />
            <View style={styles.stopBody}>
              <SectionLabel>{t.departure}</SectionLabel>
              <Text style={text(fontSize.body, '500')}>{departure.local}</Text>
              <Text style={text(fontSize.subheadline, '400', colors.textSecondary)}>{formatAppDate(departure.date, 'HH:mm')}</Text>
            </View>
          </View>
        )}
        <View style={styles.stop}>
          {arrival ? <Dot color={colors.orange} style={styles.stopDot} /> : <View style={[styles.emptyDot, styles.stopDot]} />}
          <View style={styles.stopBody}>
            <SectionLabel>{t.arrival}</SectionLabel>
            {arrival ? (
              <>
                <Text style={text(fontSize.body, '500')}>{arrival.local}</Text>
                <Text style={text(fontSize.subheadline, '400', colors.textSecondary)}>{formatAppDate(arrival.date, 'HH:mm')}</Text>
              </>
            ) : (
              <Text style={[text(fontSize.body, '400', colors.textSecondary), styles.italic]}>{t.arrivalMissing}</Text>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
}

/** Resumo: tempo de condução e km totais. */
function DaySummaryCard({ values }: { values: DayFormValues }) {
  const s = useStrings();
  const t = s.day.general;
  const hasKm = values.departureKm !== '' && values.arriveKm !== '';
  const km = totalKm(kmOrZero(values.departureKm), kmOrZero(values.arriveKm));
  return (
    <Card style={styles.card16}>
      <SectionLabel>{t.summaryTitle}</SectionLabel>
      <View style={styles.row16}>
        <SummaryColumn
          label={t.driving}
          value={values.drivingMinutes > 0 ? formatDuration(values.drivingMinutes) : null}
          caption={values.drivingMinutes > 0 ? t.drivingCaption : t.notRecorded}
        />
        <Divider vertical />
        <SummaryColumn label={t.km} value={hasKm ? String(km) : null} caption={hasKm ? t.kmCaption : t.kmMissing} />
      </View>
      <View style={styles.infoRow}>
        <Icon name="info.circle" size={fontSize.caption} color={colors.textSecondary} />
        <Text style={[text(fontSize.caption, '400', colors.textSecondary), styles.flex]}>
          {t.completeAfterArrivalBefore}{' '}
          <Text style={text(fontSize.caption, '700', colors.text)}>{t.arrivalAction}</Text>.
        </Text>
      </View>
    </Card>
  );
}

function SummaryColumn({ label, value, caption }: { label: string; value: string | null; caption: string }) {
  return (
    <View style={styles.summaryColumn}>
      <Text style={text(fontSize.caption, '400', colors.textSecondary)}>{label}</Text>
      {value != null ? (
        <Text style={text(fontSize.title, '700', colors.primary)}>{value}</Text>
      ) : (
        <Text style={text(fontSize.title, '700')}>—</Text>
      )}
      <Text style={text(fontSize.caption, '400', colors.textSecondary)}>{caption}</Text>
    </View>
  );
}

function WeekStartCard({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const s = useStrings();
  const t = s.day.general;
  return (
    <Card style={styles.weekStartCard}>
      <View style={styles.iconBox}>
        <Icon name="calendar" size={fontSize.title2} color={colors.primary} />
      </View>
      <View style={styles.weekStartBody}>
        <Text style={text(fontSize.body, '500')}>{t.weekStart}</Text>
        <Text style={text(fontSize.caption, '400', colors.textSecondary)}>{t.weekStartHint}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary, false: undefined }} ios_backgroundColor="#E9E9EB" />
    </Card>
  );
}

type UpdateFn = (patch: Partial<DayFormValues>) => void;

function TruckCard({ values, update }: { values: DayFormValues; update: UpdateFn }) {
  const s = useStrings();
  const t = s.day.general;
  return (
    <Card style={styles.card16}>
      <SectionLabel>{t.truckTitle}</SectionLabel>
      <View style={styles.gap16}>
        <FormRow label={t.truckPlate}>
          <ValueInput value={values.truckPlate} onChangeText={(truckPlate) => update({ truckPlate })} placeholder="—" />
        </FormRow>
        <Divider />
        <FormRow label={t.trailerPlate}>
          <ValueInput value={values.trailerPlate} onChangeText={(trailerPlate) => update({ trailerPlate })} placeholder="—" />
        </FormRow>
      </View>
    </Card>
  );
}

function KilometersCard({ values, update }: { values: DayFormValues; update: UpdateFn }) {
  const s = useStrings();
  const t = s.day.general;
  const hasKm = values.departureKm !== '' && values.arriveKm !== '';
  const km = totalKm(kmOrZero(values.departureKm), kmOrZero(values.arriveKm));
  return (
    <Card style={styles.card16}>
      <SectionLabel>{t.kmTitle}</SectionLabel>
      <View style={styles.gap16}>
        <FormRow label={t.departureKm}>
          <ValueInput
            value={values.departureKm}
            onChangeText={(departureKm) => update({ departureKm })}
            placeholder={t.notRecorded}
            numeric
          />
        </FormRow>
        <Divider />
        <FormRow label={t.arrivalKm}>
          <ValueInput value={values.arriveKm} onChangeText={(arriveKm) => update({ arriveKm })} placeholder={t.notRecorded} numeric />
        </FormRow>
        <Divider />
        <FormRow label={t.totalDistance}>
          {hasKm ? <Text style={text(fontSize.body, '600', colors.primary)}>{t.kmUnit(km)}</Text> : <Text style={text(fontSize.body, '600')}>—</Text>}
        </FormRow>
        <Text style={[text(fontSize.caption, '400', colors.textSecondary), styles.italic]}>
          {hasKm
            ? t.kmAuto
            : t.kmFillHint}
        </Text>
      </View>
    </Card>
  );
}

function DrivingTimeCard({ minutes, onChange }: { minutes: number; onChange: (minutes: number) => void }) {
  const s = useStrings();
  const t = s.day.general;
  // O seletor de hora representa a duração como uma hora do dia (HH:mm).
  const asTime = new Date(2001, 0, 1, Math.trunc(minutes / 60), minutes % 60);
  return (
    <Card style={styles.card16}>
      <SectionLabel>{t.drivingTimeTitle}</SectionLabel>
      <View style={styles.gap16}>
        <FormRow label={t.drivingTime}>
          <TimePicker value={asTime} onChange={(d) => onChange(d.getHours() * 60 + d.getMinutes())} />
        </FormRow>
        <Text style={[text(fontSize.caption, '400', colors.textSecondary), styles.italic]}>
          {minutes > 0 ? t.drivingTotal(formatDuration(minutes)) : t.drivingHint}
        </Text>
      </View>
    </Card>
  );
}

/** Amplitudes 13H e 15H (a de 15H fica indisponível com 3 reduzidas e sem 3H+). */
function AmplitudesCard({ day }: { day: DayStruct }) {
  const s = useStrings();
  const t = s.day.general;
  const allDays = useDaysStore((s) => s.days);
  const dayLimit = getDayLimit(day, allDays, currentTimeZoneId());
  const valueStyle = [text(fontSize.body, '600'), styles.rightValue];
  return (
    <Card style={styles.card16}>
      <SectionLabel>{t.amplitudesTitle}</SectionLabel>
      <View style={styles.gap16}>
        <FormRow label={t.amplitude13}>
          <Text style={valueStyle}>{amplitudeLimitText(day, 13)}</Text>
        </FormRow>
        <Divider />
        <View style={styles.gap6}>
          <FormRow label={t.amplitude15}>
            {dayLimit.blocked && dayLimit.limit15h != null ? (
              <Text style={[text(fontSize.body, '600', colors.textSecondary), styles.rightValue]}>
                {t.amplitude15Unavailable(formatAppDate(new Date(dayLimit.limit15h), 'HH:mm'))}
              </Text>
            ) : (
              <Text style={valueStyle}>{amplitudeLimitText(day, 15)}</Text>
            )}
          </FormRow>
          {hasThreeHourRest(day.actions ?? []) && (
            <Text style={text(fontSize.caption, '600', colors.restGreen)}>{t.fractionedNoReduced}</Text>
          )}
        </View>
      </View>
    </Card>
  );
}

function NotesCard({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const s = useStrings();
  const t = s.day.general;
  return (
    <Card style={styles.card16}>
      <SectionLabel>{t.notesTitle}</SectionLabel>
      <View>
        <TextInput value={value} onChangeText={onChange} multiline style={styles.notesInput} />
        {value === '' && (
          <Text pointerEvents="none" style={styles.notesPlaceholder}>
            {t.notesPlaceholder}
          </Text>
        )}
      </View>
    </Card>
  );
}

/** Campo de texto alinhado à direita (valores do formulário). */
function ValueInput({
  value,
  onChangeText,
  placeholder,
  numeric,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  numeric?: boolean;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textTertiary}
      keyboardType={numeric ? 'number-pad' : undefined}
      style={styles.valueInput}
    />
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  content: { padding: 16, gap: 24 },
  content0: { gap: 24 },
  card16: { gap: 16 },
  flex: { flex: 1 },
  gap6: { gap: 6 },
  gap12: { gap: 12 },
  gap16: { gap: 16 },
  row4: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  row16: { flexDirection: 'row', gap: 16 },
  formRow: { flexDirection: 'row', alignItems: 'center' },
  stop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stopDot: { marginTop: 6 },
  stopBody: { gap: 2, flex: 1 },
  emptyDot: { width: 8, height: 8, borderRadius: 4, borderWidth: 2, borderColor: 'rgba(142,142,147,0.3)' },
  italic: { fontStyle: 'italic' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  summaryColumn: { flex: 1, gap: 4 },
  weekStartCard: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 40, alignItems: 'center' },
  weekStartBody: { gap: 2, flex: 1 },
  rightValue: { flexShrink: 1, textAlign: 'right' },
  valueInput: { ...text(fontSize.body, '600'), textAlign: 'right', minWidth: 80, flexShrink: 1, padding: 0 },
  notesInput: { ...text(fontSize.body), minHeight: 100, textAlignVertical: 'top', paddingTop: 8, paddingHorizontal: 5 },
  notesPlaceholder: {
    ...text(fontSize.body, '400', colors.textSecondary),
    fontStyle: 'italic',
    position: 'absolute',
    top: 8,
    left: 5,
    right: 0,
  },
});
