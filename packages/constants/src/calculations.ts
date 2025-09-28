export const CONVERSION_FACTORS = {
  // Time conversions
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  DAYS_PER_WEEK: 7,
  DAYS_PER_MONTH: 30,
  DAYS_PER_YEAR: 365,

  // Memory conversions
  BYTES_PER_KB: 1024,
  BYTES_PER_MB: 1024 * 1024,
  BYTES_PER_GB: 1024 * 1024 * 1024,
  BYTES_PER_TB: 1024 * 1024 * 1024 * 1024,

  // Percentage calculations
  PERCENT_MULTIPLIER: 100,
  DECIMAL_TO_PERCENT: 100,
  PERCENT_TO_DECIMAL: 0.01,

  // Currency calculations (base unit is cents)
  CENTS_PER_DOLLAR: 100,
  CENTS_PER_EURO: 100,

  // Network calculations
  BITS_PER_BYTE: 8,
  KILOBITS_PER_MEGABIT: 1000,
  MEGABITS_PER_GIGABIT: 1000
} as const;

export const MATHEMATICAL_CONSTANTS = {
  PI: Math.PI,
  E: Math.E,
  GOLDEN_RATIO: 1.618033988749,
  SQRT_2: Math.SQRT2,
  SQRT_1_2: Math.SQRT1_2,
  LN_2: Math.LN2,
  LN_10: Math.LN10,
  LOG_2_E: Math.LOG2E,
  LOG_10_E: Math.LOG10E
} as const;

export const ROUNDING_PRECISION = {
  CURRENCY: 2,          // 2 decimal places for currency
  PERCENTAGE: 2,        // 2 decimal places for percentages
  RATE: 4,             // 4 decimal places for rates
  PERFORMANCE: 3,       // 3 decimal places for performance metrics
  COORDINATES: 6,       // 6 decimal places for GPS coordinates
  ANALYTICS: 2          // 2 decimal places for analytics
} as const;

// Time conversion functions
export function millisecondsToSeconds(ms: number): number {
  return ms / CONVERSION_FACTORS.MILLISECONDS_PER_SECOND;
}

export function secondsToMilliseconds(seconds: number): number {
  return seconds * CONVERSION_FACTORS.MILLISECONDS_PER_SECOND;
}

export function secondsToMinutes(seconds: number): number {
  return seconds / CONVERSION_FACTORS.SECONDS_PER_MINUTE;
}

export function minutesToSeconds(minutes: number): number {
  return minutes * CONVERSION_FACTORS.SECONDS_PER_MINUTE;
}

export function minutesToHours(minutes: number): number {
  return minutes / CONVERSION_FACTORS.MINUTES_PER_HOUR;
}

export function hoursToMinutes(hours: number): number {
  return hours * CONVERSION_FACTORS.MINUTES_PER_HOUR;
}

export function hoursToDays(hours: number): number {
  return hours / CONVERSION_FACTORS.HOURS_PER_DAY;
}

export function daysToHours(days: number): number {
  return days * CONVERSION_FACTORS.HOURS_PER_DAY;
}

// Memory conversion functions
export function bytesToKB(bytes: number): number {
  return bytes / CONVERSION_FACTORS.BYTES_PER_KB;
}

export function bytesToMB(bytes: number): number {
  return bytes / CONVERSION_FACTORS.BYTES_PER_MB;
}

export function bytesToGB(bytes: number): number {
  return bytes / CONVERSION_FACTORS.BYTES_PER_GB;
}

export function bytesToTB(bytes: number): number {
  return bytes / CONVERSION_FACTORS.BYTES_PER_TB;
}

export function kbToBytes(kb: number): number {
  return kb * CONVERSION_FACTORS.BYTES_PER_KB;
}

export function mbToBytes(mb: number): number {
  return mb * CONVERSION_FACTORS.BYTES_PER_MB;
}

export function gbToBytes(gb: number): number {
  return gb * CONVERSION_FACTORS.BYTES_PER_GB;
}

// Percentage calculation functions
export function decimalToPercentage(decimal: number, precision = ROUNDING_PRECISION.PERCENTAGE): number {
  return Number((decimal * CONVERSION_FACTORS.DECIMAL_TO_PERCENT).toFixed(precision));
}

export function percentageToDecimal(percentage: number): number {
  return percentage * CONVERSION_FACTORS.PERCENT_TO_DECIMAL;
}

export function calculatePercentage(part: number, whole: number, precision = ROUNDING_PRECISION.PERCENTAGE): number {
  if (whole === 0) return 0;
  return Number(((part / whole) * CONVERSION_FACTORS.PERCENT_MULTIPLIER).toFixed(precision));
}

export function calculatePercentageChange(oldValue: number, newValue: number, precision = ROUNDING_PRECISION.PERCENTAGE): number {
  if (oldValue === 0) return newValue > 0 ? Infinity : 0;
  return Number((((newValue - oldValue) / oldValue) * CONVERSION_FACTORS.PERCENT_MULTIPLIER).toFixed(precision));
}

// Currency conversion functions
export function centsTodollars(cents: number): number {
  return cents / CONVERSION_FACTORS.CENTS_PER_DOLLAR;
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * CONVERSION_FACTORS.CENTS_PER_DOLLAR);
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: ROUNDING_PRECISION.CURRENCY,
    maximumFractionDigits: ROUNDING_PRECISION.CURRENCY
  }).format(amount);
}

// Rate calculation functions
export function calculateRate(events: number, timeWindow: number, precision = ROUNDING_PRECISION.RATE): number {
  if (timeWindow === 0) return 0;
  return Number((events / timeWindow).toFixed(precision));
}

export function calculateRequestsPerSecond(requests: number, timeWindowMs: number): number {
  const timeWindowSeconds = millisecondsToSeconds(timeWindowMs);
  return calculateRate(requests, timeWindowSeconds);
}

export function calculateErrorRate(errors: number, total: number, precision = ROUNDING_PRECISION.PERCENTAGE): number {
  return calculatePercentage(errors, total, precision);
}

// Statistics functions
export function calculateAverage(values: number[], precision = ROUNDING_PRECISION.ANALYTICS): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Number((sum / values.length).toFixed(precision));
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  if (percentile < 0 || percentile > 100) throw new Error('Percentile must be between 0 and 100');

  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);

  if (Math.floor(index) === index) {
    return sorted[index];
  }

  const lower = sorted[Math.floor(index)];
  const upper = sorted[Math.ceil(index)];
  return lower + (upper - lower) * (index - Math.floor(index));
}

// Utility functions
export function roundToPrecision(value: number, precision: number): number {
  return Number(value.toFixed(precision));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}