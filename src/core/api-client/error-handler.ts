// Standardized error handling for API clients

import { ApiError } from './types';

export class TurnkeyApiError extends Error implements ApiError {
  public readonly status?: number;
  public readonly statusText?: string;
  public readonly code?: string;
  public readonly response?: {
    data?: any;
    status: number;
    statusText: string;
  };

  constructor(
    message: string,
    options: {
      status?: number;
      statusText?: string;
      code?: string;
      response?: any;
    } = {}
  ) {
    super(message);
    this.name = 'TurnkeyApiError';
    this.status = options.status;
    this.statusText = options.statusText;
    this.code = options.code;
    this.response = options.response;

    // Maintain proper stack trace for where our error was thrown (Node.js only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TurnkeyApiError);
    }
  }
}

export function createApiError(message: string, status?: number, response?: any): TurnkeyApiError {
  return new TurnkeyApiError(message, {
    status,
    statusText: response?.statusText || getStatusText(status),
    code: `API_ERROR_${status || 'UNKNOWN'}`,
    response: response
      ? {
          data: response.data,
          status: response.status || status || 0,
          statusText: response.statusText || getStatusText(status),
        }
      : undefined,
  });
}

export function isRetryableError(error: ApiError): boolean {
  if (!error.status) return false;

  // Retry on server errors (5xx) and specific client errors
  return (
    error.status >= 500 ||
    error.status === 408 || // Request Timeout
    error.status === 429
  ); // Too Many Requests
}

export function getStatusText(status?: number): string {
  const statusTexts: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    408: 'Request Timeout',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };

  return statusTexts[status || 0] || 'Unknown Error';
}

export function handleApiError(error: any): never {
  if (error instanceof TurnkeyApiError) {
    throw error;
  }

  // Handle fetch API errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw createApiError('Network error: Unable to connect to server', 0, null);
  }

  // Handle generic errors
  const message = error.message || 'An unexpected error occurred';
  const status = error.status || error.response?.status;

  throw createApiError(message, status, error.response);
}
