import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  scanFromURLAsync,
  type BarcodeScanningResult,
} from 'expo-camera';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';

import { colors, MONO } from './lib/theme';
import { parseScan, type Scan } from './lib/parseScan';
import { LogoTile, PulsingDot, Wordmarks } from './components/branding';
import { Reticle } from './components/Reticle';
import { ResultSheet } from './components/ResultSheet';
import { HistoryScreen } from './components/HistoryScreen';
import { SafetyTeaser } from './components/SafetyTeaser';
import { ShotHarness } from './components/ShotHarness';
import { SHOT } from './shot';
import { createHistoryEntry, loadHistory, saveHistory, type CaptureSource, type HistoryEntry } from './lib/history';
import { authClient, signInWithEmail, signInWithProvider, signUpWithEmail, type SocialProvider } from './lib/auth-client';
import { clearCloudHistory, deleteCloudEntry, syncHistory, type SyncSummary } from './lib/history-sync';
import { useStoreKitPro } from './lib/storekit';
import { capture, identify, resetAnalytics } from './lib/analytics';

const ACCENT = colors.accent; // '#0F7BFF' — brand primary blue

export default function App() {
  const session = authClient.useSession();
  const storeKit = useStoreKitPro(session.data?.user?.id);
  const [permission, requestPermission] = useCameraPermissions();
  const [scan, setScan] = useState<Scan | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [noQrFound, setNoQrFound] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyReady, setHistoryReady] = useState(false);
  const [sync, setSync] = useState<SyncSummary>({ state: 'idle', total: 0, limit: 0, plan: 'FREE' });
  const syncing = useRef(false);
  // Guards against the camera firing onBarcodeScanned dozens of times per second.
  const locked = useRef(false);

  useEffect(() => {
    loadHistory().then((entries) => {
      setHistory(entries);
      setHistoryReady(true);
      capture('scanner_opened', { saved_link_count: entries.length });
    });
  }, []);

  useEffect(() => {
    const userId = session.data?.user?.id;
    if (userId) identify(userId);
    else resetAnalytics();
  }, [session.data?.user?.id]);

  const runSync = useCallback(async () => {
    if (!session.data?.user || !historyReady || syncing.current) return;
    syncing.current = true;
    setSync((current) => ({ ...current, state: 'syncing' }));
    try {
      const result = await syncHistory(history);
      setHistory(result.entries);
      await saveHistory(result.entries);
      setSync(result.summary);
      capture('cloud_history_synced', {
        state: result.summary.state,
        total: result.summary.total,
        plan: result.summary.plan,
      });
    } catch {
      setSync((current) => ({ ...current, state: 'error' }));
      capture('cloud_history_sync_failed');
    } finally {
      syncing.current = false;
    }
  }, [history, historyReady, session.data?.user]);

  useEffect(() => {
    if (!session.data?.user || !historyReady) return;
    void runSync();
    // Sync again when a new local capture changes the count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.data?.user?.id, historyReady, history.length]);

  const presentScan = useCallback((nextScan: Scan, source: CaptureSource) => {
    setScan(nextScan);
    capture('qr_code_scanned', { kind: nextScan.kind, source });
    const entry = createHistoryEntry(nextScan, source);
    if (!entry) return;
    setHistory((current) => {
      const next = [entry, ...current];
      void saveHistory(next);
      return next;
    });
  }, []);

  const handleScanned = useCallback((result: BarcodeScanningResult) => {
    if (locked.current) return;
    locked.current = true;
    presentScan(parseScan(result.data), 'camera');
  }, [presentScan]);

  const reset = useCallback(() => {
    setScan(null);
    setCopied(false);
    setNoQrFound(false);
    locked.current = false;
  }, []);

  // Decode a QR straight from a saved/screenshot image — no camera needed.
  // The OS barcode detector (Apple Vision on iOS, ML Kit on Android) reads it
  // on-device; nothing leaves the phone.
  const pickFromLibrary = useCallback(async () => {
    setNoQrFound(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (result.canceled || !result.assets?.length) return;
    setDecoding(true);
    try {
      const found = await scanFromURLAsync(result.assets[0].uri, ['qr']);
      if (found.length > 0) {
        locked.current = true;
        presentScan(parseScan(found[0].data), 'photo');
      } else {
        setNoQrFound(true);
        capture('photo_scan_no_qr');
      }
    } catch {
      setNoQrFound(true);
      capture('photo_scan_failed');
    } finally {
      setDecoding(false);
    }
  }, [presentScan]);

  const deleteHistoryEntry = useCallback(async (clientId: string) => {
    const target = history.find((entry) => entry.clientId === clientId);
    if (session.data?.user && target?.serverId) {
      try {
        await deleteCloudEntry(target.serverId);
      } catch {
        Alert.alert('Could not delete', 'You appear to be offline. The link was kept so your device and cloud history stay consistent.');
        return;
      }
    }
    setHistory((current) => {
      const next = current.filter((entry) => entry.clientId !== clientId);
      void saveHistory(next);
      return next;
    });
  }, [history, session.data?.user]);

  const clearHistory = useCallback(async () => {
    if (session.data?.user) {
      try {
        await clearCloudHistory();
      } catch {
        Alert.alert('Could not clear history', 'You appear to be offline. Nothing was removed.');
        return;
      }
    }
    setHistory([]);
    void saveHistory([]);
  }, [session.data?.user]);

  const handleSignIn = useCallback(async (provider: SocialProvider) => {
    const result = await signInWithProvider(provider);
    if (result.error) {
      capture('account_sign_in_failed', { method: provider });
      Alert.alert('Could not sign in', result.error.message || 'Please try again.');
    } else {
      capture('account_signed_in', { method: provider });
    }
  }, []);

  const handleEmailAuth = useCallback(async (mode: 'sign-in' | 'sign-up', values: { name: string; email: string; password: string }) => {
    const result = mode === 'sign-up'
      ? await signUpWithEmail(values.name, values.email, values.password)
      : await signInWithEmail(values.email, values.password);
    if (result.error) {
      capture('account_auth_failed', { mode });
      Alert.alert(mode === 'sign-up' ? 'Could not create account' : 'Could not sign in', result.error.message || 'Check your details and try again.');
      return false;
    }
    capture(mode === 'sign-up' ? 'account_created' : 'account_signed_in', { method: 'email' });
    return true;
  }, []);

  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    capture('account_signed_out');
    resetAnalytics();
    setSync({ state: 'idle', total: 0, limit: 0, plan: 'FREE' });
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    const result = await authClient.deleteUser();
    if (result.error) {
      Alert.alert('Could not delete account', result.error.message || 'Please try again.');
      return false;
    }
    setHistory([]);
    await saveHistory([]);
    setSync({ state: 'idle', total: 0, limit: 0, plan: 'FREE' });
    return true;
  }, []);

  const open = useCallback(() => {
    if (scan?.kind === 'url') {
      capture('scan_result_opened', { kind: 'url' });
      Linking.openURL(scan.raw).catch(() => {});
    }
  }, [scan]);

  const copy = useCallback(async () => {
    if (!scan) return;
    const toCopy = scan.kind === 'wifi' && scan.wifi?.password ? scan.wifi.password : scan.raw;
    await Clipboard.setStringAsync(toCopy);
    capture('scan_result_copied', { kind: scan.kind });
    setCopied(true);
  }, [scan]);

  // Screenshot harness (no-op in production: SHOT is null). Placed after all
  // hooks so hook order stays stable when Fast Refresh swaps the flag.
  if (SHOT) return <ShotHarness shot={SHOT} />;

  if (showHistory) {
    return (
      <>
        <HistoryScreen
          entries={history}
          onBack={() => setShowHistory(false)}
          onDelete={deleteHistoryEntry}
          onClear={clearHistory}
          user={session.data?.user ? { name: session.data.user.name, email: session.data.user.email } : null}
          sync={sync}
          onSignIn={handleSignIn}
          onEmailAuth={handleEmailAuth}
          onSignOut={handleSignOut}
          onDeleteAccount={handleDeleteAccount}
          onSync={runSync}
          storeKit={storeKit}
        />
        <StatusBar style="light" />
      </>
    );
  }

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
          <Pressable
            style={({ pressed }) => [styles.photoBtnOutline, pressed && styles.pressed]}
            onPress={pickFromLibrary}
          >
            <Text style={styles.photoBtnOutlineText}>Scan a photo instead</Text>
          </Pressable>
          {noQrFound && (
            <Text style={styles.noQrText}>No QR code found in that image.</Text>
          )}
          <Text style={styles.permFootnote}>ON-DEVICE · NO ACCOUNT</Text>
        </View>
        {decoding && <DecodingOverlay />}
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
        onBarcodeScanned={scan || !historyReady ? undefined : handleScanned}
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
            {noQrFound && (
              <Text style={styles.noQrText}>No QR code found in that image.</Text>
            )}
            <Pressable
              style={({ pressed }) => [styles.photoPill, pressed && styles.pressed]}
              onPress={pickFromLibrary}
            >
              <Text style={styles.photoPillText}>⤓  Scan from photo</Text>
            </Pressable>
            <Pressable style={styles.historyPill} onPress={() => { capture('history_opened', { saved_link_count: history.length }); setShowHistory(true); }}>
              <Text style={styles.historyPillText}>History{history.length > 0 ? `  ·  ${history.length}` : ''}</Text>
            </Pressable>
            {__DEV__ && (
              <Pressable style={styles.devToggle} onPress={() => setShowTeaser(true)}>
                <Text style={styles.devToggleText}>preview safety check</Text>
              </Pressable>
            )}
          </View>
        </SafeAreaView>
      )}

      {decoding && <DecodingOverlay />}

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

function DecodingOverlay() {
  return (
    <View style={styles.decodingOverlay}>
      <ActivityIndicator color={ACCENT} size="large" />
      <Text style={styles.decodingText}>Reading image…</Text>
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
  photoBtnOutline: {
    alignSelf: 'stretch',
    marginTop: 12,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  photoBtnOutlineText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  noQrText: {
    color: colors.orange,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 14,
  },
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
  photoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 999,
    shadowColor: ACCENT,
    shadowOpacity: 0.34,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  photoPillText: { color: colors.pureWhite, fontSize: 14.5, fontWeight: '600' },
  historyPill: {
    backgroundColor: 'rgba(10,10,10,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  historyPillText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  decodingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10,10,10,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  decodingText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '500',
  },
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
