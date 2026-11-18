/**
 * Entrar com Face ID / impressão digital.
 *
 * Depois de um login manual com sucesso a app pergunta se quer usar a
 * biometria. Se sim, guarda o e-mail e a senha no cofre seguro do sistema
 * (Keychain no iOS, Keystore no Android), só neste aparelho. Nas aberturas
 * seguintes pede Face ID / digital antes de os usar para entrar.
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { strings } from '../../i18n';

const STORAGE_KEY = 'credenciaisBiometria';

export interface Credentials {
  email: string;
  password: string;
}

export type BiometryType = 'faceid' | 'fingerprint' | null;

/** Biometria configurada no aparelho (`null` se não houver nenhuma). */
export async function getBiometryType(): Promise<BiometryType> {
  try {
    if (!(await LocalAuthentication.hasHardwareAsync())) return null;
    if (!(await LocalAuthentication.isEnrolledAsync())) return null;
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'faceid';
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'fingerprint';
    return null;
  } catch {
    return null;
  }
}

/** Nome da biometria para mostrar ("Face ID" / "impressão digital"). */
export function biometryLabel(type: BiometryType): string {
  const t = strings().auth;
  return type === 'faceid' ? t.faceId : t.fingerprint;
}

export async function hasSavedCredentials(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(STORAGE_KEY)) != null;
  } catch {
    return false;
  }
}

export async function saveCredentials(c: Credentials): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(c), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function deleteSavedCredentials(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  } catch {}
}

/** Pede Face ID / digital e, se correr bem, devolve as credenciais guardadas. */
export async function getCredentialsWithBiometrics(): Promise<Credentials | null> {
  const type = await getBiometryType();
  if (!type) return null;
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: strings().auth.biometryPrompt,
    cancelLabel: strings().common.cancel,
    fallbackLabel: strings().auth.biometryFallback,
  });
  if (!result.success) return null;
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Credentials) : null;
  } catch {
    return null;
  }
}
