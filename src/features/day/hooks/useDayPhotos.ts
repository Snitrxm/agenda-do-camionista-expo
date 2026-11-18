/**
 * Fotos de um dia: carrega a lista sempre que o ecrã ganha foco (ex.: ao
 * voltar do detalhe de uma foto apagada) e permite escolher e enviar novas.
 */

import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchDayPhotos, uploadDayPhotos } from '../../../api/days';
import { FileStruct } from '../../../types/models';

export function useDayPhotos(dayId: string) {
  const [photos, setPhotos] = useState<FileStruct[]>([]);
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    []
  );

  const reload = useCallback(() => {
    fetchDayPhotos(dayId)
      .then((r) => mounted.current && setPhotos(r))
      .catch((e) => console.log(e));
  }, [dayId]);

  useFocusEffect(reload);

  /** Abre a galeria (várias fotos, JPEG 0,8), envia e recarrega. */
  const pickAndUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (result.canceled || result.assets.length === 0) return;
    try {
      await uploadDayPhotos(
        dayId,
        result.assets.map((a) => a.uri)
      );
      reload();
    } catch (e) {
      console.log('Erro ao enviar fotos:', e);
    }
  };

  return { photos, pickAndUpload };
}
