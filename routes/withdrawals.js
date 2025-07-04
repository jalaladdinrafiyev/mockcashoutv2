const express = require('express');
const router = express.Router();
const withdrawalsController = require('../controllers/withdrawalsController');

// POST /api/withdrawals/reserve
router.post('/reserve', withdrawalsController.reserve);

// POST /api/withdrawals/process
router.post('/process', withdrawalsController.process);

// POST /api/withdrawals/finalize
router.post('/finalize', withdrawalsController.finalize);

module.exports = router; 
