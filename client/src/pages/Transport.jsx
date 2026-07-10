import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Transport() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 600 }}>
        <h1 className="page-title animate-in">🚜 {t('transport.title')}</h1>

        <div className="card animate-slide-up">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t('transport.pickup')}</label>
                <input type="text" className="form-input" placeholder="Farm location / Village" required />
              </div>

              <div className="form-group">
                <label className="form-label">{t('transport.destination')}</label>
                <select className="form-select" required>
                  <option value="">Select Mandi...</option>
                  <option value="1">Kukatpally Procurement Center</option>
                  <option value="2">Secunderabad Main Market</option>
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">{t('transport.vehicle_type')}</label>
                  <select className="form-select" required>
                    <option value="truck">{t('transport.truck')} (10-15 Tons)</option>
                    <option value="tractor">{t('transport.tractor')} (3-5 Tons)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('transport.date_time')}</label>
                  <input type="datetime-local" className="form-input" required />
                </div>
              </div>

              {submitted && (
                <div className="badge badge-success" style={{ display: 'block', padding: 12, marginBottom: 16, textAlign: 'center' }}>
                  ✅ {t('transport.success')}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block">
                {t('transport.book')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
