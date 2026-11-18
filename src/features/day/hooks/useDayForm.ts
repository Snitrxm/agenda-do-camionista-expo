/**
 * Formulário do separador "Geral" de um dia.
 *
 * Cada alteração é aplicada logo: atualiza o dia no store (e a cache local)
 * e envia `PATCH /days/:id` com todos os campos do formulário.
 * KM vazios ou inválidos são enviados como 0.
 */

import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { getErrorMessage } from '../../../api/client';
import { updateDay } from '../../../api/days';
import { strings } from '../../../i18n';
import { useDaysStore } from '../../../stores/daysStore';
import { DayStruct } from '../../../types/models';

export interface DayFormValues {
  weekStart: boolean;
  truckPlate: string;
  trailerPlate: string;
  /** texto livre do campo (pode estar vazio) */
  departureKm: string;
  arriveKm: string;
  drivingMinutes: number;
  observations: string;
}

/** Inteiro do campo de KM, ou 0 se não for um número inteiro. */
export const kmOrZero = (s: string) => (/^[+-]?\d+$/.test(s) ? parseInt(s, 10) : 0);

function initialValues(day: DayStruct): DayFormValues {
  return {
    weekStart: day.weekStart,
    truckPlate: day.truckPlate ?? '',
    trailerPlate: day.trailerPlate ?? '',
    departureKm: day.departureKm != null ? String(day.departureKm) : '',
    arriveKm: day.arriveKm != null ? String(day.arriveKm) : '',
    drivingMinutes: day.drivingMinutes ?? 0,
    observations: day.observations ?? '',
  };
}

export function useDayForm(day: DayStruct) {
  const [values, setValues] = useState<DayFormValues>(() => initialValues(day));
  const latest = useRef(values);

  const save = (v: DayFormValues) => {
    const current = useDaysStore.getState().days.find((d) => d.id === day.id) ?? day;
    const body = {
      truckPlate: v.truckPlate,
      trailerPlate: v.trailerPlate,
      departureKm: kmOrZero(v.departureKm),
      arriveKm: kmOrZero(v.arriveKm),
      drivingMinutes: v.drivingMinutes,
      observations: v.observations,
      weekStart: v.weekStart,
    };
    useDaysStore.getState().updateDay({ ...current, ...body });
    updateDay(day.id, body).catch((e) => Alert.alert(strings().common.errorTitle, getErrorMessage(e)));
  };

  /** Altera um ou mais campos; só grava se algum valor mudou. */
  const update = (patch: Partial<DayFormValues>) => {
    const prev = latest.current;
    const next = { ...prev, ...patch };
    const changed = (Object.keys(patch) as (keyof DayFormValues)[]).some((k) => prev[k] !== next[k]);
    if (!changed) return;
    latest.current = next;
    setValues(next);
    save(next);
  };

  return { values, update };
}
