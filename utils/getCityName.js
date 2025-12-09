import * as Location from 'expo-location';

export const getCityName = async (latitude, longitude) => {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const response = await fetch(url);
    const data = await response.json();

    // CRITICAL FIX: 
    // 1. Check 'city' first. BigDataCloud usually puts the Metro area here (e.g. "Melbourne")
    // 2. Only use 'locality' (e.g. "Epping") if 'city' is strictly empty.
    if (data.city) {
      return data.city;
    } else {
      return data.locality;
    }

  } catch (e) {
    console.log("BigDataCloud failed, falling back to Expo Native...");
  }

  // Fallback: Expo Native (This will likely still say Epping, but it's just a backup)
  try {
    const nativeGeo = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (nativeGeo && nativeGeo.length > 0) {
      const item = nativeGeo[0];
      // On Android/Expo, 'city' is often the suburb. 'subregion' is often the Council.
      // There is no perfect fix for native Expo in Australia, so we just return what we have.
      return item.city || item.name;
    }
  } catch (e) {
    return null;
  }
};