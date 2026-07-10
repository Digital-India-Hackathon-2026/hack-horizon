import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, farmer, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
    { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
    { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
    { code: 'or', label: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  ];

  const navLinks = isAuthenticated ? [
    { to: '/dashboard', label: t('nav.dashboard'), icon: '📊' },
  ] : [];

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-icon">🌾</span>
          <span className="brand-text">{t('app_name')}</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="nav-icon">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {/* Language Toggle */}
          <div className="lang-toggle">
            <button className="btn-icon lang-btn" onClick={() => setLangOpen(!langOpen)} title="Language">
              🌐
            </button>
            {langOpen && (
              <div className="lang-dropdown">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    className={`lang-option ${i18n.language === lang.code ? 'active' : ''}`}
                    onClick={() => changeLang(lang.code)}
                  >
                    <span>{lang.flag}</span> {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div className="user-menu">
              <button className="user-btn" onClick={() => setMenuOpen(!menuOpen)}>
                <span className="user-avatar">👤</span>
                <span className="user-name hide-mobile">{farmer?.name?.split(' ')[0]}</span>
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              {t('nav.login')}
            </Link>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span className={menuOpen ? 'open' : ''}></span>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)} />}
    </nav>
  );
}
