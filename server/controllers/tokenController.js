const { prepareGet, prepareRun } = require('../db');

const tokenController = {
  async getById(req, res) {
    const token = await prepareGet(`
      SELECT t.*, b.farmer_id, b.center_id, b.slot_date, b.slot_time, b.status as booking_status,
             b.queue_position, b.crop_type,
             pc.name as center_name, pc.address as center_address,
             f.name as farmer_name, f.mobile as farmer_mobile
      FROM tokens t
      JOIN bookings b ON t.booking_id = b.id
      JOIN procurement_centers pc ON b.center_id = pc.id
      JOIN farmers f ON b.farmer_id = f.id
      WHERE t.id = ? OR t.token_code = ?
    `, [req.params.id, req.params.id]);

    if (!token) return res.status(404).json({ error: 'Token not found.' });
    res.json(token);
  },

  async scan(req, res) {
    const token = await prepareGet(
      'SELECT t.*, b.farmer_id, b.center_id, b.status as booking_status FROM tokens t JOIN bookings b ON t.booking_id = b.id WHERE t.id = ? OR t.token_code = ?',
      [req.params.id, req.params.id]
    );

    if (!token) return res.status(404).json({ error: 'Token not found.' });
    if (token.status === 'used') return res.status(400).json({ error: 'Token has already been used.', scanned_at: token.scanned_at });
    if (token.status === 'cancelled') return res.status(400).json({ error: 'Token has been cancelled.' });

    await prepareRun("UPDATE tokens SET status = 'used', scanned_at = CURRENT_TIMESTAMP WHERE id = ?", [token.id]);
    await prepareRun("UPDATE bookings SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [token.booking_id]);
    await prepareRun(
      'INSERT INTO audit_logs (action, entity_type, entity_id, actor_id, actor_type, details) VALUES (?, ?, ?, ?, ?, ?)',
      ['token_scanned', 'token', token.id, token.farmer_id, 'staff', JSON.stringify({ token_code: token.token_code, booking_id: token.booking_id, center_id: token.center_id, scan_time: new Date().toISOString() })]
    );
    await prepareRun(
      'INSERT INTO notifications (farmer_id, type, title, message) VALUES (?, ?, ?, ?)',
      [token.farmer_id, 'turn_arrived', 'Your Turn!', 'Your token has been scanned. You are now being served.']
    );

    res.json({ success: true, message: 'Token verified successfully.', token_code: token.token_code, scanned_at: new Date().toISOString() });
  }
};

module.exports = tokenController;
