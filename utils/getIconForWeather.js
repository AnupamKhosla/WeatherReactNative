// /mnt/data/getIconForWeather.js
const iconsDay = {
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

const iconsNight = {
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

export default function getIconForWeather(weatherLabel, isDay = true) {
  if (isDay) return iconsDay[weatherLabel] || '❓';
  return iconsNight[weatherLabel] || '🌙';
}
