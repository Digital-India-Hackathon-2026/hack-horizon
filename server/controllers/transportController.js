const { prepareRun } = require('../db');

const bookTransport = async (req, res) => {
  try {
    const { vehicle_name, pickup_location, drop_location, booking_date } = req.body;
    
    // Simulate getting the farmer ID from auth middleware if it existed.
    // The current system uses local storage 'agriqueue_farmer' mostly, 
    // but we can default to farmer ID 1 for now if no auth middleware is passed.
    const farmerId = req.user?.id || 1; 

    if (!vehicle_name || !pickup_location || !drop_location || !booking_date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await prepareRun(
      `INSERT INTO transport_bookings (farmer_id, vehicle_name, pickup_location, drop_location, booking_date, status) 
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [farmerId, vehicle_name, pickup_location, drop_location, booking_date]
    );

    res.status(201).json({
      message: 'Transport booked successfully',
      bookingId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Transport booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  bookTransport
};
