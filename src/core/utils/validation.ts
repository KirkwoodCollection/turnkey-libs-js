// Input validators - generic validation functions, no business logic

import { VALIDATION_PATTERNS, CURRENCY_CODES } from './constants';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Basic type validators
export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: any): value is object {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

export function isDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

// String validators
export function validateEmail(email: string): ValidationResult {
  if (!isString(email)) {
    return { isValid: false, error: 'Email must be a string' };
  }

  if (email.length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }

  if (!VALIDATION_PATTERNS.EMAIL.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
}

export function validatePhone(phone: string): ValidationResult {
  if (!isString(phone)) {
    return { isValid: false, error: 'Phone must be a string' };
  }

  if (phone.length === 0) {
    return { isValid: false, error: 'Phone is required' };
  }

  if (!VALIDATION_PATTERNS.PHONE.test(phone)) {
    return { isValid: false, error: 'Invalid phone format' };
  }

  return { isValid: true };
}

export function validateUUID(uuid: string): ValidationResult {
  if (!isString(uuid)) {
    return { isValid: false, error: 'UUID must be a string' };
  }

  if (!VALIDATION_PATTERNS.UUID.test(uuid)) {
    return { isValid: false, error: 'Invalid UUID format' };
  }

  return { isValid: true };
}

export function validateUrl(url: string): ValidationResult {
  if (!isString(url)) {
    return { isValid: false, error: 'URL must be a string' };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

// Date validators
export function validateISODate(dateString: string): ValidationResult {
  if (!isString(dateString)) {
    return { isValid: false, error: 'Date must be a string' };
  }

  if (!VALIDATION_PATTERNS.ISO_DATE.test(dateString)) {
    return { isValid: false, error: 'Date must be in ISO 8601 format' };
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date' };
  }

  return { isValid: true };
}

export function validateDateRange(startDate: string | Date, endDate: string | Date): ValidationResult {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  if (!isDate(start)) {
    return { isValid: false, error: 'Start date is invalid' };
  }

  if (!isDate(end)) {
    return { isValid: false, error: 'End date is invalid' };
  }

  if (start >= end) {
    return { isValid: false, error: 'Start date must be before end date' };
  }

  return { isValid: true };
}

// Number validators
export function validatePositiveNumber(value: number): ValidationResult {
  if (!isNumber(value)) {
    return { isValid: false, error: 'Value must be a number' };
  }

  if (value <= 0) {
    return { isValid: false, error: 'Value must be positive' };
  }

  return { isValid: true };
}

export function validateRange(value: number, min: number, max: number): ValidationResult {
  if (!isNumber(value)) {
    return { isValid: false, error: 'Value must be a number' };
  }

  if (value < min || value > max) {
    return { isValid: false, error: `Value must be between ${min} and ${max}` };
  }

  return { isValid: true };
}

// Currency validators
export function validateCurrencyCode(code: string): ValidationResult {
  if (!isString(code)) {
    return { isValid: false, error: 'Currency code must be a string' };
  }

  if (!CURRENCY_CODES.includes(code as any)) {
    return { isValid: false, error: `Invalid currency code: ${code}` };
  }

  return { isValid: true };
}

export function validateAmount(amount: number, currency: string): ValidationResult {
  const amountResult = validatePositiveNumber(amount);
  if (!amountResult.isValid) {
    return amountResult;
  }

  const currencyResult = validateCurrencyCode(currency);
  if (!currencyResult.isValid) {
    return currencyResult;
  }

  // Check for reasonable decimal places based on currency
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  const maxDecimals = currency === 'JPY' ? 0 : 2; // JPY doesn't use decimals

  if (decimalPlaces > maxDecimals) {
    return { isValid: false, error: `Too many decimal places for ${currency}` };
  }

  return { isValid: true };
}

// Object validators
export function validateRequired<T>(value: T, fieldName?: string): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { 
      isValid: false, 
      error: fieldName ? `${fieldName} is required` : 'Value is required' 
    };
  }

  return { isValid: true };
}

export function validateMaxLength(value: string, maxLength: number, fieldName?: string): ValidationResult {
  if (!isString(value)) {
    return { isValid: false, error: 'Value must be a string' };
  }

  if (value.length > maxLength) {
    return { 
      isValid: false, 
      error: fieldName 
        ? `${fieldName} must not exceed ${maxLength} characters` 
        : `Value must not exceed ${maxLength} characters`
    };
  }

  return { isValid: true };
}

export function validateMinLength(value: string, minLength: number, fieldName?: string): ValidationResult {
  if (!isString(value)) {
    return { isValid: false, error: 'Value must be a string' };
  }

  if (value.length < minLength) {
    return { 
      isValid: false, 
      error: fieldName 
        ? `${fieldName} must be at least ${minLength} characters` 
        : `Value must be at least ${minLength} characters`
    };
  }

  return { isValid: true };
}

// Composite validator
export function validate<T>(
  value: T, 
  validators: Array<(value: T) => ValidationResult>,
  fieldName?: string
): ValidationResult {
  for (const validator of validators) {
    const result = validator(value);
    if (!result.isValid) {
      return {
        isValid: false,
        error: fieldName && result.error 
          ? result.error.replace(/Value|value/, fieldName)
          : result.error
      };
    }
  }

  return { isValid: true };
}

// Validation helper function that throws
export function validateOrThrow<T>(
  value: T,
  validators: Array<(value: T) => ValidationResult>,
  fieldName?: string
): void {
  const result = validate(value, validators, fieldName);
  if (!result.isValid) {
    throw new ValidationError(result.error!, fieldName);
  }
}