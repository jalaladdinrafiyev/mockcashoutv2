const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const withdrawalsFile = process.env.WITHDRAWALS_FILE || path.join(__dirname, '../withdrawals.json');

/**
 * Generate a random withdrawal ID as a long integer.
 * @returns {number}
 */
exports.generateWithdrawalId = function () {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000);
};

/**
 * Store a withdrawal ID and reserved amount in the file.
 * @param {number} id
 * @param {number} amount
 * @returns {Promise<void>}
 */
exports.storeWithdrawalId = async function (id, amount) {
  let withdrawals = {};
  try {
    const data = await fs.readFile(withdrawalsFile, 'utf-8');
    withdrawals = JSON.parse(data);
  } catch (err) {
    // File may not exist yet
  }
  withdrawals[id] = { reservedAmount: amount };
  await fs.writeFile(withdrawalsFile, JSON.stringify(withdrawals));
};

/**
 * Check if a withdrawal ID exists in the file.
 * @param {number} id
 * @returns {Promise<boolean>}
 */
exports.withdrawalIdExists = async function (id) {
  try {
    const data = await fs.readFile(withdrawalsFile, 'utf-8');
    const withdrawals = JSON.parse(data);
    return withdrawals.hasOwnProperty(id);
  } catch (err) {
    return false;
  }
};

/**
 * Get the reserved amount for a withdrawal ID.
 * @param {number} id
 * @returns {Promise<number|null>} reservedAmount or null if not found
 */
exports.getReservedAmount = async function (id) {
  try {
    const data = await fs.readFile(withdrawalsFile, 'utf-8');
    const withdrawals = JSON.parse(data);
    return withdrawals[id] ? withdrawals[id].reservedAmount : null;
  } catch (err) {
    return null;
  }
}; 
