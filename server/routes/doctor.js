const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

router.post('/analyze', doctorController.analyze);

module.exports = router;
