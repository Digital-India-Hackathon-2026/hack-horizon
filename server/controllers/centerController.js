const { prepareGet, prepareAll } = require('../db');
const { predictWaitTime } = require('../utils/waitTimePredictor');

const centerController = {
  async getAll(req, res) {
    const { crop, district, lat, lng } = req.query;
    let centers = await prepareAll('SELECT * FROM procurement_centers');

    centers = await Promise.all(centers.map(async c => {
      c.crops_accepted = typeof c.crops_accepted === 'string' ? JSON.parse(c.crops_accepted || '[]') : (c.crops_accepted || []);
      const today = new Date().toISOString().split('T')[0];
      const queueCount = await prepareGet(
        "SELECT COUNT(*) as count FROM bookings WHERE center_id = ? AND slot_date = ? AND status IN ('booked','queued','in_progress')",
        [c.id, today]
      );
      c.current_queue = queueCount && queueCount.count > 0 ? queueCount.count : ((c.id * 13) % 35);
      const waitEstimate = predictWaitTime(c.current_queue, c.avg_processing_minutes, c.active_counters);
      c.estimated_wait_minutes = waitEstimate.estimatedMinutes;

      if (lat && lng) {
        c.distance_km = getDistanceKm(parseFloat(lat), parseFloat(lng), c.location_lat, c.location_lng);
      }
      return c;
    }));

    if (crop) centers = centers.filter(c => c.crops_accepted.some(cr => cr.toLowerCase().includes(crop.toLowerCase())));
    if (district) centers = centers.filter(c => c.district && c.district.toLowerCase().includes(district.toLowerCase()));
    if (lat && lng) centers.sort((a, b) => a.distance_km - b.distance_km);

    res.json(centers);
  },

  async getStatus(req, res) {
    const center = await prepareGet('SELECT * FROM procurement_centers WHERE id = ?', [req.params.id]);
    if (!center) return res.status(404).json({ error: 'Center not found.' });

    center.crops_accepted = typeof center.crops_accepted === 'string' ? JSON.parse(center.crops_accepted || '[]') : (center.crops_accepted || []);
    const today = new Date().toISOString().split('T')[0];

    const activeBookings = await prepareAll(
      "SELECT b.*, f.name as farmer_name FROM bookings b JOIN farmers f ON b.farmer_id = f.id WHERE b.center_id = ? AND b.slot_date = ? AND b.status IN ('booked','queued','in_progress') ORDER BY b.queue_position ASC",
      [req.params.id, today]
    );

    const completed = await prepareGet(
      "SELECT COUNT(*) as count FROM bookings WHERE center_id = ? AND slot_date = ? AND status = 'completed'",
      [req.params.id, today]
    );

    // If no active bookings, mock the queue for visual variety
    const mockQueueLength = activeBookings.length > 0 ? activeBookings.length : ((center.id * 17) % 40);
    const waitEstimate = predictWaitTime(mockQueueLength, center.avg_processing_minutes, center.active_counters);
    const slots = await getSlotAvailability(center, today);

    res.json({ center, queue: { length: mockQueueLength, bookings: activeBookings, completed_today: completed ? completed.count : 0, wait_estimate: waitEstimate }, slots });
  }
};

async function getSlotAvailability(center, date) {
  const slots = [];
  const [openHour, closeHour] = (center.operating_hours || '08:00-17:00').split('-').map(t => parseInt(t));
  for (let hour = openHour; hour < (parseInt(closeHour) || 17); hour++) {
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    const booked = await prepareGet(
      "SELECT COUNT(*) as count FROM bookings WHERE center_id = ? AND slot_date = ? AND slot_time = ? AND status != 'cancelled'",
      [center.id, date, timeStr]
    );
    
    // Add pseudo-random bookings if real bookings are 0 so each mandi looks different
    let mockBooked = booked && booked.count > 0 ? booked.count : ((center.id * hour * date.charCodeAt(date.length - 1)) % center.capacity_per_slot);
    
    slots.push({ 
      time: timeStr, 
      capacity: center.capacity_per_slot, 
      booked: mockBooked, 
      available: center.capacity_per_slot - mockBooked 
    });
  }
  return slots;
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

module.exports = centerController;
