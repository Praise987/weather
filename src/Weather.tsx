import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Fade,
  Divider,
} from "@mui/material";

import foggyday from "./assets/foggyday.jpg";
import Thunderstorm from "./assets/Thunderstorm.jpg";
import cloudy from "./assets/cloudy.jpg";
import rainyday from "./assets/rainyday.jpg";
import sunnyday from "./assets/sunnyday.jpg";
import snowyday from "./assets/snowyday.jpg";

type WeatherData = {
  temperature: number;
  windspeed: number;
  weathercode: number;
  time: string;
};

type ForecastDay = {
  time: string;
  max: number;
  min: number;
};

function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getBackground = (code?: number) => {
    if (code === undefined) return `url(${sunnyday})`;

    if (code === 0) return `url(${sunnyday})`;
    if (code >= 1 && code <= 3) return `url(${cloudy})`;
    if (code === 45 || code === 48) return `url(${foggyday})`;
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
      return `url(${rainyday})`;
    if (code >= 71 && code <= 77) return `url(${snowyday})`;
    if (code >= 95) return `url(${Thunderstorm})`;

    return `url(${sunnyday})`;
  };

  const fetchWeather = async () => {
    if (!city.trim()) return;

    setLoading(true);
    setError("");
    setWeather(null);
    setForecast([]);

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`,
      );
      const geoData = await geoRes.json();

      if (!geoData.results?.length) {
        throw new Error("State/City Not Found!");
      }

      const { latitude, longitude } = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${latitude}&longitude=${longitude}` +
          `&current_weather=true` +
          `&daily=temperature_2m_max,temperature_2m_min` +
          `&timezone=auto`,
      );

      const data = await weatherRes.json();

      setWeather({
        temperature: data.current_weather.temperature,
        windspeed: data.current_weather.windspeed,
        weathercode: data.current_weather.weathercode ?? 0,
        time: data.current_weather.time,
      });

      const days: ForecastDay[] = data.daily.time.map(
        (t: string, i: number) => ({
          time: t,
          max: data.daily.temperature_2m_max[i],
          min: data.daily.temperature_2m_min[i],
        }),
      );

      setForecast(days.slice(0, 7));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error! Please try again later.";

      setError(message);
    }
  };

  return (
    <Box
      key={weather?.weathercode}
      sx={{
        width: "100vw",
        height: "100vh",
        backgroundImage: getBackground(weather?.weathercode),
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        margin: 0,
      }}
    >
      <Card
        sx={{
          width: "350px",
          minHeight: "500px",
          borderRadius: 6,
          background: "#ffffff",
          textAlign: "center",
        }}
      >
        <CardContent>
          <Typography sx={{ mt: 2, mb: 2, fontWeight: 800, fontSize: "20px" }}>
            WEATHER TODAY
          </Typography>

          <TextField
            fullWidth
            label="Enter State or City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            sx={{ mt: 2 }}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={fetchWeather}
            disabled={loading}
          >
            {loading ? "Loading..." : "Search"}
          </Button>

          {error && (
            <Typography sx={{ mt: 2, color: "red" }}>{error}</Typography>
          )}

          <Fade in={!!weather && !loading}>
            <Box sx={{ mt: 3 }}>
              {weather && (
                <>
                  <Typography variant="h6">
                    Temperature: {weather.temperature}
                    <sup>°</sup>C
                  </Typography>
                  <Typography>Windspeed: {weather.windspeed} km/h</Typography>
                  <Typography variant="caption">{weather.time}</Typography>
                </>
              )}
            </Box>
          </Fade>

          {forecast.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
             <Typography sx={{ fontWeight: 600 }}>
               7 Days Forecast
               </Typography>
               
              {forecast.map((day) => (
                <Box
                  key={day.time}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    px: 1,
                    py: 0.5,
                  }}
                >
                  <Typography>
                    {new Date(day.time).toDateString().slice(0, 10)}
                  </Typography>
                  <Typography>
                    {day.max} / {day.min}
                  </Typography>
                </Box>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Weather;
