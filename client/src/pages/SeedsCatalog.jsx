import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';

export default function SeedsCatalog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [seeds, setSeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const fetchSeeds = async () => {
      try {
        const response = await api.get('/seeds');
        setSeeds(response.data);
      } catch (err) {
        console.error('Failed to fetch seeds:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSeeds();
  }, []);

  const updateQuantity = (id, delta) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const handleAddToCart = (id) => {
    const qty = quantities[id] || 1;
    setCartCount(c => c + qty);
    setCartItems(prev => [...prev, { seed_id: id, quantity: qty }]);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return alert('Cart is empty!');
    try {
      const response = await api.post('/seeds/order', { items: cartItems });
      if (response.data.success) {
        alert('Order placed successfully! Total: ₹' + response.data.total_amount);
        setCartCount(0);
        setCartItems([]);
      }
    } catch (err) {
      console.error('Failed to place order:', err);
      alert('Failed to place order.');
    }
  };

  const handleBuyNow = async (seedId) => {
    const qty = quantities[seedId] || 1;
    const seed = seeds.find(s => s.id === seedId);
    if (!confirm(`Buy ${qty} × ${seed?.name || 'this seed'} for ₹${(seed?.price || 0) * qty}?`)) return;
    try {
      const response = await api.post('/seeds/buy-now', { seed_id: seedId, quantity: qty });
      if (response.data.success) {
        setQuantities(prev => ({ ...prev, [seedId]: 1 }));
        navigate(`/bill/${response.data.order_id}`);
      }
    } catch (err) {
      console.error('Failed to place order:', err);
      alert('Failed to place order. Please login first.');
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 className="page-title animate-in" style={{ margin: 0 }}>🌱 {t('seeds.title')}</h1>
          <button className="btn btn-secondary" style={{ borderRadius: 'var(--radius-full)' }} onClick={handleCheckout}>
            🛒 Checkout ({cartCount})
          </button>
        </div>

        <div className="form-group animate-in">
          <input type="text" className="form-input" placeholder={t('seeds.search')} style={{ maxWidth: '100%', padding: '16px', fontSize: '1.1rem' }} />
        </div>
        
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16, fontWeight: 600 }}>Results</p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 24, marginTop: -12 }}>Check each product page for other buying options.</p>

        {loading ? (
          <div className="loading-page">
            <div className="spinner"></div>
            <p>Loading catalog...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {seeds.map((seed, i) => (
              <div key={seed.id} className="card animate-slide-up" style={{ animationDelay: `${i * 0.1}s`, display: 'flex', flexDirection: 'row', padding: 24, background: 'var(--color-surface)' }}>
              {/* Product Image */}
              <div style={{ width: 220, height: 260, background: '#F8F9FA', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={seed.image} alt={seed.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              {/* Product Info */}
              <div style={{ paddingLeft: 32, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 8px', color: '#0F1111', fontSize: '1.4rem', fontWeight: 500, lineHeight: 1.3 }}>
                  {seed.name}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: '0.9rem' }}>
                  <span style={{ color: '#DE7921', fontSize: '1.1rem' }}>★★★★☆</span>
                  <span style={{ color: '#DE7921' }}>{seed.rating}</span>
                  <span style={{ color: '#007185', marginLeft: 4 }}>({seed.reviews})</span>
                </div>
                
                <p style={{ fontSize: '0.85rem', color: '#565959', margin: '0 0 12px' }}>
                  100+ bought in past month
                </p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 600, color: '#0F1111' }}>₹{seed.price}</span>
                  <span style={{ fontSize: '0.9rem', color: '#565959', textDecoration: 'line-through' }}>M.R.P: ₹{seed.mrp}</span>
                  <span style={{ fontSize: '0.9rem', color: '#CC0C39', fontWeight: 500 }}>({Math.round(((seed.mrp - seed.price) / seed.mrp) * 100)}% off)</span>
                </div>
                
                <p style={{ fontSize: '0.9rem', color: '#565959', margin: '0 0 20px' }}>
                  FREE delivery <strong>Tomorrow</strong><br />
                  Sold by: <span style={{ color: '#007185' }}>{seed.supplier}</span>
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D5D9D9', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(15,17,17,.15)', background: '#F0F2F2' }}>
                      <button 
                        type="button" 
                        onClick={() => updateQuantity(seed.id, -1)} 
                        style={{ padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#0F1111' }}
                      >-</button>
                      <span style={{ padding: '8px 20px', background: 'white', minWidth: 40, textAlign: 'center', fontWeight: '500', fontSize: '1rem', borderLeft: '1px solid #D5D9D9', borderRight: '1px solid #D5D9D9' }}>
                        {quantities[seed.id] || 1}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => updateQuantity(seed.id, 1)} 
                        style={{ padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#0F1111' }}
                      >+</button>
                    </div>
                    <button 
                      onClick={() => handleAddToCart(seed.id)}
                      style={{ 
                        background: '#FFD814', 
                        color: '#0F1111', 
                        border: 'none', 
                        padding: '12px 32px', 
                        borderRadius: '100px', 
                        fontSize: '1rem', 
                        fontWeight: 500, 
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(213,217,217,.5)',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#F7CA00'}
                      onMouseOut={(e) => e.target.style.background = '#FFD814'}
                    >
                      Add to cart
                    </button>
                    <button 
                      onClick={() => handleBuyNow(seed.id)}
                      style={{ 
                        background: 'var(--color-primary)', 
                        color: 'white', 
                        border: 'none', 
                        padding: '12px 24px', 
                        borderRadius: '100px', 
                        fontSize: '1rem', 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(45,106,79,0.3)',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => { e.target.style.background = 'var(--color-primary-dark)'; e.target.style.transform = 'translateY(-1px)'; }}
                      onMouseOut={(e) => { e.target.style.background = 'var(--color-primary)'; e.target.style.transform = 'none'; }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
