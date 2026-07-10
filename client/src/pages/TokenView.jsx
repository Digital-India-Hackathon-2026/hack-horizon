import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

export default function TokenView() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/bookings/${id}`).then(res => { setBooking(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-page"><div className="spinner" /><p>{t('common.loading')}</p></div>;
  if (!booking) return <div className="loading-page"><p>❌ Booking not found</p></div>;

  const statusColor = { booked: '#2563EB', queued: '#D97706', in_progress: '#059669', completed: '#059669', cancelled: '#DC2626' };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="card animate-slide-up" style={{ overflow: 'hidden' }}>
          {/* Token header */}
          <div style={{ background: `linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))`, color: 'white', padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>🎫 {t('token.title')}</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 3, fontFamily: "'Courier New', monospace" }}>{booking.token_code || 'N/A'}</div>
          </div>

          {/* QR Code */}
          {booking.qr_data && (
            <div style={{ textAlign: 'center', padding: '24px 24px 0', background: 'white' }}>
              <img src={booking.qr_data} alt="QR Code" style={{ width: 200, height: 200, margin: '0 auto', borderRadius: 12 }} />
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>Scan at procurement counter</p>
            </div>
          )}

          {/* Details */}
          <div className="card-body">
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>📍 {t('token.center')}</span>
                <strong>{booking.center_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>📅 {t('token.date')}</span>
                <strong>{booking.slot_date}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>⏰ {t('token.time')}</span>
                <strong>{booking.slot_time}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>📊 {t('token.status')}</span>
                <span className={`badge ${booking.status === 'completed' ? 'badge-success' : booking.status === 'in_progress' ? 'badge-accent' : booking.status === 'queued' ? 'badge-warning' : 'badge-info'}`}>
                  {booking.status}
                </span>
              </div>
              {booking.queue_position && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>🔢 Queue Position</span>
                  <strong>#{booking.queue_position}</strong>
                </div>
              )}
              {booking.crop_type && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>🌾 Crop</span>
                  <strong>{booking.crop_type}</strong>
                </div>
              )}
            </div>

            {/* Wait estimate */}
            {booking.wait_estimate && (
              <div style={{ marginTop: 16, padding: 16, background: 'var(--color-accent-bg)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--color-accent-dark)' }}>⏱️ {t('queue.estimated_wait')}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-accent-dark)' }}>
                  {booking.wait_estimate.confidenceLow}–{booking.wait_estimate.confidenceHigh} <span style={{ fontSize: 14 }}>{t('queue.minutes')}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <Link to={`/queue/${booking.center_id}`} className="btn btn-primary" style={{ flex: 1 }}>📍 {t('dashboard.track_queue')}</Link>
              <Link to="/dashboard" className="btn btn-secondary" style={{ flex: 1 }}>📊 {t('nav.dashboard')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
