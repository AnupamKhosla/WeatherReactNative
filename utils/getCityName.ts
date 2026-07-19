import * as Location from 'expo-location';

// Reverse-geocode lat/long → a human city name string.
// Two-step fallback: BigDataCloud HTTP API first (usually gives the metro area,
// e.g. "Melbourne" instead of the suburb "Epping"), then Expo's native reverse
// geocoder as a backup.
//
// Returns null if both sources fail — caller decides the fallback city.
export const getCityName = async (
  latitude: number,
  longitude: number,
): Promise<string | null> => {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const response = await fetch(url);
    // External API shape is volatile → treat as a plain record and read
    // fields defensively. No strict interface; if they rename `city` we just
    // fall through to the next branch instead of a compile error lying to us.
    const data: Record<string, unknown> = await response.json();

    if (typeof data.city === 'string' && data.city) {
      return data.city;
    }
    if (typeof data.locality === 'string' && data.locality) {
      return data.locality;
    }
  } catch {
    console.log('BigDataCloud failed, falling back to Expo Native...');
  }

  try {
    const nativeGeo = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (nativeGeo && nativeGeo.length > 0) {
      const item = nativeGeo[0];
      // On Android/Expo, `city` is often the suburb and `subregion` the council.
      // There's no perfect fix for AU suburb-vs-metro on native, so take what we get.
      return item.city || item.name || null;
    }
  } catch {
    return null;
  }

  return null;
};
