function isNotEmpty(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

function isValidNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPositiveNumber(value) {
  return isValidNumber(value) && Number(value) > 0;
}

function hasNoDigits(value) {
  return typeof value === 'string' && !/\d/.test(value);
}

module.exports = { isNotEmpty, isValidNumber, isPositiveNumber, hasNoDigits };
