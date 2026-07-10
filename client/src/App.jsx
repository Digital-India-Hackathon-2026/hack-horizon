import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './i18n';

// Components
import Navbar from './components/Navbar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SlotBooking from './pages/SlotBooking';
import TokenView from './pages/TokenView';
import QueueTracker from './pages/QueueTracker';
import MapView from './pages/MapView';
import MarketPrices from './pages/MarketPrices';
import Schemes from './pages/Schemes';
import Help from './pages/Help';

// Advanced Feature Pages

import SeedsCatalog from './pages/SeedsCatalog';
import AIDoctor from './pages/AIDoctor';
import Weather from './pages/Weather';
import Transport from './pages/Transport';

// Payment Pages
import BillPage from './pages/BillPage';
import PaymentPage from './pages/PaymentPage';
import TransactionsPage from './pages/TransactionsPage';

// Sidebar component
import Sidebar from './components/Sidebar';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppContent() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="app">
      {isOffline && (
        <div className="offline-banner">
          ⚠️ You are offline — showing cached data. Some features may be limited.
        </div>
      )}
      <Navbar />
      <Sidebar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/prices" element={<MarketPrices />} />
        <Route path="/schemes" element={<Schemes />} />
        <Route path="/help" element={<Help />} />
        
        {/* Advanced Feature Routes */}

        <Route path="/seeds" element={<SeedsCatalog />} />
        <Route path="/ai-doctor" element={<AIDoctor />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/transport" element={<Transport />} />

        {/* Payment Routes */}
        <Route path="/bill/:orderId" element={<ProtectedRoute><BillPage /></ProtectedRoute>} />
        <Route path="/payment/:paymentId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/book" element={<ProtectedRoute><SlotBooking /></ProtectedRoute>} />
        <Route path="/token/:id" element={<ProtectedRoute><TokenView /></ProtectedRoute>} />
        <Route path="/queue/:centerId" element={<ProtectedRoute><QueueTracker /></ProtectedRoute>} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
