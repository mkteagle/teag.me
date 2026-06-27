import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../lib/theme';

const SIZE = 220;
const CORNER = 40;
const TRAVEL = SIZE - 12; // scan-line vertical travel inside the reticle

// Corner-bracket reticle with an animated horizontal scan line sweeping inside it,
// mimicking the CSS `teagScanline` 2.6s ease-in-out loop.
export function Reticle() {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 1300, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 1300, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t]);

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [6, TRAVEL] });
  const opacity = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.35, 1, 0.35] });

  return (
    <View style={styles.reticle}>
      <View style={[styles.corner, styles.tl]} />
      <View style={[styles.corner, styles.tr]} />
      <View style={[styles.corner, styles.bl]} />
      <View style={[styles.corner, styles.br]} />
      <Animated.View style={[styles.scanline, { opacity, transform: [{ translateY }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  reticle: { width: SIZE, height: SIZE },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: colors.accent,
  },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 11 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 11 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 11 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 11 },
  scanline: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 0,
    height: 2,
    backgroundColor: colors.accent,
    borderRadius: 2,
    // Glow to stand in for the CSS box-shadow.
    shadowColor: colors.accent,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});
