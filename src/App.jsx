import { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [unit, setUnit] = useState("C");

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

  // Convert Celsius to Fahrenheit
  const convertTemperature = () => {
    if (unit === "C") {
      setUnit("F");
    } else {
      setUnit("C");
    }
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