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
  const [selectedSeed, setSelectedSeed] = useState(null);

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
    alert('Added to cart!');
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
      alert('Failed to place order. Please login.');
    }
  };

  return (
    <div className="page" style={{ backgroundColor: '#0B0F13', minHeight: '100vh', color: '#fff', paddingTop: 32 }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 className="page-title animate-in" style={{ margin: 0, color: '#E5E7EB', fontWeight: 600 }}>🌱 Seed Marketplace</h1>
          <button className="btn" style={{ backgroundColor: '#065F46', color: 'white', borderRadius: '8px', padding: '10px 20px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }} onClick={handleCheckout}>
            🛒 Checkout ({cartCount})
          </button>
        </div>

        {loading ? (
          <div className="loading-page">
            <div className="spinner"></div>
            <p>Loading catalog...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {seeds.map((seed, i) => {
              const tags = seed.tags ? (typeof seed.tags === 'string' ? JSON.parse(seed.tags) : seed.tags) : [];
              return (
                <div key={seed.id} className="card animate-slide-up" style={{ 
                  animationDelay: `${i * 0.05}s`, 
                  background: '#161B22', 
                  border: '1px solid #30363D',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Product Image */}
                  <div style={{ position: 'relative', height: 200, width: '100%', backgroundColor: '#0D1117' }}>
                    <img src={seed.image} alt={seed.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                    
                    {/* Badge */}
                    {seed.badge && (
                      <div style={{ position: 'absolute', top: 12, left: 12, background: '#10B981', color: '#000', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                        {seed.badge}
                      </div>
                    )}
                    
                    {/* Rating */}
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', color: '#FBBF24', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      ★ {seed.rating}
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#F3F4F6', flex: 1 }}>{seed.name}</h3>
                      <div style={{ color: '#06B6D4', fontSize: '1.25rem', fontWeight: 700, marginLeft: 12 }}>₹{seed.price}</div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>{seed.supplier}</span>
                      <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>/pkt</span>
                    </div>
                    
                    <p style={{ fontSize: '0.9rem', color: '#D1D5DB', margin: '0 0 16px', lineHeight: 1.4 }}>
                      {seed.description || "High-quality seeds for optimal farming yield."}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                      {tags.map((tag, idx) => (
                        <span key={idx} style={{ background: '#21262D', border: '1px solid #30363D', color: '#9CA3AF', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem' }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#21262D', borderRadius: '8px', overflow: 'hidden', border: '1px solid #30363D' }}>
                        <button onClick={() => updateQuantity(seed.id, -1)} style={{ padding: '8px 12px', background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>-</button>
                        <span style={{ padding: '8px 4px', minWidth: '32px', textAlign: 'center', color: '#E5E7EB', fontSize: '0.9rem' }}>{quantities[seed.id] || 1}</span>
                        <button onClick={() => updateQuantity(seed.id, 1)} style={{ padding: '8px 12px', background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>+</button>
                      </div>
                      
                      <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                        <button 
                          onClick={() => setSelectedSeed(seed)}
                          style={{ background: '#374151', color: '#F3F4F6', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', flex: '1', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          ℹ️ Info
                        </button>
                        <button 
                          onClick={() => handleAddToCart(seed.id)}
                          style={{ background: '#0F766E', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', flex: '2', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        >
                          <span>+</span> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedSeed && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setSelectedSeed(null)}>
          <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '16px', padding: 32, maxWidth: 600, width: '100%', color: '#E5E7EB', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedSeed(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#9CA3AF', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            <h2 style={{ margin: '0 0 8px', color: '#10B981' }}>{selectedSeed.name}</h2>
            <p style={{ color: '#9CA3AF', marginBottom: 24 }}>By {selectedSeed.supplier}</p>
            
            <h4 style={{ marginBottom: 8, color: '#F3F4F6' }}>Description</h4>
            <p style={{ lineHeight: 1.6, color: '#D1D5DB', marginBottom: 24 }}>{selectedSeed.description}</p>
            
            <h4 style={{ marginBottom: 8, color: '#F3F4F6' }}>Benefits & How it works</h4>
            <ul style={{ lineHeight: 1.6, color: '#D1D5DB', marginBottom: 24, paddingLeft: 20 }}>
              <li><strong>High Germination Rate:</strong> Ensures maximum plant emergence for a successful crop.</li>
              <li><strong>Disease Resistance:</strong> Genetically selected to withstand common local pests and blights.</li>
              <li><strong>Optimal Yield:</strong> Provides superior yield compared to traditional seeds when used with proper irrigation.</li>
            </ul>

            <button 
              onClick={() => { handleAddToCart(selectedSeed.id); setSelectedSeed(null); }}
              style={{ background: '#0F766E', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, width: '100%' }}
            >
              Add to Cart - ₹{selectedSeed.price}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
