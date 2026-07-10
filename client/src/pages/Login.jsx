import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { t } = useTranslation();
  const { login, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('mobile');
  const [mobile, setMobile] = useState('');
  const [farmerId, setFarmerId] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [farmerName, setFarmerName] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab !== 'mobile') {
        setError('For demo, please use Mobile tab');
        setLoading(false);
        return;
      }
      if (mobile.length !== 10) {
        setError('Please enter a valid 10-digit mobile number');
        setLoading(false);
        return;
      }
      const res = await login(mobile);
      setMessage(res.message || t('login.otp_sent'));
      setDemoOtp(res.demo_otp || '');
      setFarmerName(res.farmer_name || '');
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || t('common.error'));
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await verifyOtp(mobile, otp);
      if (res.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <span className="login-brand-icon">🌾</span>
            <h1>{t('login.title')}</h1>
            <p>{t('login.subtitle')}</p>
          </div>
          <div className="login-features">
            <div className="login-feature"><span>📅</span> {t('landing.feature_booking')}</div>
            <div className="login-feature"><span>🎫</span> {t('landing.feature_token')}</div>
            <div className="login-feature"><span>📍</span> {t('landing.feature_queue')}</div>
            <div className="login-feature"><span>🔒</span> {t('landing.stat_transparent')}</div>
          </div>
          <div className="login-illustration">
            🌾👨‍🌾
          </div>
        </div>

        <div className="login-right">
          <div className="login-card card">
            <div className="card-body">
              <div className="login-tabs">
                {['mobile', 'farmer_id', 'aadhaar'].map(t_tab => (
                  <button
                    key={t_tab}
                    className={`login-tab ${tab === t_tab ? 'active' : ''}`}
                    onClick={() => { setTab(t_tab); setStep('input'); setError(''); setDemoOtp(''); }}
                  >
                    {t_tab === 'mobile' ? '📱' : t_tab === 'farmer_id' ? '🆔' : '🪪'}{' '}
                    {t(`login.tab_${t_tab}`)}
                  </button>
                ))}
              </div>

              {step === 'input' ? (
                <form onSubmit={handleSendOtp}>
                  {tab === 'mobile' && (
                    <div className="form-group">
                      <label className="form-label">{t('login.mobile')}</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder={t('login.mobile_placeholder')}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        required
                        maxLength={10}
                      />
                    </div>
                  )}
                  {tab === 'farmer_id' && (
                    <div className="form-group">
                      <label className="form-label">{t('login.farmer_id')}</label>
                      <input type="text" className="form-input" placeholder={t('login.farmer_id_placeholder')} value={farmerId} onChange={(e) => setFarmerId(e.target.value)} required />
                    </div>
                  )}
                  {tab === 'aadhaar' && (
                    <div className="form-group">
                      <label className="form-label">{t('login.aadhaar')}</label>
                      <input type="tel" className="form-input" placeholder={t('login.aadhaar_placeholder')} value={aadhaar} onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))} required maxLength={12} />
                    </div>
                  )}
                  {error && <div className="login-error">⚠️ {error}</div>}
                  <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                    {loading ? <span className="spinner-sm" /> : '📤 ' + t('login.send_otp')}
                  </button>
                  {tab === 'mobile' && <p className="demo-hint">📱 Enter your mobile number to receive OTP</p>}
                  {tab !== 'mobile' && <p className="demo-hint">💡 {t('login.demo_hint')} | Mobile: 9876543210</p>}
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <div className="otp-success">
                    {farmerName && <span style={{ display: 'block', marginBottom: 4, fontSize: '1.1rem' }}>👤 {farmerName}</span>}
                    ✅ {message}
                  </div>
                  {demoOtp && (
                    <div className="otp-demo-box">
                      <span className="otp-demo-label">🔑 Demo OTP</span>
                      <span className="otp-demo-code">{demoOtp}</span>
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">{t('login.enter_otp')}</label>
                    <input
                      type="tel"
                      className="form-input otp-input"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      autoFocus
                    />
                  </div>
                  {error && <div className="login-error">⚠️ {error}</div>}
                  <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                    {loading ? <span className="spinner-sm" /> : '✅ ' + t('login.verify_otp')}
                  </button>
                  <button type="button" className="btn btn-ghost btn-block" onClick={() => { setStep('input'); setOtp(''); setError(''); setDemoOtp(''); }}>
                    ← {t('common.back')}
                  </button>
                  <button type="button" className="btn btn-sm btn-block" style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.8rem', cursor: 'pointer', marginTop: 4 }} onClick={() => { setOtp(demoOtp); }}>
                    📋 Tap to auto-fill OTP
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
