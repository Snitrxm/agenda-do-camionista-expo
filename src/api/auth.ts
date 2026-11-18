/**
 * Autenticação, criação de conta e recuperação da senha.
 *
 * @module api/auth
 */

import { LoginResponse, UserStruct } from '../types/models';
import { request, requestOptional } from './client';

/** `POST /users/login` — devolve o token JWT e o utilizador. */
export function login(credentials: { email: string; password: string }): Promise<LoginResponse> {
  return request<LoginResponse>('/users/login', 'POST', credentials);
}

/**
 * `POST /users` — cria uma conta (e as definições do utilizador).
 *
 * @returns o utilizador criado, ou `null` se o backend não o criou. O
 *          backend responde com corpo vazio (e sem erro) quando o e-mail já
 *          tem conta ou quando falha ao gravar.
 */
export function register(account: { name: string; email: string; password: string; language?: string }): Promise<UserStruct | null> {
  return requestOptional<UserStruct>('/users', 'POST', account);
}

/**
 * `POST /users/forgot-password` — envia um código de 6 dígitos para o email.
 * Responde sempre com sucesso (mesmo sem conta), para não revelar que emails existem.
 */
export function forgotPassword(body: { email: string; language?: string }): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/users/forgot-password', 'POST', body);
}

/** Erro devolvido pelo backend quando o código está errado, expirado ou já usado. */
export const INVALID_RESET_CODE = 'INVALID_OR_EXPIRED_CODE';

/** `POST /users/reset-password` — define a nova senha com o código recebido. */
export function resetPassword(body: { email: string; code: string; password: string; language?: string }): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/users/reset-password', 'POST', body);
}
