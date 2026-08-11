const { isNotEmpty, isValidNumber, isPositiveNumber } = require('./helpers');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIRECTIONS = ['above', 'below'];
const CLOSENESS_THRESHOLD = 0.005; // 0.5%

function validateAlert(data, db, { isUpdate = false, existingAlert = null } = {}) {
  const errors = [];

  if (!isUpdate || data.asset_id !== undefined) {
    if (!isNotEmpty(data.asset_id) || !Number.isInteger(Number(data.asset_id))) {
      errors.push({ field: 'asset_id', message: 'asset_id is required and must be an integer' });
    }
  }

  if (!isUpdate || data.email !== undefined) {
    if (!isNotEmpty(data.email) || typeof data.email !== 'string' || !EMAIL_PATTERN.test(data.email)) {
      errors.push({ field: 'email', message: 'A valid email is required' });
    }
  }

  if (!isUpdate || data.direction !== undefined) {
    if (!isNotEmpty(data.direction) || !DIRECTIONS.includes(data.direction)) {
      errors.push({ field: 'direction', message: 'direction must be "above" or "below"' });
    }
  }

  if (!isUpdate || data.target_price !== undefined) {
    if (!isValidNumber(data.target_price) || !isPositiveNumber(data.target_price)) {
      errors.push({ field: 'target_price', message: 'target_price must be a positive number' });
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const assetId = data.asset_id !== undefined ? Number(data.asset_id) : existingAlert.asset_id;
  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(assetId);
  if (!asset) {
    errors.push({ field: 'asset_id', message: 'Referenced asset does not exist' });
    return { valid: false, errors };
  }

  const direction = data.direction !== undefined ? data.direction : existingAlert.direction;
  const targetPrice = data.target_price !== undefined ? Number(data.target_price) : existingAlert.target_price;
  const currentPrice = asset.current_price;

  if (direction === 'above' && targetPrice <= currentPrice) {
    errors.push({
      field: 'target_price',
      message: `target_price must be greater than the current price (${currentPrice}) when direction is "above"`
    });
  } else if (direction === 'below' && targetPrice >= currentPrice) {
    errors.push({
      field: 'target_price',
      message: `target_price must be less than the current price (${currentPrice}) when direction is "below"`
    });
  } else if (Math.abs(targetPrice - currentPrice) / currentPrice < CLOSENESS_THRESHOLD) {
    errors.push({
      field: 'target_price',
      message: 'target_price is too close to the current price to be a meaningful alert'
    });
  }

  return { valid: errors.length === 0, errors, asset };
}

module.exports = { validateAlert };
