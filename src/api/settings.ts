/**
 * Definições do utilizador guardadas no backend (matrículas por omissão).
 *
 * @module api/settings
 */

import { getAuthToken } from '../stores/authStore';
import { SettingsStruct } from '../types/models';
import { request, requestVoid } from './client';

/** `GET /settings/:userId` */
export const fetchSettings = (userId: string) =>
  request<SettingsStruct>(`/settings/${userId}`, 'GET', undefined, getAuthToken());

/** `PATCH /settings/:id` */
export const updateSettings = (settingsId: string, body: Record<string, unknown>) =>
  requestVoid(`/settings/${settingsId}`, 'PATCH', body, getAuthToken());
