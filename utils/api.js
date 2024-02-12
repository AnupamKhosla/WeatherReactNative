/**
 * Only ES6 =))))
 *
 * GET iD current location
 * Example ``RESPONSE``:
 * URi: " https://www.metaweather.com/api/location/search/?query=London "
 *
   [
      {
        "title": "London",
        "location_type": "City",
        "woeid": 44418,
        "latt_long": "51.506321,-0.12714"
      }
  ]
 *
  */


// export const getLocationId = async city => {

//   const response = await fetch(
//     `https://www.metaweather.com/api/location/search/?query=${city}`,
//   );

//   const r = await response.json();

//   return r[0].woeid;
// };



/*
 * GEt WEATHER by current Location <<< iD  >>>
 * Example ``RESPONSE``:
 * URi: " https://www.metaweather.com/api/location/924938/ "
 *
  [
    {
      "consolidated_weather": [
      {
        "id": 5364180358004736,

        "weather_state_name": "Heavy Cloud", // << WEATHER

        "weather_state_abbr": "hc",
        "wind_direction_compass": "WSW",

        "created": "2018-08-21T06:09:14.113170Z", // << CREATED

        "applicable_date": "2018-08-21",
        "min_temp": 16.8,
        "max_temp": 27.63333333333333,

        "the_temp": 27.45, // << The TEMPERATURE

        "wind_speed": 4.406190471627032,
        "wind_direction": 246.7213559823457,
        "air_pressure": 1014.44,
        "humidity": 59,
        "visibility": 14.79546945836316,
        "predictability": 71
      },
      ...
  ]
 *
 */




// export const getWeather = async woeid => {

//   const response = await fetch(
//     `https://www.metaweather.com/api/location/${woeid}/`
//   );

//   let { title, consolidated_weather } = await response.json();
//   let { weather_state_name, the_temp, created } = consolidated_weather[0];

//   return {
//     location: title,
//     weather: weather_state_name,
//     temperature: the_temp,
//     created: created
//   };
// };




// Anupam khosla Jan 22 2024 new code based upon https://wttr.in/London?format=j1 api  
// Original https://github.com/rymaruk/reactnative-weather used metaweather api, which has been commercialized  

export const getWeather2 = async (city_name) => {
  let response = await fetch(
    `https://wttr.in/${city_name}?format=j1`
  );
  let icon_response = await fetch(`https://wttr.in/${city_name}?format=1`);
  let icon = await icon_response.text();
  icon = icon.split(" ")[0];

  let { current_condition, nearest_area } = await response.json(); //already json

  let { temp_C, FeelsLikeC, weatherDesc, observation_time } = current_condition[0];
  let areaName = nearest_area[0].areaName[0].value;
  
  return {
    location: areaName,
    weather: weatherDesc[0].value,
    temperature: temp_C,    
    created: observation_time,
    icon: icon
  };
}

//https://wttr.in/London?format=j1