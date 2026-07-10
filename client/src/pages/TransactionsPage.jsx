import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const STATUS_STYLES = {
  completed: { class: 'badge-success', icon: '✅' },
  pending: { class: 'badge-warning', icon: '⏳' },
  cancelled: { class: 'badge-error', icon: '❌' },
  failed: { class: 'badge-error', icon: '❌' },
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    try {
      const res = await api.get('/payments/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTransactions(); }, []);

  const handleCancel = async (paymentId) => {
    if (!confirm('Cancel this payment?')) return;
    try {
      await api.post(`/payments/${paymentId}/cancel`);
      loadTransactions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading-page"><div className="spinner" /><p>Loading transactions...</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 className="page-title" style={{ margin: 0 }}>💳 My Transactions</h1>
          <Link to="/seeds" className="btn btn-primary btn-sm">🌱 Buy More Seeds</Link>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No transactions yet</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>Buy seeds to see your payment history here.</p>
            <Link to="/seeds" className="btn btn-accent">🛒 Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {transactions.map((txn) => {
              const st = STATUS_STYLES[txn.status] || STATUS_STYLES.pending;
              return (
                <div key={txn.id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span className={`badge ${st.class}`}>{st.icon} {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {new Date(txn.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{txn.items_summary || `Order #${txn.order_id}`}</div>
                      {txn.bank_name && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                          {txn.payment_method === 'upi' ? '📱' : '🏦'} {txn.bank_name}
                          {txn.transaction_id && <span style={{ marginLeft: 8, fontFamily: 'monospace', fontSize: '0.8rem' }}>TXN: {txn.transaction_id}</span>}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>₹{txn.amount}</div>
                      {txn.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <Link to={`/payment/${txn.id}`} className="btn btn-primary btn-sm">Pay Now</Link>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => handleCancel(txn.id)}>Cancel</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{
          marginTop: 24, padding: '16px 20px', background: 'var(--color-primary-bg)',
          borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 8,
          fontSize: '0.85rem', color: 'var(--color-primary-dark)'
        }}>
          💰 You can cancel any pending payment anytime. Completed payments are non-refundable.
        </div>
      </div>
    </div>
  );
}