import { strings } from '../../i18n';

/**
 * Validação do formulário "Criar conta" (antes de enviar ao backend).
 */

export interface RegistrationForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/** Tamanho mínimo da senha. */
export const MIN_PASSWORD_LENGTH = 6;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** `true` se o texto tem formato de email. */
export const isValidEmail = (email: string) => EMAIL_RE.test(email.trim());

/** Devolve a primeira mensagem de erro, ou `null` se o formulário estiver válido. */
export function validateRegistration(f: RegistrationForm): string | null {
  const t = strings().auth;
  if (!f.name.trim() || !f.email.trim() || !f.password || !f.confirmPassword) return t.fillAllFields;
  if (!isValidEmail(f.email)) return t.invalidEmail;
  if (f.password.length < MIN_PASSWORD_LENGTH) return t.passwordTooShort(MIN_PASSWORD_LENGTH);
  if (f.password !== f.confirmPassword) return t.passwordsDontMatch;
  return null;
}

/**
 * Dados a enviar (nome e e-mail sem espaços nas pontas). O e-mail mantém as
 * maiúsculas/minúsculas porque o login compara-o exatamente.
 */
export function registrationPayload(f: RegistrationForm) {
  return { name: f.name.trim(), email: f.email.trim(), password: f.password };
}
