const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportController');

router.post('/book', transportController.bookTransport);
router.get('/my-bookings', transportController.getMyBookings);

module.exports = router;
