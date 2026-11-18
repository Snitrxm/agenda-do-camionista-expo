/**
 * Criar conta: valida o formulário, cria o utilizador (`POST /users`),
 * entra logo com a nova conta e oferece Face ID / impressão digital.
 */

import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { login, register } from '../../../api/auth';
import { getErrorMessage } from '../../../api/client';
import { currentLanguage, strings } from '../../../i18n';
import { useAuthStore } from '../../../stores/authStore';
import { RegistrationForm, registrationPayload, validateRegistration } from '../registration';
import { offerBiometrics } from './useLogin';

const EMPTY: RegistrationForm = { name: '', email: '', password: '', confirmPassword: '' };

export function useRegister() {
  const [form, setForm] = useState<RegistrationForm>(EMPTY);
  const [isSaving, setSaving] = useState(false);
  const update = (patch: Partial<RegistrationForm>) => setForm((f) => ({ ...f, ...patch }));

  const showError = (message: string) =>
    Alert.alert(strings().auth.registerErrorTitle, message, [{ text: strings().common.ok }]);

  const submit = async () => {
    if (isSaving) return;
    const error = validateRegistration(form);
    if (error) return showError(error);

    const account = registrationPayload(form);
    setSaving(true);
    try {
      const user = await register({ ...account, language: currentLanguage() });
      if (!user) {
        // O backend responde vazio quando o e-mail já existe (ou falha ao gravar).
        setSaving(false);
        return showError(strings().auth.registerFailed);
      }
      const session = await login({ email: account.email, password: account.password });
      await offerBiometrics(account.email, account.password);
      useAuthStore.getState().setSession(session.token, session.user);
      setSaving(false);
      router.back();
    } catch (e) {
      setSaving(false);
      showError(getErrorMessage(e));
    }
  };

  return { form, update, isSaving, submit };
}
