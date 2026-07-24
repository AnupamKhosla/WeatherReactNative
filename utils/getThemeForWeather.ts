// Cinematic Tinted Landscape theme engine.
//
// The background behind the glass is built from two stacked gradients:
//   1. `sky`     — the weather condition's intrinsic mood color (deep + rich so
//                  white text and frosted glass pop).
//   2. `overlay` — a time-of-day veil with alpha baked into the stops, so dawn
//                  warms the horizon, night deepens everything, etc.
// Stacking (not a 9×4 lookup table) keeps this small while giving real depth,
// which is exactly what makes the glass frost look premium instead of flat.
//
// Inputs are our own stable vocabulary (`weather`) + a city-local `hour` that
// the data layer derives — no external shape leaks in here.

export type WeatherTheme = {
  sky: [string, string];
  overlay: [string, string];
};

const SKY: Record<string, [string, string]> = {
  Clear: ['#2E86C1', '#AED6F1'],
  'Light Cloud': ['#5DADE2', '#D6EAF8'],
  'Heavy Cloud': ['#3B4A5A', '#8597A8'],
  'Light Rain': ['#243B53', '#486581'],
  'Heavy Rain': ['#16243A', '#2C3E57'],
  Showers: ['#1F618D', '#76D7C4'],
  Snow: ['#2E86C1', '#AED6F1'],
  Thunder: ['#1B1430', '#4A235A'],
  Hail: ['#212F3D', '#7FB3D3'],
};

const FALLBACK_SKY: [string, string] = ['#243B55', '#141E30'];

function overlayForHour(hour: number): [string, string] {
  if (hour < 5 || hour >= 19) {
    return ['rgba(8,10,35,0.72)', 'rgba(20,24,60,0.5)']; // night
  }
  if (hour < 8) {
    return ['rgba(40,40,80,0.25)', 'rgba(255,138,76,0.5)']; // dawn
  }
  if (hour < 16) {
    return ['rgba(255,236,179,0.15)', 'rgba(255,255,255,0.0)']; // day
  }
  return ['rgba(60,30,80,0.35)', 'rgba(255,110,90,0.5)']; // dusk
}

export const DEFAULT_THEME: WeatherTheme = {
  sky: FALLBACK_SKY,
  overlay: overlayForHour(20),
};

export default function getThemeForWeather(
  weather: string,
  hour: number,
): WeatherTheme {
  return {
    sky: SKY[weather] ?? FALLBACK_SKY,
    overlay: overlayForHour(hour),
  };
}
