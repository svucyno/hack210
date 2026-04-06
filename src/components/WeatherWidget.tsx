import { Cloud, Droplets, Wind, CloudRain, Sun, CloudSun, CloudLightning, Calendar, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getWeather } from "@/services/weatherService";

interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  description: string;
  icon: string;
  condition: string;
  forecast: { day: string; temp: number; icon: string; condition: string }[];
}

interface WeatherAlert {
  message: string;
  type: 'warning' | 'info' | 'danger';
}

function getWeatherIcon(icon: string) {
  if (icon.includes("01")) return Sun;
  if (icon.includes("02") || icon.includes("03")) return CloudSun;
  if (icon.includes("04")) return Cloud;
  if (icon.includes("09") || icon.includes("10")) return CloudRain;
  if (icon.includes("11")) return CloudLightning;
  return Cloud;
}

// Generate dynamic weather alert based on live conditions
function generateWeatherAlert(weather: WeatherData, location: string): WeatherAlert {
  const { condition, temp, humidity, windSpeed, description, forecast } = weather;
  
  // Check for rain in current or forecast
  const hasRain = condition.toLowerCase().includes('rain') || 
                  description.toLowerCase().includes('rain') ||
                  forecast.some(day => day.condition.toLowerCase().includes('rain'));
  
  const hasThunderstorm = condition.toLowerCase().includes('thunder') || 
                          description.toLowerCase().includes('thunder');
  
  const isHot = temp > 35;
  const isCold = temp < 15;
  const isHighHumidity = humidity > 80;
  const isHighWind = windSpeed > 30;
  
  // Priority-based alert generation
  if (hasThunderstorm) {
    return {
      message: `Thunderstorm alert in ${location}. Avoid outdoor farming activities.`,
      type: 'danger'
    };
  }
  
  if (hasRain) {
    return {
      message: `Rain expected in ${location}. Delay sowing and protect harvested crops.`,
      type: 'warning'
    };
  }
  
  if (isHot && isHighHumidity) {
    return {
      message: `High temperature (${temp}°C) and humidity in ${location}. Increase irrigation.`,
      type: 'warning'
    };
  }
  
  if (isHot) {
    return {
      message: `High temperature (${temp}°C) in ${location}. Ensure adequate irrigation.`,
      type: 'warning'
    };
  }
  
  if (isCold) {
    return {
      message: `Low temperature (${temp}°C) in ${location}. Protect sensitive crops.`,
      type: 'info'
    };
  }
  
  if (isHighWind) {
    return {
      message: `Strong winds (${windSpeed} km/h) in ${location}. Secure crops and equipment.`,
      type: 'warning'
    };
  }
  
  if (isHighHumidity) {
    return {
      message: `High humidity (${humidity}%) in ${location}. Monitor for fungal diseases.`,
      type: 'info'
    };
  }
  
  // Default favorable conditions
  return {
    message: `Favorable weather conditions in ${location}. Good for farming activities.`,
    type: 'info'
  };
}

// Configuration: Live weather for Chandragiri, Tirupati
const WEATHER_LOCATION = "Tirupati,IN";
const WEATHER_LOCATION_DISPLAY = "Chandragiri, Tirupati";

