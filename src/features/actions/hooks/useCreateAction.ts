/**
 * Estado e envio do formulário "Criar Ação".
 *
 * - Local: começa em " - " e é reposto com "Cidade - País" sempre que a
 *   localização é recalculada (o utilizador pode editar).
 * - Unidade da Descarga: lembra a última usada.
 * - Regras: Repouso 11H indisponível passadas 13h da Partida; Repouso 9H
 *   indisponível com 3 reduzidas usadas e sem Repouso 3H+ (ver domain/amplitude).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { createAction } from '../../../api/actions';
import { getErrorMessage } from '../../../api/client';
import { ACTION_TYPES } from '../../../domain/actionTypes';
import { getDayLimit, nineHourRestUnavailableReason } from '../../../domain/amplitude';
import { findDeparture } from '../../../domain/days';
import { strings } from '../../../i18n';
import { nowISO8601, parseISO } from '../../../lib/dateFormat';
import { useDaysStore } from '../../../stores/daysStore';
import { currentTimeZoneId } from '../../../stores/settingsStore';
import {
  actionFromResponse,
  coordinateString,
  EMPTY_EXTRA_FIELDS,
  ExtraFields,
  extraFieldsBody,
  fieldSuggestions,
  findOpenLoad,
} from '../actionForm';
import { useLocationWatcher } from './useLocationWatcher';

const LAST_UNIT_KEY = 'lastUnidadeDescarga';

export function useCreateAction(dayId: string) {
  const day = useDaysStore((s) => s.days.find((d) => d.id === dayId));
  const allDays = useDaysStore((s) => s.days);
  const dayActions = useMemo(() => day?.actions ?? [], [day]);
  const [local, setLocal] = useState(' - ');
  const location = useLocationWatcher((city, country) => setLocal(`${city ?? ''} - ${country ?? ''}`));

  const [actionType, setActionType] = useState<string>(ACTION_TYPES[0]);
  const [notes, setNotes] = useState('');
  const [extra, setExtra] = useState<ExtraFields>(EMPTY_EXTRA_FIELDS);
  const [isSaving, setSaving] = useState(false);
  const updateExtra = (patch: Partial<ExtraFields>) => setExtra((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    AsyncStorage.getItem(LAST_UNIT_KEY)
      .then((saved) => saved && updateExtra({ unit: saved }))
      .catch(() => {});
  }, []);

  // Passadas 13h da Partida (amplitude) já não é possível fazer um 11H.
  // Calculado no momento (ao abrir o menu / ao criar), não durante o render.
  const isElevenHourRestDisabled = () => {
    const departure = day ? findDeparture(day) : undefined;
    const departureDate = departure ? parseISO(departure.date) : null;
    if (!departureDate) return false;
    return Date.now() >= departureDate.getTime() + 13 * 3600000;
  };

  const isNineHourRestDisabled = day ? !getDayLimit(day, allDays, currentTimeZoneId()).canTakeNineHourRest : false;

  const submit = async () => {
    const s = strings();
    if (actionType === 'Pausa 11H' && isElevenHourRestDisabled()) {
      Alert.alert(s.common.errorTitle, s.actions.elevenHourUnavailable);
      return;
    }
    if (actionType === 'Pausa 9H' && isNineHourRestDisabled) {
      Alert.alert(s.actions.nineHourAlertTitle, nineHourRestUnavailableReason());
      return;
    }
    setSaving(true);
    const coords = location.location?.coords;
    const body: Record<string, unknown> = {
      action: actionType,
      date: nowISO8601(),
      additionalInformations: notes,
      local,
      latitude: coordinateString(coords?.latitude ?? 0),
      longitude: coordinateString(coords?.longitude ?? 0),
      ...extraFieldsBody(actionType, extra, actionType === 'Descarga' ? findOpenLoad(dayActions)?.cliente : undefined),
    };
    if (actionType === 'Descarga') AsyncStorage.setItem(LAST_UNIT_KEY, extra.unit).catch(() => {});

    try {
      const response = await createAction(dayId, body);
      useDaysStore.getState().addAction(dayId, actionFromResponse(response, dayId, body));
      setSaving(false);
      router.back();
    } catch (e) {
      setSaving(false);
      Alert.alert(s.common.errorTitle, getErrorMessage(e));
    }
  };

  return {
    actionType,
    setActionType,
    local,
    setLocal,
    notes,
    setNotes,
    extra,
    updateExtra,
    isSaving,
    isLocationDetected: location.city != null,
    isElevenHourRestDisabled,
    isNineHourRestDisabled,
    suggestions: fieldSuggestions(dayActions),
    submit,
  };
}
