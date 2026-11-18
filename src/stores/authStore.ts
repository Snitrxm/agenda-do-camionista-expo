/**
 * Sessão do utilizador: token JWT e dados do utilizador autenticado.
 *
 * Fica só em memória (como na versão Swift): ao fechar a app é preciso
 * voltar a entrar (com senha ou Face ID / impressão digital).
 *
 * `hasSignedIn` passa a `true` no primeiro login/registo e decide quando a
 * app mostra o Início. "Sair da Conta" apaga a sessão mas não volta ao ecrã
 * de login (comportamento da versão original).
 *
 * @module stores/authStore
 */

import { create } from 'zustand';
import { UserStruct } from '../types/models';

interface AuthState {
  token: string | null;
  user: UserStruct | null;
  hasSignedIn: boolean;
  /** Guarda o token e o utilizador depois do login. */
  setSession: (token: string, user: UserStruct) => void;
  /** Termina a sessão (apaga token e utilizador). */
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hasSignedIn: false,
  setSession: (token, user) => set({ token, user, hasSignedIn: true }),
  clearSession: () => set({ token: null, user: null }),
}));

/** Token atual (para uso fora de componentes, ex.: cliente HTTP). */
export const getAuthToken = () => useAuthStore.getState().token;

/** Utilizador atual (para uso fora de componentes). */
export const getCurrentUser = () => useAuthStore.getState().user;
