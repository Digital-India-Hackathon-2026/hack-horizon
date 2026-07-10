const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');
const { optionalAuth } = require('../middleware/auth');

router.get('/:id', optionalAuth, tokenController.getById);
router.post('/:id/scan', tokenController.scan);

module.exports = router;
