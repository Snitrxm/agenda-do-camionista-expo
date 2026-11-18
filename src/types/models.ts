/**
 * Modelos de dados da API (formato JSON do backend).
 *
 * Os nomes dos campos são os da API e não podem mudar. Os campos extra das
 * ações (cliente, empresaLocal, quantidade…) são opcionais: dias antigos e
 * versões antigas do backend podem não os ter.
 *
 * @module types/models
 */

/** Uma ação registada num dia (Partida, pausa, repouso, carga…). */
export interface DayActionStruct {
  id: string;
  dayId: string;
  action: string;
  date: string;
  local: string;
  latitude?: string | null;
  longitude?: string | null;
  additionalInformations?: string | null;
  createdAt: string;
  updatedAt: string;

  // Campos específicos (todos opcionais para não quebrar dados existentes).
  cliente?: string | null;
  empresaLocal?: string | null;
  quantidade?: number | null;
  unidade?: string | null; // "L" ou "kg"
  posto?: string | null;
  gasoleoL?: number | null;
  adblueL?: number | null;
  km?: number | null;
}

/** Um dia de trabalho. */
export interface DayStruct {
  id: string;
  userId: string;
  date: string;
  weekStart: boolean;
  departureKm?: number | null;
  arriveKm?: number | null;
  drivingMinutes?: number | null;
  truckPlate?: string | null;
  trailerPlate?: string | null;
  createdAt: string;
  updatedAt: string;
  observations?: string | null;
  actions?: DayActionStruct[] | null;
}

/** Foto anexada a um dia. */
export interface FileStruct {
  name: string;
  publicUrl: string;
}

/** Definições do utilizador guardadas no backend. */
export interface SettingsStruct {
  id: string;
  userId: string;
  defaultTruckPlate?: string | null;
  defaultTrailerPlate?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Utilizador autenticado. */
export interface UserStruct {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface WeeklyDrivingHoursStruct {
  weekStart: string;
  weekEnd: string;
  drivingMinutes: number;
}

export interface BiweeklyDrivingHoursStruct {
  biweekStart: string;
  biweekEnd: string;
  drivingMinutes: number;
}

export interface CurrentWeekStruct {
  weekStart: string;
  weekEnd: string;
  drivingMinutes: number;
  biweekStart: string;
  biweekEnd: string;
  biweekDrivingMinutes: number;
}

/** Resposta de `GET /days/week/hours`. */
export interface DrivingHoursResponse {
  weekly: WeeklyDrivingHoursStruct[];
  biweekly: BiweeklyDrivingHoursStruct[];
  currentWeek: CurrentWeekStruct;
}

/** Resposta de `POST /users/login`. */
export interface LoginResponse {
  token: string;
  user: UserStruct;
}

/** Resposta de `POST /days/:id/actions`. */
export interface CreateActionResponse {
  id: string;
  action: string;
  date: string;
  local: string;
  createdAt: string;
  updatedAt: string;
  additionalInformations: string;
  latitude: string;
  longitude: string;
  cliente?: string | null;
  empresaLocal?: string | null;
  quantidade?: number | null;
  unidade?: string | null;
  posto?: string | null;
  gasoleoL?: number | null;
  adblueL?: number | null;
  km?: number | null;
}
