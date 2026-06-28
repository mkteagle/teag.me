// Temporary App Store screenshot harness — renders each marketed state
// full-screen with seeded data so it can be captured from the simulator
// (no camera / no tapping needed). Driven by `shot.ts`. Not shipped: when
// SHOT is null this never renders.
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors, MONO } from '../lib/theme';
import { parseScan } from '../lib/parseScan';
import { LogoTile, PulsingDot, Wordmarks } from './branding';
import { Reticle } from './Reticle';
import { ResultSheet } from './ResultSheet';
import type { ShotKey } from '../shot';

const ACCENT = colors.accent;
const noop = () => {};

// A faux camera scene: dark frame with a QR sticker centered, so the reticle
// reads as actively scanning even though the simulator has no camera.
function Scene() {
  return (
    <View style={styles.scene}>
      <View style={styles.qrCard}>
        <Image source={require('../assets/sample-qr.png')} style={styles.qrImg} />
      </View>
    </View>
  );
}

export function ShotHarness({ shot }: { shot: ShotKey }) {
  if (shot === 'privacy') {
    return (
      <SafeAreaView style={styles.permScreen}>
        <View style={styles.permBody}>
          <LogoTile size={72} />
          <View style={styles.permWordmark}>
            <Wordmarks size={24} outlined />
          </View>
          <Text style={styles.permLead}>Point your camera at any QR code.</Text>
          <Text style={styles.permSub}>Nothing leaves your phone.</Text>
          <View style={styles.enableBtn}>
            <Text style={styles.enableBtnText}>Enable camera</Text>
          </View>
          <View style={styles.photoBtnOutline}>
            <Text style={styles.photoBtnOutlineText}>Scan a photo instead</Text>
          </View>
          <Text style={styles.permFootnote}>ON-DEVICE · NO ACCOUNT</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (shot === 'scan') {
    return (
      <View style={styles.flex}>
        <Scene />
        <SafeAreaView style={styles.overlay}>
          <View style={styles.topBar}>
            <Wordmarks size={17} />
          </View>
          <View style={styles.reticleWrap}>
            <Reticle />
          </View>
          <View style={styles.bottomBar}>
            <View style={styles.hintPill}>
              <PulsingDot size={7} />
              <Text style={styles.hintText}>Point at a QR code</Text>
            </View>
            <View style={styles.photoPill}>
              <Text style={styles.photoPillText}>⤓  Scan from photo</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Result-sheet shots: link / open / wifi
  const scan =
    shot === 'wifi'
      ? parseScan('WIFI:S:Cafe Guest;T:WPA2;P:latte-2026;;')
      : shot === 'open'
        ? parseScan('https://teag.me/launch')
        : parseScan('https://marriott.com/reservations/spring-2026');

  return (
    <View style={styles.flex}>
      <Scene />
      <ResultSheet scan={scan} copied={false} onOpen={noop} onCopy={noop} onScanAnother={noop} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.phoneBody },

  // Faux scene
  scene: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#111317',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCard: {
    width: 188,
    height: 188,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.92,
  },
  qrImg: { width: 150, height: 150 },

  // Scanner overlay (mirrors App.tsx)
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
  },
  photoPillText: { color: colors.pureWhite, fontSize: 14.5, fontWeight: '600' },

  // Permission screen (mirrors App.tsx)
  permScreen: { flex: 1, backgroundColor: colors.phoneBody },
  permBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34 },
  permWordmark: { marginTop: 28, marginBottom: 22 },
  permLead: { color: '#C4C9D2', fontSize: 16, lineHeight: 25, fontWeight: '500', textAlign: 'center' },
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
  permFootnote: { fontFamily: MONO, fontSize: 10.5, color: colors.faint, letterSpacing: 0.4, marginTop: 18 },
});
