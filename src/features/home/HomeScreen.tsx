/**
 * Ecrã Início: atalhos, avisos, dia em curso, contadores da semana, limites
 * de condução, repouso, compensações e a lista de dias (com pesquisa).
 */

import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight';
import { useStrings } from '../../hooks/useStrings';
import { useDaysStore } from '../../stores/daysStore';
import { FloatingActionButton } from '../../ui/primitives';
import { colors, fontSize, text } from '../../ui/theme';
import { openDay } from '../day/navigation';
import { CompensationCard } from './components/CompensationCard';
import { DayInProgressCard } from './components/DayInProgressCard';
import { DayRow } from './components/DayRow';
import { DrivingLimitsCard } from './components/DrivingLimitsCard';
import { RestStatusCard } from './components/RestStatusCard';
import { SEARCH_BAR_HEIGHT, SearchBar } from './components/SearchBar';
import { TopBar } from './components/TopBar';
import { WarningsCapsule } from './components/WarningsCapsule';
import { WeekCountersSection } from './components/WeekCountersSection';
import { WeeklyRestCard } from './components/WeeklyRestCard';
import { useHomeData } from './hooks/useHomeData';

const FAB_HEIGHT = 56;

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const home = useHomeData();
  const s = useStrings();

  // Pesquisa no fundo (sobe com o teclado) e "Novo dia" por cima dela.
  const searchBottom = keyboardHeight > 0 ? keyboardHeight + 8 : insets.bottom + 8;
  const fabBottom = searchBottom + SEARCH_BAR_HEIGHT + 12;
  // Espaço no fim da lista para o último cartão não ficar tapado.
  const listBottomInset = insets.bottom + 8 + SEARCH_BAR_HEIGHT + 12 + FAB_HEIGHT + 16;

  const createDay = async () => {
    const newDay = await useDaysStore.getState().createDay();
    if (newDay) openDay(newDay, 'Form');
  };

  return (
    <View style={styles.screen}>
      {home.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : home.filteredDays.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>{s.home.noDays}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.screen}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: listBottomInset }]}
        >
          <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
            <TopBar
              onDrivingHours={() => router.push('/weekly-hours')}
              onWorkSheet={() => router.push('/worksheet')}
              onSettings={() => router.push('/settings')}
            />
          </View>
          {home.warnings.length > 0 && (
            <View style={styles.padded}>
              <WarningsCapsule warnings={home.warnings} />
            </View>
          )}
          {home.weeklyRest && <WeeklyRestCard rest={home.weeklyRest} now={home.now.getTime()} tz={home.tz} />}
          {home.dailyRestPast24h && (
            <WeeklyRestCard rest={home.dailyRestPast24h} now={home.now.getTime()} tz={home.tz} fromDailyRest />
          )}
          {home.dayInProgress && <DayInProgressCard day={home.dayInProgress} days={home.days} now={home.now} tz={home.tz} />}
          <WeekCountersSection counters={home.weekCounters} />
          <DrivingLimitsCard
            weekMinutes={home.drivingHours?.currentWeek.drivingMinutes ?? 0}
            biweekMinutes={home.drivingHours?.currentWeek.biweekDrivingMinutes ?? 0}
          />
          <RestStatusCard days={home.days} now={home.now.getTime()} tz={home.tz} />
          {home.compensations.map((c) => (
            <CompensationCard key={c.id} compensation={c} tz={home.tz} />
          ))}
          <View style={styles.daysSection}>
            <Text style={styles.sectionTitle}>{s.home.recentDays}</Text>
            <View>
              {home.filteredDays.map((day) => (
                <DayRow key={day.id} day={day} allDays={home.days} />
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {!home.isLoading && (
        <SearchBar
          value={home.searchQuery}
          onChangeText={(q) => useDaysStore.getState().setSearchQuery(q)}
          style={{ bottom: searchBottom }}
        />
      )}
      {!home.isLoading && keyboardHeight === 0 && (
        <FloatingActionButton title={s.home.newDay} onPress={createDay} disabled={home.isCreatingDay} style={{ bottom: fabBottom }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { ...text(fontSize.headline, '600'), padding: 16 },
  content: { gap: 14 },
  topBar: { paddingHorizontal: 16 },
  padded: { paddingHorizontal: 16 },
  daysSection: { gap: 12 },
  sectionTitle: { ...text(fontSize.subheadline, '600', colors.textSecondary), paddingHorizontal: 16 },
});
