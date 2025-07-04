/**
 * Validate reserve request body.
 * @param {object} body
 * @returns {{ error: string|null }}
 */
exports.validateReserve = (body) => {
  if (body.wallet_id === undefined || body.amount === undefined) {
    return { error: 'wallet_id and amount are required.' };
  }
  if (typeof body.amount !== 'number' || body.amount <= 0) {
    return { error: 'amount must be a positive number.' };
  }
  return { error: null };
};

/**
 * Validate process request body.
 * @param {object} body
 * @returns {{ error: string|null }}
 */
exports.validateProcess = (body) => {
  if (body.withdrawal_id === undefined || body.amount === undefined) {
    return { error: 'withdrawal_id and amount are required.' };
  }
  if (typeof body.withdrawal_id !== 'number') {
    return { error: 'withdrawal_id must be a number.' };
  }
  if (typeof body.amount !== 'number' || body.amount <= 0) {
    return { error: 'amount must be a positive number.' };
  }
  return { error: null };
};

/**
 * Validate finalize request body.
 * @param {object} body
 * @param {number} [reservedAmount] Optional, for status/amount relationship
 * @returns {{ error: string|null }}
 */
exports.validateFinalize = (body, reservedAmount) => {
  if (body.withdrawal_id === undefined || body.withdrawal_status === undefined || body.amount === undefined) {
    return { error: 'withdrawal_id, withdrawal_status, and amount are required.' };
  }
  if (typeof body.withdrawal_id !== 'number') {
    return { error: 'withdrawal_id must be a number.' };
  }
  if (typeof body.withdrawal_status !== 'string') {
    return { error: 'withdrawal_status must be a string.' };
  }
  const allowedStatuses = ['full', 'partial', 'released'];
  if (!allowedStatuses.includes(body.withdrawal_status)) {
    return { error: `withdrawal_status must be one of: ${allowedStatuses.join(', ')}` };
  }
  if (typeof body.amount !== 'number' || body.amount < 0) {
    return { error: 'amount must be a non-negative number.' };
  }
  if (reservedAmount !== undefined) {
    if (body.withdrawal_status === 'full' && body.amount !== reservedAmount) {
      return { error: 'For status full, amount must equal reserved amount.' };
    }
    if (body.withdrawal_status === 'partial' && (body.amount <= 0 || body.amount >= reservedAmount)) {
      return { error: 'For status partial, amount must be greater than 0 and less than reserved amount.' };
    }
    if (body.withdrawal_status === 'released' && body.amount !== 0) {
      return { error: 'For status released, amount must be 0.' };
    }
  }
  return { error: null };
}; 
