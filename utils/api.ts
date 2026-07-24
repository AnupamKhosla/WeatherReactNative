// Weather data layer.
//
// Source: Open-Meteo (free, no API key). wttr.in was previously used but proved
// unreliable; Open-Meteo has been stable through 2025.
//
// Typing policy (see project AGENTS/docs): the *external* JSON from Open-Meteo
// is treated as untyped/defensive — their schema can shift and we don't want
// compile-time lies. The *return* shape, however, is our internal contract with
// the UI, so it is typed tightly as `WeatherResult`.

import getIconForWeather from './getIconForWeather';

// Open-Meteo WMO weather codes → our simplified vocabulary.
// Full list: https://open-meteo.com/en/docs (weather_code field).
const weatherMap: Record<number, string> = {
  0: 'Clear',
  1: 'Light Cloud',
  2: 'Light Cloud',
  3: 'Heavy Cloud',
  45: 'Light Cloud',
  48: 'Light Cloud',
  51: 'Light Rain',
  53: 'Light Rain',
  55: 'Light Rain',
  61: 'Light Rain',
  63: 'Heavy Rain',
  65: 'Heavy Rain',
  71: 'Snow',
  73: 'Snow',
  75: 'Snow',
  77: 'Snow',
  80: 'Showers',
  81: 'Showers',
  82: 'Heavy Rain',
  95: 'Thunder',
  96: 'Hail',
  99: 'Hail',
};

// Internal, stable contract between this module and the UI.
// If the upstream API changes, we adapt inside getWeather2 so this shape never
// has to — the rest of the app depends only on these five fields.
export type WeatherResult = {
  location: string;
  weather: string;
  // Stored as a string already rounded to int, e.g. "21". Kept as string so the
  // UI can render `{temperature}°` without re-formatting.
  temperature: string;
  created: string;
  icon: string;
  // City-local hour (0-23), derived from the parsed forecast time. Owned by us
  // (not raw API), so the UI can theme the background by time of day without
  // ever touching external data.
  hour: number;
};

export const getWeather2 = async (cityName: string): Promise<WeatherResult> => {
  // 1) Geocoding: city name → lat/long.
  const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    cityName,
  )}&count=1&language=en&format=json`;

  const geoRes = await fetch(geoURL);
  const geoData: unknown = await geoRes.json();

  // Defensive navigation: `geoData?.results?.[0]` would throw at compile time on
  // `unknown`, so we narrow with a small helper.
  const firstResult = readFirstGeocodeResult(geoData);
  if (!firstResult) {
    throw new Error('City not found');
  }

  const { latitude, longitude, name } = firstResult;

  // 2) Forecast for those coords. timezone=auto → times come back in the
  //    location's local time, which makes the day/night + "live at HH:MM"
  //    logic below correct without device timezone gymnastics.
  const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;

  const weatherRes = await fetch(weatherURL);
  const weatherData: unknown = await weatherRes.json();

  const current = readCurrentWeather(weatherData);
  if (!current) {
    throw new Error('Weather not found');
  }

  const { temperature, weathercode, time } = current;

  // 3) WMO code → vocabulary.
  const mappedWeather = weatherMap[weathercode] ?? 'Clear';

  // 4) Derive day/night + a friendly local-time string for "Live at ...".
  //    Open-Meteo returns time as "YYYY-MM-DDTHH:MM" when timezone=auto.
  let isDay = true;
  let localHour = 12;
  let createdLocal = '';

  if (typeof time === 'string' && time.includes('T')) {
    const [, timePart] = time.split('T'); // "HH:MM" or "HH:MM:SS"
    const [hh, mm] = timePart.split(':');
    const hour = parseInt(hh, 10);
    const minute = parseInt(mm ?? '0', 10);

    isDay = hour >= 6 && hour < 19;

    const hour12 = ((hour + 11) % 12) + 1;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    createdLocal = `${hour12}:${String(minute).padStart(2, '0')} ${ampm}`;
  } else {
    // Fallback: format using the API's timezone if present, else device time.
    const tz = readTimezone(weatherData);
    try {
      createdLocal = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: tz,
      });
      const hourStr = new Date().toLocaleString('en-US', {
        hour: '2-digit',
        hour12: false,
        timeZone: tz,
      });
      const hourNum = parseInt(hourStr, 10);
      isDay = hourNum >= 6 && hourNum < 19;
      localHour = Number.isFinite(hourNum) ? hourNum : localHour;
    } catch {
      const now = new Date();
      const hour = now.getHours();
      isDay = hour >= 6 && hour < 19;
      localHour = hour;
    localHour = Number.isFinite(hour) ? hour : 12;
      createdLocal = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  }

  // 5) Pick day/night emoji glyph.
  const iconGlyph = getIconForWeather(mappedWeather, isDay);

  // 6) Hand back our stable internal shape.
  return {
    location: name,
    weather: mappedWeather,
    temperature: `${Math.round(temperature)}`,
    created: createdLocal,
    icon: iconGlyph,
    hour: localHour,
  };
};

// --- narrow helpers ---------------------------------------------------------
// Each of these takes `unknown` (the raw JSON) and returns the strongly-shaped
// piece we need, or null if the shape isn't what we expected. This is what
// "defensive access on untyped external data" looks like in practice: the cast
// happens once, in one place, behind a type guard, not scattered in app code.

type GeocodeResult = { latitude: number; longitude: number; name: string };

function readFirstGeocodeResult(data: unknown): GeocodeResult | null {
  if (typeof data !== 'object' || data === null) return null;
  const results = (data as { results?: unknown }).results;
  if (!Array.isArray(results) || results.length === 0) return null;
  const r = results[0];
  if (typeof r !== 'object' || r === null) return null;
  const obj = r as Record<string, unknown>;
  if (
    typeof obj.latitude === 'number' &&
    typeof obj.longitude === 'number' &&
    typeof obj.name === 'string'
  ) {
    return { latitude: obj.latitude, longitude: obj.longitude, name: obj.name };
  }
  return null;
}

type CurrentWeather = {
  temperature: number;
  weathercode: number;
  time: string;
};

function readCurrentWeather(data: unknown): CurrentWeather | null {
  if (typeof data !== 'object' || data === null) return null;
  const cw = (data as { current_weather?: unknown }).current_weather;
  if (typeof cw !== 'object' || cw === null) return null;
  const obj = cw as Record<string, unknown>;
  if (
    typeof obj.temperature === 'number' &&
    typeof obj.weathercode === 'number' &&
    typeof obj.time === 'string'
  ) {
    return {
      temperature: obj.temperature,
      weathercode: obj.weathercode,
      time: obj.time,
    };
  }
  return null;
}

function readTimezone(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null) return undefined;
  const tz = (data as { timezone?: unknown }).timezone;
  return typeof tz === 'string' ? tz : undefined;
}
