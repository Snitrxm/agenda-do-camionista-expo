/**
 * Lógica do ecrã de login: login com senha, oferta/atualização da
 * biometria depois do login manual e login com Face ID / digital
 * (pedido automaticamente ao abrir, se houver credenciais guardadas).
 */

import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { login } from '../../../api/auth';
import { getErrorMessage } from '../../../api/client';
import { strings } from '../../../i18n';
import { useAuthStore } from '../../../stores/authStore';
import {
  biometryLabel,
  BiometryType,
  deleteSavedCredentials,
  getBiometryType,
  getCredentialsWithBiometrics,
  hasSavedCredentials,
  saveCredentials,
} from '../biometrics';

/**
 * Depois de um login manual (ou de criar conta): oferece a biometria, ou
 * atualiza a senha guardada.
 */
export async function offerBiometrics(email: string, password: string) {
  const type = await getBiometryType();
  if (!type) return;
  if (await hasSavedCredentials()) {
    await saveCredentials({ email, password }); // mantém a senha atualizada
    return;
  }
  await new Promise<void>((resolve) =>
    Alert.alert(strings().auth.offerBiometryTitle(biometryLabel(type)), strings().auth.offerBiometryText(biometryLabel(type)), [
      { text: strings().auth.notNow, style: 'cancel', onPress: () => resolve() },
      {
        text: strings().auth.use,
        onPress: () => {
          saveCredentials({ email, password })
            .catch(() => {})
            .finally(() => resolve());
        },
      },
    ])
  );
}

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [biometry, setBiometry] = useState<BiometryType>(null);
  const [hasCredentials, setHasCredentials] = useState(false);
  const busy = useRef(false); // evita dois logins em paralelo
  const didPromptBiometry = useRef(false);

  const signIn = async (em: string, pw: string, viaBiometrics = false) => {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    if (!em || !pw) {
      busy.current = false;
      setLoading(false);
      Alert.alert(strings().auth.loginErrorTitle, strings().auth.fillAllFields, [{ text: strings().common.ok }]);
      return;
    }
    try {
      const response = await login({ email: em, password: pw });
      if (!viaBiometrics) await offerBiometrics(em, pw);
      setLoading(false);
      // Entrar na sessão mostra o Início (ver app/index.tsx).
      useAuthStore.getState().setSession(response.token, response.user);
    } catch (e) {
      busy.current = false;
      setLoading(false);
      if (viaBiometrics) {
        // A senha guardada pode ter mudado: esquece-a e pede login manual.
        await deleteSavedCredentials();
        setHasCredentials(false);
        setEmail(em);
        Alert.alert(strings().auth.loginErrorTitle, strings().auth.enterManually(getErrorMessage(e)), [{ text: strings().common.ok }]);
      } else {
        Alert.alert(strings().auth.loginErrorTitle, getErrorMessage(e), [{ text: strings().common.ok }]);
      }
    }
  };

  const signInWithBiometrics = async () => {
    if (busy.current) return;
    const c = await getCredentialsWithBiometrics();
    if (c) await signIn(c.email, c.password, true);
  };

  // Ao abrir: se há credenciais guardadas, pede logo Face ID / digital.
  useEffect(() => {
    (async () => {
      const type = await getBiometryType();
      const saved = await hasSavedCredentials();
      setBiometry(type);
      setHasCredentials(saved);
      if (type && saved && !didPromptBiometry.current) {
        didPromptBiometry.current = true;
        await signInWithBiometrics();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    /** biometria disponível e com credenciais guardadas */
    biometry: biometry && hasCredentials ? biometry : null,
    signIn: () => signIn(email, password),
    signInWithBiometrics,
  };
}
