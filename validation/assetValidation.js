const { isNotEmpty, isValidNumber, isPositiveNumber, hasNoDigits } = require('./helpers');

const SYMBOL_PATTERN = /^[A-Z]{2,10}$/;

function validateAsset(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate || data.name !== undefined) {
    if (!isNotEmpty(data.name)) {
      errors.push({ field: 'name', message: 'Name is required' });
    } else if (typeof data.name !== 'string' || !hasNoDigits(data.name)) {
      errors.push({ field: 'name', message: 'Name may not contain digits' });
    }
  }

  if (!isUpdate || data.symbol !== undefined) {
    if (!isNotEmpty(data.symbol)) {
      errors.push({ field: 'symbol', message: 'Symbol is required' });
    } else if (typeof data.symbol !== 'string' || !SYMBOL_PATTERN.test(data.symbol)) {
      errors.push({ field: 'symbol', message: 'Symbol must be 2-10 uppercase letters (e.g. BTC)' });
    }
  }

  if (!isUpdate || data.category !== undefined) {
    if (!isNotEmpty(data.category) || typeof data.category !== 'string') {
      errors.push({ field: 'category', message: 'Category is required' });
    }
  }

  if (!isUpdate || data.current_price !== undefined) {
    if (!isValidNumber(data.current_price)) {
      errors.push({ field: 'current_price', message: 'Current price must be a number' });
    } else if (!isPositiveNumber(data.current_price)) {
      errors.push({ field: 'current_price', message: 'Current price must be positive' });
    }
  }

  if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
    errors.push({ field: 'is_active', message: 'is_active must be a boolean' });
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateAsset };
