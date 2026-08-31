// App Store screenshot harness flag.
// Set SHOT to one of the keys to render that state full-screen for capture,
// then flip it back to null. null = the normal app (production default).
export type ShotKey = 'scan' | 'link' | 'history' | 'photo' | 'privacy';

const requestedShot = process.env.EXPO_PUBLIC_SCREENSHOT as ShotKey | undefined;

export const SHOT: ShotKey | null = requestedShot ?? null;
