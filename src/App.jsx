import { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);

  const getWeather = async () => {
    if (!city.trim()) return;

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
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
        temp: Math.round(weatherData.current.temperature_2m),
        humidity: weatherData.current.relative_humidity_2m,
        wind: weatherData.current.wind_speed_10m,
      });
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

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
            <h1>⛅{weather.temp}°C</h1>
            <h2>{weather.city}</h2>

            <div className="details">
              <div className="box">
                <h3>🌧️{weather.humidity}%</h3>
                <p>Humidity</p>
              </div>

              <div className="box">
                <h3>🌪️{weather.wind} km/h</h3>
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