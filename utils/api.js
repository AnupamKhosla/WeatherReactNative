// wttr servers are problematic and often down, so moving to Open-Meteo API 2025
// Completely new code based on Open-Meteo API 2025 Anupam khosla


import getIconForWeather from "./getIconForWeather";

// Mapping Open-Meteo codes → your weather vocabulary
const weatherMap = {
  0: "Clear",
  1: "Light Cloud",
  2: "Light Cloud",
  3: "Heavy Cloud",
  45: "Light Cloud",
  48: "Light Cloud",
  51: "Light Rain",
  53: "Light Rain",
  55: "Light Rain",
  61: "Light Rain",
  63: "Heavy Rain",
  65: "Heavy Rain",
  71: "Snow",
  73: "Snow",
  75: "Snow",
  77: "Snow",
  80: "Showers",
  81: "Showers",
  82: "Heavy Rain",
  95: "Thunder",
  96: "Hail",
  99: "Hail"
};

export const getWeather2 = async (city_name) => {
  // 1) Geocoding
  const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city_name)}&count=1&language=en&format=json`;

  const geoRes = await fetch(geoURL);
  const geoData = await geoRes.json();

  if (!geoData?.results?.length) {
    throw new Error("City not found");
  }

  const { latitude, longitude, name } = geoData.results[0];

  // 2) Fetch weather for these coordinates (timezone=auto returns times in that location's local time)
  const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;

  const weatherRes = await fetch(weatherURL);
  const weatherData = await weatherRes.json();

  if (!weatherData?.current_weather) {
    throw new Error("Weather not found");
  }

  const { temperature, weathercode, time } = weatherData.current_weather;

  // 3) Convert code → vocabulary
  const mappedWeather = weatherMap[weathercode] || "Clear";

  // 4) Determine local hour (time is returned in the location's local time when timezone=auto)
  //    Parse "YYYY-MM-DDTHH:MM" (Open-Meteo uses that format)
  let isDay = true;
  let createdLocal = "";

  if (typeof time === "string" && time.includes("T")) {
    const [, timePart] = time.split("T"); // "HH:MM" or "HH:MM:SS"
    const [hh, mm] = timePart.split(":");
    const hour = parseInt(hh, 10);
    const minute = parseInt(mm || "0", 10);

    // day range: 06:00 - 18:59
    isDay = hour >= 6 && hour < 19;

    // format to 12-hour AM/PM for that place
    const hour12 = ((hour + 11) % 12) + 1;
    const ampm = hour >= 12 ? "PM" : "AM";
    createdLocal = `${hour12}:${String(minute).padStart(2, "0")} ${ampm}`;
  } else {
    // fallback: attempt to format using timezone (if provided), else use device time with AM/PM
    const tz = weatherData.timezone || undefined;
    try {
      createdLocal = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: tz
      });
      // derive hour for isDay
      const hourStr = new Date().toLocaleString("en-US", {
        hour: "2-digit",
        hour12: false,
        timeZone: tz
      });
      const hourNum = parseInt(hourStr, 10);
      isDay = hourNum >= 6 && hourNum < 19;
    } catch (e) {
      // final fallback: device time
      const now = new Date();
      const hour = now.getHours();
      isDay = hour >= 6 && hour < 19;
      createdLocal = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    }
  }

  // 5) Get icon glyph for day/night
  const iconGlyph = getIconForWeather(mappedWeather, isDay);

  // 6) Return shape expected by UI
  return {
    location: name,
    weather: mappedWeather,
    temperature: `${Math.round(temperature)}`,
    created: createdLocal,
    icon: iconGlyph
  };
};