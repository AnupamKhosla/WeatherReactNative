import { BlurView } from 'expo-blur';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { ReactNode, RefObject } from 'react';

type GlassTint = 'light' | 'dark' | 'default';

type GlassCardProps = {
  children: ReactNode;
  blurTarget?: RefObject<View | null>;
  intensity?: number;
  tint?: GlassTint;
  radius?: number;
  padding?: number;
  style?: StyleProp<ViewStyle>;
};

export default function GlassCard({
  children,
  blurTarget,
  intensity = 60,
  tint = 'light',
  radius = 16,
  padding = 16,
  style,
}: GlassCardProps) {
  return (
    <View style={[styles.outer, { borderRadius: radius }, style]}>
      <BlurView
        intensity={intensity}
        tint={tint}
        blurMethod="dimezisBlurViewSdk31Plus"
        blurReductionFactor={4}
        blurTarget={blurTarget}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.content, { padding }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  content: {
    padding: 16,
  },
});
