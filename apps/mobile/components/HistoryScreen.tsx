import { useState } from 'react';
import { Alert, Linking, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import type { HistoryEntry } from '../lib/history';
import { colors, MONO } from '../lib/theme';
import { Wordmarks } from './branding';
import type { SocialProvider } from '../lib/auth-client';
import type { SyncSummary } from '../lib/history-sync';
import type { useStoreKitPro } from '../lib/storekit';
import { capture } from '../lib/analytics';

type Props = {
  entries: HistoryEntry[];
  onBack: () => void;
  onDelete: (clientId: string) => void;
  onClear: () => void;
  user: { name?: string | null; email: string } | null;
  sync: SyncSummary;
  onSignIn: (provider: SocialProvider) => void;
  onEmailAuth: (mode: 'sign-in' | 'sign-up', values: { name: string; email: string; password: string }) => Promise<boolean>;
  onSignOut: () => void;
  onDeleteAccount: () => Promise<boolean>;
  onSync: () => void;
  storeKit: ReturnType<typeof useStoreKitPro>;
};

function relativeDate(value: string) {
  const date = new Date(value);
  const elapsed = Date.now() - date.getTime();
  if (elapsed < 60_000) return 'JUST NOW';
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}M AGO`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)}H AGO`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase();
}

function syncLabel(sync: SyncSummary) {
  if (sync.state === 'syncing') return 'SYNCING…';
  if (sync.state === 'offline') return 'OFFLINE · SAVED LOCALLY';
  if (sync.state === 'error') return 'SYNC PAUSED · TAP TO RETRY';
  if (sync.state === 'limit') return `FREE CLOUD LIMIT · ${sync.total}/${sync.limit}`;
  return `CLOUD SYNCED · ${sync.total}${sync.limit === -1 ? '' : `/${sync.limit}`}`;
}

