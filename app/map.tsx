import { Component, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { BlurTargetView, BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SearchInput from '../components/SearchInput';
import GlassCard from '../components/GlassCard';
import { getCityName } from '../utils/getCityName';
import {
  geocodeCity,
  getWeather2,
  type GeoPoint,
  type WeatherResult,
} from '../utils/api';
import getThemeForWeather, { DEFAULT_THEME } from '../utils/getThemeForWeather';

const textShadow = {
  textShadowColor: 'rgba(0,0,0,0.5)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
};

function accentFor(weather: string): string {
  if (weather.includes('Clear')) return '#ffd479';
  if (weather.includes('Cloud')) return '#cfd8e3';
  if (weather.includes('Rain') || weather.includes('Shower')) return '#7fb6ff';
  if (weather.includes('Snow')) return '#eaf2ff';
  if (weather.includes('Thunder')) return '#b69bff';
  if (weather.includes('Hail')) return '#cfe9ff';
  return '#8fd3ff';
}

function useMaps() {
  const [mod, setMod] = useState<any>(null);
  useEffect(() => {
    let alive = true;
    try {
      const m = require('react-native-maps') as any;
      if (alive) setMod(m);
    } catch {
      // native module not linked yet → stay null, render the fallback panel
    }
    return () => {
      alive = false;
    };
  }, []);
  return mod;
}

type BoundaryProps = { children: ReactNode; fallback: ReactNode };
type BoundaryState = { hasError: boolean };

class MapErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };
  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }
  componentDidCatch() {}
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

async function resolveCoords(): Promise<GeoPoint> {
  try {
    const pos = await Location.getCurrentPositionAsync({});
    const name =
      (await getCityName(pos.coords.latitude, pos.coords.longitude)) ||
      'New York';
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      name,
    };
  } catch {
    return geocodeCity('New York');
  }
}

