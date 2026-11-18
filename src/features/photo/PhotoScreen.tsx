/**
 * Foto em ecrã inteiro (fundo preto) com botão para apagar.
 */

import { router, useNavigation } from 'expo-router';
import React, { useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { deleteDayPhoto } from '../../api/days';
import { useStrings } from '../../hooks/useStrings';
import { Icon } from '../../ui/Icon';
import { colors } from '../../ui/theme';

export function PhotoScreen({ dayId, name, url }: { dayId: string; name: string; url: string }) {
  const navigation = useNavigation();
  const s = useStrings();
  const [phase, setPhase] = useState<'loading' | 'ok' | 'error'>('loading');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          hitSlop={10}
          onPress={() =>
            Alert.alert(s.common.confirmDeleteTitle, s.photo.deleteMessage, [
              { text: s.common.cancel, style: 'cancel' },
              {
                text: s.common.delete,
                style: 'destructive',
                onPress: () =>
                  deleteDayPhoto(dayId, name)
                    .then(() => router.back())
                    .catch((e) => console.log('Erro ao deletar fotos:', e)),
              },
            ])
          }
        >
          <Icon name="trash" size={17} color={colors.red} />
        </Pressable>
      ),
    });
  }, [navigation, dayId, name, s]);

  return (
    <View style={styles.screen}>
      {phase !== 'error' && (
        <Image
          source={{ uri: url }}
          style={styles.image}
          resizeMode="contain"
          onLoad={() => setPhase('ok')}
          onError={() => setPhase('error')}
        />
      )}
      {phase === 'loading' && (
        <View style={styles.spinner}>
          <ActivityIndicator color="#fff" />
        </View>
      )}
      {phase === 'error' && <Icon name="exclamationmark.triangle.fill" size={17} color={colors.red} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  spinner: { position: 'absolute' },
});
