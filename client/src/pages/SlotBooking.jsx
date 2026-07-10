import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './SlotBooking.css';

export default function SlotBooking() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [cropType, setCropType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/centers').then(res => { setCenters(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCenter && selectedDate) {
      api.get(`/centers/${selectedCenter.id}/status`).then(res => setSlots(res.data.slots || [])).catch(() => {});
    }
  }, [selectedCenter, selectedDate]);

  const filteredCenters = centers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() + i * 86400000);
      days.push({
        value: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
        isToday: i === 0,
      });
    }
    return days;
  };

  const handleBook = async () => {
    setError('');
    setBooking(true);
    try {
      const res = await api.post('/bookings', {
        center_id: selectedCenter.id,
        slot_date: selectedDate,
        slot_time: selectedSlot,
        crop_type: cropType,
        estimated_quantity: quantity ? parseFloat(quantity) : null,
      });
      setSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.error || t('common.error'));
    }
    setBooking(false);
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><p>{t('common.loading')}</p></div>;

  if (success) {
    return (
      <div className="page">
        <div className="container">
          <div className="success-card card animate-slide-up">
            <div className="card-body" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
              <h2>{t('booking.success')}</h2>
              <p style={{ margin: '12px 0', color: 'var(--color-text-secondary)' }}>
                {success.center_name} | {success.booking.slot_date} | {success.booking.slot_time}
              </p>
              <div className="token-display">
                <span className="token-label">{t('token.token_number')}</span>
                <span className="token-code">{success.token.token_code}</span>
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: '12px 0' }}>
                #{success.queue_position} in queue | ~{success.wait_estimate.estimatedMinutes} {t('queue.minutes')} wait
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
                <button className="btn btn-primary" onClick={() => navigate(`/token/${success.booking.id}`)}>🎫 {t('dashboard.view_token')}</button>
                <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>📊 {t('nav.dashboard')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title animate-in">📅 {t('booking.title')}</h1>

        {/* Step 1: Select Center */}
        <div className="booking-step animate-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="step-title"><span className="step-num">1</span> {t('booking.select_center')}</h2>
          
          <div style={{ marginBottom: 16 }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder={t('map.search')} 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>

          <div className="center-grid">
            {filteredCenters.map(c => (
              <div key={c.id} className={`center-option card ${selectedCenter?.id === c.id ? 'selected' : ''}`} onClick={() => setSelectedCenter(c)}>
                <div className="card-body">
                  <h3>{c.name.replace('Mandi Center', t('dynamic.Mandi Center')).replace('Main Market Yard', t('dynamic.Main Market Yard'))}</h3>
                  <p className="center-addr">{c.address.replace('Main Market Yard', t('dynamic.Main Market Yard'))}</p>
                  <div className="center-meta">
                    <span className="badge badge-primary">👥 {c.current_queue} {t('queue.in_queue')}</span>
                    <span className="badge badge-warning">⏱️ ~{c.estimated_wait_minutes} {t('queue.min')}</span>
                  </div>
                  <div className="center-crops">
                    {(c.crops_accepted || []).map((crop, i) => (
                      <span key={i} className="crop-tag">🌾 {t(`dynamic.${crop}`, crop)}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Select Date */}
        {selectedCenter && (
          <div className="booking-step animate-in">
            <h2 className="step-title"><span className="step-num">2</span> {t('booking.select_date')}</h2>
            <div className="date-grid">
              {getNextDays().map(d => (
                <button key={d.value} className={`date-btn ${selectedDate === d.value ? 'selected' : ''}`} onClick={() => setSelectedDate(d.value)}>
                  <span className="date-label">{d.label}</span>
                  {d.isToday && <span className="date-today">{t('queue.today')}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Time */}
        {selectedDate && slots.length > 0 && (
          <div className="booking-step animate-in">
            <h2 className="step-title"><span className="step-num">3</span> {t('booking.select_time')}</h2>
            <div className="slot-grid">
              {slots.map(s => (
                <button key={s.time} className={`slot-btn ${selectedSlot === s.time ? 'selected' : ''} ${s.available <= 0 ? 'full' : ''}`}
                  onClick={() => s.available > 0 && setSelectedSlot(s.time)} disabled={s.available <= 0}>
                  <span className="slot-time">{s.time}</span>
                  <span className={`slot-avail ${s.available <= 3 ? 'low' : ''}`}>
                    {s.available > 0 ? `${s.available} ${t('booking.available')}` : t('booking.full')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Crop details + Confirm */}
        {selectedSlot && (
          <div className="booking-step animate-in">
            <h2 className="step-title"><span className="step-num">4</span> {t('booking.confirm')}</h2>
            <div className="card">
              <div className="card-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('booking.crop_type')}</label>
                    <select className="form-select" value={cropType} onChange={e => setCropType(e.target.value)}>
                      <option value="">-- {t('common.select', 'Select')} --</option>
                      {(selectedCenter.crops_accepted || []).map(c => <option key={c} value={c}>{t(`dynamic.${c}`, c)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('booking.quantity')}</label>
                    <input type="number" className="form-input" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g. 10" min="0" step="0.5" />
                  </div>
                </div>

                <div className="confirm-summary">
                  <div><strong>📍 {t('token.center')}:</strong> {selectedCenter.name}</div>
                  <div><strong>📅 {t('token.date')}:</strong> {selectedDate}</div>
                  <div><strong>⏰ {t('token.time')}:</strong> {selectedSlot}</div>
                  {cropType && <div><strong>🌾 {t('booking.crop_type')}:</strong> {cropType}</div>}
                </div>

                {error && <div className="login-error" style={{ marginTop: 12 }}>⚠️ {error}</div>}

                <button className="btn btn-accent btn-lg btn-block" onClick={handleBook} disabled={booking} style={{ marginTop: 16 }}>
                  {booking ? '...' : `✅ ${t('booking.confirm')}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