export function HistoryScreen({ entries, onBack, onDelete, onClear, user, sync, onSignIn, onEmailAuth, onSignOut, onDeleteAccount, onSync, storeKit }: Props) {
  const [accountOpen, setAccountOpen] = useState(false);
  const [proOpen, setProOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitEmail = async () => {
    if (!email.trim() || password.length < 8 || (authMode === 'sign-up' && !name.trim())) {
      Alert.alert('Check your details', 'Enter a valid email and a password with at least 8 characters.');
      return;
    }
    setSubmitting(true);
    const ok = await onEmailAuth(authMode, { name, email, password });
    setSubmitting(false);
    if (ok) setAccountOpen(false);
  };

  const confirmDeleteAccount = () => {
    Alert.alert('Delete your account?', 'This permanently deletes your teag.me account and cloud URL history. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete account',
        style: 'destructive',
        onPress: async () => {
          if (await onDeleteAccount()) setAccountOpen(false);
        },
      },
    ]);
  };
  const confirmClear = () => {
    Alert.alert('Clear scan history?', 'This removes every saved link from this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear history', style: 'destructive', onPress: onClear },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.headerAction}>
          <Text style={styles.headerActionText}>‹ Scan</Text>
        </Pressable>
        <Wordmarks size={16} />
        <Pressable onPress={() => setAccountOpen(true)} hitSlop={12} style={styles.headerAction}>
          <Text style={styles.accountText}>{user ? 'Account' : 'Sign in'}</Text>
        </Pressable>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.eyebrow}>YOUR PRIVATE LINK LOG</Text>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>{user ? 'Synced to your teag.me account. Wi-Fi passwords and text codes are never recorded.' : 'Saved on this device. Sign in to sync links across devices.'}</Text>
        {user && (
          <Pressable onPress={onSync} style={styles.syncRow}>
            <Text style={styles.syncText}>
              {syncLabel(sync)}
            </Text>
          </Pressable>
        )}
        <Pressable onPress={confirmClear} disabled={entries.length === 0} style={styles.clearInline}>
          <Text style={[styles.clearText, entries.length === 0 && styles.disabled]}>Clear history</Text>
        </Pressable>
      </View>

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}><Text style={styles.emptyGlyph}>↗</Text></View>
          <Text style={styles.emptyTitle}>No links yet</Text>
          <Text style={styles.emptyBody}>URLs you scan will appear here so you can find them again.</Text>
          <Pressable style={styles.scanButton} onPress={onBack}>
            <Text style={styles.scanButtonText}>Scan a QR code</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {entries.map((entry) => (
            <View key={entry.clientId} style={styles.card}>
              <Pressable style={styles.cardMain} onPress={() => Linking.openURL(entry.normalizedUrl).catch(() => {})}>
                <View style={styles.iconTile}><Text style={styles.linkGlyph}>↗</Text></View>
                <View style={styles.cardCopy}>
                  <Text style={styles.host} numberOfLines={1}>{entry.host}</Text>
                  <Text style={styles.url} numberOfLines={2}>{entry.rawValue}</Text>
                  <Text style={styles.meta}>{relativeDate(entry.capturedAt)} · {entry.source.toUpperCase()}</Text>
                </View>
              </Pressable>
              <View style={styles.actions}>
                <Pressable style={styles.action} onPress={() => Clipboard.setStringAsync(entry.rawValue)}>
                  <Text style={styles.actionText}>Copy</Text>
                </Pressable>
                <View style={styles.divider} />
                <Pressable style={styles.action} onPress={() => onDelete(entry.clientId)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      <Modal visible={accountOpen} transparent animationType="slide" onRequestClose={() => setAccountOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setAccountOpen(false)}>
          <Pressable style={styles.accountSheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.accountTitle}>{user ? 'Your account' : 'Keep your links'}</Text>
            {user ? (
              <>
                <Text style={styles.accountEmail}>{user.name || user.email}</Text>
                <Text style={styles.accountBody}>{user.email}{'\n'}Your URL history syncs automatically. Scanning still works offline.</Text>
                {storeKit.isPro ? (
                  <Pressable style={styles.proActive} onPress={storeKit.manage}>
                    <Text style={styles.proActiveText}>PRO · UNLIMITED CLOUD HISTORY</Text>
                    <Text style={styles.manageText}>Manage subscription</Text>
                  </Pressable>
                ) : (
                  <Pressable style={styles.emailButton} onPress={() => { capture('pro_paywall_opened'); setAccountOpen(false); setProOpen(true); }}>
                    <Text style={styles.emailButtonText}>Upgrade to Pro</Text>
                  </Pressable>
                )}
                <Pressable style={styles.secondaryButton} onPress={() => { setAccountOpen(false); onSignOut(); }}>
                  <Text style={styles.secondaryButtonText}>Sign out</Text>
                </Pressable>
                <Pressable style={styles.deleteAccountButton} onPress={confirmDeleteAccount}>
                  <Text style={styles.deleteAccountText}>Delete account and cloud history</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.accountBody}>Scanning stays free with no account. Sign in only if you want your URL history backed up and available on teag.me.</Text>
                {authMode === 'sign-up' && (
                  <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={colors.faint} autoCapitalize="words" textContentType="name" />
                )}
                <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.faint} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" />
                <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password (8+ characters)" placeholderTextColor={colors.faint} secureTextEntry textContentType={authMode === 'sign-up' ? 'newPassword' : 'password'} />
                <Pressable disabled={submitting} style={styles.emailButton} onPress={submitEmail}>
                  <Text style={styles.emailButtonText}>{submitting ? 'Please wait…' : authMode === 'sign-up' ? 'Create account' : 'Sign in with email'}</Text>
                </Pressable>
                <Pressable style={styles.modeButton} onPress={() => setAuthMode((mode) => mode === 'sign-in' ? 'sign-up' : 'sign-in')}>
                  <Text style={styles.modeButtonText}>{authMode === 'sign-in' ? 'New here? Create an account' : 'Already have an account? Sign in'}</Text>
                </Pressable>
                <View style={styles.orRow}><View style={styles.orLine} /><Text style={styles.orText}>OR</Text><View style={styles.orLine} /></View>
                {(['apple', 'google', 'github'] as SocialProvider[]).map((provider) => (
                  <Pressable key={provider} style={styles.providerButton} onPress={() => onSignIn(provider)}>
                    <Text style={styles.providerButtonText}>Continue with {provider[0].toUpperCase() + provider.slice(1)}</Text>
                  </Pressable>
                ))}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={proOpen} transparent animationType="slide" onRequestClose={() => setProOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setProOpen(false)}>
          <Pressable style={styles.accountSheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.proEyebrow}>TEAG.ME PRO</Text>
            <Text style={styles.accountTitle}>Keep every link.</Text>
            <Text style={styles.accountBody}>Free includes 100 cloud-synced URLs. Pro removes that limit and unlocks the full teag.me web toolkit on the same account.</Text>
            <View style={styles.proFeature}><Text style={styles.proCheck}>✓</Text><Text style={styles.proFeatureText}>Unlimited synced URL history</Text></View>
            <View style={styles.proFeature}><Text style={styles.proCheck}>✓</Text><Text style={styles.proFeatureText}>100 dynamic QR codes</Text></View>
            <View style={styles.proFeature}><Text style={styles.proCheck}>✓</Text><Text style={styles.proFeatureText}>50,000 tracked scans per month</Text></View>
            <Pressable disabled={storeKit.busy || !storeKit.available} style={[styles.emailButton, (storeKit.busy || !storeKit.available) && styles.disabled]} onPress={() => { capture('pro_purchase_started'); storeKit.purchase(); }}>
              <Text style={styles.emailButtonText}>{storeKit.busy ? 'Connecting to App Store…' : `Subscribe · ${storeKit.price}/month`}</Text>
            </Pressable>
            <Pressable disabled={storeKit.busy} style={styles.modeButton} onPress={() => { capture('pro_restore_started'); storeKit.restore(); }}>
              <Text style={styles.modeButtonText}>Restore purchases</Text>
            </Pressable>
            {storeKit.message && <Text style={styles.storeMessage}>{storeKit.message}</Text>}
            <Text style={styles.subscriptionFinePrint}>Payment is charged to your Apple ID. Subscription renews automatically unless canceled at least 24 hours before the current period ends. Manage or cancel in App Store settings.</Text>
            <View style={styles.legalRow}>
              <Pressable onPress={() => Linking.openURL('https://teag.me/scanner/terms')}><Text style={styles.legalLink}>Terms</Text></Pressable>
              <Text style={styles.legalDot}>·</Text>
              <Pressable onPress={() => Linking.openURL('https://teag.me/scanner/privacy')}><Text style={styles.legalLink}>Privacy</Text></Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.phoneBody },
  header: { height: 58, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#202024' },
  headerAction: { minWidth: 58 },
  headerActionText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
  clearText: { color: colors.orange, fontSize: 14, fontWeight: '600', textAlign: 'right' },
  accountText: { color: colors.accent, fontSize: 14, fontWeight: '600', textAlign: 'right' },
  disabled: { opacity: 0.35 },
  titleBlock: { paddingHorizontal: 22, paddingTop: 28, paddingBottom: 20 },
  eyebrow: { color: colors.accent, fontFamily: MONO, fontSize: 9.5, fontWeight: '600', letterSpacing: 1.4 },
  title: { color: colors.white, fontSize: 38, lineHeight: 44, fontWeight: '800', letterSpacing: -1.1, marginTop: 7 },
  subtitle: { color: colors.mutedCool, fontSize: 13.5, lineHeight: 20, marginTop: 6, maxWidth: 330 },
  syncRow: { alignSelf: 'flex-start', marginTop: 12, paddingVertical: 5 },
  syncText: { color: colors.accent, fontFamily: MONO, fontSize: 9, letterSpacing: 0.7 },
  clearInline: { alignSelf: 'flex-start', marginTop: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 36, gap: 12 },
  card: { backgroundColor: colors.sheet, borderWidth: 1, borderColor: colors.sheetBorder, borderRadius: 18, overflow: 'hidden' },
  cardMain: { flexDirection: 'row', padding: 16, gap: 13 },
  iconTile: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(15,123,255,0.13)', borderWidth: 1, borderColor: 'rgba(15,123,255,0.28)', alignItems: 'center', justifyContent: 'center' },
  linkGlyph: { color: colors.accent, fontSize: 21, fontWeight: '600' },
  cardCopy: { flex: 1, minWidth: 0 },
  host: { color: colors.white, fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  url: { color: colors.mutedCool, fontFamily: MONO, fontSize: 10.5, lineHeight: 15, marginTop: 4 },
  meta: { color: colors.faint, fontFamily: MONO, fontSize: 8.5, letterSpacing: 0.7, marginTop: 8 },
  actions: { height: 42, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.sheetBorder },
  action: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center' },
  actionText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  deleteText: { color: colors.orange, fontSize: 13, fontWeight: '600' },
  divider: { width: 1, height: 18, backgroundColor: colors.sheetBorder },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 42, paddingBottom: 80 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(15,123,255,0.12)', borderWidth: 1, borderColor: 'rgba(15,123,255,0.26)', alignItems: 'center', justifyContent: 'center' },
  emptyGlyph: { color: colors.accent, fontSize: 30, fontWeight: '600' },
  emptyTitle: { color: colors.white, fontSize: 22, fontWeight: '700', marginTop: 19 },
  emptyBody: { color: colors.mutedCool, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 7 },
  scanButton: { backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 23 },
  scanButtonText: { color: colors.pureWhite, fontSize: 14.5, fontWeight: '600' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.65)' },
  accountSheet: { backgroundColor: colors.sheet, borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: 1, borderColor: colors.sheetBorder, paddingHorizontal: 24, paddingTop: 10, paddingBottom: 38 },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: colors.faint, alignSelf: 'center', marginBottom: 24 },
  accountTitle: { color: colors.white, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  accountEmail: { color: colors.accent, fontSize: 15, fontWeight: '600', marginTop: 8 },
  accountBody: { color: colors.mutedCool, fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 18 },
  providerButton: { height: 50, borderRadius: 14, backgroundColor: colors.pureWhite, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  providerButtonText: { color: colors.phoneBody, fontSize: 15, fontWeight: '700' },
  input: { height: 50, borderRadius: 13, borderWidth: 1, borderColor: colors.sheetBorder, backgroundColor: colors.phoneBody, color: colors.white, paddingHorizontal: 15, fontSize: 15, marginTop: 10 },
  emailButton: { height: 50, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  emailButtonText: { color: colors.pureWhite, fontSize: 15, fontWeight: '700' },
  modeButton: { alignItems: 'center', paddingVertical: 13 },
  modeButtonText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  orLine: { flex: 1, height: 1, backgroundColor: colors.sheetBorder },
  orText: { color: colors.faint, fontFamily: MONO, fontSize: 9 },
  secondaryButton: { height: 50, borderRadius: 14, borderWidth: 1, borderColor: colors.sheetBorder, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  secondaryButtonText: { color: colors.orange, fontSize: 15, fontWeight: '600' },
  deleteAccountButton: { alignItems: 'center', paddingVertical: 16 },
  deleteAccountText: { color: colors.orange, fontSize: 13, fontWeight: '600' },
  proActive: { borderWidth: 1, borderColor: 'rgba(15,123,255,0.35)', backgroundColor: 'rgba(15,123,255,0.12)', borderRadius: 12, padding: 12, marginBottom: 10 },
  proActiveText: { color: colors.accent, fontFamily: MONO, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textAlign: 'center' },
  manageText: { color: colors.mutedCool, fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 5 },
  proEyebrow: { color: colors.accent, fontFamily: MONO, fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 7 },
  proFeature: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  proCheck: { color: colors.accent, fontSize: 16, fontWeight: '800' },
  proFeatureText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  storeMessage: { color: colors.mutedCool, fontSize: 12.5, lineHeight: 18, textAlign: 'center', marginTop: 4 },
  subscriptionFinePrint: { color: colors.faint, fontSize: 10.5, lineHeight: 15, textAlign: 'center', marginTop: 12 },
  legalRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12 },
  legalLink: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  legalDot: { color: colors.faint, fontSize: 12 },
});
