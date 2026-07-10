import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

export default function Landing() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const features = [
    { icon: '📅', title: t('landing.feature_booking'), desc: t('landing.feature_booking_desc'), color: '#2D6A4F' },
    { icon: '🎫', title: t('landing.feature_token'), desc: t('landing.feature_token_desc'), color: '#059669' },
    { icon: '📍', title: t('landing.feature_queue'), desc: t('landing.feature_queue_desc'), color: '#D97706' },
    { icon: '🤖', title: t('landing.feature_ai'), desc: t('landing.feature_ai_desc'), color: '#2563EB' },
  ];

  const stats = [
    { value: '14.6 Cr+', label: t('landing.stat_farmers'), icon: '👨‍🌾' },
    { value: '500+', label: t('landing.stat_centers'), icon: '🏛️' },
    { value: '10K+', label: t('landing.stat_time'), icon: '⏱️' },
    { value: '✓', label: t('landing.stat_transparent'), icon: '🔒' },
  ];

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-pattern" />
        <div className="container hero-content">
          <div className="hero-text animate-slide-up">
            <div className="trust-badges">
              <span className="trust-badge">🏛️ {t('landing.trust_enam')}</span>
              <span className="trust-badge">✅ {t('landing.trust_pmkisan')}</span>
            </div>
            <h1 className="hero-title">
              {t('landing.hero_title')}<br/>
              <span className="text-accent">{t('landing.hero_title2')}</span>
            </h1>
            <p className="hero-subtitle">{t('landing.hero_subtitle')}</p>
            <div className="hero-actions">
              <Link to={isAuthenticated ? '/book' : '/login'} className="btn btn-accent btn-lg">
                📅 {t('landing.cta_book')}
              </Link>
              <a href="#features" className="btn btn-secondary btn-lg">
                {t('landing.cta_learn')}
              </a>
            </div>
          </div>
          <div className="hero-visual animate-in">
            <div className="queue-demo">
              <div className="queue-demo-header">🌾 {t('queue.title')}</div>
              <div className="queue-demo-item active">
                <span className="q-pos">1</span>
                <span className="q-name">R***</span>
                <span className="badge badge-success">✓ {t('queue.status_your_turn')}</span>
              </div>
              <div className="queue-demo-item">
                <span className="q-pos">2</span>
                <span className="q-name">L***</span>
                <span className="badge badge-warning">⏳ {t('queue.status_queued')}</span>
              </div>
              <div className="queue-demo-item">
                <span className="q-pos">3</span>
                <span className="q-name">V***</span>
                <span className="badge badge-info">📅 {t('queue.status_booked')}</span>
              </div>
              <div className="queue-demo-footer">
                <span>⏱️ ~12 {t('queue.minutes')}</span>
                <span className="badge badge-success">{t('queue.live')}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none"><path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,60 L1440,120 L0,120 Z" fill="var(--color-bg)"/></svg>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="stat-icon">{stat.icon}</span>
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="container">
          <h2 className="section-title">How AgriQueue Works</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card card animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon" style={{ background: `${f.color}15`, color: f.color }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <div className="feature-number">{String(i + 1).padStart(2, '0')}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>🌾 {t('landing.hero_title')}</h2>
            <p>{t('landing.hero_subtitle')}</p>
            <Link to={isAuthenticated ? '/book' : '/login'} className="btn btn-accent btn-lg">
              {t('landing.cta_book')} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
