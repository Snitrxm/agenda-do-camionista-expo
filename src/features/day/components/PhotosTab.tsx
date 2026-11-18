/**
 * Separador "Fotos": grelha de 2 colunas e botão "Adicionar Foto".
 */

import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useStrings } from '../../../hooks/useStrings';
import { DayStruct, FileStruct } from '../../../types/models';
import { Icon } from '../../../ui/Icon';
import { EmptyState, FloatingActionButton } from '../../../ui/primitives';
import { colors, fontSize } from '../../../ui/theme';
import { useDayPhotos } from '../hooks/useDayPhotos';

export function PhotosTab({ day }: { day: DayStruct }) {
  const s = useStrings();
  const { photos, pickAndUpload } = useDayPhotos(day.id);
  return (
    <View style={styles.flex}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {photos.length === 0 ? (
          <EmptyState icon="photo.stack" title={s.day.photosTab.empty} />
        ) : (
          <View style={styles.grid}>
            {photos.map((photo) => (
              <PhotoTile
                key={photo.name}
                photo={photo}
                onPress={() => router.push({ pathname: '/photo', params: { dayId: day.id, name: photo.name, url: photo.publicUrl } })}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <FloatingActionButton title={s.day.photosTab.addPhoto} onPress={pickAndUpload} />
    </View>
  );
}

/** Miniatura quadrada com estado de carregamento/erro. */
function PhotoTile({ photo, onPress }: { photo: FileStruct; onPress: () => void }) {
  const { width } = useWindowDimensions();
  const size = (width - 32 - 12) / 2;
  const [phase, setPhase] = useState<'loading' | 'ok' | 'error'>('loading');
  return (
    <Pressable onPress={onPress} style={{ width: size, height: size }}>
      <View style={styles.tile}>
        {phase !== 'error' && (
          <Image
            source={{ uri: photo.publicUrl }}
            style={styles.image}
            resizeMode="cover"
            onLoad={() => setPhase('ok')}
            onError={() => setPhase('error')}
          />
        )}
        {phase === 'loading' && (
          <View style={styles.overlay}>
            <ActivityIndicator />
          </View>
        )}
        {phase === 'error' && (
          <View style={styles.center}>
            <Icon name="exclamationmark.triangle.fill" size={fontSize.body} color={colors.red} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { backgroundColor: colors.background },
  content: { paddingBottom: 80 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  tile: { flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.fill },
  image: { width: '100%', height: '100%' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
