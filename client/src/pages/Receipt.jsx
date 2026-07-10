import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';

export default function Receipt() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/bookings/${id}`)
      .then(res => { setBooking(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-page"><div className="spinner" /><p>{t('common.loading')}</p></div>;
  if (!booking) return <div className="loading-page"><p>❌ Receipt not found</p></div>;

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Receipt Paper */}
      <div style={{
        background: 'white',
        width: '100%',
        maxWidth: '400px',
        padding: '30px 20px',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        borderTop: '8px solid var(--color-primary)',
        fontFamily: "'Courier New', monospace",
        color: '#333'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '24px', letterSpacing: '1px' }}>AgriQueue</h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>OFFICIAL TOKEN RECEIPT</p>
        </div>

        <div style={{ borderTop: '2px dashed #ccc', borderBottom: '2px dashed #ccc', padding: '15px 0', margin: '20px 0', textAlign: 'center' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>TOKEN NO.</p>
          <h1 style={{ margin: 0, fontSize: '32px', letterSpacing: '2px', color: 'var(--color-primary-dark)' }}>{booking.token_code}</h1>
        </div>

        <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 0', color: '#666' }}>Farmer ID:</td>
              <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold' }}>{booking.farmer_id}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#666' }}>Center:</td>
              <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold' }}>{booking.center_name}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#666' }}>Date:</td>
              <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold' }}>{booking.slot_date}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#666' }}>Time:</td>
              <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold' }}>{booking.slot_time}</td>
            </tr>
            {booking.crop_type && (
              <tr>
                <td style={{ padding: '8px 0', color: '#666' }}>Crop:</td>
                <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold' }}>{booking.crop_type}</td>
              </tr>
            )}
            <tr>
              <td style={{ padding: '8px 0', color: '#666' }}>Status:</td>
              <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold', textTransform: 'uppercase' }}>{booking.status}</td>
            </tr>
          </tbody>
        </table>

        {booking.qr_data && (
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <img src={booking.qr_data} alt="QR Code" style={{ width: '120px', height: '120px', mixBlendMode: 'multiply' }} />
            <p style={{ margin: '10px 0 0 0', fontSize: '10px', color: '#999' }}>Scan for live updates</p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '12px', color: '#666' }}>
          <p>Thank you for using AgriQueue!</p>
          <p>{new Date().toLocaleString()}</p>
        </div>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={() => window.print()} style={{ padding: '10px 20px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit' }}>🖨️ Print Receipt</button>
        <Link to="/" style={{ padding: '10px 20px', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', borderRadius: '4px', display: 'inline-block', fontFamily: 'inherit' }}>Go Home</Link>
      </div>

    </div>
  );
}
