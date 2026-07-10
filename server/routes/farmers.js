const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');
const { authMiddleware } = require('../middleware/auth');

router.get('/:id/profile', authMiddleware, farmerController.getProfile);
router.put('/:id/profile', authMiddleware, farmerController.updateProfile);

module.exports = router;
