import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../utils/api';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper function for Heatmap color
const getHeatmapColor = (current, capacity) => {
  if (!capacity) return '#059669'; // Green if unknown
  const ratio = current / capacity;
  if (ratio > 0.8) return '#DC2626'; // Red (Crowded)
  if (ratio > 0.5) return '#D97706'; // Yellow (Moderate)
  return '#059669'; // Green (Empty)
};

export default function MapView() {
  const { t } = useTranslation();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');

  useEffect(() => {
    api.get('/centers')
      .then(res => { setCenters(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const allCrops = [...new Set(centers.flatMap(c => c.crops_accepted || []))].sort();

  const filteredCenters = centers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = selectedCrop ? (c.crops_accepted || []).includes(selectedCrop) : true;
    return matchesSearch && matchesCrop;
  });

  // Default center of India
  const centerPos = [22.9074872, 79.7400652];

  if (loading) return <div className="loading-page"><div className="spinner" /><p>{t('common.loading')}</p></div>;

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title animate-in">🗺️ {t('map.title')}</h1>

        <div className="grid-2 animate-in" style={{ marginBottom: 20 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder={t('map.search')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select className="form-select" value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)}>
              <option value="">{t('common.all')} {t('map.crops')}</option>
              {allCrops.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="card animate-in" style={{ overflow: 'hidden', height: '65vh', display: 'flex', flexDirection: 'column', animationDelay: '0.1s' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <MapContainer center={centerPos} zoom={5} style={{ width: '100%', height: '100%', zIndex: 1 }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredCenters.map(c => (
                <div key={c.id}>
                  {/* --- HACKATHON FEATURE: Live Crowd Heatmap --- */}
                  <Circle 
                    center={[c.location_lat, c.location_lng]} 
                    pathOptions={{ 
                      fillColor: getHeatmapColor(c.current_queue, c.capacity_per_slot || 100), 
                      fillOpacity: 0.3,
                      color: getHeatmapColor(c.current_queue, c.capacity_per_slot || 100),
                      weight: 1
                    }} 
                    radius={50000} // Radius in meters (visual size)
                  />
                  {/* --------------------------------------------- */}

                  <Marker position={[c.location_lat, c.location_lng]}>
                  <Popup>
                    <div style={{ padding: '4px 0', minWidth: 200 }}>
                      <h3 style={{ fontSize: 16, margin: '0 0 8px', color: 'var(--color-primary-dark)' }}>{c.name}</h3>
                      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#666' }}>{c.address}</p>
                      
                      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                        <span className="badge badge-primary">👥 {c.current_queue}</span>
                        <span className="badge badge-warning">⏱️ ~{c.estimated_wait_minutes}m</span>
                      </div>
                      
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>{t('map.crops')}</div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {(c.crops_accepted || []).slice(0, 3).map((crop, i) => (
                            <span key={i} className="crop-tag" style={{ fontSize: 10 }}>{crop}</span>
                          ))}
                          {(c.crops_accepted || []).length > 3 && <span className="crop-tag" style={{ fontSize: 10 }}>+{(c.crops_accepted || []).length - 3}</span>}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/queue/${c.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, padding: '6px 12px', minHeight: 'auto', textAlign: 'center' }}>
                          📍 {t('map.view_details')}
                        </Link>
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${c.location_lat},${c.location_lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{ flex: 1, padding: '6px 12px', minHeight: 'auto', textAlign: 'center' }}
                        >
                          🗺️ Directions
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
                </div>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
