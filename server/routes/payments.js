const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

router.post('/create', authMiddleware, paymentController.createPayment);
router.get('/transactions', authMiddleware, paymentController.getTransactions);
router.get('/:id', authMiddleware, paymentController.getPayment);
router.post('/:id/pay', authMiddleware, paymentController.processPayment);
router.post('/:id/cancel', authMiddleware, paymentController.cancelPayment);

module.exports = router;