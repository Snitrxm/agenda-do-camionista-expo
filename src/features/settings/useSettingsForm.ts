/**
 * Matrículas por omissão guardadas no backend (carrega ao abrir, grava em "Guardar").
 */

import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { getErrorMessage } from '../../api/client';
import { fetchSettings, updateSettings } from '../../api/settings';
import { strings } from '../../i18n';
import { getCurrentUser } from '../../stores/authStore';

const showError = (message: string) => Alert.alert(strings().settings.errorTitle, message, [{ text: strings().common.ok }]);

export function useSettingsForm() {
  const [isLoading, setLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [form, setForm] = useState({ id: '', defaultTruckPlate: '', defaultTrailerPlate: '' });

  useEffect(() => {
    const userId = getCurrentUser()?.id;
    if (!userId) return;
    fetchSettings(userId)
      .then((r) => {
        setLoading(false);
        setForm({ id: r.id, defaultTruckPlate: r.defaultTruckPlate ?? '', defaultTrailerPlate: r.defaultTrailerPlate ?? '' });
      })
      .catch((e) => {
        setLoading(false);
        showError(getErrorMessage(e));
      });
  }, []);

  /** Grava e fecha os Ajustes. */
  const save = () => {
    setSaving(true);
    updateSettings(form.id, { defaultTruckPlate: form.defaultTruckPlate, defaultTrailerPlate: form.defaultTrailerPlate })
      .then(() => {
        setSaving(false);
        router.back();
      })
      .catch((e) => {
        setSaving(false);
        showError(getErrorMessage(e));
      });
  };

  return {
    isLoading,
    isSaving,
    form,
    setTruckPlate: (defaultTruckPlate: string) => setForm((f) => ({ ...f, defaultTruckPlate })),
    setTrailerPlate: (defaultTrailerPlate: string) => setForm((f) => ({ ...f, defaultTrailerPlate })),
    save,
  };
}
