import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

export default function Dashboard() {
  const { t } = useTranslation();
  const { farmer } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [transportBookings, setTransportBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookRes, transportRes, notifRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/transport/my-bookings'),
        api.get('/notifications'),
      ]);
      setBookings(bookRes.data);
      setTransportBookings(transportRes.data);
      setNotifications(notifRes.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
    setLoading(false);
  };

  const activeBookings = bookings.filter(b => ['booked', 'queued', 'in_progress'].includes(b.status));
  const pastBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  const getStatusBadge = (status) => {
    const map = {
      booked: { class: 'badge-info', icon: '📅', label: t('queue.status_booked') },
      queued: { class: 'badge-warning', icon: '⏳', label: t('queue.status_queued') },
      in_progress: { class: 'badge-accent', icon: '🔔', label: t('queue.status_your_turn') },
      completed: { class: 'badge-success', icon: '✅', label: t('queue.status_completed') },
      cancelled: { class: 'badge-error', icon: '❌', label: t('common.cancel') },
    };
    const s = map[status] || map.booked;
    return <span className={`badge ${s.class}`}>{s.icon} {s.label}</span>;
  };

  const getTransportStatusBadge = (status) => {
    const map = {
      pending: { class: 'badge-warning', icon: '⏳', label: 'Pending' },
      confirmed: { class: 'badge-info', icon: '✅', label: 'Confirmed' },
      completed: { class: 'badge-success', icon: '🚚', label: 'Completed' },
      cancelled: { class: 'badge-error', icon: '❌', label: 'Cancelled' },
    };
    const s = map[status] || map.pending;
    return <span className={`badge ${s.class}`}>{s.icon} {s.label}</span>;
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><p>{t('common.loading')}</p></div>;

  return (
    <div className="page">
      <div className="container">
        {/* Welcome */}
        <div className="dash-header animate-in">
          <div>
            <h1 className="dash-welcome">{t('dashboard.welcome')}, <span className="text-primary">{farmer?.name}</span>! 👋</h1>
            <p className="dash-subtitle">ID: {farmer?.farmer_id} | 📍 {farmer?.village || 'N/A'}</p>
          </div>
          <Link to="/book" className="btn btn-primary">🏪 {t('nav.mandi_booking')}</Link>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions animate-in" style={{ animationDelay: '0.1s' }}>
          <Link to="/book" className="quick-card"><span className="quick-icon">🏪</span><span>{t('nav.mandi_booking')}</span></Link>
          <Link to="/map" className="quick-card"><span className="quick-icon">🗺️</span><span>{t('nav.map')}</span></Link>
          <Link to="/prices" className="quick-card"><span className="quick-icon">💰</span><span>{t('nav.prices')}</span></Link>
          <Link to="/schemes" className="quick-card"><span className="quick-icon">📋</span><span>{t('nav.schemes')}</span></Link>
        </div>

        <div className="dash-grid">
          {/* Active Bookings */}
          <div className="dash-section animate-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="section-heading">📅 {t('dashboard.active_bookings')} ({activeBookings.length})</h2>
            {activeBookings.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">📅</div>
                  <h3>{t('dashboard.no_bookings')}</h3>
                  <p>{t('dashboard.book_first')}</p>
                  <Link to="/book" className="btn btn-primary" style={{ marginTop: 16 }}>🏪 {t('nav.mandi_booking')}</Link>
                </div>
              </div>
            ) : (
              activeBookings.map(b => (
                <div key={b.id} className="card booking-card">
                  <div className="card-body">
                    <div className="flex-between">
                      <div>
                        <h3 className="booking-center">{b.center_name ? b.center_name.replace('Mandi Center', t('dynamic.Mandi Center')).replace('Main Market Yard', t('dynamic.Main Market Yard')) : ''}</h3>
                        <p className="booking-meta">📅 {b.slot_date} | ⏰ {b.slot_time} | 🌾 {b.crop_type ? t(`dynamic.${b.crop_type}`, b.crop_type) : 'N/A'}</p>
                      </div>
                      {getStatusBadge(b.status)}
                    </div>
                    {b.queue_position && (
                      <div className="booking-queue">
                        <span>#{b.queue_position} {t('dashboard.your_position')}</span>
                        <span className="badge badge-primary">🎫 {b.token_code}</span>
                      </div>
                    )}
                    <div className="booking-actions">
                      <Link to={`/token/${b.id}`} className="btn btn-secondary btn-sm">🎫 {t('dashboard.view_token')}</Link>
                      <Link to={`/queue/${b.center_id}`} className="btn btn-primary btn-sm">📍 {t('dashboard.track_queue')}</Link>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <>
                <h2 className="section-heading" style={{ marginTop: 24 }}>📋 {t('dashboard.past_bookings')} ({pastBookings.length})</h2>
                {pastBookings.slice(0, 3).map(b => (
                  <div key={b.id} className="card booking-card past">
                    <div className="card-body">
                      <div className="flex-between">
                        <div>
                          <h3 className="booking-center">{b.center_name ? b.center_name.replace('Mandi Center', t('dynamic.Mandi Center')).replace('Main Market Yard', t('dynamic.Main Market Yard')) : ''}</h3>
                          <p className="booking-meta">📅 {b.slot_date} | 🌾 {b.crop_type ? t(`dynamic.${b.crop_type}`, b.crop_type) : 'N/A'}</p>
                        </div>
                        {getStatusBadge(b.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Transport Bookings */}
            {transportBookings.length > 0 && (
              <>
                <h2 className="section-heading" style={{ marginTop: 24 }}>🚚 Transport Bookings ({transportBookings.length})</h2>
                {transportBookings.map(tb => (
                  <div key={tb.id} className="card booking-card">
                    <div className="card-body">
                      <div className="flex-between" style={{ marginBottom: '12px' }}>
                        <div>
                          <h3 className="booking-center" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {tb.vehicle_name}
                          </h3>
                        </div>
                        {getTransportStatusBadge(tb.status)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#666', fontSize: '0.9rem' }}>
                        <div><strong>Pickup:</strong> {tb.pickup_location}</div>
                        <div><strong>Drop:</strong> {tb.drop_location}</div>
                        <div><strong>Date:</strong> {new Date(tb.booking_date).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Notifications */}
          <div className="dash-section animate-in" style={{ animationDelay: '0.3s' }}>
            <h2 className="section-heading">🔔 {t('dashboard.notifications')}</h2>
            <div className="card notif-list">
              {notifications.length === 0 ? (
                <div className="empty-state" style={{ padding: 32 }}>
                  <p>{t('dashboard.no_notifications')}</p>
                </div>
              ) : (
                notifications.slice(0, 8).map(n => (
                  <div key={n.id} className={`notif-item ${n.is_read ? 'read' : 'unread'}`}>
                    <span className="notif-icon">{n.type === 'booking_confirmed' ? '✅' : n.type === 'turn_arrived' ? '🔔' : n.type === 'queue_update' ? '📍' : '📋'}</span>
                    <div className="notif-content">
                      <strong>{n.title}</strong>
                      <p>{n.message}</p>
                    </div>
                    {!n.is_read && <span className="notif-dot" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
