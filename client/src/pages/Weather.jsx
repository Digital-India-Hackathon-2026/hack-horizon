import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Weather() {
  const { t } = useTranslation();
  
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to map WMO weather codes to emojis and descriptions
  const getWeatherInfo = (code) => {
    if (code === 0) return { emoji: '☀️', desc: 'Clear sky' };
    if (code === 1 || code === 2 || code === 3) return { emoji: '⛅', desc: 'Partly cloudy' };
    if (code === 45 || code === 48) return { emoji: '🌫️', desc: 'Fog' };
    if (code >= 51 && code <= 55) return { emoji: '🌧️', desc: 'Drizzle' };
    if (code >= 61 && code <= 65) return { emoji: '🌧️', desc: 'Rain' };
    if (code >= 71 && code <= 77) return { emoji: '❄️', desc: 'Snow' };
    if (code >= 80 && code <= 82) return { emoji: '🌦️', desc: 'Rain showers' };
    if (code >= 95 && code <= 99) return { emoji: '⛈️', desc: 'Thunderstorm' };
    return { emoji: '☁️', desc: 'Unknown' };
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Fetch real weather data for Hyderabad from Open-Meteo API
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=17.3850&longitude=78.4867&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Asia/Kolkata');
        const data = await response.json();
        setWeatherData(data);
      } catch (err) {
        console.error("Failed to fetch weather data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeather();
  }, []);

  if (loading) {
    return <div className="loading-page"><div className="spinner" /><p>Loading live weather...</p></div>;
  }

  if (!weatherData) {
    return <div className="loading-page"><p>Failed to load weather data.</p></div>;
  }

  const currentInfo = getWeatherInfo(weatherData.current_weather.weathercode);
  const isHeavyRainAlert = weatherData.current_weather.weathercode >= 61 && weatherData.current_weather.weathercode <= 99;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 className="page-title animate-in">⛅ {t('weather.title')}</h1>

        <div className="grid-2">
          {/* Current Weather Card */}
          <div className="card animate-in" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white' }}>
            <div className="card-body">
              <h3 style={{ margin: '0 0 16px', opacity: 0.9 }}>{t('weather.current')} (Hyderabad)</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ fontSize: 64 }}>{currentInfo.emoji}</div>
                <div>
                  <div style={{ fontSize: 48, fontWeight: 700 }}>{Math.round(weatherData.current_weather.temperature)}°C</div>
                  <div style={{ fontSize: 16, opacity: 0.9 }}>{currentInfo.desc}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <div>💨 Wind: {weatherData.current_weather.windspeed} km/h</div>
              </div>
            </div>
          </div>

          {/* Alerts Card */}
          <div className="card animate-in" style={{ animationDelay: '0.1s' }}>
            <div className="card-header">
              <h3 style={{ margin: 0 }}>⚠️ {t('weather.alerts')}</h3>
            </div>
            <div className="card-body">
              {isHeavyRainAlert ? (
                <div style={{ padding: 12, background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-md)', marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 24 }}>🚨</span>
                  <p style={{ margin: 0, fontSize: 14 }}>{t('weather.heavy_rain') || 'Heavy rain expected. Protect your crops.'}</p>
                </div>
              ) : (
                <div style={{ padding: 12, background: '#dcfce7', color: '#166534', borderRadius: 'var(--radius-md)', marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 24 }}>✅</span>
                  <p style={{ margin: 0, fontSize: 14 }}>Weather is currently clear and suitable for farming activities.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Forecast */}
        <h3 className="section-heading" style={{ marginTop: 32 }}>{t('weather.forecast')}</h3>
        <div className="grid-2">
          {weatherData.daily.time.slice(1, 4).map((dateString, i) => {
            const dailyCode = weatherData.daily.weathercode[i + 1];
            const maxTemp = Math.round(weatherData.daily.temperature_2m_max[i + 1]);
            const minTemp = Math.round(weatherData.daily.temperature_2m_min[i + 1]);
            const dailyInfo = getWeatherInfo(dailyCode);
            
            const date = new Date(dateString);
            const dayName = i === 0 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'long' });

            return (
              <div key={dateString} className="card animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{dayName}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{dailyInfo.desc}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{dailyInfo.emoji}</span>
                    <div style={{ fontWeight: 700 }}>{maxTemp}°/{minTemp}°</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
