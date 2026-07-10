import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';

export default function MarketPrices() {
  const { t, i18n } = useTranslation();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/market-prices')
      .then(res => { setPrices(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const getLocalizedName = (item) => {
    if (i18n.language === 'hi' && item.crop_name_hi) return item.crop_name_hi;
    if (i18n.language === 'te' && item.crop_name_te) return item.crop_name_te;
    return item.crop_name;
  };

  const filteredPrices = prices.filter(p => {
    const name = getLocalizedName(p).toLowerCase();
    const mandi = p.mandi_name.toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || mandi.includes(search);
  });

  if (loading) return <div className="loading-page"><div className="spinner" /><p>{t('common.loading')}</p></div>;

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title animate-in">💰 {t('prices.title')}</h1>
        
        <div className="form-group animate-in" style={{ maxWidth: 400, animationDelay: '0.1s' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder={t('prices.search')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="card table-wrapper animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <table className="table">
            <thead>
              <tr>
                <th>{t('prices.crop')}</th>
                <th>{t('prices.mandi')}</th>
                <th>{t('prices.price')}</th>
                <th>{t('prices.msp')}</th>
                <th>{t('prices.trend')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrices.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>
                    <div className="empty-state">
                      <p>{t('common.no_data')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPrices.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{getLocalizedName(p)}</td>
                    <td>{p.mandi_name}, {p.state}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>₹{p.price_per_quintal}</td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{p.msp ? `₹${p.msp}` : 'N/A'}</td>
                    <td>
                      <span className={`badge ${p.trend === 'up' ? 'badge-success' : p.trend === 'down' ? 'badge-error' : 'badge-info'}`}>
                        {t(`prices.${p.trend}`)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
