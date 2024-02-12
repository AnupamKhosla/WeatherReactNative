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

import SearchInput from './SearchInput.js'; // Search component
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

  //give be useEffect
  useEffect(()=>{
    handleUpdateLocation("New york"); //default city weather delhi   
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