export default function WeatherWidget() {
  const { t } = useI18n();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherAlert, setWeatherAlert] = useState<WeatherAlert | null>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch live weather data
  useEffect(() => {
    async function fetchWeather() {
      try {
        console.log("Fetching live weather data for:", WEATHER_LOCATION);
        const serviceData = await getWeather(WEATHER_LOCATION);

        // Map weatherService's WeatherData to component's local state format
        const mappedWeather: WeatherData = {
          temp: serviceData.temperature,
          humidity: serviceData.humidity,
          windSpeed: serviceData.windSpeed,
          rainChance: 0, // OpenWeather doesn't provide rain chance directly
          description: serviceData.description,
          icon: serviceData.icon,
          condition: serviceData.condition,
          forecast: serviceData.forecast.map((item) => ({
            day: item.date,
            temp: item.temp,
            icon: item.icon,
            condition: item.condition,
          })),
        };
        
        setWeather(mappedWeather);
        
        // Generate dynamic weather alert based on live conditions
        const alert = generateWeatherAlert(mappedWeather, "Tirupati");
        setWeatherAlert(alert);
        
        console.log("Live weather data loaded successfully");
        console.log("Generated alert:", alert.message);
      } catch (e) {
        console.error("Weather fetch error:", e);
        // weatherService will return mock data on error
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
    
    // Refresh weather data every 10 minutes for live updates
    const weatherRefreshInterval = setInterval(fetchWeather, 10 * 60 * 1000);
    
    return () => clearInterval(weatherRefreshInterval);
  }, []);

  // Format date and time
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0 }}
        className="rounded-2xl bg-[#141e14] border border-emerald-500/10 p-4 col-span-full md:col-span-2 animate-pulse"
      >
        <div className="h-4 bg-secondary rounded w-24 mb-3" />
        <div className="h-12 bg-secondary rounded w-32 mb-4" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-secondary rounded flex-1" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!weather) return null;

  const WeatherIcon = getWeatherIcon(weather.icon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0 }}
      className="rounded-2xl bg-[#141e14] border border-emerald-500/10 hover:border-emerald-500/30 transition-colors duration-200 p-4 col-span-full md:col-span-2"
    >
      {/* Header with Location and Live Time/Date */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">{t("weather")}</h3>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">{WEATHER_LOCATION_DISPLAY}</div>
        </div>
      </div>

      {/* Live Date and Time */}
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar size={14} />
          <span>{formatDate(currentTime)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock size={14} />
          <span className="font-mono">{formatTime(currentTime)}</span>
        </div>
        <div className="ml-auto">
          <span className="inline-flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 font-medium">
            <span className="w-1.5 h-1.5 bg-green-600 dark:bg-green-400 rounded-full animate-pulse"></span>
            LIVE
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <WeatherIcon size={48} className="text-agri-warning" />
        <div>
          <div className="text-4xl font-bold text-foreground">{weather.temp}°C</div>
          <div className="text-sm text-muted-foreground capitalize">{weather.description}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-secondary rounded-xl p-2.5 text-center">
          <Droplets size={16} className="text-agri-info mx-auto mb-1" />
          <div className="text-xs text-muted-foreground">{t("humidity")}</div>
          <div className="text-sm font-semibold text-foreground">{weather.humidity}%</div>
        </div>
        <div className="bg-secondary rounded-xl p-2.5 text-center">
          <Wind size={16} className="text-muted-foreground mx-auto mb-1" />
          <div className="text-xs text-muted-foreground">{t("windSpeed")}</div>
          <div className="text-sm font-semibold text-foreground">{weather.windSpeed} km/h</div>
        </div>
        <div className="bg-secondary rounded-xl p-2.5 text-center">
          <CloudRain size={16} className="text-agri-info mx-auto mb-1" />
          <div className="text-xs text-muted-foreground">{t("rainChance")}</div>
          <div className="text-sm font-semibold text-foreground">{weather.rainChance}%</div>
        </div>
      </div>

      {/* Dynamic Weather Alert based on live conditions */}
      {weatherAlert && (
        <div className={`rounded-xl p-3 mb-4 ${
          weatherAlert.type === 'danger' 
            ? 'bg-red-500/10 border border-red-500/20' 
            : weatherAlert.type === 'warning'
            ? 'bg-agri-warning/10 border border-agri-warning/20'
            : 'bg-blue-500/10 border border-blue-500/20'
        }`}>
          <div className="flex items-center gap-2">
            <CloudLightning size={16} className={
              weatherAlert.type === 'danger' 
                ? 'text-red-600 dark:text-red-400' 
                : weatherAlert.type === 'warning'
                ? 'text-agri-warning'
                : 'text-blue-600 dark:text-blue-400'
            } />
            <span className={`text-xs font-semibold ${
              weatherAlert.type === 'danger' 
                ? 'text-red-600 dark:text-red-400' 
                : weatherAlert.type === 'warning'
                ? 'text-agri-warning'
                : 'text-blue-600 dark:text-blue-400'
            }`}>
              {t("weatherAlert")} - LIVE
            </span>
          </div>
          <p className="text-xs text-foreground mt-1">{weatherAlert.message}</p>
        </div>
      )}

      {/* 5-Day Forecast */}
      <div>
        <div className="text-xs font-medium text-muted-foreground mb-2">{t("forecast")}</div>
        <div className="flex gap-2">
          {weather.forecast.map((day) => {
            const DayIcon = getWeatherIcon(day.icon);
            return (
              <div key={day.day} className="flex-1 bg-secondary rounded-xl p-2 text-center">
                <div className="text-[10px] text-muted-foreground">{day.day}</div>
                <DayIcon size={16} className="mx-auto my-1 text-muted-foreground" />
                <div className="text-xs font-semibold text-foreground">{day.temp}°</div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
