/**
 * Dias de trabalho, fotos do dia e horas de condução.
 *
 * Todas as funções usam o token da sessão atual.
 *
 * @module api/days
 */

import { getAuthToken } from '../stores/authStore';
import { DayStruct, DrivingHoursResponse, FileStruct } from '../types/models';
import { request, requestVoid, uploadFiles } from './client';

/** `GET /days` — todos os dias do utilizador. */
export const fetchDays = () => request<DayStruct[]>('/days', 'GET', undefined, getAuthToken());

/** `POST /days` — cria um dia (`{ date }`). */
export const createDay = (body: Record<string, unknown>) => request<DayStruct>('/days', 'POST', body, getAuthToken());

/** `PATCH /days/:id` — atualiza matrículas, km, condução, notas, início da semana. */
export const updateDay = (dayId: string, body: Record<string, unknown>) =>
  request<DayStruct>(`/days/${dayId}`, 'PATCH', body, getAuthToken());

/** `DELETE /days/:id` */
export const deleteDay = (dayId: string) => requestVoid(`/days/${dayId}`, 'DELETE', undefined, getAuthToken());

/** `GET /days/week/hours` — horas de condução semanais e bissemanais. */
export const fetchDrivingHours = () =>
  request<DrivingHoursResponse>('/days/week/hours', 'GET', undefined, getAuthToken());

/** `GET /days/:id/files` — fotos do dia. */
export const fetchDayPhotos = (dayId: string) =>
  request<FileStruct[]>(`/days/${dayId}/files`, 'GET', undefined, getAuthToken());

/** `POST /days/:id/files` — envia fotos (URIs locais de imagens JPEG). */
export const uploadDayPhotos = (dayId: string, photoUris: string[]) =>
  uploadFiles(`/days/${dayId}/files`, photoUris, getAuthToken());

/** `DELETE /days/:id/files/:name` */
export const deleteDayPhoto = (dayId: string, photoName: string) =>
  requestVoid(`/days/${dayId}/files/${photoName}`, 'DELETE', undefined, getAuthToken());
