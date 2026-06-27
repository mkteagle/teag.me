import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, MONO } from '../lib/theme';
import type { Scan } from '../lib/parseScan';

type Props = {
  scan: Scan;
  copied: boolean;
  onOpen: () => void;
  onCopy: () => void;
  onScanAnother: () => void;
};

function Eyebrow({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.eyebrowRow}>
      <View style={[styles.eyebrowDot, { backgroundColor: color }]} />
      <Text style={[styles.eyebrow, { color }]} allowFontScaling={false}>
        {label}
      </Text>
    </View>
  );
}

export function ResultSheet({ scan, copied, onOpen, onCopy, onScanAnother }: Props) {
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(rise, {
      toValue: 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 170,
      mass: 0.9,
    }).start();
  }, [rise]);

  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [420, 0] });

  return (
    <View style={styles.dim}>
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.grabber} />

        {scan.kind === 'url' && (
          <>
            <Eyebrow color={colors.accent} label="QR DETECTED · WEB LINK" />
            <Text style={styles.domain} numberOfLines={1} allowFontScaling={false}>
              {scan.host ?? scan.raw}
            </Text>
            <Text style={styles.url} numberOfLines={4} allowFontScaling={false}>
              {scan.raw}
            </Text>
            <View style={styles.actions}>
              <Pressable style={styles.primaryBtn} onPress={onOpen}>
                <Text style={styles.primaryBtnText}>Open link</Text>
              </Pressable>
              <Pressable style={styles.secondaryBtn} onPress={onCopy}>
                <Text style={styles.secondaryBtnText}>{copied ? 'Copied' : 'Copy'}</Text>
              </Pressable>
              <Pressable style={styles.quietBtn} onPress={onScanAnother}>
                <Text style={styles.quietBtnText}>Scan another</Text>
              </Pressable>
            </View>
          </>
        )}

        {scan.kind === 'wifi' && scan.wifi && (
          <>
            <Eyebrow color={colors.orange} label="QR DETECTED · WI-FI NETWORK" />
            <View style={styles.wifiRow}>
              <View style={styles.wifiTile}>
                <Text style={styles.wifiGlyph}>📶</Text>
              </View>
              <View style={styles.flexShrink}>
                <Text style={styles.ssid} numberOfLines={1} allowFontScaling={false}>
                  {scan.wifi.ssid}
                </Text>
                <Text style={styles.wifiMeta} allowFontScaling={false}>
                  {scan.wifi.security} · auto-join
                </Text>
              </View>
            </View>
            {scan.wifi.password != null && (
              <View style={styles.passwordBox}>
                <Text style={styles.passwordLabel} allowFontScaling={false}>
                  PASSWORD
                </Text>
                <Text style={styles.passwordValue} allowFontScaling={false}>
                  {scan.wifi.password}
                </Text>
              </View>
            )}
            <View style={styles.actions}>
              <Pressable style={styles.primaryBtn} onPress={onCopy}>
                <Text style={styles.primaryBtnText}>
                  {copied ? 'Copied' : 'Join network'}
                </Text>
              </Pressable>
              <Pressable style={styles.quietBtn} onPress={onScanAnother}>
                <Text style={styles.quietBtnText}>Scan another</Text>
              </Pressable>
            </View>
          </>
        )}

        {scan.kind === 'text' && (
          <>
            <Eyebrow color={colors.orange} label="QR DETECTED · TEXT" />
            <Text style={styles.text} numberOfLines={6} allowFontScaling={false}>
              {scan.raw}
            </Text>
            <View style={styles.actions}>
              <Pressable style={styles.primaryBtn} onPress={onCopy}>
                <Text style={styles.primaryBtnText}>{copied ? 'Copied' : 'Copy'}</Text>
              </Pressable>
              <Pressable style={styles.quietBtn} onPress={onScanAnother}>
                <Text style={styles.quietBtnText}>Scan another</Text>
              </Pressable>
            </View>
          </>
        )}
      </Animated.View>
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

  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 13 },
  eyebrowDot: { width: 5, height: 5, borderRadius: 3 },
  eyebrow: { fontFamily: MONO, fontSize: 10, fontWeight: '600', letterSpacing: 1.4 },

  // URL
  domain: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  url: {
    fontFamily: MONO,
    color: colors.accent,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 11,
  },

  // Wi-Fi
  wifiRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  wifiTile: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255,138,61,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,138,61,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wifiGlyph: { fontSize: 23 },
  flexShrink: { flexShrink: 1 },
  ssid: { color: colors.white, fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  wifiMeta: { fontFamily: MONO, color: colors.mutedLabel, fontSize: 11, marginTop: 2 },
  passwordBox: {
    backgroundColor: '#1B1B1E',
    borderWidth: 1,
    borderColor: '#2A2A2D',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
  },
  passwordLabel: { fontFamily: MONO, fontSize: 9.5, color: '#7A8190', letterSpacing: 0.8 },
  passwordValue: { fontFamily: MONO, fontSize: 14, color: colors.white, marginTop: 3 },

  // Text
  text: { color: '#D4D4D4', fontSize: 15, lineHeight: 22 },

  // Actions
  actions: { marginTop: 22, gap: 10 },
  primaryBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: colors.pureWhite, fontSize: 15, fontWeight: '600' },
  secondaryBtn: {
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  quietBtn: { paddingVertical: 9, alignItems: 'center' },
  quietBtnText: { color: colors.mutedLabel, fontSize: 14, fontWeight: '500' },
});
