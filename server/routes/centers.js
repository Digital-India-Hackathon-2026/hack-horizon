const express = require('express');
const router = express.Router();
const centerController = require('../controllers/centerController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, centerController.getAll);
router.get('/:id/status', optionalAuth, centerController.getStatus);

module.exports = router;
