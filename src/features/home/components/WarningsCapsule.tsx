/**
 * Cápsula de avisos do Início. Fechada mostra o ícone do aviso mais grave e
 * o número de avisos; tocando abre a lista completa.
 */

import React, { useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';
import { Warning, WarningSeverity } from '../../../domain/week';
import { useStrings } from '../../../hooks/useStrings';
import { Icon } from '../../../ui/Icon';
import { colors, fontSize, text } from '../../../ui/theme';

const SEVERITY_RED = '#D93636';
const SEVERITY_ORANGE = '#E8833A';
const SEPARATOR = '#F3E2CC';

function SeverityIcon({ severity }: { severity: WarningSeverity }) {
  if (severity === 0) return <Icon name="exclamationmark.triangle.fill" size={fontSize.body} color={SEVERITY_RED} />;
  if (severity === 1) return <Icon name="exclamationmark.triangle.fill" size={fontSize.body} color={SEVERITY_ORANGE} />;
  return <Icon name="info.circle.fill" size={fontSize.body} color={colors.blue} />;
}

export function WarningsCapsule({ warnings }: { warnings: Warning[] }) {
  const [expanded, setExpanded] = useState(false);
  const s = useStrings();
  if (warnings.length === 0) return null;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
    setExpanded((v) => !v);
  };

  if (!expanded) {
    const topSeverity = Math.min(...warnings.map((w) => w.severity)) as WarningSeverity;
    return (
      <Pressable
        onPress={toggle}
        accessibilityLabel={s.home.warningsA11y(warnings.length)}
        style={styles.collapsed}
      >
        <SeverityIcon severity={topSeverity} />
        <Text style={text(15, '600')}>{s.home.warnings}</Text>
        <View style={styles.spacer} />
        <View style={styles.countBadge}>
          <Text style={text(13, '700', colors.warningText)}>{warnings.length}</Text>
        </View>
        <Icon name="chevron.down" size={fontSize.footnote} color={colors.textSecondary} />
      </Pressable>
    );
  }

  return (
    <View style={styles.expanded}>
      <Pressable onPress={toggle} style={styles.header}>
        <Text style={[text(13, '800', colors.warningText), styles.headerTitle]}>{s.home.warningsCount(warnings.length)}</Text>
        <View style={styles.flex} />
        <Icon name="chevron.up" size={fontSize.footnote} color={colors.textSecondary} />
      </Pressable>
      {warnings.map((warning, index) => (
        <React.Fragment key={warning.id}>
          <View style={styles.item}>
            <View style={styles.itemIcon}>
              <SeverityIcon severity={warning.severity} />
            </View>
            <View style={styles.itemBody}>
              <Text style={text(15, '700')}>{warning.title}</Text>
              <Text style={text(13, '400', colors.textSecondary)}>{warning.explanation}</Text>
            </View>
          </View>
          {index < warnings.length - 1 && <View style={styles.separator} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  collapsed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: colors.warningBg,
    borderRadius: 24,
  },
  spacer: { flex: 1, minWidth: 4 },
  flex: { flex: 1 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#fff', borderRadius: 10 },
  expanded: { gap: 10, padding: 14, backgroundColor: colors.warningBg, borderRadius: 22 },
  header: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { letterSpacing: 1.5 },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  itemIcon: { paddingTop: 2 },
  itemBody: { flex: 1, gap: 2 },
  separator: { height: 1, backgroundColor: SEPARATOR },
});
