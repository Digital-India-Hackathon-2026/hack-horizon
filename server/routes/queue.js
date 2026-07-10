const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const { optionalAuth } = require('../middleware/auth');

router.get('/:centerId/status', optionalAuth, queueController.getStatus);
router.get('/:centerId/position/:farmerId', optionalAuth, queueController.getFarmerPosition);

module.exports = router;
