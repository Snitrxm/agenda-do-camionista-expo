/**
 * Definições locais da app (guardadas no telemóvel): fuso horário e idioma.
 *
 * Regista-se como fornecedor do fuso (`lib/dateFormat`) e do idioma
 * (`i18n`), para que datas e textos usem a escolha do utilizador.
 *
 * @module stores/settingsStore
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { create } from 'zustand';
import { Language, setLanguageProvider } from '../i18n';
import { setAppTimeZoneProvider } from '../lib/dateFormat';

/** Fusos suportados. */
export type AppTimeZone = 'lisboa' | 'madrid';

/** Ordem em que os fusos aparecem nos Ajustes. */
export const APP_TIME_ZONES: AppTimeZone[] = ['lisboa', 'madrid'];

/** Identificador IANA do fuso. */
export function timeZoneId(tz: AppTimeZone): string {
  return tz === 'madrid' ? 'Europe/Madrid' : 'Europe/Lisbon';
}

/** Nome do fuso para mostrar. */
export function timeZoneLabel(tz: AppTimeZone): string {
  return tz === 'madrid' ? 'Madrid' : 'Lisboa';
}

/** Idioma escolhido: `auto` segue o idioma do telemóvel. */
export type LanguagePreference = 'auto' | Language;

/** Opções de idioma, pela ordem em que aparecem nos Ajustes. */
export const LANGUAGE_PREFERENCES: LanguagePreference[] = ['auto', 'pt', 'es'];

/** Idioma do telemóvel: espanhol se for "es", senão português. */
function deviceLanguage(): Language {
  try {
    return getLocales()[0]?.languageCode === 'es' ? 'es' : 'pt';
  } catch {
    return 'pt';
  }
}

/** Idioma efetivo para uma preferência. */
export function resolveLanguage(pref: LanguagePreference): Language {
  return pref === 'auto' ? deviceLanguage() : pref;
}

const STORAGE_KEY = 'selectedTimeZone';
const LANGUAGE_KEY = 'appLanguage';

interface SettingsState {
  timeZone: AppTimeZone;
  languagePreference: LanguagePreference;
  /** Idioma efetivo (resolvido a partir da preferência). */
  language: Language;
  /** `true` depois de ler as definições guardadas (a app espera por isto ao arrancar). */
  loaded: boolean;
  setTimeZone: (tz: AppTimeZone) => void;
  setLanguagePreference: (pref: LanguagePreference) => void;
  load: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  timeZone: 'lisboa',
  languagePreference: 'auto',
  language: resolveLanguage('auto'),
  loaded: false,
  setTimeZone: (tz) => {
    set({ timeZone: tz });
    AsyncStorage.setItem(STORAGE_KEY, tz).catch(() => {});
  },
  setLanguagePreference: (pref) => {
    set({ languagePreference: pref, language: resolveLanguage(pref) });
    AsyncStorage.setItem(LANGUAGE_KEY, pref).catch(() => {});
  },
  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw === 'lisboa' || raw === 'madrid') set({ timeZone: raw });
      const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (lang === 'auto' || lang === 'pt' || lang === 'es') set({ languagePreference: lang, language: resolveLanguage(lang) });
    } catch {}
    set({ loaded: true });
  },
}));

/** Identificador IANA do fuso escolhido (para uso fora de componentes). */
export function currentTimeZoneId(): string {
  return timeZoneId(useSettingsStore.getState().timeZone);
}

setAppTimeZoneProvider(currentTimeZoneId);
setLanguageProvider(() => useSettingsStore.getState().language);
