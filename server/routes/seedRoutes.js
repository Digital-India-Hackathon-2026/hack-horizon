const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const seedController = require('../controllers/seedController');

router.get('/', seedController.getSeeds);
router.post('/order', authMiddleware, seedController.createOrder);
router.post('/buy-now', authMiddleware, seedController.buyNow);

module.exports = router;
