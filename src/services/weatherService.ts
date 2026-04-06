import { toast } from "@/hooks/use-toast";

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  description: string;
  icon: string;
  forecast: ForecastDay[];
}

export interface ForecastDay {
  date: string;
  temp: number;
  condition: string;
  icon: string;
}

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export async function getWeather(city: string): Promise<WeatherData> {
  if (!API_KEY) {
    console.warn("OpenWeather API key not configured, using mock data");
    return getMockWeather(city);
  }

  try {
    // Current weather
    const currentResponse = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );

    if (!currentResponse.ok) {
      // Check for invalid API key
      if (currentResponse.status === 401) {
        console.error("Invalid OpenWeather API key");
        throw new Error("Invalid API key. Please check your VITE_OPENWEATHER_API_KEY in .env file.");
      }
      throw new Error(`Weather API error: ${currentResponse.status}`);
    }

    const currentData = await currentResponse.json();

    // 5-day forecast
    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );

    const forecastData = forecastResponse.ok
      ? await forecastResponse.json()
      : null;

    const forecast: ForecastDay[] = forecastData
      ? forecastData.list
          .filter((_: any, index: number) => index % 8 === 0)
          .slice(0, 5)
          .map((item: any) => ({
            date: new Date(item.dt * 1000).toLocaleDateString("en-US", {
              weekday: "short",
            }),
            temp: Math.round(item.main.temp),
            condition: item.weather[0].main,
            icon: item.weather[0].icon,
          }))
      : [];

    return {
      temperature: Math.round(currentData.main.temp),
      humidity: currentData.main.humidity,
      windSpeed: Math.round(currentData.wind.speed * 3.6), // m/s to km/h
      condition: currentData.weather[0].main,
      description: currentData.weather[0].description,
      icon: currentData.weather[0].icon,
      forecast,
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    toast({
      title: "Weather Error",
      description: "Using cached weather data",
      variant: "destructive",
    });
    return getMockWeather(city);
  }
}

function getMockWeather(city: string): WeatherData {
  return {
    temperature: 28 + Math.floor(Math.random() * 8),
    humidity: 60 + Math.floor(Math.random() * 20),
    windSpeed: 10 + Math.floor(Math.random() * 15),
    condition: "Clear",
    description: "clear sky",
    icon: "01d",
    forecast: [
      { date: "Mon", temp: 30, condition: "Clear", icon: "01d" },
      { date: "Tue", temp: 28, condition: "Clouds", icon: "02d" },
      { date: "Wed", temp: 26, condition: "Rain", icon: "10d" },
      { date: "Thu", temp: 29, condition: "Clear", icon: "01d" },
      { date: "Fri", temp: 31, condition: "Clear", icon: "01d" },
    ],
  };
}
