import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Transport() {
  const { t } = useTranslation();

  const assets = [
    {
      id: 1,
      name: 'DJI Agras T40 Drone',
      distance: '2.4km away',
      price: 2500,
      unit: '/hr',
      rating: '4.8',
      image: 'https://images.unsplash.com/photo-1579822981966-1c2ce0c279c4?w=400&q=80',
      tags: ['Spraying', 'Mapping']
    },
    {
      id: 2,
      name: 'John Deere Autonomous',
      distance: '5.1km away',
      price: 1200,
      unit: '/hr',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1592982537447-6f208c6e04d9?w=400&q=80',
      tags: ['Tilling', 'Seeding']
    },
    {
      id: 3,
      name: 'Harvest Assistant Bot',
      distance: '1.2km away',
      price: 800,
      unit: '/hr',
      rating: '4.5',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80',
      tags: ['Picking', 'Sorting']
    },
    {
      id: 4,
      name: 'Solar Cargo Truck',
      distance: '8km away',
      price: 1500,
      unit: '/hr',
      rating: '4.2',
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&q=80',
      tags: ['Cold Storage']
    }
  ];

  const handleBook = (name) => {
    alert(`Successfully added ${name} to cart!`);
  };

  return (
    <div className="page" style={{ backgroundColor: '#0B0F13', minHeight: '100vh', color: '#fff', paddingTop: 32 }}>
      <div className="container">
        
        {/* Header Section */}
        <div style={{ background: '#12161A', border: '1px solid #30363D', borderRadius: '16px', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: '0 0 8px', fontSize: '1.5rem', color: '#F3F4F6' }}>Asset Sharing Economy</h1>
            <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.95rem' }}>Rent high-tech machinery on demand. Earn by listing your idle assets.</p>
          </div>
          <button style={{ background: '#0F766E', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>+</span> List My Equipment
          </button>
        </div>

        {/* Assets Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {assets.map((asset, i) => (
            <div key={asset.id} className="card animate-slide-up" style={{ 
              animationDelay: `${i * 0.1}s`, 
              background: '#161B22', 
              border: '1px solid #30363D',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Image */}
              <div style={{ position: 'relative', height: 200, backgroundColor: '#0D1117' }}>
                <img src={asset.image} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                
                {/* Rating */}
                <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', color: '#FBBF24', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  ★ {asset.rating}
                </div>
              </div>
              
              {/* Content */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#F3F4F6', flex: 1 }}>{asset.name}</h3>
                  <div style={{ color: '#06B6D4', fontSize: '1.2rem', fontWeight: 700, marginLeft: 8 }}>₹{asset.price}<span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 500 }}>{asset.unit}</span></div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF', fontSize: '0.85rem', marginBottom: 16 }}>
                  <span>📍</span> {asset.distance}
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                  {asset.tags.map((tag, idx) => (
                    <span key={idx} style={{ background: '#21262D', border: '1px solid #30363D', color: '#9CA3AF', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem' }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <button 
                  onClick={() => handleBook(asset.name)}
                  style={{ marginTop: 'auto', background: '#374151', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.2s' }}
                  onMouseOver={e => e.target.style.background = '#4B5563'}
                  onMouseOut={e => e.target.style.background = '#374151'}
                >
                  <span>+</span> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
