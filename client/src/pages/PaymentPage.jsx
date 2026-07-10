import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const BANKS = [
  { name: 'State Bank of India', code: 'SBI', icon: '🏦' },
  { name: 'HDFC Bank', code: 'HDFC', icon: '🏛️' },
  { name: 'ICICI Bank', code: 'ICICI', icon: '🏢' },
  { name: 'Punjab National Bank', code: 'PNB', icon: '🏗️' },
  { name: 'Bank of Baroda', code: 'BOB', icon: '🏬' },
  { name: 'Canara Bank', code: 'CANARA', icon: '🏭' },
  { name: 'Axis Bank', code: 'AXIS', icon: '🏤' },
  { name: 'Union Bank of India', code: 'UNION', icon: '🏛️' },
];

const UPI_APPS = [
  { name: 'Google Pay', code: 'GPAY', icon: '📱' },
  { name: 'PhonePe', code: 'PHONEPE', icon: '📲' },
  { name: 'Paytm', code: 'PAYTM', icon: '💳' },
  { name: 'BHIM UPI', code: 'BHIM', icon: '🇮🇳' },
];

export default function PaymentPage() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedUpi, setSelectedUpi] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState('bank');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await api.get(`/payments/${paymentId}`);
        setPayment(res.data);
      } catch (err) {
        setError('Payment not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [paymentId]);

  const handlePay = async () => {
    if (method === 'bank' && !selectedBank) {
      setError('Please select a bank');
      return;
    }
    if (method === 'upi' && !selectedUpi) {
      setError('Please select a UPI app');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const res = await api.post(`/payments/${paymentId}/pay`, {
        bank_name: method === 'bank' ? selectedBank : selectedUpi,
        payment_method: method === 'bank' ? 'online_banking' : 'upi'
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/transactions'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this payment?')) return;
    setProcessing(true);
    try {
      await api.post(`/payments/${paymentId}/cancel`);
      navigate('/transactions');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container"><div className="loading-page"><div className="spinner" /><p>Loading payment...</p></div></div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">💳</div>
            <h3>Payment not found</h3>
            <Link to="/transactions" className="btn btn-primary">View Transactions</Link>
          </div>
        </div>
      </div>
    );
  }

  if (payment.status !== 'pending') {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 500 }}>
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>
              {payment.status === 'completed' ? '✅' : payment.status === 'cancelled' ? '❌' : '⚠️'}
            </div>
            <h2>Payment {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</h2>
            <p style={{ color: 'var(--color-text-secondary)', margin: '12px 0 24px' }}>
              This payment is already {payment.status}.
            </p>
            <Link to="/transactions" className="btn btn-primary">View Transactions</Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 500 }}>
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: 'var(--color-success)' }}>Payment Successful!</h2>
            <p style={{ color: 'var(--color-text-secondary)', margin: '12px 0' }}>
              Your payment of ₹{payment.amount} has been processed.
            </p>
            <div className="spinner" style={{ margin: '16px auto' }}></div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Redirecting to transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 600 }}>
        <div className="card" style={{ overflow: 'visible' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
            color: 'white', padding: '24px 24px 20px', textAlign: 'center'
          }}>
            <span style={{ fontSize: 40 }}>💳</span>
            <h2 style={{ color: 'white', margin: '8px 0 4px' }}>Secure Payment</h2>
            <p style={{ opacity: 0.8 }}>Order #{payment.order_id}</p>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 8 }}>₹{payment.amount}</div>
          </div>

          <div style={{ padding: 24 }}>
            {error && (
              <div style={{
                background: 'var(--color-error-bg)', color: 'var(--color-error)',
                padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 16,
                fontSize: '0.875rem', fontWeight: 500
              }}>⚠️ {error}</div>
            )}

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button
                className={`btn ${method === 'bank' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flex: 1 }}
                onClick={() => { setMethod('bank'); setSelectedUpi(null); setError(''); }}
              >
                🏦 Net Banking
              </button>
              <button
                className={`btn ${method === 'upi' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flex: 1 }}
                onClick={() => { setMethod('upi'); setSelectedBank(null); setError(''); }}
              >
                📱 UPI Apps
              </button>
            </div>

            {method === 'bank' && (
              <>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                  Select your bank
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {BANKS.map(bank => (
                    <button
                      key={bank.code}
                      onClick={() => { setSelectedBank(bank.name); setError(''); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '14px 12px', border: `2px solid ${selectedBank === bank.name ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-md)', background: selectedBank === bank.name ? 'var(--color-primary-bg)' : 'var(--color-surface)',
                        cursor: 'pointer', fontFamily: 'var(--font-family)', fontSize: '0.9rem', fontWeight: 500,
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{bank.icon}</span>
                      <span style={{ textAlign: 'left' }}>{bank.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {method === 'upi' && (
              <>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                  Select UPI app
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {UPI_APPS.map(app => (
                    <button
                      key={app.code}
                      onClick={() => { setSelectedUpi(app.name); setError(''); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '14px 12px', border: `2px solid ${selectedUpi === app.name ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-md)', background: selectedUpi === app.name ? 'var(--color-primary-bg)' : 'var(--color-surface)',
                        cursor: 'pointer', fontFamily: 'var(--font-family)', fontSize: '0.9rem', fontWeight: 500,
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{app.icon}</span>
                      <span>{app.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                className="btn btn-accent btn-lg"
                style={{ flex: 1 }}
                onClick={handlePay}
                disabled={processing || (!selectedBank && !selectedUpi)}
              >
                {processing ? <><span className="spinner-sm" /> Processing...</> : `🔒 Pay ₹${payment.amount}`}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              <button
                className="btn btn-ghost"
                onClick={handleCancel}
                disabled={processing}
                style={{ color: 'var(--color-error)' }}
              >
                ✕ Cancel Payment
              </button>
            </div>

            <div style={{
              marginTop: 20, padding: '12px 16px', background: 'var(--color-primary-bg)',
              borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 8,
              fontSize: '0.8rem', color: 'var(--color-primary-dark)'
            }}>
              🔒 Secured via 256-bit SSL encryption. Your payment details are safe.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}