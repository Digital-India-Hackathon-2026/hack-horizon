const { prepareGet, prepareAll, prepareRun } = require('../db');
const { generateToken } = require('../utils/tokenGenerator');
const { predictWaitTime } = require('../utils/waitTimePredictor');

const bookingController = {
  async create(req, res) {
    try {
      const { center_id, slot_date, slot_time, crop_type, estimated_quantity } = req.body;
      const farmer_id = req.farmer.id;

      if (!center_id || !slot_date || !slot_time) {
        return res.status(400).json({ error: 'center_id, slot_date, and slot_time are required.' });
      }

      const center = await prepareGet('SELECT * FROM procurement_centers WHERE id = ?', [center_id]);
      if (!center) return res.status(404).json({ error: 'Center not found.' });

      const booked = await prepareGet(
        "SELECT COUNT(*) as count FROM bookings WHERE center_id = ? AND slot_date = ? AND slot_time = ? AND status != 'cancelled'",
        [center_id, slot_date, slot_time]
      );
      if (booked && booked.count >= center.capacity_per_slot) {
        return res.status(409).json({ error: 'This slot is fully booked. Please choose another time.' });
      }

      const existing = await prepareGet(
        "SELECT id FROM bookings WHERE farmer_id = ? AND center_id = ? AND slot_date = ? AND status != 'cancelled'",
        [farmer_id, center_id, slot_date]
      );
      if (existing) return res.status(409).json({ error: 'You already have a booking at this center on this date.' });

      const queuePos = await prepareGet(
        "SELECT COUNT(*) as count FROM bookings WHERE center_id = ? AND slot_date = ? AND status != 'cancelled'",
        [center_id, slot_date]
      );
      const queuePosition = (queuePos ? queuePos.count : 0) + 1;

      const result = await prepareRun(
        'INSERT INTO bookings (farmer_id, center_id, slot_date, slot_time, crop_type, estimated_quantity, queue_position) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [farmer_id, center_id, slot_date, slot_time, crop_type || null, estimated_quantity || null, queuePosition]
      );
      const bookingId = result.lastInsertRowid;

      const { tokenCode, qrData } = await generateToken(bookingId, center.name, slot_date, slot_time);
      const tokenResult = await prepareRun(
        'INSERT INTO tokens (booking_id, token_code, qr_data) VALUES (?, ?, ?)',
        [bookingId, tokenCode, qrData]
      );

      await prepareRun('UPDATE bookings SET token_id = ? WHERE id = ?', [tokenResult.lastInsertRowid, bookingId]);

      await prepareRun(
        'INSERT INTO notifications (farmer_id, type, title, message) VALUES (?, ?, ?, ?)',
        [farmer_id, 'booking_confirmed', 'Booking Confirmed', `Your slot at ${center.name} on ${slot_date} at ${slot_time} is confirmed. Token: ${tokenCode}`]
      );

      await prepareRun(
        'INSERT INTO audit_logs (action, entity_type, entity_id, actor_id, details) VALUES (?, ?, ?, ?, ?)',
        ['booking_created', 'booking', bookingId, farmer_id, JSON.stringify({ center_id, slot_date, slot_time, queue_position: queuePosition })]
      );

      const waitEstimate = predictWaitTime(queuePosition, center.avg_processing_minutes, center.active_counters);
      const booking = await prepareGet('SELECT * FROM bookings WHERE id = ?', [bookingId]);
      const token = await prepareGet('SELECT * FROM tokens WHERE booking_id = ?', [bookingId]);

      res.status(201).json({
        success: true, booking, token, queue_position: queuePosition, wait_estimate: waitEstimate, center_name: center.name
      });
    } catch (err) {
      console.error('Booking creation error:', err);
      res.status(500).json({ error: 'Failed to create booking.' });
    }
  },

  async getAll(req, res) {
    const bookings = await prepareAll(`
      SELECT b.*, pc.name as center_name, pc.address as center_address,
             t.token_code, t.qr_data, t.status as token_status
      FROM bookings b
      JOIN procurement_centers pc ON b.center_id = pc.id
      LEFT JOIN tokens t ON t.booking_id = b.id
      WHERE b.farmer_id = ?
      ORDER BY b.slot_date DESC, b.slot_time DESC
    `, [req.farmer.id]);
    res.json(bookings);
  },

  async getById(req, res) {
    const booking = await prepareGet(`
      SELECT b.*, pc.name as center_name, pc.address as center_address,
             pc.avg_processing_minutes, pc.active_counters,
             t.token_code, t.qr_data, t.status as token_status, t.scanned_at
      FROM bookings b
      JOIN procurement_centers pc ON b.center_id = pc.id
      LEFT JOIN tokens t ON t.booking_id = b.id
      WHERE b.id = ?
    `, [req.params.id]);

    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    if (booking.status === 'queued' || booking.status === 'booked') {
      booking.wait_estimate = predictWaitTime(booking.queue_position, booking.avg_processing_minutes, booking.active_counters);
    }
    res.json(booking);
  },

  async cancel(req, res) {
    const booking = await prepareGet('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.farmer_id !== req.farmer.id) return res.status(403).json({ error: "Cannot cancel another farmer's booking." });
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ error: `Booking is already ${booking.status}.` });
    }

    await prepareRun("UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [req.params.id]);
    await prepareRun("UPDATE tokens SET status = 'cancelled' WHERE booking_id = ?", [req.params.id]);
    await prepareRun(
      'INSERT INTO audit_logs (action, entity_type, entity_id, actor_id, details) VALUES (?, ?, ?, ?, ?)',
      ['booking_cancelled', 'booking', booking.id, req.farmer.id, JSON.stringify({ previous_status: booking.status })]
    );
    res.json({ success: true, message: 'Booking cancelled.' });
  }
};

module.exports = bookingController;
