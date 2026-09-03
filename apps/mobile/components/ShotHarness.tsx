// Temporary App Store screenshot harness — renders each marketed state
// full-screen with seeded data so it can be captured from the simulator
// (no camera / no tapping needed). Driven by `shot.ts`. Not shipped: when
// SHOT is null this never renders.
import { Image, LogBox, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors, MONO } from '../lib/theme';
import { parseScan } from '../lib/parseScan';
import { LogoTile, PulsingDot, Wordmarks } from './branding';
import { Reticle } from './Reticle';
import { ResultSheet } from './ResultSheet';
import { CreateScreen } from './CreateScreen';
import type { ShotKey } from '../shot';

const ACCENT = colors.accent;
const noop = () => {};

// Marketing captures run in a development client; keep React Native's warning
// toast out of the screenshots without changing normal production behavior.
LogBox.ignoreAllLogs(true);

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
  if (shot === 'create') {
    return (
      <CreateScreen
        signedIn
        initialUrl="kindling.studio/menu"
        initialTracked
        onSignIn={noop}
        onCreated={noop}
        onClose={noop}
      />
    );
  }

  if (shot === 'privacy' || shot === 'photo') {
    return (
      <SafeAreaView style={styles.permScreen}>
        <View style={styles.permBody}>
          <LogoTile size={72} />
          <View style={styles.permWordmark}>
            <Wordmarks size={24} outlined />
          </View>
          <Text style={styles.permLead}>{shot === 'photo' ? 'Already have a QR code?' : 'Point your camera at any QR code.'}</Text>
          <Text style={styles.permSub}>{shot === 'photo' ? 'Choose a screenshot or saved photo. It is decoded on-device.' : 'Nothing leaves your phone.'}</Text>
          <View style={styles.enableBtn}>
            <Text style={styles.enableBtnText}>{shot === 'photo' ? 'Choose from Photos' : 'Enable camera'}</Text>
          </View>
          <View style={styles.photoBtnOutline}>
            <Text style={styles.photoBtnOutlineText}>{shot === 'photo' ? 'Use the camera instead' : 'Scan a photo instead'}</Text>
          </View>
          <Text style={styles.permFootnote}>ON-DEVICE · NO ACCOUNT</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (shot === 'history') {
    return (
      <SafeAreaView style={styles.historyScreen}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyAction}>‹ Scan</Text>
          <Wordmarks size={16} />
          <Text style={styles.historyAction}>Account</Text>
        </View>
        <View style={styles.historyIntro}>
          <Text style={styles.historyEyebrow}>YOUR PRIVATE LINK LOG</Text>
          <Text style={styles.historyTitle}>History</Text>
          <Text style={styles.historySubtitle}>Synced to your teag.me account. Wi-Fi passwords and text codes are never recorded.</Text>
          <Text style={styles.historySync}>CLOUD SYNCED · 3/100</Text>
        </View>
        <View style={styles.historyList}>
          {[
            ['openai.com', 'https://openai.com/research', 'JUST NOW · CAMERA'],
            ['apps.apple.com', 'https://apps.apple.com/app/qr-code-by-teag-me', '8M AGO · PHOTO'],
            ['nationalparks.org', 'https://www.nationalparks.org/explore', 'YESTERDAY · CAMERA'],
          ].map(([host, url, meta]) => (
            <View key={host} style={styles.historyCard}>
              <View style={styles.historyCardMain}>
                <View style={styles.historyIcon}><Text style={styles.historyGlyph}>↗</Text></View>
                <View style={styles.historyCardCopy}>
                  <Text style={styles.historyHost}>{host}</Text>
                  <Text style={styles.historyUrl} numberOfLines={1}>{url}</Text>
                  <Text style={styles.historyMeta}>{meta}</Text>
                </View>
              </View>
              <View style={styles.historyCardActions}><Text style={styles.historyCopy}>Copy</Text><Text style={styles.historyDelete}>Delete</Text></View>
            </View>
          ))}
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

  const scan = parseScan('https://marriott.com/reservations/spring-2026');

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

  historyScreen: { flex: 1, backgroundColor: colors.phoneBody },
  historyHeader: { height: 58, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#202024' },
  historyAction: { minWidth: 58, color: colors.accent, fontSize: 14, fontWeight: '600' },
  historyIntro: { paddingHorizontal: 22, paddingTop: 28, paddingBottom: 20 },
  historyEyebrow: { color: colors.accent, fontFamily: MONO, fontSize: 9.5, fontWeight: '600', letterSpacing: 1.4 },
  historyTitle: { color: colors.white, fontSize: 38, lineHeight: 44, fontWeight: '800', letterSpacing: -1.1, marginTop: 7 },
  historySubtitle: { color: colors.mutedCool, fontSize: 13.5, lineHeight: 20, marginTop: 6 },
  historySync: { color: colors.accent, fontFamily: MONO, fontSize: 9, letterSpacing: 0.7, marginTop: 13 },
  historyList: { paddingHorizontal: 16, gap: 12 },
  historyCard: { backgroundColor: colors.sheet, borderWidth: 1, borderColor: colors.sheetBorder, borderRadius: 18, overflow: 'hidden' },
  historyCardMain: { flexDirection: 'row', padding: 16, gap: 13 },
  historyIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(15,123,255,0.13)', borderWidth: 1, borderColor: 'rgba(15,123,255,0.28)', alignItems: 'center', justifyContent: 'center' },
  historyGlyph: { color: colors.accent, fontSize: 21, fontWeight: '600' },
  historyCardCopy: { flex: 1 },
  historyHost: { color: colors.white, fontSize: 17, fontWeight: '700' },
  historyUrl: { color: colors.mutedCool, fontFamily: MONO, fontSize: 10.5, marginTop: 4 },
  historyMeta: { color: colors.faint, fontFamily: MONO, fontSize: 8.5, letterSpacing: 0.7, marginTop: 8 },
  historyCardActions: { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: colors.sheetBorder },
  historyCopy: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  historyDelete: { color: colors.orange, fontSize: 13, fontWeight: '600' },
});
