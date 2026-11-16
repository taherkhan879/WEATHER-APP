import { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [unit, setUnit] = useState("C");

  // Search weather by city
  const getWeather = async () => {
    if (!city.trim()) return;

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );

      const geoData = await geoRes.json();

      if (!geoData.results) {
        alert("City not found");
        return;
      }

      const { latitude, longitude, name } = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`
      );

      const weatherData = await weatherRes.json();

      setWeather({
        city: name,
        temp: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        wind: weatherData.current.wind_speed_10m,
      });

    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  // Get current location weather
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          // Get city name from coordinates
const locationResponse = await fetch(
  `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
);

const locationData = await locationResponse.json();

const cityName =
  locationData.address?.city ||
  locationData.address?.town ||
  locationData.address?.village ||
  locationData.address?.municipality ||
  locationData.address?.suburb ||
  locationData.address?.county ||
  "Your Current Location";

          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`
          );

          if (!response.ok) {
            throw new Error("Weather API request failed");
          }

          const data = await response.json();

         setWeather({
  city: cityName,
  temp: data.current.temperature_2m,
  humidity: data.current.relative_humidity_2m,
  wind: data.current.wind_speed_10m,
});

        } catch (error) {
          console.error(error);
          alert("Unable to fetch weather data.");
        }
      },

      (error) => {
        console.error(error);

        if (error.code === 1) {
          alert("Please allow location permission.");
        } else if (error.code === 2) {
          alert("Location unavailable.");
        } else {
          alert("Location request timed out.");
        }
      },

      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  // Celsius and Fahrenheit conversion
  const convertTemperature = () => {
    setUnit(unit === "C" ? "F" : "C");
  };

  const temperature =
    weather &&
    (unit === "C"
      ? Math.round(weather.temp)
      : Math.round((weather.temp * 9) / 5 + 32));

  return (
    <div className="container">
      <div className="card">

        <div className="search">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getWeather()}
          />

          <button onClick={getWeather}>🔍</button>
        </div>

        {/* Current Location Button */}
        <button
          className="location-button"
          onClick={getCurrentLocation}
        >
          📍 Use My Current Location
        </button>

        {weather && (
          <div className="weather">

            <h1>
              ⛅ {temperature}°{unit}
            </h1>

            <button
              className="unit-button"
              onClick={convertTemperature}
            >
              Switch to {unit === "C" ? "°F" : "°C"}
            </button>

            <h2>{weather.city}</h2>

            <div className="details">

              <div className="box">
                <h3>🌧️ {weather.humidity}%</h3>
                <p>Humidity</p>
              </div>

              <div className="box">
                <h3>🌪️ {weather.wind} km/h</h3>
                <p>Wind Speed</p>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;