/**
 * Cartões do ecrã Folha de serviço: período, pré-visualização da página 1,
 * botões de exportação e sincronização.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStrings } from '../../../hooks/useStrings';
import { formatInteger } from '../../../lib/numbers';
import { Icon } from '../../../ui/Icon';
import { openMenu } from '../../../ui/menus';
import { Divider } from '../../../ui/primitives';
import { colors, fontSize, shadow, text } from '../../../ui/theme';
import { periodSubtitle, WorkSheetCounts, WorkSheetPeriod, WorkSheetRow } from '../worksheetModel';

const ALL_PLATES = '__all__';

/** Navegação de período e matrículas do período. */
export function PeriodCard({
  period,
  title,
  trucks,
  trailer,
  selectedTruckPlate,
  onSelectTruck,
  onPrevious,
  onNext,
}: {
  period: WorkSheetPeriod;
  title: string;
  trucks: string[];
  trailer: string | null;
  selectedTruckPlate: string | null;
  onSelectTruck: (plate: string | null) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const t = useStrings().worksheet;
  const chooseTruck = () =>
    openMenu([...trucks.map((p) => ({ label: p, value: p })), { label: t.allPlates, value: ALL_PLATES }], (v) =>
      onSelectTruck(v === ALL_PLATES ? null : v)
    );

  return (
    <View style={[styles.panel, styles.gap12]}>
      <View style={styles.row}>
        <Pressable hitSlop={10} onPress={onPrevious}>
          <Icon name="chevron.left" size={fontSize.title3} color={colors.textSecondary} />
        </Pressable>
        <View style={styles.periodTitle}>
          <Text style={text(fontSize.headline, '600')}>{title}</Text>
          <Text style={text(fontSize.caption, '400', colors.textSecondary)}>{periodSubtitle(period)}</Text>
        </View>
        <Pressable hitSlop={10} onPress={onNext}>
          <Icon name="chevron.right" size={fontSize.title3} color={colors.textSecondary} />
        </Pressable>
      </View>
      <Divider />
      <Text style={styles.template}>{t.templateName}</Text>
      <View style={styles.plates}>
        {trucks.length > 1 ? (
          // Várias matrículas no período: escolher uma (ou todas).
          <Pressable style={styles.flex} onPress={chooseTruck}>
            <View style={styles.rowOnly}>
              <PlateBadge label={t.plate} value={selectedTruckPlate ?? t.allPlates} />
            </View>
          </Pressable>
        ) : (
          <PlateBadge label={t.plate} value={trucks[0] ?? '—'} />
        )}
        <PlateBadge label={t.trailer} value={trailer ?? '—'} />
      </View>
    </View>
  );
}

function PlateBadge({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.plateBadge}>
      <Text style={text(fontSize.headline, '700')}>{value}</Text>
      <Text style={text(fontSize.caption2, '400', colors.textSecondary)}>{label}</Text>
    </View>
  );
}

/** Pré-visualização da tabela da página 1 e contadores. */
export function PreviewCard({ rows, counts }: { rows: WorkSheetRow[]; counts: WorkSheetCounts }) {
  const t = useStrings().worksheet;
  return (
    <View style={[styles.panel, styles.gap8]}>
      <Text style={text(fontSize.caption, '600', colors.textSecondary)}>{t.previewTitle}</Text>
      <View style={styles.headerRow}>
        <Text style={[styles.columnHeader, styles.dayColumn]}>{t.columnDay}</Text>
        <Text style={[styles.columnHeader, styles.flex]}>{t.columnService}</Text>
        <Text style={[styles.columnHeader, styles.kmColumnHeader]}>{t.columnKm}</Text>
      </View>
      <Divider />
      {rows.length === 0 ? (
        <Text style={styles.emptyRows}>{t.noServices}</Text>
      ) : (
        rows.map((r) => (
          <React.Fragment key={r.id}>
            <PreviewRow row={r} />
            <Divider />
          </React.Fragment>
        ))
      )}
      <View style={styles.counters}>
        <Counter value={counts.abastecimentos} label={t.fuelings} />
        <Counter value={counts.lavagens} label={t.washes} />
        <Counter value={counts.oficina} label={t.workshop} />
      </View>
    </View>
  );
}

function PreviewRow({ row: r }: { row: WorkSheetRow }) {
  return (
    <View style={styles.previewRow}>
      <Text style={[text(fontSize.body, '700'), styles.dayColumn]}>{r.dayNumber}</Text>
      <View style={styles.previewBody}>
        <View style={styles.clientLine}>
          {r.cliente != null && <Text style={text(fontSize.body, '600')}>{r.cliente}</Text>}
          {r.quantidadeText != null && <Text style={text(fontSize.body, '600')}>· {r.quantidadeText}</Text>}
          {r.cliente == null && r.quantidadeText == null && <Text style={text(fontSize.body, '400', colors.textSecondary)}>—</Text>}
        </View>
        <Text numberOfLines={2} style={text(fontSize.caption, '400', colors.textSecondary)}>
          {r.cargaDescargaText}
        </Text>
      </View>
      <View style={styles.kmColumn}>
        <Text style={text(fontSize.footnote, '600')}>{r.kmInicial != null ? formatInteger(r.kmInicial) : '–'}</Text>
        <Text style={text(fontSize.footnote, '400', colors.textSecondary)}>{r.kmFinal != null ? formatInteger(r.kmFinal) : '–'}</Text>
      </View>
    </View>
  );
}

