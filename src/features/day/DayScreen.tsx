/**
 * Ecrã de um dia, com três separadores: Geral, Ações e Fotos.
 *
 * - Título: a data do dia; botão do mapa à direita.
 * - Aberto em "Ações" (dia em curso) abre logo o formulário "Criar Ação".
 */

import { router, useNavigation } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { formatAppDate } from '../../lib/dateFormat';
import { useDaysStore } from '../../stores/daysStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { Icon } from '../../ui/Icon';
import { colors, fontSize } from '../../ui/theme';
import { ActionsTab } from './components/ActionsTab';
import { DayTabBar } from './components/DayTabBar';
import { GeneralTab } from './components/GeneralTab';
import { PhotosTab } from './components/PhotosTab';
import { DayTab } from './navigation';

export function DayScreen({ dayId, initialTab }: { dayId: string; initialTab: DayTab }) {
  const day = useDaysStore((s) => s.days.find((d) => d.id === dayId));
  useSettingsStore((s) => s.timeZone); // volta a desenhar se o fuso mudar
  const navigation = useNavigation();
  const [tab, setTab] = useState<DayTab>(initialTab);

  const dayDate = day?.date;
  useLayoutEffect(() => {
    if (!dayDate) return;
    navigation.setOptions({
      title: formatAppDate(dayDate),
      headerRight: () => (
        <Pressable onPress={() => router.push({ pathname: '/map', params: { dayId } })} hitSlop={10}>
          <Icon name="map" size={fontSize.title3} color={colors.primary} />
        </Pressable>
      ),
    });
  }, [navigation, dayDate, dayId]);

  // Dia em curso: abre logo "Criar Ação" (depois da animação de entrada).
  useEffect(() => {
    if (initialTab !== 'Actions') return;
    const t = setTimeout(() => router.push({ pathname: '/create-action', params: { dayId } }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!day) return null;

  return (
    <View style={styles.screen}>
      <View style={styles.flex}>
        {tab === 'Form' && <GeneralTab day={day} />}
        {tab === 'Actions' && <ActionsTab day={day} />}
        {tab === 'Files' && <PhotosTab day={day} />}
      </View>
      <DayTabBar selected={tab} onSelect={setTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
});
