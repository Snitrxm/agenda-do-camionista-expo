/** Rota "/": login enquanto não houver sessão; depois o Início. */

import React from 'react';
import { LoginScreen } from '../features/auth/LoginScreen';
import { HomeScreen } from '../features/home/HomeScreen';
import { useAuthStore } from '../stores/authStore';

export default function IndexRoute() {
  const hasSignedIn = useAuthStore((s) => s.hasSignedIn);
  return hasSignedIn ? <HomeScreen /> : <LoginScreen />;
}
