import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { BlurTargetView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import SearchInput from '../components/SearchInput';
import GlassCard from '../components/GlassCard';
import { getCityName } from '../utils/getCityName';
import { getWeather2, type WeatherResult } from '../utils/api';
import getThemeForWeather, { DEFAULT_THEME } from '../utils/getThemeForWeather';

const DEFAULT_CITY = 'New York';

export default function WeatherScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<WeatherResult | null>(null);

  const blurTarget = useRef<View | null>(null);

  const theme = data ? getThemeForWeather(data.weather, data.hour) : DEFAULT_THEME;

  const handleUpdateLocation = async (city: string) => {
    if (!city) return;
    setLoading(true);
    try {
      const result = await getWeather2(city);
      setData(result);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          handleUpdateLocation(DEFAULT_CITY);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        if (!loc?.coords) {
          handleUpdateLocation(DEFAULT_CITY);
          return;
        }

        const cityName = await getCityName(loc.coords.latitude, loc.coords.longitude);
        handleUpdateLocation(cityName || DEFAULT_CITY);
      } catch {
        handleUpdateLocation(DEFAULT_CITY);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <BlurTargetView ref={blurTarget} style={StyleSheet.absoluteFill}>
        <LinearGradient colors={theme.sky} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={theme.overlay} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.mountainLayer]}>
          <Image
            source={require('../assets/bg.png')}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        </View>
      </BlurTargetView>

      <View style={styles.detailsContainer}>
        <ActivityIndicator animating={loading} color="white" size="large" />

        {!loading && (
          <View>
            {error || !data ? (
              <GlassCard tint="dark" intensity={90} blurTarget={blurTarget} style={styles.weatherCard}>
                <Text style={[styles.smallText, styles.textStyle]}>
                  Could not load your city or weather. Please try again later...
                </Text>
              </GlassCard>
            ) : (
              <GlassCard tint="dark" intensity={90} blurTarget={blurTarget} style={styles.weatherCard}>
                <Text style={[styles.largeText, styles.textStyle]}>
                  {data.icon} {data.location}
                </Text>
                <Text style={[styles.smallText, styles.textStyle]}>{data.weather}</Text>
                <Text style={[styles.largeText, styles.textStyle]}>{data.temperature}°</Text>
              </GlassCard>
            )}

            <View style={styles.searchCard}>
              <SearchInput
                placeholder="Search any city"
                onSubmit={handleUpdateLocation}
                blurTarget={blurTarget}
              />
            </View>

            {!error && data && (
              <Text style={[styles.smallText, styles.textStyle, styles.subtitle]}>
                Live at {data.created} {data.location}
              </Text>
            )}
          </View>
        )}
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
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  textStyle: {
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'Roboto',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  largeText: {
    fontSize: 44,
  },
  smallText: {
    fontSize: 18,
  },
  subtitle: {
    marginTop: 10,
  },
  weatherCard: {
    marginVertical: 12,
  },
  searchCard: {
    marginTop: 20,
  },
});
