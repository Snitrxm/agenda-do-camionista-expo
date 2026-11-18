/**
 * Ações de um dia (Partida, pausas, repousos, cargas, abastecimentos…).
 *
 * @module api/actions
 */

import { getAuthToken } from '../stores/authStore';
import { CreateActionResponse, DayActionStruct } from '../types/models';
import { request, requestVoid } from './client';

/** `POST /days/:dayId/actions` */
export const createAction = (dayId: string, body: Record<string, unknown>) =>
  request<CreateActionResponse>(`/days/${dayId}/actions`, 'POST', body, getAuthToken());

/** `PATCH /days/actions/:id` */
export const updateAction = (actionId: string, body: Record<string, unknown>) =>
  request<DayActionStruct>(`/days/actions/${actionId}`, 'PATCH', body, getAuthToken());

/** `DELETE /days/actions/:id` */
export const deleteAction = (actionId: string) =>
  requestVoid(`/days/actions/${actionId}`, 'DELETE', undefined, getAuthToken());
