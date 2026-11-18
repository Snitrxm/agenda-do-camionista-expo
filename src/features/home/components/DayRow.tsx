/**
 * Linha de um dia na lista "DIAS RECENTES": quadrado com o dia, cartão com
 * trajeto, condução, km, fracionado 3+9 e a última pausa/repouso.
 *
 * Toque → abre o dia (em Ações se estiver em aberto). Toque longo → menu
 * "Gerar PDF" / "Delete".
 */

import * as Sharing from 'expo-sharing';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { actionDisplayName, SHORT_BREAKS } from '../../../domain/actionTypes';
import { cityOnly, findDeparture, isDayOpen, lastEndingRest, latestBreak, breakEndText, totalKm } from '../../../domain/days';
import { hasThreeHourRest } from '../../../domain/fractionedRest';
import { useStrings } from '../../../hooks/useStrings';
import { dateLocale } from '../../../i18n';
import { formatAppDate, minutesToClock, parseISO } from '../../../lib/dateFormat';
import { shortWeekdaySymbols } from '../../../lib/timezone';
import { useDaysStore } from '../../../stores/daysStore';
import { DayStruct } from '../../../types/models';
import { Icon } from '../../../ui/Icon';
import { openMenu } from '../../../ui/menus';
import { cardStyle, colors, fontSize, text } from '../../../ui/theme';
import { Dot, Tag } from '../../../ui/primitives';
import { createDayPdf } from '../../day/dayPdf';
import { openDay } from '../../day/navigation';
import { RestLabelTag } from './RestLabelTag';

export function DayRow({ day, allDays }: { day: DayStruct; allDays: DayStruct[] }) {
  const s = useStrings();
  // Dia e "hoje" no fuso do dispositivo (como na versão original).
  const date = parseISO(day.date) ?? new Date();
  const weekdayName = shortWeekdaySymbols(dateLocale('pt_PT'))[date.getDay()].toUpperCase();
  const isToday = new Date().toDateString() === date.toDateString();

  const actions = day.actions ?? [];
  const departure = findDeparture(day);
  const arrival = lastEndingRest(actions); // "Chegada" do trajeto = último repouso de fecho
  const lastBreak = latestBreak(actions);
  const departureDate = departure ? parseISO(departure.date) : null;
  const splitReadyUntil =
    hasThreeHourRest(actions) && departureDate ? formatAppDate(new Date(departureDate.getTime() + 15 * 3600000), 'HH:mm') : null;

  const badgeBackground = day.weekStart ? colors.teal : isToday ? colors.primary : colors.fill;
  const badgeText = isToday || day.weekStart ? '#fff' : colors.text;
  const borderColor = day.weekStart ? colors.teal : isToday ? colors.primary : 'transparent';

  const showContextMenu = () =>
    openMenu(
      [
        { label: s.home.generatePdf, value: 'pdf' },
        { label: s.home.deleteDay, value: 'delete', destructive: true },
      ],
      async (choice) => {
        if (choice === 'pdf') {
          try {
            const uri = await createDayPdf(day);
            await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
          } catch (e) {
            console.log(e);
          }
        } else {
          Alert.alert(s.common.confirmDeleteTitle, s.home.confirmDeleteDay, [
            { text: s.common.cancel, style: 'cancel' },
            { text: s.common.delete, style: 'destructive', onPress: () => useDaysStore.getState().deleteDay(day) },
          ]);
        }
      }
    );

  return (
    <View style={styles.row}>
      <View style={[styles.badge, { backgroundColor: badgeBackground }]}>
        {day.weekStart ? (
          <Icon name="star.fill" size={fontSize.caption2} color={badgeText} />
        ) : (
          <Text numberOfLines={1} style={text(fontSize.caption2, '600', badgeText)}>
            {weekdayName}
          </Text>
        )}
        <Text style={text(fontSize.title2, '700', badgeText)}>{date.getDate()}</Text>
      </View>

      <Pressable
        onPress={() => openDay(day, isDayOpen(day) ? 'Actions' : 'Form')}
        onLongPress={showContextMenu}
        style={({ pressed }) => [cardStyle, styles.card, { borderColor, opacity: pressed ? 0.85 : 1 }]}
      >
        <View style={styles.titleRow}>
          <Dot color={colors.green} />
          <Text style={[text(fontSize.headline, '600'), styles.shrink]}>{formatAppDate(day.date)}</Text>
          <View style={styles.flex} />
          <Text style={text(fontSize.caption, '400', colors.textSecondary)}>{s.home.actionsCount(actions.length)}</Text>
        </View>
        {day.weekStart && (
          <Tag label={s.home.weekStart} color={colors.teal} background="rgba(67,145,138,0.12)" radius={8} style={styles.weekStartTag} />
        )}

        {departure && (
          <View style={styles.routeRow}>
            <Text numberOfLines={1} style={[text(fontSize.subheadline, '500'), styles.shrink]}>
              {cityOnly(departure.local)}
            </Text>
            {arrival && (
              <>
                <Icon name="arrow.right" size={fontSize.caption} color={colors.textSecondary} />
                <Text numberOfLines={1} style={[text(fontSize.subheadline, '500'), styles.shrink]}>
                  {cityOnly(arrival.local)}
                </Text>
              </>
            )}
          </View>
        )}

        <View style={styles.statsRow}>
          {day.drivingMinutes != null && <Stat icon="clock" label={minutesToClock(day.drivingMinutes)} />}
          {day.departureKm != null && day.arriveKm != null && day.arriveKm > 0 && (
            <Stat icon="equal" label={`${totalKm(day.departureKm, day.arriveKm)} km`} />
          )}
        </View>

        {splitReadyUntil && (
          <Tag
            icon="bed.double.fill"
            label={s.home.splitReady(splitReadyUntil)}
            color={colors.restGreen}
            background={colors.restGreenBg}
            size={fontSize.caption}
          />
        )}

        {lastBreak && (
          <View style={styles.breakRow}>
            {SHORT_BREAKS.has(lastBreak.action) ? (
              <View style={[styles.breakIcon, { backgroundColor: 'rgba(0,122,255,0.12)' }]}>
                <Icon name="cup.and.saucer.fill" size={fontSize.body} color={colors.blue} />
              </View>
            ) : (
              <View style={[styles.breakIcon, { backgroundColor: colors.restGreenBg }]}>
                <Icon name="bed.double.fill" size={fontSize.body} color={colors.restGreen} />
              </View>
            )}
            <View style={styles.breakBody}>
              <Text style={text(fontSize.body, '700')}>{actionDisplayName(lastBreak.action)}</Text>
              <RestLabelTag action={lastBreak} days={allDays} />
              <Text style={text(fontSize.subheadline, '400', colors.textSecondary)}>
                {s.home.endsAt(breakEndText(lastBreak.action, lastBreak.date))}
              </Text>
            </View>
          </View>
        )}
      </Pressable>
    </View>
  );
}

function Stat({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Icon name={icon} size={fontSize.caption} color={colors.textSecondary} />
      <Text style={text(fontSize.caption, '400', colors.textSecondary)}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingVertical: 4 },
  badge: { width: 60, height: 60, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 2 },
  card: { flex: 1, gap: 8, borderWidth: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
  shrink: { flexShrink: 1 },
  weekStartTag: { paddingVertical: 2 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, overflow: 'hidden' },
  statsRow: { flexDirection: 'row', gap: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  breakRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 6 },
  breakIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  breakBody: { gap: 4, flex: 1 },
});
