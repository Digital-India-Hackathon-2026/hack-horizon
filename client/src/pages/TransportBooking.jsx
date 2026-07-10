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
    setLoading(true);
    setError('');
    
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
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ background: '#D1E7DD', color: '#0F5132', padding: '30px', borderRadius: '12px', display: 'inline-block' }}>
          <h2>✅ Booking Successful!</h2>
          <p>Your transport request has been received. We will contact you shortly.</p>
          <p>Redirecting to transport page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px', color: '#2D6A4F' }}>Register for Transport</h2>
      
      {error && <div style={{ background: '#F8D7DA', color: '#842029', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Vehicle Type</label>
          <input 
            type="text" 
            name="vehicle_name"
            value={formData.vehicle_name} 
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
            placeholder="e.g. Medium Cargo Truck"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Pickup Location (Farm / Village)</label>
          <input 
            type="text" 
            name="pickup_location"
            value={formData.pickup_location} 
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
            placeholder="Enter your village or farm address"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Drop Location (Mandi / Market)</label>
          <input 
            type="text" 
            name="drop_location"
            value={formData.drop_location} 
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
            placeholder="Enter the procurement center or mandi"
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Date and Time</label>
          <input 
            type="datetime-local" 
            name="booking_date"
            value={formData.booking_date} 
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '14px', background: '#2D6A4F', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Booking...' : 'Book it'}
        </button>

      </form>
    </div>
  );
}
