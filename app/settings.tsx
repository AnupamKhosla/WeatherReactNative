import { StyleSheet, Text, View } from 'react-native';
import GlassCard from '../components/GlassCard';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <GlassCard tint="dark" style={styles.card}>
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
