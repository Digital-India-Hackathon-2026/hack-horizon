import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './QueueTracker.css';

export default function QueueTracker() {
  const { t } = useTranslation();
  const { centerId } = useParams();
  const { farmer } = useAuth();
  const [queueData, setQueueData] = useState(null);
  const [myPosition, setMyPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    try {
      const res = await api.get(`/queue/${centerId}/status`);
      setQueueData(res.data);
      // Try to get farmer's position
      if (farmer) {
        try {
          const posRes = await api.get(`/queue/${centerId}/position/${farmer.id}`);
          setMyPosition(posRes.data);
        } catch (e) { /* No booking at this center */ }
      }
    } catch (err) {
      console.error('Queue load error:', err);
    }
    setLoading(false);
  };

  useEffect(() => { loadQueue(); }, [centerId]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(loadQueue, 15000);
    return () => clearInterval(interval);
  }, [centerId]);

  if (loading) return <div className="loading-page"><div className="spinner" /><p>{t('common.loading')}</p></div>;
  if (!queueData) return <div className="loading-page"><p>{t('queue.center_not_found')}</p></div>;

  const statuses = ['booked', 'queued', 'in_progress', 'completed'];
  const myStatus = myPosition?.status || 'booked';
  const myStatusIdx = statuses.indexOf(myStatus);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700 }}>
        {/* Header */}
        <div className="queue-header card animate-in">
          <div className="card-body">
            <div className="flex-between">
              <div>
                <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>📍 {queueData.center_name.replace('Mandi Center', t('dynamic.Mandi Center')).replace('Main Market Yard', t('dynamic.Main Market Yard'))}</h1>
                <span className={`badge ${queueData.is_open ? 'badge-success' : 'badge-error'}`} style={{ marginTop: 4 }}>
                  {queueData.is_open ? `🟢 ${t('map.open')}` : `🔴 ${t('map.closed')}`}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-error" style={{ animation: 'pulse-ring 2s infinite' }}>● {t('queue.live')}</span>
                <button className="btn btn-ghost btn-sm" onClick={loadQueue} style={{ marginTop: 8 }}>🔄 {t('queue.refresh')}</button>
              </div>
            </div>
          </div>
        </div>

        {/* My Position */}
        {myPosition && (
          <div className="my-position card animate-in" style={{ animationDelay: '0.1s' }}>
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>🎫 {myPosition.token_code}</div>

              {/* Status Steps */}
              <div className="status-steps">
                {statuses.map((s, i) => (
                  <div key={s} className={`status-step ${i < myStatusIdx ? 'completed' : i === myStatusIdx ? 'active' : ''}`}>
                    <div className="status-dot">
                      {i < myStatusIdx ? '✓' : i === myStatusIdx ? (myStatus === 'in_progress' ? '!' : '→') : (i + 1)}
                    </div>
                    <span className="status-label">
                      {s === 'booked' ? t('queue.status_booked') : s === 'queued' ? t('queue.status_queued') : s === 'in_progress' ? t('queue.status_your_turn') : t('queue.status_completed')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Position & Wait */}
              <div className="position-grid">
                <div className="position-card">
                  <span className="pos-label">{t('queue.your_position')}</span>
                  <span className="pos-value">#{myPosition.queue_position}</span>
                </div>
                <div className="position-card">
                  <span className="pos-label">{t('queue.people_ahead')}</span>
                  <span className="pos-value">{myPosition.people_ahead}</span>
                </div>
                <div className="position-card highlight">
                  <span className="pos-label">⏱️ {t('queue.estimated_wait')}</span>
                  <span className="pos-value">
                    {myPosition.wait_estimate.confidenceLow}–{myPosition.wait_estimate.confidenceHigh}
                    <small> {t('queue.minutes')}</small>
                  </span>
                  <span className={`badge ${myPosition.wait_estimate.confidence === 'high' ? 'badge-success' : myPosition.wait_estimate.confidence === 'medium' ? 'badge-warning' : 'badge-error'}`} style={{ marginTop: 4 }}>
                    {t(`queue.${myPosition.wait_estimate.confidence}`)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Queue Overview */}
        <div className="card animate-in" style={{ animationDelay: '0.2s' }}>
          <div className="card-header">
            <span>📊 {t('queue.overview')}</span>
            <div style={{ display: 'flex', gap: 12, fontSize: 'var(--font-size-sm)' }}>
              <span>👥 {queueData.queue.total} {t('queue.total')}</span>
              <span>✅ {queueData.queue.completed_today} {t('queue.done')}</span>
              <span>🖥️ {queueData.active_counters} {t('queue.counters')}</span>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {queueData.queue.positions.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}><p>{t('queue.no_one')}</p></div>
            ) : (
              queueData.queue.positions.map((p, i) => (
                <div key={i} className={`queue-row ${p.status === 'in_progress' ? 'serving' : ''}`}>
                  <span className="queue-pos">#{p.position}</span>
                  <span className="queue-name">{p.farmer_name}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{t(`dynamic.${p.crop}`, p.crop)}</span>
                  <span className={`badge ${p.status === 'in_progress' ? 'badge-success' : p.status === 'queued' ? 'badge-warning' : 'badge-info'}`}>
                    {p.status === 'in_progress' ? `🔔 ${t('queue.serving')}` : p.status === 'queued' ? `⏳ ${t('queue.waiting')}` : `📅 ${t('queue.status_booked')}`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
