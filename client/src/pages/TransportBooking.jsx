import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

export default function TransportBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedVehicle = location.state?.vehicleName || '';

  const [formData, setFormData] = useState({
    vehicle_name: selectedVehicle,
    pickup_location: '',
    drop_location: '',
    booking_date: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // --- HACKATHON FEATURE: SMS Fallback (Zero-Internet Booking) ---
    if (!navigator.onLine) {
      const smsBody = `TRANSPORT ${formData.vehicle_name} FROM ${formData.pickup_location} TO ${formData.drop_location} ON ${formData.booking_date}`;
      const phoneNumber = '+919876543210';
      window.open(`sms:${phoneNumber}?body=${encodeURIComponent(smsBody)}`);
      setSuccess(true);
      setTimeout(() => navigate('/transport'), 3000);
      return;
    }
    // ---------------------------------------------------------------

    setLoading(true);
    try {
      await api.post('/transport/book', formData);
      setSuccess(true);
      setTimeout(() => navigate('/transport'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book transport');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page" style={{ paddingTop: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', position: 'relative', overflow: 'hidden' }}>
        <div className="animate-slide-up" style={{ background: 'linear-gradient(145deg, var(--color-surface), var(--color-primary-bg))', padding: '50px 40px', borderRadius: '24px', boxShadow: 'var(--shadow-xl)', textAlign: 'center', maxWidth: '450px', border: '1px solid var(--color-primary-light)', zIndex: 1, position: 'relative' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px', animation: 'pulse 2s infinite' }}>✅</div>
          <h2 style={{ color: 'var(--color-primary-dark)', margin: '0 0 12px', fontSize: '1.8rem', fontWeight: 700 }}>Booking Confirmed!</h2>
          <p style={{ color: 'var(--color-primary)', fontSize: '1.05rem', margin: '0 0 24px', lineHeight: 1.5 }}>Your transport request has been securely placed. Our driver will contact you shortly.</p>
          <div style={{ display: 'inline-block', padding: '8px 16px', background: 'var(--color-primary-light)', color: 'white', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 600 }}>
            Redirecting...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ 
      paddingTop: '60px', 
      paddingBottom: '60px', 
      backgroundColor: 'var(--color-bg)',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(45, 106, 79, 0.15) 0px, transparent 60%), radial-gradient(at 100% 100%, rgba(245, 158, 11, 0.15) 0px, transparent 60%)',
      minHeight: 'calc(100vh - 64px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background blur elements mapped to theme colors */}
      <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '400px', height: '400px', background: 'var(--color-primary-light)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0, opacity: 0.15 }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '450px', height: '450px', background: 'var(--color-accent)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0, opacity: 0.12 }} />

      <div className="container" style={{ maxWidth: '650px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        <div className="animate-slide-up" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: '#e8f5e9', borderRadius: '16px', marginBottom: '16px', fontSize: '2rem', boxShadow: '0 4px 6px rgba(45, 106, 79, 0.1)' }}>
            🚛
          </div>
          <h2 style={{ margin: '0 0 8px', color: '#111827', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Register for Transport</h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '1.05rem' }}>Reliable logistics from your farm directly to the mandi.</p>
        </div>
        
        {error && (
          <div className="animate-in" style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <span style={{ fontWeight: 500 }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="animate-slide-up" style={{ animationDelay: '0.1s', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', border: '1px solid #f3f4f6' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Vehicle Type</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: '#9ca3af' }}>🚗</span>
              <input 
                type="text" 
                name="vehicle_name"
                value={formData.vehicle_name} 
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '1rem', background: '#f9fafb', transition: 'all 0.2s', outline: 'none' }}
                placeholder="e.g. Medium Cargo Truck"
                onFocus={(e) => { e.target.style.borderColor = '#2D6A4F'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(45, 106, 79, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Pickup Location</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: '#9ca3af' }}>📍</span>
              <input 
                type="text" 
                name="pickup_location"
                value={formData.pickup_location} 
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '1rem', background: '#f9fafb', transition: 'all 0.2s', outline: 'none' }}
                placeholder="Village name or farm address"
                onFocus={(e) => { e.target.style.borderColor = '#2D6A4F'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(45, 106, 79, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Drop Location</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: '#9ca3af' }}>🏢</span>
              <input 
                type="text" 
                name="drop_location"
                value={formData.drop_location} 
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '1rem', background: '#f9fafb', transition: 'all 0.2s', outline: 'none' }}
                placeholder="Mandi or procurement center"
                onFocus={(e) => { e.target.style.borderColor = '#2D6A4F'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(45, 106, 79, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '36px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Date & Time</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: '#9ca3af', zIndex: 1, pointerEvents: 'none' }}>📅</span>
              <input 
                type="datetime-local" 
                name="booking_date"
                value={formData.booking_date} 
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '1rem', background: '#f9fafb', transition: 'all 0.2s', outline: 'none' }}
                onFocus={(e) => { e.target.style.borderColor = '#2D6A4F'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(45, 106, 79, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '16px', 
              background: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              fontSize: '1.1rem', 
              fontWeight: 700, 
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(45, 106, 79, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '3px', borderTopColor: 'transparent', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}></span>
                Confirming...
              </span>
            ) : (
              <><span>✓</span> Confirm Booking</>
            )}
          </button>
          
          {!navigator.onLine && (
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span>📶</span> You are offline. We will book via SMS.
            </p>
          )}

        </form>
      </div>
    </div>
  );
}
