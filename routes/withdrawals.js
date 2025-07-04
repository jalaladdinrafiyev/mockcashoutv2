const express = require('express');
const router = express.Router();

// POST /api/withdrawals/reserve
router.post('/reserve', (req, res) => {
  const { wallet_id, amount } = req.body;
  console.log('POST /api/withdrawals/reserve called with:', req.body);
  // Generate a random withdrawal_id as a long integer
  const withdrawal_id = Date.now() * 1000 + Math.floor(Math.random() * 1000);
  // Mock external API response
  const response = {
    withdrawal_id,
    status: 'reserved',
    reserved_amount: amount,
    sentOTP: '56565'
  };
  console.log('Responding with:', response);
  res.status(200).json(response);
});

// POST /api/withdrawals/process
router.post('/process', (req, res) => {
  const { withdrawal_id, amount } = req.body;
  console.log('POST /api/withdrawals/process called with:', req.body);
  // Mock external API response
  const response = {
    status: 'pending'
  };
  console.log('Responding with:', response);
  res.status(200).json(response);
});

// POST /api/withdrawals/finalize
router.post('/finalize', (req, res) => {
  const { withdrawal_id, withdrawal_status, amount } = req.body;
  console.log('POST /api/withdrawals/finalize called with:', req.body);
  // Mock external API response
  const response = {
    status: 'completed'
  };
  console.log('Responding with:', response);
  res.status(200).json(response);
});

module.exports = router; 
