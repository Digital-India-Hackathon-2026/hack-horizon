import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function BillPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/payments/transactions`);
        const all = res.data;
        const match = all.find(t => t.order_id == orderId);
        if (match) {
          const payRes = await api.get(`/payments/${match.id}`);
          setOrder(payRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handlePay = () => {
    if (order) {
      navigate(`/payment/${order.id}`);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading-page"><div className="spinner"></div><p>Loading bill...</p></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <h3>Order not found</h3>
            <Link to="/seeds" className="btn btn-primary">Back to Seeds</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="card" style={{ overflow: 'visible' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
            color: 'white', padding: '32px 32px 24px', textAlign: 'center'
          }}>
            <span style={{ fontSize: 48 }}>🧾</span>
            <h2 style={{ color: 'white', margin: '8px 0 4px', fontSize: '1.5rem' }}>Order Invoice</h2>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Order #{order.order_id}</p>
          </div>

          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, padding: '12px 0', borderBottom: '1px solid var(--color-border-light)' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>Order ID</span>
              <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>#{order.order_id}</span>
            </div>

            {order.items && order.items.map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 0', borderBottom: '1px solid var(--color-border-light)'
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.seed_name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Qty: {item.quantity} × ₹{item.price}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{item.quantity * item.price}</div>
              </div>
            ))}

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 0', marginTop: 8
            }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>Total Amount</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>₹{order.amount}</span>
            </div>

            <div style={{
              display: 'flex', gap: 12, marginTop: 24,
              padding: '16px', background: 'var(--color-accent-bg)',
              borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--color-accent-dark)'
            }}>
              ⚠️ This is a draft bill. Please proceed to payment to confirm your order.
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handlePay}>
                💳 Proceed to Pay ₹{order.amount}
              </button>
              <Link to="/seeds" className="btn btn-secondary btn-lg">
                ← Back
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}