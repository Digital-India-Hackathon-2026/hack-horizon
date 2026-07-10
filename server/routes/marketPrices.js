const express = require('express');
const router = express.Router();
const marketPriceController = require('../controllers/marketPriceController');

router.get('/', marketPriceController.getAll);
router.get('/:crop', marketPriceController.getByCrop);

module.exports = router;
