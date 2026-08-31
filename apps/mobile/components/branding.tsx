import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, MONO } from '../lib/theme';

// Brand wordmark "teag.me" — system bold with tight tracking to stand in for Sora.
export function Wordmark({ size = 17 }: { size?: number }) {
  return (
    <Text style={[styles.wordmark, { fontSize: size }]} allowFontScaling={false}>
      teag.me
    </Text>
  );
}

// Mono uppercase QR CODE tag, blue, optionally outlined.
export function ScannerTag({ size = 8, outlined = false }: { size?: number; outlined?: boolean }) {
  return (
    <Text
      style={[
        styles.scannerTag,
        { fontSize: size, letterSpacing: size * 0.2 },
        outlined && styles.scannerTagOutlined,
      ]}
      allowFontScaling={false}
    >
      QR CODE
    </Text>
  );
}

export function Wordmarks({ size = 17, outlined = false }: { size?: number; outlined?: boolean }) {
  return (
    <View style={styles.row}>
      <Wordmark size={size} />
      <ScannerTag size={Math.round(size * 0.5)} outlined={outlined} />
    </View>
  );
}

// Logo mark: a rounded blue tile with the tag/dot motif approximated from primitives
// (no react-native-svg in this project). Crisp at small sizes.
export function LogoTile({ size = 72 }: { size?: number }) {
  const r = size * 0.28;
  return (
    <View style={[styles.logoTile, { width: size, height: size, borderRadius: r }]}>
      {/* tag silhouette */}
      <View
        style={{
          width: size * 0.46,
          height: size * 0.46,
          borderRadius: size * 0.12,
          backgroundColor: colors.phoneBody,
          transform: [{ rotate: '0deg' }],
        }}
      />
      {/* signal dot */}
      <View
        style={{
          position: 'absolute',
          width: size * 0.13,
          height: size * 0.13,
          borderRadius: size * 0.07,
          backgroundColor: colors.accent,
        }}
      />
      {/* orange corner dot */}
      <View
        style={{
          position: 'absolute',
          right: size * 0.12,
          bottom: size * 0.12,
          width: size * 0.2,
          height: size * 0.2,
          borderRadius: size * 0.1,
          backgroundColor: colors.orange,
          borderWidth: size * 0.04,
          borderColor: colors.phoneBody,
        }}
      />
    </View>
  );
}

// A blue dot that gently pulses (mimics the CSS teagPulse 1.6s loop).
export function PulsingDot({
  size = 7,
  color = colors.accent,
  style,
}: {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] });

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [{ scale }],
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  wordmark: {
    color: colors.white,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scannerTag: {
    color: colors.accent,
    fontFamily: MONO,
    fontWeight: '600',
  },
  scannerTagOutlined: {
    borderWidth: 1,
    borderColor: 'rgba(15,123,255,0.4)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    overflow: 'hidden',
  },
  logoTile: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
