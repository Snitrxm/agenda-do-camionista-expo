/**
 * Folha de serviço: escolha do período (Dia/Semana/Mês), pré-visualização
 * da página 1, contadores e exportação (PDF e CSV/Excel).
 */

import { router, useNavigation } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useStrings } from '../../hooks/useStrings';
import { ToolbarButton } from '../../ui/menus';
import { Segmented } from '../../ui/Segmented';
import { colors } from '../../ui/theme';
import { ExportButtons, PeriodCard, PreviewCard, SyncCard, WorkSheetWarnings } from './components/WorkSheetCards';
import { useWorkSheet } from './hooks/useWorkSheet';
import { PERIODS, periodLabel } from './worksheetModel';

export function WorkSheetScreen() {
  const navigation = useNavigation();
  const sheet = useWorkSheet();
  const s = useStrings();

  useLayoutEffect(() => {
    navigation.setOptions({ headerLeft: () => <ToolbarButton title={s.common.close} onPress={() => router.back()} /> });
  }, [navigation, s]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Segmented
        values={PERIODS.map(periodLabel)}
        selectedIndex={PERIODS.indexOf(sheet.period)}
        onChange={(i) => sheet.setPeriod(PERIODS[i])}
      />
      <PeriodCard
        period={sheet.period}
        title={sheet.title}
        trucks={sheet.trucks}
        trailer={sheet.trailer}
        selectedTruckPlate={sheet.selectedTruckPlate}
        onSelectTruck={sheet.setSelectedTruckPlate}
        onPrevious={sheet.previous}
        onNext={sheet.next}
      />
      <WorkSheetWarnings warnings={sheet.warnings} />
      <PreviewCard rows={sheet.rows} counts={sheet.counts} />
      <ExportButtons onPdf={sheet.sharePdf} onCsv={sheet.shareCsv} />
      <SyncCard lastSyncLabel={sheet.lastSyncLabel} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  content: { padding: 16, gap: 16 },
});
