import { BlurView } from 'expo-blur';
import { router, usePathname } from 'expo-router';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RefObject } from 'react';

type Tab = { name: string; path: string; label: string; icon: string };

const TABS: Tab[] = [
  { name: 'index', path: '/', label: 'Weather', icon: '☁️' },
  { name: 'settings', path: '/settings', label: 'Settings', icon: '⚙️' },
];

type GlassTabBarProps = {
  blurTarget?: RefObject<View | null>;
};

export default function GlassTabBar({ blurTarget }: GlassTabBarProps) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 16 }]}>
      <BlurView
        intensity={80}
        tint="dark"
        blurMethod="dimezisBlurViewSdk31Plus"
        blurReductionFactor={4}
        blurTarget={blurTarget}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, styles.sheen]} />
      <View style={styles.row}>
        {TABS.map((tab) => {
          const active = pathname === tab.path;
          return (
            <Pressable
              key={tab.name}
              onPress={() => router.navigate(tab.path as any)}
              style={styles.tab}
            >
              {active && <View style={[StyleSheet.absoluteFill, styles.activePill]} />}
              <Text style={styles.icon}>{tab.icon}</Text>
              <Text style={[styles.label, active && styles.labelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  sheen: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 24,
    margin: 6,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  labelActive: {
    color: '#fff',
    fontWeight: '700',
  },
});
