import { useTranslation } from 'react-i18next';

export default function Weather() {
  const { t } = useTranslation();

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 className="page-title animate-in">⛅ {t('weather.title')}</h1>

        <div className="grid-2">
          <div className="card animate-in" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white' }}>
            <div className="card-body">
              <h3 style={{ margin: '0 0 16px', opacity: 0.9 }}>{t('weather.current')} (Hyderabad)</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ fontSize: 64 }}>⛅</div>
                <div>
                  <div style={{ fontSize: 48, fontWeight: 700 }}>28°C</div>
                  <div style={{ fontSize: 16, opacity: 0.9 }}>Partly Cloudy</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <div>💧 Humidity: 65%</div>
                <div>💨 Wind: 12 km/h</div>
              </div>
            </div>
          </div>

          <div className="card animate-in" style={{ animationDelay: '0.1s' }}>
            <div className="card-header">
              <h3 style={{ margin: 0 }}>⚠️ {t('weather.alerts')}</h3>
            </div>
            <div className="card-body">
              <div style={{ padding: 12, background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-md)', marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 24 }}>🚨</span>
                <p style={{ margin: 0, fontSize: 14 }}>{t('weather.heavy_rain')}</p>
              </div>
            </div>
          </div>
        </div>

        <h3 className="section-heading" style={{ marginTop: 32 }}>{t('weather.forecast')}</h3>
        <div className="grid-2">
          {['Tomorrow', 'Wednesday', 'Thursday'].map((day, i) => (
            <div key={day} className="card animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{day}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Scattered Showers</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>🌧️</span>
                  <div style={{ fontWeight: 700 }}>26°/22°</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
