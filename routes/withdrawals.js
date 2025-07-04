const express = require('express');
const router = express.Router();

// POST /api/withdrawals/reserve
router.post('/reserve', (req, res) => {
  const { wallet_id, amount } = req.body;
  // Manual validation
  if (wallet_id === undefined || amount === undefined) {
    return res.status(400).json({ error: 'wallet_id and amount are required.' });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number.' });
  }
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
  // Manual validation
  if (withdrawal_id === undefined || amount === undefined) {
    return res.status(400).json({ error: 'withdrawal_id and amount are required.' });
  }
  if (typeof withdrawal_id !== 'number') {
    return res.status(400).json({ error: 'withdrawal_id must be a number.' });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number.' });
  }
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
  // Manual validation
  if (withdrawal_id === undefined || withdrawal_status === undefined || amount === undefined) {
    return res.status(400).json({ error: 'withdrawal_id, withdrawal_status, and amount are required.' });
  }
  if (typeof withdrawal_id !== 'number') {
    return res.status(400).json({ error: 'withdrawal_id must be a number.' });
  }
  if (typeof withdrawal_status !== 'string') {
    return res.status(400).json({ error: 'withdrawal_status must be a string.' });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number.' });
  }
  // Mock external API response
  const response = {
    status: 'completed'
  };
  console.log('Responding with:', response);
  res.status(200).json(response);
});

module.exports = router; 
