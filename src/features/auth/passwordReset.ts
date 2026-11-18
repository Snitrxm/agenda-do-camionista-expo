/**
 * Validação do fluxo "Esqueceu a senha" (antes de enviar ao backend).
 */

import { strings } from '../../i18n';
import { isValidEmail, MIN_PASSWORD_LENGTH } from './registration';

/** Passo 1: email. Devolve a mensagem de erro, ou `null`. */
export function validateResetEmail(email: string): string | null {
  const t = strings().auth;
  if (!email.trim()) return t.fillAllFields;
  if (!isValidEmail(email)) return t.invalidEmail;
  return null;
}

export interface NewPasswordForm {
  code: string;
  password: string;
  confirmPassword: string;
}

/** Passo 2: código de 6 dígitos e nova senha. Devolve a mensagem de erro, ou `null`. */
export function validateNewPassword(f: NewPasswordForm): string | null {
  const t = strings();
  if (!f.code || !f.password || !f.confirmPassword) return t.auth.fillAllFields;
  if (!/^\d{6}$/.test(f.code.trim())) return t.passwordReset.codeFormat;
  if (f.password.length < MIN_PASSWORD_LENGTH) return t.auth.passwordTooShort(MIN_PASSWORD_LENGTH);
  if (f.password !== f.confirmPassword) return t.auth.passwordsDontMatch;
  return null;
}
