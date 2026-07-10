const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, bookingController.create);
router.get('/', authMiddleware, bookingController.getAll);
router.get('/:id', authMiddleware, bookingController.getById);
router.delete('/:id/cancel', authMiddleware, bookingController.cancel);

module.exports = router;
