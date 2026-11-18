/**
 * Textos no idioma atual, para componentes (volta a desenhar ao mudar de idioma).
 *
 * @module hooks/useStrings
 */

import { Strings, strings } from '../i18n';
import { useSettingsStore } from '../stores/settingsStore';

export function useStrings(): Strings {
  useSettingsStore((s) => s.language);
  return strings();
}
