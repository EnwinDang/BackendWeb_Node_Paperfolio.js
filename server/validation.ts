// validatie

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

function isNotEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

function isValidNumber(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

function isPositiveNumber(value: unknown): boolean {
  if (!isValidNumber(value)) return false;
  return Number(value) > 0;
}

function isNonNegativeNumber(value: unknown): boolean {
  if (!isValidNumber(value)) return false;
  return Number(value) >= 0;
}

function hasNoNumbers(value: string): boolean {
  return !/\d/.test(value);
}

function isValidInteger(value: unknown): boolean {
  if (!isValidNumber(value)) return false;
  return Number.isInteger(Number(value));
}

// categorie validatie
export function validateCategory(data: Record<string, unknown>, isUpdate = false): ValidationResult {
  const errors: ValidationError[] = [];

  if (!isUpdate || data.name !== undefined) {
    if (!isNotEmpty(data.name)) {
      errors.push({ field: 'name', message: 'Naam mag niet leeg zijn' });
    } else if (typeof data.name === 'string' && !hasNoNumbers(data.name)) {
      errors.push({ field: 'name', message: 'Naam mag geen cijfers bevatten' });
    }
  }

  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== 'string') {
      errors.push({ field: 'description', message: 'Beschrijving moet tekst zijn' });
    }
  }

  return { valid: errors.length === 0, errors };
}

// product validatie
export function validateProduct(data: Record<string, unknown>, isUpdate = false): ValidationResult {
  const errors: ValidationError[] = [];

  if (!isUpdate || data.name !== undefined) {
    if (!isNotEmpty(data.name)) {
      errors.push({ field: 'name', message: 'Naam mag niet leeg zijn' });
    } else if (typeof data.name === 'string' && !hasNoNumbers(data.name)) {
      errors.push({ field: 'name', message: 'Productnaam mag geen cijfers bevatten' });
    }
  }

  if (!isUpdate || data.price !== undefined) {
    if (!isNotEmpty(data.price)) {
      errors.push({ field: 'price', message: 'Prijs mag niet leeg zijn' });
    } else if (!isValidNumber(data.price)) {
      errors.push({ field: 'price', message: 'Prijs moet een geldig nummer zijn' });
    } else if (!isPositiveNumber(data.price)) {
      errors.push({ field: 'price', message: 'Prijs moet groter zijn dan 0' });
    }
  }

  if (data.stock !== undefined) {
    if (!isValidInteger(data.stock)) {
      errors.push({ field: 'stock', message: 'Voorraad moet een geheel getal zijn' });
    } else if (!isNonNegativeNumber(data.stock)) {
      errors.push({ field: 'stock', message: 'Voorraad mag niet negatief zijn' });
    }
  }

  if (data.categoryId !== undefined && data.categoryId !== null) {
    if (!isValidInteger(data.categoryId)) {
      errors.push({ field: 'categoryId', message: 'Categorie ID moet een geheel getal zijn' });
    } else if (!isPositiveNumber(data.categoryId)) {
      errors.push({ field: 'categoryId', message: 'Categorie ID moet positief zijn' });
    }
  }

  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== 'string') {
      errors.push({ field: 'description', message: 'Beschrijving moet tekst zijn' });
    }
  }

  return { valid: errors.length === 0, errors };
}

// paginatie validatie
export function validatePagination(limit: unknown, offset: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (limit !== undefined) {
    if (!isValidInteger(limit)) {
      errors.push({ field: 'limit', message: 'Limit moet een geheel getal zijn' });
    } else if (!isPositiveNumber(limit)) {
      errors.push({ field: 'limit', message: 'Limit moet groter zijn dan 0' });
    }
  }

  if (offset !== undefined) {
    if (!isValidInteger(offset)) {
      errors.push({ field: 'offset', message: 'Offset moet een geheel getal zijn' });
    } else if (!isNonNegativeNumber(offset)) {
      errors.push({ field: 'offset', message: 'Offset mag niet negatief zijn' });
    }
  }

  return { valid: errors.length === 0, errors };
}