function Counter({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.counter}>
      <Text style={text(fontSize.title2, '700')}>{value}</Text>
      <Text style={text(fontSize.caption2, '400', colors.textSecondary)}>{label}</Text>
    </View>
  );
}

/** "Exportar PDF" + "Excel" + "Enviar à empresa" (este último também partilha o PDF). */
export function ExportButtons({ onPdf, onCsv }: { onPdf: () => void; onCsv: () => void }) {
  const t = useStrings().worksheet;
  return (
    <>
      <Pressable onPress={onPdf} style={({ pressed }) => [styles.pdfButton, { opacity: pressed ? 0.7 : 1 }]}>
        <Icon name="square.and.arrow.down" size={fontSize.title3} color="#fff" />
        <Text style={text(fontSize.headline, '600', '#fff')}>{t.exportPdf}</Text>
      </Pressable>
      <View style={styles.secondaryButtons}>
        <SecondaryButton label={t.excel} icon="tablecells" onPress={onCsv} />
        <SecondaryButton label={t.sendToCompany} icon="paperplane.fill" onPress={onPdf} />
      </View>
    </>
  );
}

function SecondaryButton({ label, icon, onPress }: { label: string; icon: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.secondaryButton, { opacity: pressed ? 0.6 : 1 }]}>
      <Icon name={icon} size={fontSize.subheadline} color={colors.tealDark} />
      <Text style={text(fontSize.subheadline, '600', colors.tealDark)}>{label}</Text>
    </Pressable>
  );
}

/** Avisos da folha (ex.: "Falta o km final do dia 16"). */
export function WorkSheetWarnings({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <View style={styles.warnings}>
      {warnings.map((w) => (
        <View key={w} style={styles.warningRow}>
          <Icon name="exclamationmark.triangle.fill" size={fontSize.subheadline} color={colors.warningText} />
          <Text style={[text(fontSize.subheadline, '600', colors.warningText), styles.flex]}>{w}</Text>
        </View>
      ))}
    </View>
  );
}

/** Informação de sincronização / funcionamento sem rede. */
export function SyncCard({ lastSyncLabel }: { lastSyncLabel: string }) {
  const t = useStrings().worksheet;
  return (
    <View style={[styles.panel, styles.gap10]}>
      <Text style={text(fontSize.caption, '600', colors.textSecondary)}>{t.syncTitle}</Text>
      <View style={styles.syncRow}>
        <Icon name="icloud.fill" size={fontSize.title3} color={colors.teal} />
        <View style={styles.gap2}>
          <Text style={text(fontSize.subheadline, '600')}>{t.allSaved}</Text>
          <Text style={text(fontSize.caption, '400', colors.textSecondary)}>{t.lastSync(lastSyncLabel)}</Text>
        </View>
      </View>
      <View style={styles.offlineNote}>
        <Icon name="exclamationmark.triangle.fill" size={fontSize.body} color={colors.orange} />
        <Text style={[text(fontSize.caption, '400', colors.textSecondary), styles.flex]}>
          {t.offlineNote}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  warnings: { gap: 8, padding: 12, borderRadius: 12, backgroundColor: colors.warningBg },
  warningRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  panel: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, ...shadow(0.05, 8, 2) },
  flex: { flex: 1 },
  gap2: { gap: 2 },
  gap8: { gap: 8 },
  gap10: { gap: 10 },
  gap12: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowOnly: { flexDirection: 'row' },
  periodTitle: { flex: 1, alignItems: 'center', gap: 2 },
  template: { ...text(fontSize.footnote, '400', colors.textSecondary), textAlign: 'center' },
  plates: { flexDirection: 'row', gap: 10 },
  plateBadge: { flex: 1, gap: 4, padding: 12, backgroundColor: colors.inputBg, borderRadius: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'baseline' },
  columnHeader: text(fontSize.caption2, '600', colors.textSecondary),
  dayColumn: { width: 32 },
  kmColumnHeader: { width: 70, textAlign: 'right' },
  emptyRows: { ...text(fontSize.footnote, '400', colors.textSecondary), paddingVertical: 8 },
  counters: { flexDirection: 'row', gap: 10, paddingTop: 8 },
  counter: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10, backgroundColor: colors.inputBg, borderRadius: 10 },
  previewRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 6 },
  previewBody: { flex: 1, gap: 2 },
  clientLine: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  kmColumn: { width: 70, alignItems: 'flex-end', gap: 2, paddingTop: 3 },
  pdfButton: {
    height: 56,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    borderRadius: 14,
  },
  secondaryButtons: { flexDirection: 'row', gap: 10 },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(67,145,138,0.25)',
  },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  offlineNote: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, backgroundColor: 'rgba(255,204,0,0.1)', borderRadius: 8 },
});
