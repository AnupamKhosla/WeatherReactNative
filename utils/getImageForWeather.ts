// Maps a weather vocabulary label → its background image asset.
// Currently unused by the UI (App renders a single bg.png), but kept for the
// planned per-weather backgrounds feature.
//
// Assets are imported lazily via the lookup so a missing file doesn't crash the
// whole app at import time. Returns null if there's no image for the label.

import type { ImageSourcePropType } from 'react-native';

const images: Record<string, ImageSourcePropType> = {
  // NOTE: these files are not yet present in /assets. Uncomment/require when added.
  // Clear: require('../assets/clear.png'),
  // Hail: require('../assets/hail.png'),
  // 'Heavy Cloud': require('../assets/heavy-cloud.png'),
  // 'Light Cloud': require('../assets/light-cloud.png'),
  // 'Heavy Rain': require('../assets/heavy-rain.png'),
  // 'Light Rain': require('../assets/light-rain.png'),
  // Showers: require('../assets/showers.png'),
  // Sleet: require('../assets/sleet.png'),
  // Snow: require('../assets/snow.png'),
  // Thunder: require('../assets/thunder.png'),
};

export default function getImageForWeather(
  weather: string,
): ImageSourcePropType | null {
  return images[weather] ?? null;
}
