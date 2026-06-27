import { Platform } from 'react-native';

// Brand tokens for the dark, camera-first scanner surface.
export const colors = {
  accent: '#0F7BFF', // primary blue
  orange: '#FF8A3D', // sparing signal accent
  verdantGreen: '#34D17F', // safety-check verdict
  phoneBody: '#0A0A0A',
  sheet: '#141414',
  sheetBorder: '#262626',
  chip: '#1F1F22',
  chipBorder: '#2E2E31',
  page: '#1C1C1E',
  white: '#FFFDF8',
  pureWhite: '#fff',
  grabber: '#3A3A3C',
  muted: '#737373',
  mutedCool: '#9AA1AE',
  mutedLabel: '#8A909C',
  faint: '#5A606C',
} as const;

// RN has no Sora / JetBrains Mono by default. Fall back to the platform mono
// face for utility labels, and use weighted system bold for wordmarks.
export const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });
