/**
 * Cliente HTTP da API do backend.
 *
 * - `request<T>`: pedido JSON que devolve um corpo descodificado.
 * - `requestVoid`: pedido sem corpo de resposta.
 * - `requestOptional<T>`: como `request`, mas devolve `null` se a resposta vier vazia.
 * - `uploadFiles`: envio multipart de fotos (campo `files`).
 *
 * Erros (rede, HTTP ≥ 300, JSON inválido) são lançados como `ApiError`,
 * com a mensagem do backend (`{ message }`) quando existir.
 *
 * @module api/client
 */

import { strings } from '../i18n';

/** Endereço do backend. */
export const BASE_URL = 'http://23.88.99.154:30000';
// export const BASE_URL = 'http://localhost:3000';

/** Erro de um pedido à API; `message` já vem pronto a mostrar ao utilizador. */
export class ApiError extends Error {}

/** Mensagem legível de qualquer erro apanhado num `catch`. */
export function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

async function doFetch(endpoint: string, init: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, init);
  } catch (e) {
    throw new ApiError(getErrorMessage(e));
  }
  if (res.status > 299) {
    let text = '';
    try {
      text = await res.text();
    } catch {
      throw new ApiError(strings().common.noDataFromServer);
    }
    try {
      const json = JSON.parse(text);
      if (json && typeof json.message === 'string') throw new ApiError(json.message);
    } catch (err) {
      if (err instanceof ApiError) throw err;
    }
    throw new ApiError(text);
  }
  return res;
}

function buildInit(method: string, body?: Record<string, unknown>, bearerToken?: string | null): RequestInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;
  return { method, headers, body: body ? JSON.stringify(body) : undefined };
}

/**
 * Pedido JSON que espera um corpo de resposta.
 *
 * @param bearerToken token JWT; se existir é enviado em `Authorization`
 */
export async function request<T>(
  endpoint: string,
  method = 'GET',
  body?: Record<string, unknown>,
  bearerToken?: string | null
): Promise<T> {
  const res = await doFetch(endpoint, buildInit(method, body, bearerToken));
  const text = await res.text();
  if (!text) throw new ApiError(strings().common.noDataFromServer);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(strings().common.decodeFailed);
  }
}

/** Como `request`, mas devolve `null` quando o corpo da resposta vem vazio. */
export async function requestOptional<T>(
  endpoint: string,
  method = 'GET',
  body?: Record<string, unknown>,
  bearerToken?: string | null
): Promise<T | null> {
  const res = await doFetch(endpoint, buildInit(method, body, bearerToken));
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(strings().common.decodeFailed);
  }
}

/** Pedido JSON sem corpo de resposta. */
export async function requestVoid(
  endpoint: string,
  method = 'GET',
  body?: Record<string, unknown>,
  bearerToken?: string | null
): Promise<void> {
  await doFetch(endpoint, buildInit(method, body, bearerToken));
}

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    })
    .toUpperCase();
}

/** Envia fotos JPEG em multipart (campo `files`), cada uma com um nome UUID. */
export async function uploadFiles(endpoint: string, photoUris: string[], bearerToken?: string | null): Promise<void> {
  const form = new FormData();
  for (const uri of photoUris) {
    form.append('files', { uri, name: `${uuid()}.jpg`, type: 'image/jpeg' } as unknown as Blob);
  }
  const headers: Record<string, string> = {};
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, { method: 'POST', headers, body: form });
  } catch (e) {
    throw new ApiError(getErrorMessage(e));
  }
  if (res.status > 299) throw new ApiError(`Request failed with status code ${res.status}`);
}
