/**
 * "Esqueceu a senha" em 2 passos:
 * 1. email → `POST /users/forgot-password` (o backend envia o código);
 * 2. código + nova senha → `POST /users/reset-password`, e entra logo na conta.
 */

import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { forgotPassword, INVALID_RESET_CODE, login, resetPassword } from '../../../api/auth';
import { getErrorMessage } from '../../../api/client';
import { currentLanguage, strings } from '../../../i18n';
import { useAuthStore } from '../../../stores/authStore';
import { validateNewPassword, validateResetEmail } from '../passwordReset';
import { offerBiometrics } from './useLogin';

export function usePasswordReset() {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isBusy, setBusy] = useState(false);

  const showError = (message: string) =>
    Alert.alert(strings().passwordReset.errorTitle, message, [{ text: strings().common.ok }]);

  /** Passo 1 (e "Reenviar código"): pede o código. */
  const sendCode = async () => {
    if (isBusy) return;
    const error = validateResetEmail(email);
    if (error) return showError(error);
    setBusy(true);
    try {
      await forgotPassword({ email: email.trim(), language: currentLanguage() });
      setBusy(false);
      setStep('code');
    } catch (e) {
      setBusy(false);
      showError(getErrorMessage(e));
    }
  };

  /** Passo 2: muda a senha e entra na conta. */
  const changePassword = async () => {
    if (isBusy) return;
    const error = validateNewPassword({ code, password, confirmPassword });
    if (error) return showError(error);
    const trimmedEmail = email.trim();
    setBusy(true);
    try {
      await resetPassword({ email: trimmedEmail, code: code.trim(), password, language: currentLanguage() });
      const session = await login({ email: trimmedEmail, password });
      await offerBiometrics(trimmedEmail, password); // atualiza a senha guardada para o Face ID
      useAuthStore.getState().setSession(session.token, session.user);
      setBusy(false);
      router.back();
    } catch (e) {
      setBusy(false);
      const message = getErrorMessage(e);
      showError(message === INVALID_RESET_CODE ? strings().passwordReset.invalidCode : message);
    }
  };

  return {
    step,
    email,
    setEmail,
    code,
    setCode,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isBusy,
    sendCode,
    changePassword,
    /** Volta ao passo do email. */
    changeEmail: () => setStep('email'),
  };
}
