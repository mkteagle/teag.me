import PostHog from 'posthog-react-native';

type AnalyticsValue = string | number | boolean | null;

const key = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const client = key
  ? new PostHog(key, {
      host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
      enableSessionReplay: false,
    })
  : null;

export function capture(event: string, properties?: Record<string, AnalyticsValue>) {
  client?.capture(event, properties);
}

export function identify(userId: string) {
  client?.identify(userId);
}

export function resetAnalytics() {
  client?.reset();
}
