const express = require('express');
const router = express.Router();
const aiAgentController = require('../controllers/aiAgentController');

router.post('/chat', aiAgentController.chat);

module.exports = router;
