/**
 * Estado e gravação do formulário "Editar Ação".
 * Em caso de erro na API o formulário fica aberto (o erro só vai para o log).
 * Ao corrigir a hora de uma Partida ou de um repouso diário, volta a verificar
 * se o repouso passou a contar como semanal (alerta "Esteve Xh em repouso").
 */

import { router } from 'expo-router';
import { useState } from 'react';
import { updateAction } from '../../../api/actions';
import { parseISO, toISOWithMillis } from '../../../lib/dateFormat';
import { useDaysStore } from '../../../stores/daysStore';
import { DayActionStruct } from '../../../types/models';
import { getRestPeriod } from '../../../domain/restTracking';
import { applyExtraFields, ExtraFields, extraFieldsBody, extraFieldsFromAction } from '../actionForm';
import { alertIfRestWasWeekly } from '../restWasWeeklyAlert';

/** Depois de corrigir uma Partida ou um repouso: a Partida que fecha o repouso passou a 24h+? */
function checkRestWasWeekly(updated: DayActionStruct) {
  const days = useDaysStore.getState().days;
  if (updated.action === 'Partida') return alertIfRestWasWeekly(updated);
  const end = getRestPeriod(updated, days)?.end;
  if (end == null) return;
  const departure = days.flatMap((d) => d.actions ?? []).find((a) => a.action === 'Partida' && Date.parse(a.date) === end);
  if (departure) alertIfRestWasWeekly(departure);
}

export function useEditAction(dayId: string, action: DayActionStruct | undefined) {
  const [local, setLocal] = useState(action?.local ?? '');
  const [date, setDate] = useState<Date>(() => parseISO(action?.date) ?? new Date());
  const [notes, setNotes] = useState(action?.additionalInformations ?? '');
  const [extra, setExtra] = useState<ExtraFields>(() =>
    action ? extraFieldsFromAction(action) : extraFieldsFromAction({ action: '', local: '' } as DayActionStruct)
  );
  const [isSaving, setSaving] = useState(false);
  const updateExtra = (patch: Partial<ExtraFields>) => setExtra((prev) => ({ ...prev, ...patch }));

  const submit = async () => {
    if (!action) return;
    setSaving(true);
    const body: Record<string, unknown> = {
      local,
      date: toISOWithMillis(date),
      additionalInformations: notes,
      ...extraFieldsBody(action.action, extra),
    };
    try {
      await updateAction(action.id, body);
      const updated = applyExtraFields({ ...action, local, date: toISOWithMillis(date), additionalInformations: notes }, extra);
      useDaysStore.getState().replaceAction(dayId, updated);
      setSaving(false);
      router.back();
      checkRestWasWeekly(updated);
    } catch (e) {
      setSaving(false);
      console.log(e);
    }
  };

  return { local, setLocal, date, setDate, notes, setNotes, extra, updateExtra, isSaving, submit };
}
