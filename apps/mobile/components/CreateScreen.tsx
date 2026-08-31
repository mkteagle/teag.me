import { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { colors, MONO } from '../lib/theme';
import { capture } from '../lib/analytics';
import { generateQr, saveQr, shareQr, type GeneratedQr } from '../lib/qr-generator';
import { Wordmarks } from './branding';

type Props = { signedIn: boolean; onSignIn: () => void; onCreated: (qr: GeneratedQr) => void; onClose: () => void };

export function CreateScreen({ signedIn, onSignIn, onCreated, onClose }: Props) {
  const [url, setUrl] = useState('');
  const [tracked, setTracked] = useState(signedIn);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<GeneratedQr | null>(null);
  const [copied, setCopied] = useState(false);

  const create = async () => {
    if (!url.trim()) return Alert.alert('Add a destination', 'Enter the website this QR code should open.');
    if (tracked && !signedIn) return onSignIn();
    setBusy(true);
    try {
      const qr = await generateQr(url, tracked);
      setResult(qr);
      onCreated(qr);
      capture('qr_code_created', { tracked: qr.tracked });
    } catch (error) {
      Alert.alert('Could not create QR code', error instanceof Error ? error.message : 'Please try again.');
      capture('qr_code_create_failed', { tracked });
    } finally { setBusy(false); }
  };

  const runAction = async (action: 'save' | 'share') => {
    if (!result) return;
    try {
      if (action === 'save') await saveQr(result); else await shareQr(result);
      capture(`qr_code_${action}d`, { tracked: result.tracked });
      if (action === 'save') Alert.alert('Saved', 'The QR code was added to Photos.');
    } catch (error) {
      Alert.alert(action === 'save' ? 'Could not save' : 'Could not share', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12}><Text style={styles.headerAction}>‹ Scan</Text></Pressable>
        <Wordmarks size={16} />
        <View style={styles.headerSpacer} />
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {!result ? <>
            <Text style={styles.eyebrow}>MAKE SOMETHING USEFUL</Text>
            <Text style={styles.title}>Create a QR code</Text>
            <Text style={styles.subtitle}>Paste a website. We’ll make a clean code you can save, print, or share.</Text>
            <View style={styles.fieldCard}>
              <Text style={styles.label}>DESTINATION URL</Text>
              <TextInput value={url} onChangeText={setUrl} style={styles.input} placeholder="example.com/menu" placeholderTextColor={colors.faint} autoCapitalize="none" autoCorrect={false} keyboardType="url" textContentType="URL" returnKeyType="done" />
            </View>
            <View style={styles.trackCard}>
              <View style={styles.trackCopy}>
                <View style={styles.trackTitleRow}><Text style={styles.trackTitle}>Track with teag.me</Text><Text style={styles.badge}>DYNAMIC</Text></View>
                <Text style={styles.trackBody}>{signedIn ? 'See scans and change the destination later.' : 'Sign in to create an editable teag.me link with analytics.'}</Text>
              </View>
              <Switch value={tracked} onValueChange={setTracked} trackColor={{ false: '#303641', true: colors.accent }} thumbColor="#fff" />
            </View>
            {!signedIn && tracked && <Pressable onPress={onSignIn}><Text style={styles.signInHint}>Sign in to create a tracked code →</Text></Pressable>}
            <Pressable disabled={busy} onPress={create} style={({ pressed }) => [styles.primary, pressed && styles.pressed, busy && styles.disabled]}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{tracked ? 'Create tracked QR code' : 'Create QR code'}</Text>}
            </Pressable>
            <Text style={styles.footnote}>{tracked ? 'FREE: 10 ACTIVE CODES · PRO: UNLIMITED' : 'STATIC CODE · NO ACCOUNT REQUIRED'}</Text>
          </> : <View style={styles.resultWrap}>
            <Text style={styles.eyebrow}>{result.tracked ? 'TRACKED BY TEAG.ME' : 'READY TO SHARE'}</Text>
            <Text style={styles.title}>Your QR code</Text>
            <View style={styles.qrFrame}><Image source={{ uri: result.imageDataUrl }} style={styles.qrImage} /></View>
            <Text style={styles.resultHost} numberOfLines={1}>{new URL(result.destinationUrl).hostname.replace(/^www\./, '')}</Text>
            <Text style={styles.resultUrl} numberOfLines={2}>{result.destinationUrl}</Text>
            {result.tracked && <View style={styles.routingPill}><Text style={styles.routingText}>{result.encodedUrl}</Text></View>}
            <View style={styles.actionRow}>
              <Pressable style={styles.secondary} onPress={() => runAction('save')}><Text style={styles.secondaryText}>Save image</Text></Pressable>
              <Pressable style={styles.secondary} onPress={() => runAction('share')}><Text style={styles.secondaryText}>Share</Text></Pressable>
            </View>
            <Pressable style={styles.copyButton} onPress={async () => { await Clipboard.setStringAsync(result.encodedUrl); setCopied(true); capture('created_qr_link_copied', { tracked: result.tracked }); }}>
              <Text style={styles.copyText}>{copied ? 'Copied' : result.tracked ? 'Copy teag.me link' : 'Copy destination'}</Text>
            </Pressable>
            <Pressable style={styles.again} onPress={() => { setResult(null); setCopied(false); }}><Text style={styles.againText}>Create another</Text></Pressable>
          </View>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, screen: { flex: 1, backgroundColor: colors.phoneBody },
  header: { minHeight: 56, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  headerAction: { color: colors.white, fontSize: 15, fontWeight: '700' }, headerSpacer: { width: 44 },
  content: { padding: 24, paddingBottom: 48 },
  eyebrow: { fontFamily: MONO, color: colors.accent, fontSize: 10, fontWeight: '700', letterSpacing: 1.6, marginTop: 18, marginBottom: 12 },
  title: { color: colors.white, fontSize: 36, lineHeight: 40, fontWeight: '800', letterSpacing: -1.3 },
  subtitle: { color: '#A8AFBA', fontSize: 16, lineHeight: 24, marginTop: 12, marginBottom: 30 },
  fieldCard: { backgroundColor: '#171B22', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 18, padding: 18 },
  label: { fontFamily: MONO, color: '#8C95A3', fontSize: 10, fontWeight: '700', letterSpacing: 1.1, marginBottom: 10 },
  input: { color: colors.white, fontSize: 18, fontWeight: '600', paddingVertical: 6 },
  trackCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#171B22', borderWidth: 1, borderColor: 'rgba(15,123,255,0.25)', borderRadius: 18, padding: 18, marginTop: 14 },
  trackCopy: { flex: 1 }, trackTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, trackTitle: { color: colors.white, fontSize: 15, fontWeight: '800' },
  badge: { fontFamily: MONO, color: colors.accent, fontSize: 8, fontWeight: '800', letterSpacing: 0.8 }, trackBody: { color: '#8C95A3', fontSize: 13, lineHeight: 19, marginTop: 5 },
  signInHint: { color: colors.accent, fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 14 },
  primary: { minHeight: 56, backgroundColor: colors.accent, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginTop: 22, shadowColor: colors.accent, shadowOpacity: 0.28, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '800' }, footnote: { fontFamily: MONO, color: colors.faint, fontSize: 9.5, letterSpacing: 0.8, textAlign: 'center', marginTop: 15 },
  pressed: { opacity: 0.84 }, disabled: { opacity: 0.55 }, resultWrap: { alignItems: 'center' },
  qrFrame: { marginTop: 26, backgroundColor: '#fff', borderRadius: 26, padding: 17, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 16 } },
  qrImage: { width: 250, height: 250, borderRadius: 10 }, resultHost: { color: colors.white, fontSize: 21, fontWeight: '800', marginTop: 25 },
  resultUrl: { color: '#8C95A3', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 6 }, routingPill: { backgroundColor: 'rgba(15,123,255,0.12)', borderWidth: 1, borderColor: 'rgba(15,123,255,0.28)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginTop: 14 },
  routingText: { color: '#74B4FF', fontFamily: MONO, fontSize: 11 }, actionRow: { flexDirection: 'row', gap: 10, marginTop: 24, alignSelf: 'stretch' },
  secondary: { flex: 1, minHeight: 51, borderRadius: 15, backgroundColor: '#20252D', alignItems: 'center', justifyContent: 'center' }, secondaryText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  copyButton: { alignSelf: 'stretch', minHeight: 51, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.13)', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  copyText: { color: colors.white, fontSize: 14, fontWeight: '700' }, again: { padding: 18 }, againText: { color: colors.accent, fontSize: 14, fontWeight: '700' },
});
