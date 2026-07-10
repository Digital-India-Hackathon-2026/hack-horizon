const { prepareGet, prepareAll, prepareRun } = require('../db');

const paymentController = {
  async createPayment(req, res) {
    try {
      const farmerId = req.farmer.id;
      const { order_id } = req.body;

      const order = await prepareGet(
        'SELECT so.*, soi.seed_id, soi.quantity, soi.price as item_price, s.name as seed_name FROM seed_orders so JOIN seed_order_items soi ON so.id = soi.order_id JOIN seeds s ON soi.seed_id = s.id WHERE so.id = ? AND so.farmer_id = ?',
        [order_id, farmerId]
      );

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const existingPayment = await prepareGet('SELECT * FROM payments WHERE order_id = ? AND status = ?', [order_id, 'pending']);
      if (existingPayment) {
        return res.json({ success: true, payment_id: existingPayment.id, amount: existingPayment.amount, status: existingPayment.status });
      }

      const result = await prepareRun(
        'INSERT INTO payments (order_id, farmer_id, amount, status) VALUES (?, ?, ?, ?)',
        [order_id, farmerId, order.total_amount, 'pending']
      );

      res.json({ success: true, payment_id: result.lastInsertRowid, amount: order.total_amount, status: 'pending' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create payment' });
    }
  },

  async getPayment(req, res) {
    try {
      const farmerId = req.farmer.id;
      const payment = await prepareGet(
        'SELECT p.*, so.total_amount, so.status as order_status FROM payments p JOIN seed_orders so ON p.order_id = so.id WHERE p.id = ? AND p.farmer_id = ?',
        [req.params.id, farmerId]
      );

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      const items = await prepareAll(
        'SELECT soi.*, s.name as seed_name FROM seed_order_items soi JOIN seeds s ON soi.seed_id = s.id WHERE soi.order_id = ?',
        [payment.order_id]
      );

      res.json({ ...payment, items });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch payment' });
    }
  },

  async processPayment(req, res) {
    try {
      const farmerId = req.farmer.id;
      const { bank_name, payment_method } = req.body;
      const payment = await prepareGet('SELECT * FROM payments WHERE id = ? AND farmer_id = ?', [req.params.id, farmerId]);

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      if (payment.status !== 'pending') {
        return res.status(400).json({ error: `Payment already ${payment.status}` });
      }

      const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

      await prepareRun(
        'UPDATE payments SET status = ?, payment_method = ?, bank_name = ?, transaction_id = ? WHERE id = ?',
        ['completed', payment_method || 'online_banking', bank_name, transactionId, payment.id]
      );

      await prepareRun(
        'UPDATE seed_orders SET status = ? WHERE id = ?',
        ['completed', payment.order_id]
      );

      const updated = await prepareGet('SELECT * FROM payments WHERE id = ?', [payment.id]);

      res.json({ success: true, payment: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to process payment' });
    }
  },

  async cancelPayment(req, res) {
    try {
      const farmerId = req.farmer.id;
      const payment = await prepareGet('SELECT * FROM payments WHERE id = ? AND farmer_id = ?', [req.params.id, farmerId]);

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      if (payment.status === 'completed') {
        return res.status(400).json({ error: 'Cannot cancel completed payment' });
      }

      if (payment.status === 'cancelled') {
        return res.status(400).json({ error: 'Payment already cancelled' });
      }

      await prepareRun('UPDATE payments SET status = ? WHERE id = ?', ['cancelled', payment.id]);
      await prepareRun('UPDATE seed_orders SET status = ? WHERE id = ?', ['cancelled', payment.order_id]);

      res.json({ success: true, message: 'Payment cancelled successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to cancel payment' });
    }
  },

  async getTransactions(req, res) {
    try {
      const farmerId = req.farmer.id;
      const payments = await prepareAll(
        `SELECT p.*, so.total_amount,
          (SELECT GROUP_CONCAT(CONCAT(soi.quantity, 'x ', s.name) SEPARATOR ', ')
           FROM seed_order_items soi JOIN seeds s ON soi.seed_id = s.id WHERE soi.order_id = so.id
          ) as items_summary
         FROM payments p
         JOIN seed_orders so ON p.order_id = so.id
         WHERE p.farmer_id = ?
         ORDER BY p.created_at DESC`,
        [farmerId]
      );

      res.json(payments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }
};

module.exports = paymentController;