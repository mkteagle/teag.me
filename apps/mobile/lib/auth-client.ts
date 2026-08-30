import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'https://teag.me').replace(/\/$/, '');

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      scheme: 'teagme-scanner',
      storagePrefix: 'teagme-scanner',
      storage: SecureStore,
    }),
  ],
});

export type SocialProvider = 'apple' | 'google' | 'github';

export async function signInWithProvider(provider: SocialProvider) {
  return authClient.signIn.social({ provider, callbackURL: '/' });
}

export async function signInWithEmail(email: string, password: string) {
  return authClient.signIn.email({ email: email.trim(), password });
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  return authClient.signUp.email({ name: name.trim(), email: email.trim(), password });
}

export async function authenticatedFetch(path: string, init: RequestInit = {}) {
  const cookie = authClient.getCookie();
  const headers = new Headers(init.headers);
  if (cookie) headers.set('Cookie', cookie);
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'omit',
  });
}
