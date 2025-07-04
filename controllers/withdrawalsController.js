/**
 * Withdrawals Controller
 * Handles reserve, process, and finalize endpoints.
 */
const withdrawalService = require('../services/withdrawalService');
const { validateReserve, validateProcess, validateFinalize } = require('../utils/validation');

/**
 * Reserve endpoint controller
 */
exports.reserve = async (req, res) => {
  try {
    const { error } = validateReserve(req.body);
    if (error) return res.status(400).json({ error });
    const withdrawal_id = withdrawalService.generateWithdrawalId();
    await withdrawalService.storeWithdrawalId(withdrawal_id, req.body.amount);
    return res.status(200).json({
      withdrawal_id,
      status: 'reserved',
      reserved_amount: req.body.amount,
      sentOTP: '56565'
    });
  } catch (err) {
    console.error('Reserve error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Process endpoint controller
 */
exports.process = async (req, res) => {
  try {
    const { error } = validateProcess(req.body);
    if (error) return res.status(400).json({ error });
    const exists = await withdrawalService.withdrawalIdExists(req.body.withdrawal_id);
    if (!exists) return res.status(400).json({ error: 'Invalid withdrawal_id.' });
    return res.status(200).json({ status: 'pending' });
  } catch (err) {
    console.error('Process error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Finalize endpoint controller
 */
exports.finalize = async (req, res) => {
  try {
    const exists = await withdrawalService.withdrawalIdExists(req.body.withdrawal_id);
    if (!exists) return res.status(400).json({ error: 'Invalid withdrawal_id.' });
    const reservedAmount = await withdrawalService.getReservedAmount(req.body.withdrawal_id);
    const { error } = validateFinalize(req.body, reservedAmount);
    if (error) return res.status(400).json({ error });
    return res.status(200).json({ status: 'completed' });
  } catch (err) {
    console.error('Finalize error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 
