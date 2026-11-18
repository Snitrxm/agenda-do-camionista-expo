/**
 * Layout raiz: carrega as definições e a cache local antes de mostrar a app
 * e declara todas as rotas da pilha de navegação (e como são apresentadas).
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform, UIManager, View } from 'react-native';
import { useStrings } from '../hooks/useStrings';
import { useDaysStore } from '../stores/daysStore';
import { useSettingsStore } from '../stores/settingsStore';
import { AndroidMenuHost } from '../ui/menus';
import { colors } from '../ui/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/** Ecrãs apresentados como folha (modal) por cima do anterior. */
const modal = { presentation: 'modal' as const, headerShadowVisible: false };

export default function RootLayout() {
  const loaded = useSettingsStore((s) => s.loaded);
  const s = useStrings();
  const t = s.navigation;

  useEffect(() => {
    useSettingsStore
      .getState()
      .load()
      .then(() => useDaysStore.getState().hydrateFromCache());
  }, []);

  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colors.blue,
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTitleStyle: { fontSize: 17, fontWeight: '600', color: colors.text },
          contentStyle: { backgroundColor: colors.background },
          headerBackButtonDisplayMode: 'default',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false, title: '' }} />
        <Stack.Screen name="day/[id]" options={{ headerBackTitle: s.common.back }} />
        <Stack.Screen name="register" options={{ ...modal, title: t.register }} />
        <Stack.Screen name="forgot-password" options={{ ...modal, title: t.forgotPassword }} />
        <Stack.Screen name="settings" options={{ ...modal, title: t.settings }} />
        <Stack.Screen name="weekly-hours" options={{ ...modal, title: t.drivingHours }} />
        <Stack.Screen name="worksheet" options={{ ...modal, title: t.worksheet }} />
        <Stack.Screen name="create-action" options={{ ...modal, title: t.createAction }} />
        <Stack.Screen name="edit-action" options={{ ...modal, title: t.editAction }} />
        <Stack.Screen
          name="map"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [1.0],
            sheetGrabberVisible: true,
            headerShown: false,
            contentStyle: { backgroundColor: '#fff' },
          }}
        />
        <Stack.Screen
          name="photo"
          options={{
            presentation: 'modal',
            title: '',
            headerStyle: { backgroundColor: '#1c1c1e' },
            headerTintColor: '#fff',
            contentStyle: { backgroundColor: '#000' },
          }}
        />
      </Stack>
      {Platform.OS === 'android' && <AndroidMenuHost />}
    </>
  );
}
