import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, MONO } from '../lib/theme';

// Decorative "COMING SOON" safety-check teaser. Not wired to live scanning —
// rendered only behind a dev toggle. Shows a static SAFE verdict for marriott.com.
export function SafetyTeaser({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.dim}>
      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>COMING SOON · SAFETY CHECK</Text>
      </View>
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <View style={styles.verdictChip}>
          <View style={styles.verdictDot} />
          <Text style={styles.verdictChipText}>SAFE · VERIFIED DESTINATION</Text>
        </View>
        <Text style={styles.domain}>marriott.com</Text>
        <Text style={styles.redirects}>
          2 redirects resolved →{'\n'}
          <Text style={{ color: colors.verdantGreen }}>final: marriott.com</Text>
        </Text>
        <View style={styles.bars}>
          <View style={[styles.bar, { backgroundColor: colors.verdantGreen }]} />
          <View style={[styles.bar, { backgroundColor: '#2A2A2D' }]} />
          <View style={[styles.bar, { backgroundColor: '#2A2A2D' }]} />
        </View>
        <View style={styles.barLabels}>
          <Text style={[styles.barLabel, { color: colors.verdantGreen }]}>SAFE</Text>
          <Text style={styles.barLabel}>CAUTION</Text>
          <Text style={styles.barLabel}>BLOCKED</Text>
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Open link</Text>
          </Pressable>
          <Pressable style={styles.quietBtn} onPress={onClose}>
            <Text style={styles.quietBtnText}>Scan another</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10,10,10,0.62)',
    justifyContent: 'flex-end',
  },
  comingSoon: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,138,61,0.35)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  comingSoonText: {
    fontFamily: MONO,
    fontSize: 8.5,
    color: colors.orange,
    letterSpacing: 1.8,
  },
  sheet: {
    backgroundColor: colors.sheet,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: colors.sheetBorder,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 36,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.grabber,
    alignSelf: 'center',
    marginBottom: 20,
  },
  verdictChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(22,163,74,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.4)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 15,
  },
  verdictDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.verdantGreen },
  verdictChipText: {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: '600',
    color: colors.verdantGreen,
    letterSpacing: 0.6,
  },
  domain: { color: colors.white, fontSize: 32, fontWeight: '700', letterSpacing: -0.8 },
  redirects: { fontFamily: MONO, fontSize: 11, color: colors.mutedLabel, marginTop: 11, lineHeight: 17 },
  bars: { flexDirection: 'row', gap: 7, marginTop: 14 },
  bar: { flex: 1, height: 5, borderRadius: 3 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  barLabel: { fontFamily: MONO, fontSize: 8.5, color: '#6B7280' },
  actions: { marginTop: 20, gap: 10 },
  primaryBtn: { backgroundColor: colors.accent, paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  primaryBtnText: { color: colors.pureWhite, fontSize: 15, fontWeight: '600' },
  quietBtn: { paddingVertical: 9, alignItems: 'center' },
  quietBtnText: { color: colors.mutedLabel, fontSize: 14, fontWeight: '500' },
});