const SPAN = { latitudeDelta: 0.06, longitudeDelta: 0.06 };

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const blurTarget = useRef<View | null>(null);
  const mapRef = useRef<any>(null);
  const Maps = useMaps();

  const [coords, setCoords] = useState<GeoPoint | null>(null);
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [perm, setPerm] = useState(false);

  const pulse = useRef(new Animated.Value(0)).current;
  const chipAnim = useRef(new Animated.Value(0)).current;

  const theme = weather
    ? getThemeForWeather(weather.weather, weather.hour)
    : DEFAULT_THEME;
  const accent = weather ? accentFor(weather.weather) : '#8fd3ff';

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    if (!weather) return;
    chipAnim.setValue(0);
    Animated.spring(chipAnim, {
      toValue: 1,
      friction: 7,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [weather, chipAnim]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setPerm(status === 'granted');
        const point = await resolveCoords();
        const w = await getWeather2(point.name).catch(() => null);
        setCoords(point);
        setWeather(w);
      } catch {
        // network / location unavailable — leave the locating state
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const flyTo = (point: GeoPoint) => {
    mapRef.current?.animateToRegion(
      { latitude: point.latitude, longitude: point.longitude, ...SPAN },
      900,
    );
  };

  const onSubmit = async (text: string) => {
    if (!text) return;
    setLoading(true);
    try {
      const point = await geocodeCity(text);
      const w = await getWeather2(point.name).catch(() => null);
      setCoords(point);
      setWeather(w);
      flyTo(point);
    } catch {
      // unknown city — keep the current view
    } finally {
      setLoading(false);
    }
  };

  const onLocate = async () => {
    setLoading(true);
    try {
      const point = await resolveCoords();
      const w = await getWeather2(point.name).catch(() => null);
      setCoords(point);
      setWeather(w);
      flyTo(point);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const rebuildPanel = (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={theme.sky} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={theme.overlay} style={StyleSheet.absoluteFill} />
      <View style={styles.centered}>
        <GlassCard
          tint="dark"
          intensity={80}
          blurTarget={blurTarget}
          style={styles.panelCard}
        >
          <Text style={[styles.panelTitle, textShadow]}>Live map</Text>
          <Text style={[styles.panelBody, textShadow]}>
            The street map needs a native rebuild to render here. Open this
            build in Expo Go to see it now without rebuilding.
          </Text>
        </GlassCard>
      </View>
    </View>
  );

  const loadingView = (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={theme.sky} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={theme.overlay} style={StyleSheet.absoluteFill} />
      <View style={styles.centered}>
        <ActivityIndicator color="white" size="large" />
        <Text style={[styles.panelBody, styles.locating, textShadow]}>
          Finding your city…
        </Text>
      </View>
    </View>
  );

  const mapLayer = !coords ? (
    loadingView
  ) : !Maps ? (
    rebuildPanel
  ) : (
    <MapErrorBoundary fallback={rebuildPanel}>
      <Maps.default
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: coords.latitude,
          longitude: coords.longitude,
          ...SPAN,
        }}
        userInterfaceStyle="dark"
        showsUserLocation={perm}
        showsMyLocationButton={false}
        pitchEnabled={false}
      >
        <Maps.Marker
          coordinate={{
            latitude: coords.latitude,
            longitude: coords.longitude,
          }}
          tracksViewChanges={false}
        >
          <View style={styles.pin}>
            <Animated.View
              style={[
                styles.pinPulse,
                {
                  borderColor: accent,
                  opacity: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.55, 0],
                  }),
                  transform: [
                    {
                      scale: pulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2.4],
                      }),
                    },
                  ],
                },
              ]}
            />
            <View style={styles.pinGlass}>
              <Text style={styles.pinEmoji}>{weather?.icon ?? '📍'}</Text>
            </View>
          </View>
        </Maps.Marker>
      </Maps.default>
    </MapErrorBoundary>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <BlurTargetView ref={blurTarget} style={StyleSheet.absoluteFill}>
        <LinearGradient colors={theme.sky} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={theme.overlay} style={StyleSheet.absoluteFill} />
      </BlurTargetView>

      {mapLayer}

      <LinearGradient
        colors={['rgba(8,12,20,0.6)', 'rgba(8,12,20,0)']}
        style={styles.topVig}
        pointerEvents="none"
      />

      <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
        <SearchInput
          placeholder="Search any city"
          onSubmit={onSubmit}
          blurTarget={blurTarget}
        />
        <Animated.View
          style={[
            styles.chip,
            {
              opacity: chipAnim,
              transform: [
                {
                  translateY: chipAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <BlurView
            intensity={70}
            tint="dark"
            blurReductionFactor={4}
            blurTarget={blurTarget}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.chipInner}>
            <View style={[styles.dot, { backgroundColor: accent }]} />
            <View style={styles.chipText}>
              <Text style={[styles.city, textShadow]} numberOfLines={1}>
                {weather?.location ?? coords?.name ?? '—'}
              </Text>
              <Text style={[styles.cond, textShadow]}>
                {(weather?.weather ?? 'Locating').toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.temp, textShadow]}>
              {weather ? `${weather.temperature}°` : '—'}
            </Text>
          </View>
        </Animated.View>
      </View>

      <Pressable
        onPress={onLocate}
        style={({ pressed }) => [styles.locate, pressed && styles.pressed]}
      >
        <BlurView
          intensity={70}
          tint="dark"
          blurReductionFactor={4}
          blurTarget={blurTarget}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.locateInner}>
          <View style={[styles.cross, { borderColor: accent }]} />
          <View style={[styles.crossDot, { backgroundColor: accent }]} />
        </View>
      </Pressable>

      {loading && (
        <View style={styles.loaderWrap} pointerEvents="none">
          <ActivityIndicator color="white" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0e1622',
  },
  topVig: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 240,
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  chip: {
    marginTop: 12,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.18)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  chipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  chipText: {
    flex: 1,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  city: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  cond: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 11,
    letterSpacing: 2.4,
    marginTop: 3,
  },
  temp: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  pin: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  pinGlass: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(13,19,30,0.55)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinEmoji: {
    fontSize: 20,
  },
  locate: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.22)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.92 }],
  },
  locateInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cross: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
  crossDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  loaderWrap: {
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  locating: {
    marginTop: 14,
  },
  panelCard: {
    width: '100%',
  },
  panelTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  panelBody: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
});
