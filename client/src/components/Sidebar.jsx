import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const toggle = () => setIsOpen(o => !o);
  const close = () => setIsOpen(false);

  useEffect(() => {
    const app = document.querySelector('.app');
    if (app) app.dataset.sidebarOpen = isOpen;
  }, [isOpen]);

  const coreFeatures = [
    ...(isAuthenticated ? [
      { path: '/dashboard', icon: '📊', label: 'nav.dashboard' },
      { path: '/book', icon: '📅', label: 'nav.book_slot' },
    ] : []),
    { path: '/map', icon: '🗺️', label: 'nav.map' },
    { path: '/prices', icon: '💰', label: 'nav.prices' },
    { path: '/schemes', icon: '📋', label: 'nav.schemes' }
  ];

  const advancedFeatures = [

    { path: '/seeds', icon: '🌱', label: 'sidebar.buy_seeds' },
    ...(isAuthenticated ? [
      { path: '/transactions', icon: '💳', label: 'My Transactions' },
    ] : []),
    { path: '/ai-doctor', icon: '🩺', label: 'sidebar.ai_doctor' },
    { path: '/weather', icon: '⛅', label: 'sidebar.weather' },
    { path: '/transport', icon: '🚜', label: 'sidebar.transport' }
  ];
  
  const supportFeatures = [
    { path: '/help', icon: '❓', label: 'nav.help' }
  ];

  return (
    <>
      <div className={`sidebar-toggle ${isOpen ? 'active' : ''}`} onClick={toggle} aria-label="Toggle sidebar">
        <div className="toggle-track">
          <div className="toggle-thumb">
            <span>{isOpen ? '✕' : '☰'}</span>
          </div>
        </div>
      </div>

      {isOpen && <div className="sidebar-backdrop" onClick={close} />}

      <aside className={`advanced-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>🌾 AgriQueue</h3>
          <button className="sidebar-close-btn" onClick={close}>✕</button>
        </div>
        <div className="sidebar-content">
          
          <div className="sidebar-section-title">Core Services</div>
          <ul className="sidebar-nav">
            {coreFeatures.map((feat) => (
              <li key={feat.path}>
                <Link 
                  to={feat.path} 
                  className={`sidebar-link ${location.pathname === feat.path ? 'active' : ''}`}
                >
                  <span className="sidebar-icon">{feat.icon}</span>
                  <span className="sidebar-text">{t(feat.label)}</span>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="sidebar-section-title">Ecosystem</div>
          <ul className="sidebar-nav">
            {advancedFeatures.map((feat) => (
              <li key={feat.path}>
                <Link 
                  to={feat.path} 
                  className={`sidebar-link ${location.pathname === feat.path ? 'active' : ''}`}
                >
                  <span className="sidebar-icon">{feat.icon}</span>
                  <span className="sidebar-text">{t(feat.label) === feat.label && feat.label.startsWith('sidebar.') ? feat.label.replace('sidebar.', '').replace('_', ' ') : t(feat.label)}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="sidebar-section-title">Support</div>
          <ul className="sidebar-nav">
            {supportFeatures.map((feat) => (
              <li key={feat.path}>
                <Link 
                  to={feat.path} 
                  className={`sidebar-link ${location.pathname === feat.path ? 'active' : ''}`}
                >
                  <span className="sidebar-icon">{feat.icon}</span>
                  <span className="sidebar-text">{t(feat.label)}</span>
                </Link>
              </li>
            ))}
          </ul>

        </div>
      </aside>
    </>
  );
}
