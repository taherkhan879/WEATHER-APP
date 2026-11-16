import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [unit, setUnit] = useState("C");
  const [forecast, setForecast] = useState(null);

  // Favourite cities
  const [favorites, setFavorites] = useState(() => {
    return JSON.parse(localStorage.getItem("favorites")) || [];
  });

  // Save favourites in localStorage
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Search weather by city
  const getWeather = async (searchCity = city) => {
    if (!searchCity.trim()) return;

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          searchCity
        )}&count=1`
      );

      const geoData = await geoRes.json();

      if (!geoData.results) {
        alert("City not found");
        return;
      }

      const { latitude, longitude, name } = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=5&timezone=auto`
      );

      if (!weatherRes.ok) {
        throw new Error("Weather API request failed");
      }

      const weatherData = await weatherRes.json();

      setWeather({
        city: name,
        temp: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        wind: weatherData.current.wind_speed_10m,
      });

      // Save 5-day forecast
      setForecast(weatherData.daily);

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
          let cityName = "Your Current Location";

          try {
            const locationResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            );

            const locationData = await locationResponse.json();

            cityName =
              locationData.address?.city ||
              locationData.address?.town ||
              locationData.address?.village ||
              locationData.address?.municipality ||
              locationData.address?.suburb ||
              locationData.address?.county ||
              "Your Current Location";
          } catch (locationError) {
            console.error("City name lookup failed:", locationError);
          }

          // Get weather and 5-day forecast
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=5&timezone=auto`
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

          // Save current location forecast
          setForecast(data.daily);

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

  // Add or remove favourite city
  const toggleFavorite = () => {
    if (!weather) return;

    if (favorites.includes(weather.city)) {
      setFavorites(
        favorites.filter((city) => city !== weather.city)
      );
    } else {
      setFavorites([...favorites, weather.city]);
    }
  };

  // Remove favourite city
  const removeFavorite = (cityToRemove) => {
    setFavorites(
      favorites.filter((city) => city !== cityToRemove)
    );
  };

  return (
    <div className="container">
      <div className="card">

        {/* City Search */}
        <div className="search">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getWeather()}
          />

          <button onClick={() => getWeather()}>🔍</button>
        </div>

        {/* Current Location Button */}
        <button
          className="location-button"
          onClick={getCurrentLocation}
        >
          📍 Use My Current Location
        </button>

        {/* Weather Information */}
        {weather && (
          <div className="weather">

            <h1>
              ⛅ {temperature}°{unit}
            </h1>

            {/* Temperature Conversion */}
            <button
              className="unit-button"
              onClick={convertTemperature}
            >
              Switch to {unit === "C" ? "°F" : "°C"}
            </button>

            {/* City Name and Favourite Button */}
            <div className="city-title">
              <h2>{weather.city}</h2>

              <button
                className="favorite-button"
                onClick={toggleFavorite}
              >
                {favorites.includes(weather.city) ? "⭐" : "☆"}
              </button>
            </div>

            {/* Humidity and Wind */}
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

            {/* 5-Day Forecast */}
            {forecast && (
              <div className="forecast">

                <h3>🌦️ 5-Day Forecast</h3>

                <div className="forecast-list">

                  {forecast.time.map((date, index) => {

                    const maxTemp =
                      unit === "C"
                        ? Math.round(
                            forecast.temperature_2m_max[index]
                          )
                        : Math.round(
                            (forecast.temperature_2m_max[index] * 9) / 5 + 32
                          );

                    const minTemp =
                      unit === "C"
                        ? Math.round(
                            forecast.temperature_2m_min[index]
                          )
                        : Math.round(
                            (forecast.temperature_2m_min[index] * 9) / 5 + 32
                          );

                    return (
                      <div className="forecast-card" key={date}>

                        <h4>
                          {new Date(
                            date + "T00:00:00"
                          ).toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </h4>

                        <p>
                          🌡️ {maxTemp}° / {minTemp}°{unit}
                        </p>

                      </div>
                    );
                  })}

                </div>
              </div>
            )}

          </div>
        )}

        {/* Favourite Cities */}
        {favorites.length > 0 && (
          <div className="favorites">

            <h3>⭐ Favourite Cities</h3>

            {favorites.map((favoriteCity, index) => (

              <div className="favorite-item" key={index}>

                <button
                  className="favorite-city"
                  onClick={() => getWeather(favoriteCity)}
                >
                  📍 {favoriteCity}
                </button>

                <button
                  className="remove-button"
                  onClick={() => removeFavorite(favoriteCity)}
                >
                  ❌
                </button>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default App;