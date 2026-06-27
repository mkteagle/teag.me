import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from 'expo-camera';
import * as Clipboard from 'expo-clipboard';

const ACCENT = '#22c55e';

type Scan = {
  raw: string;
  isLink: boolean;
  host: string | null;
};

function parseScan(raw: string): Scan {
  const value = raw.trim();
  const isLink = /^https?:\/\//i.test(value);
  let host: string | null = null;
  if (isLink) {
    try {
      host = new URL(value).hostname.replace(/^www\./, '');
    } catch {
      host = null;
    }
  }
  return { raw: value, isLink, host };
}

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scan, setScan] = useState<Scan | null>(null);
  const [copied, setCopied] = useState(false);
  // Guards against the camera firing onBarcodeScanned dozens of times per second.
  const locked = useRef(false);

  const handleScanned = useCallback((result: BarcodeScanningResult) => {
    if (locked.current) return;
    locked.current = true;
    setScan(parseScan(result.data));
  }, []);

  const reset = useCallback(() => {
    setScan(null);
    setCopied(false);
    locked.current = false;
  }, []);

  const open = useCallback(() => {
    if (scan?.isLink) Linking.openURL(scan.raw);
  }, [scan]);

  const copy = useCallback(async () => {
    if (!scan) return;
    await Clipboard.setStringAsync(scan.raw);
    setCopied(true);
  }, [scan]);

  // --- Permission states -----------------------------------------------------
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={ACCENT} />
        <StatusBar style="light" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.logo}>
          teag<Text style={{ color: ACCENT }}>.</Text>me
        </Text>
        <Text style={styles.tagline}>scanner</Text>
        <Text style={styles.permTitle}>Camera access needed</Text>
        <Text style={styles.permBody}>
          Point your camera at any QR code to read the link inside it. Nothing
          leaves your phone.
        </Text>
        <Pressable style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Enable camera</Text>
        </Pressable>
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  // --- Scanner ---------------------------------------------------------------
  return (
    <View style={styles.flex}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scan ? undefined : handleScanned}
      />

      {/* Viewfinder + hint (only while actively scanning) */}
      {!scan && (
        <SafeAreaView style={styles.overlay} pointerEvents="none">
          <Text style={styles.brand}>
            teag<Text style={{ color: ACCENT }}>.</Text>me
          </Text>
          <View style={styles.reticle}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>
          <Text style={styles.hint}>Point at a QR code</Text>
        </SafeAreaView>
      )}

      {/* Result sheet */}
      {scan && (
        <SafeAreaView style={styles.resultWrap}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>
              {scan.isLink ? 'Link' : 'Scanned'}
            </Text>

            {scan.host && <Text style={styles.host}>{scan.host}</Text>}

            <Pressable onPress={scan.isLink ? open : undefined}>
              <Text
                style={[styles.value, scan.isLink && styles.valueLink]}
                numberOfLines={4}
              >
                {scan.raw}
              </Text>
            </Pressable>

            <View style={styles.actions}>
              {scan.isLink && (
                <Pressable style={styles.primaryBtn} onPress={open}>
                  <Text style={styles.primaryBtnText}>Open link</Text>
                </Pressable>
              )}
              <Pressable style={styles.secondaryBtn} onPress={copy}>
                <Text style={styles.secondaryBtnText}>
                  {copied ? 'Copied ✓' : 'Copy'}
                </Text>
              </Pressable>
            </View>

            <Pressable style={styles.scanAgain} onPress={reset}>
              <Text style={styles.scanAgainText}>Scan another</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      )}

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },

  // Branding
  logo: { color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: -1 },
  tagline: {
    color: '#737373',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 4,
    marginTop: -6,
  },
  brand: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },

  // Permission screen
  permTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 8 },
  permBody: {
    color: '#a3a3a3',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },

  // Scanner overlay
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 24 },
  reticle: { width: 240, height: 240, marginTop: '40%' },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: ACCENT,
  },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  hint: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },

  // Result sheet
  resultWrap: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  card: {
    backgroundColor: '#141414',
    margin: 16,
    borderRadius: 28,
    padding: 24,
    gap: 14,
    borderWidth: 1,
    borderColor: '#262626',
  },
  cardLabel: {
    color: '#737373',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  host: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  value: { color: '#d4d4d4', fontSize: 15, lineHeight: 21 },
  valueLink: { color: ACCENT },

  actions: { flexDirection: 'row', gap: 12, marginTop: 6 },
  primaryBtn: {
    flex: 1,
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#04210f', fontSize: 16, fontWeight: '800' },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#262626',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  scanAgain: { alignItems: 'center', paddingVertical: 8 },
  scanAgainText: { color: '#737373', fontSize: 15, fontWeight: '600' },
});
