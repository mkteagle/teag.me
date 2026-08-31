import PostHog from 'posthog-react-native';

type AnalyticsValue = string | number | boolean | null;

// PostHog project tokens are write-only public client keys. The environment
// override makes rotation possible without a binary release.
const key = process.env.EXPO_PUBLIC_POSTHOG_KEY
  ?? 'phc_zNZ3tkdhh2x5rihfRz3v9C5TaTipKddzqRYucKbe5wgg';
const client = key
  ? new PostHog(key, {
      host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
      enableSessionReplay: false,
    })
  : null;

client?.register({
  app: 'teag.me',
  platform: 'mobile',
  environment: __DEV__ ? 'development' : 'production',
});

export function capture(event: string, properties?: Record<string, AnalyticsValue>) {
  client?.capture(event, properties);
}

export function identify(userId: string) {
  client?.identify(userId);
}

export function resetAnalytics() {
  client?.reset();
}
