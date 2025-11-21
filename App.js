import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator  
} from 'react-native';
import * as Location from 'expo-location';

import SearchInput from './components/SearchInput.js'; // Search component
import { getWeather2 } from './utils/api';






export default function App() { //function hook

  //STATE
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [location, setLocation] = useState('');
  const [temperature, setTemperature] = useState(0);
  const [weather, setWeather] = useState('');
  const [icon, setIcon] = useState('');

  //get current time according to current location
  const currentTime = new Date().toLocaleTimeString();

  const [created, setCreated] = useState(currentTime);
  //const [created, setCreated] = useState(currentTime); 
  //FUNCTIONS
  const handleUpdateLocation = async (city) => {    
    if (!city) return;
    setLoading(true);
    try {            
      const { location, weather, temperature, created, icon } = await getWeather2(city);

      setLoading(false);
      setError(false);
      setLocation(location);
      setWeather(weather);
      setTemperature(temperature);
      setCreated(created);
      setIcon(icon);
    } catch (e) {
      setLoading(false);
      setError(true);
    }    
  };

  //grab curr location or fallback on load
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          console.log("[DEBUG] Permission denied → fallback city");
          console.log("[Fetching New York weather]");
          handleUpdateLocation("New York");
          return;
        }
        console.log("[DEBUG] Fetching GPS location...");
        const loc = await Location.getCurrentPositionAsync({});
        console.log("[DEBUG] Raw GPS location:", loc);

        if (!loc || !loc.coords) {
          console.log("[DEBUG] loc is null/undefined → fallback city");
          console.log("[Fetching New York weather]");
          handleUpdateLocation("New York");
          return;
        }
        console.log("[DEBUG] Reverse geocoding...");
        const geo = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        console.log("[DEBUG] Raw geocode data:", geo);

        if (!geo || geo.length === 0) {
          console.log("[DEBUG] geocode failed (empty array) → fallback city");
          console.log("[Fetching New York weather]");
          handleUpdateLocation("New York");
          return;
        }

        const city = geo[0]?.city || geo[0]?.subregion;
        console.log("[DEBUG] Parsed city:", city);

        if (!city) {
          console.log("[DEBUG] No city in geocode → fallback city");
          handleUpdateLocation("New York");
          return;
        }

        handleUpdateLocation(city);

      } catch (e) {
        console.log("[DEBUG] Location error → fallback city:", e);
        console.log("[Fetching New York weather]");
        handleUpdateLocation("New York");
      }
    })();
  }, []);




  return (
    <View style={styles.container} behavior="padding"> 
      {/*View is buggy, creates whitespace above keyboard on android*/}
      <StatusBar barStyle="light-content" />
      
      <ImageBackground
        source={require('./assets/bg.png')} // change to function getImageForWeather(weather) later
        style={styles.imageContainer}
        imageStyle={styles.image}

      >
        <View style={styles.detailsContainer}>           
          <ActivityIndicator animating={loading} color="white" size="large" />
            
             {!loading && (
                <View> 
                  {error && (
                    <Text style={[styles.smallText, styles.textStyle]}>
                      😞 Could not load your city or weather. Please try again later...
                    </Text>
                  )}
                  {!error && (
                    <View>
                      <Text style={[styles.largeText, styles.textStyle]}>
                        {icon} {location}
                      </Text>
                      <Text style={[styles.smallText, styles.textStyle]}>
                         {weather}
                      </Text>
                      <Text style={[styles.largeText, styles.textStyle]}>
                        {`${Math.round(temperature)}°`}
                      </Text>
                    </View>
                  )}
                  <SearchInput
                    placeholder="Search any city"
                    onSubmit={handleUpdateLocation}
                  />
                  {!error && (
                    <Text style={[styles.smallText, styles.textStyle]}>
                      Last update: {created}
                    </Text>
                  )}
                </View>
              )}           
        </View>
      </ImageBackground>

     
    </View>
  );
}



/* StyleSheet */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#34495E',
    justifyContent: 'start',
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover',
    opacity: 0.5,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 20,
  },
  textStyle: {
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'Roboto',
    color: 'white',
  },
  largeText: {
    fontSize: 44,
  },
  smallText: {
    fontSize: 18,
  },
});