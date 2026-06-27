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

import { colors, MONO } from './lib/theme';
import { parseScan, type Scan } from './lib/parseScan';
import { LogoTile, PulsingDot, Wordmarks } from './components/branding';
import { Reticle } from './components/Reticle';
import { ResultSheet } from './components/ResultSheet';
import { SafetyTeaser } from './components/SafetyTeaser';

const ACCENT = colors.accent; // '#0F7BFF' — brand primary blue

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scan, setScan] = useState<Scan | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
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
    if (scan?.kind === 'url') Linking.openURL(scan.raw).catch(() => {});
  }, [scan]);

  const copy = useCallback(async () => {
    if (!scan) return;
    const toCopy = scan.kind === 'wifi' && scan.wifi?.password ? scan.wifi.password : scan.raw;
    await Clipboard.setStringAsync(toCopy);
    setCopied(true);
  }, [scan]);

  // --- Loading permission state ---------------------------------------------
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={ACCENT} />
        <StatusBar style="light" />
      </View>
    );
  }

  // --- Camera permission screen ---------------------------------------------
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permScreen}>
        <View style={styles.permBody}>
          <LogoTile size={72} />
          <View style={styles.permWordmark}>
            <Wordmarks size={24} outlined />
          </View>
          <Text style={styles.permLead}>Point your camera at any QR code.</Text>
          <Text style={styles.permSub}>Nothing leaves your phone.</Text>
          <Pressable
            style={({ pressed }) => [styles.enableBtn, pressed && styles.pressed]}
            onPress={requestPermission}
          >
            <Text style={styles.enableBtnText}>Enable camera</Text>
          </Pressable>
          <Text style={styles.permFootnote}>ON-DEVICE · NO ACCOUNT</Text>
        </View>
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  // --- Scanner + result states ----------------------------------------------
  return (
    <View style={styles.flex}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scan ? undefined : handleScanned}
      />

      {/* Viewfinder overlay (only while actively scanning) */}
      {!scan && !showTeaser && (
        <SafeAreaView style={styles.overlay}>
          <View style={styles.topBar} pointerEvents="none">
            <Wordmarks size={17} />
          </View>

          <View style={styles.reticleWrap} pointerEvents="none">
            <Reticle />
          </View>

          <View style={styles.bottomBar}>
            <View style={styles.hintPill} pointerEvents="none">
              <PulsingDot size={7} />
              <Text style={styles.hintText}>Point at a QR code</Text>
            </View>
            {__DEV__ && (
              <Pressable style={styles.devToggle} onPress={() => setShowTeaser(true)}>
                <Text style={styles.devToggleText}>preview safety check</Text>
              </Pressable>
            )}
          </View>
        </SafeAreaView>
      )}

      {/* Result sheet (URL / Wi-Fi / text) */}
      {scan && (
        <ResultSheet
          scan={scan}
          copied={copied}
          onOpen={open}
          onCopy={copy}
          onScanAnother={reset}
        />
      )}

      {/* Optional decorative safety-check teaser (dev preview only) */}
      {showTeaser && <SafetyTeaser onClose={() => setShowTeaser(false)} />}

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.phoneBody },
  pressed: { opacity: 0.85 },

  center: {
    flex: 1,
    backgroundColor: colors.phoneBody,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Permission screen
  permScreen: { flex: 1, backgroundColor: colors.phoneBody },
  permBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
  },
  permWordmark: { marginTop: 28, marginBottom: 22 },
  permLead: {
    color: '#C4C9D2',
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '500',
    textAlign: 'center',
  },
  permSub: {
    color: colors.mutedLabel,
    fontSize: 14.5,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 36,
  },
  enableBtn: {
    alignSelf: 'stretch',
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: ACCENT,
    shadowOpacity: 0.36,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
  },
  enableBtnText: { color: colors.pureWhite, fontSize: 16, fontWeight: '600' },
  permFootnote: {
    fontFamily: MONO,
    fontSize: 10.5,
    color: colors.faint,
    letterSpacing: 0.4,
    marginTop: 18,
  },

  // Scanner overlay
  overlay: { flex: 1, justifyContent: 'space-between' },
  topBar: { alignItems: 'center', paddingTop: 22 },
  reticleWrap: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  bottomBar: { alignItems: 'center', paddingBottom: 32, gap: 14 },
  hintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(10,10,10,0.66)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 19,
    paddingVertical: 11,
    borderRadius: 999,
  },
  hintText: { color: colors.white, fontSize: 13, fontWeight: '500' },
  devToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,138,61,0.4)',
  },
  devToggleText: {
    fontFamily: MONO,
    fontSize: 9,
    color: colors.orange,
    letterSpacing: 0.6,
  },
});
