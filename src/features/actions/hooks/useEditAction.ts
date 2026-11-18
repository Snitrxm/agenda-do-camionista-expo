/**
 * Estado e gravação do formulário "Editar Ação".
 * Em caso de erro na API o formulário fica aberto (o erro só vai para o log).
 */

import { router } from 'expo-router';
import { useState } from 'react';
import { updateAction } from '../../../api/actions';
import { parseISO, toISOWithMillis } from '../../../lib/dateFormat';
import { useDaysStore } from '../../../stores/daysStore';
import { DayActionStruct } from '../../../types/models';
import { applyExtraFields, ExtraFields, extraFieldsBody, extraFieldsFromAction } from '../actionForm';

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
    } catch (e) {
      setSaving(false);
      console.log(e);
    }
  };

  return { local, setLocal, date, setDate, notes, setNotes, extra, updateExtra, isSaving, submit };
}
