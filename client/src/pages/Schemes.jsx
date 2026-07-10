import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';

export default function Schemes() {
  const { t, i18n } = useTranslation();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/schemes')
      .then(res => { setSchemes(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const getLocalized = (item, field) => {
    if (i18n.language === 'hi' && item[`${field}_hi`]) return item[`${field}_hi`];
    if (i18n.language === 'te' && item[`${field}_te`]) return item[`${field}_te`];
    return item[field];
  };

  const getIcon = (iconName) => {
    const icons = { cash: '💰', shield: '🛡️', 'credit-card': '💳', leaf: '🌱', globe: '🌐', award: '🏆' };
    return icons[iconName] || '📋';
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><p>{t('common.loading')}</p></div>;

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title animate-in">📋 {t('schemes.title')}</h1>

        <div className="grid-2">
          {schemes.map((s, i) => (
            <div key={s.id} className="card animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="card-header" style={{ gap: 12 }}>
                <div style={{ fontSize: 24 }}>{getIcon(s.icon)}</div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-primary-dark)' }}>{getLocalized(s, 'title')}</h3>
              </div>
              <div className="card-body">
                <p style={{ marginBottom: 16, color: 'var(--color-text-secondary)' }}>{getLocalized(s, 'description')}</p>
                
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 4 }}>{t('schemes.eligibility')}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)' }}>{getLocalized(s, 'eligibility')}</div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 4 }}>{t('schemes.documents')}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(s.required_documents || []).map((doc, j) => (
                      <span key={j} className="badge badge-info" style={{ background: 'var(--color-border-light)', color: 'var(--color-text)' }}>📄 {doc}</span>
                    ))}
                  </div>
                </div>

                {s.link && (
                  <a href={s.link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm btn-block">
                    {t('schemes.learn_more')} ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
