const { prepareGet, prepareAll } = require('../db');
const { predictWaitTime } = require('../utils/waitTimePredictor');

const queueController = {
  async getStatus(req, res) {
    const centerId = req.params.centerId;
    const center = await prepareGet('SELECT * FROM procurement_centers WHERE id = ?', [centerId]);
    if (!center) return res.status(404).json({ error: 'Center not found.' });

    const today = new Date().toISOString().split('T')[0];

    const queue = await prepareAll(`
      SELECT b.id, b.queue_position, b.status, b.slot_time, b.crop_type,
             f.name as farmer_name, t.token_code
      FROM bookings b
      JOIN farmers f ON b.farmer_id = f.id
      LEFT JOIN tokens t ON t.booking_id = b.id
      WHERE b.center_id = ? AND b.slot_date = ? AND b.status IN ('booked','queued','in_progress')
      ORDER BY b.queue_position ASC
    `, [centerId, today]);

    const completed = await prepareGet(
      "SELECT COUNT(*) as count FROM bookings WHERE center_id = ? AND slot_date = ? AND status = 'completed'",
      [centerId, today]
    );

    const waitEstimate = predictWaitTime(queue.length, center.avg_processing_minutes, center.active_counters);
    const serving = queue.filter(b => b.status === 'in_progress');

    res.json({
      center_id: centerId, center_name: center.name, is_open: !!center.is_open,
      timestamp: new Date().toISOString(),
      queue: {
        total: queue.length, waiting: queue.filter(b => b.status !== 'in_progress').length,
        serving: serving.length, completed_today: completed ? completed.count : 0,
        positions: queue.map(b => ({
          position: b.queue_position, token: b.token_code, status: b.status,
          farmer_name: b.farmer_name ? b.farmer_name.charAt(0) + '***' : 'Anonymous',
          slot_time: b.slot_time, crop: b.crop_type
        }))
      },
      wait_estimate: waitEstimate, active_counters: center.active_counters
    });
  },

  async getFarmerPosition(req, res) {
    const { centerId, farmerId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const center = await prepareGet('SELECT * FROM procurement_centers WHERE id = ?', [centerId]);
    if (!center) return res.status(404).json({ error: 'Center not found.' });

    const booking = await prepareGet(`
      SELECT b.*, t.token_code, t.qr_data, t.status as token_status
      FROM bookings b LEFT JOIN tokens t ON t.booking_id = b.id
      WHERE b.center_id = ? AND b.farmer_id = ? AND b.slot_date = ? AND b.status != 'cancelled'
      ORDER BY b.created_at DESC LIMIT 1
    `, [centerId, farmerId, today]);

    if (!booking) return res.status(404).json({ error: 'No active booking found for this center today.' });

    const ahead = await prepareGet(
      "SELECT COUNT(*) as count FROM bookings WHERE center_id = ? AND slot_date = ? AND queue_position < ? AND status IN ('booked','queued','in_progress')",
      [centerId, today, booking.queue_position]
    );

    const waitEstimate = predictWaitTime(ahead ? ahead.count : 0, center.avg_processing_minutes, center.active_counters);

    res.json({
      booking_id: booking.id, queue_position: booking.queue_position,
      people_ahead: ahead ? ahead.count : 0, status: booking.status,
      token_code: booking.token_code, qr_data: booking.qr_data,
      slot_time: booking.slot_time, wait_estimate: waitEstimate, center_name: center.name
    });
  }
};

module.exports = queueController;
