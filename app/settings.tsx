import { useRef } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { BlurTargetView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../components/GlassCard';
import { DEFAULT_THEME } from '../utils/getThemeForWeather';

export default function SettingsScreen() {
  const blurTarget = useRef<View | null>(null);

  return (
    <View style={styles.container}>
      <BlurTargetView ref={blurTarget} style={StyleSheet.absoluteFill}>
        <LinearGradient colors={DEFAULT_THEME.sky} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={DEFAULT_THEME.overlay} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.mountainLayer]}>
          <Image
            source={require('../assets/bg.png')}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        </View>
      </BlurTargetView>

      <View style={styles.content}>
        <GlassCard tint="dark" intensity={90} blurTarget={blurTarget} style={styles.card}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Coming soon</Text>
        </GlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#34495E',
  },
  mountainLayer: {
    opacity: 0.95,
    mixBlendMode: Platform.OS === 'ios' ? 'luminosity' : 'multiply',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
});
