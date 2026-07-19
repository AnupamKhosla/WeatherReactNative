// Weather vocabulary → emoji glyph, split by day/night.
// Caller passes a label produced by api.ts (e.g. "Clear", "Heavy Rain").

const iconsDay: Record<string, string> = {
  Clear: '☀️',
  Hail: '⛆',
  'Heavy Cloud': '☁️',
  'Light Cloud': '⛅',
  'Heavy Rain': '⛈️',
  'Light Rain': '🌧️',
  Showers: '🌧️',
  Sleet: '🌨️',
  Snow: '❄️',
  Thunder: '⛈️',
};

const iconsNight: Record<string, string> = {
  Clear: '🌙',
  Hail: '⛈️',
  'Heavy Cloud': '☁️',
  'Light Cloud': '☁️',
  'Heavy Rain': '🌩️',
  'Light Rain': '🌧️',
  Showers: '🌧️',
  Sleet: '🌨️',
  Snow: '❄️',
  Thunder: '🌩️',
};

export default function getIconForWeather(
  weatherLabel: string,
  isDay = true,
): string {
  if (isDay) return iconsDay[weatherLabel] ?? '❓';
  return iconsNight[weatherLabel] ?? '🌙';
}
