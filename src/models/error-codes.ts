/**
 * Error Codes for Bank Sync Service
 * 
 * Error code ranges:
 * - 2000-2099: Bank Connection errors
 * - 2100-2199: Account Service errors
 * - 2200-2299: Database errors
 * - 2300-2399: Validation errors
 * - 2400-2499: System/Internal errors
 */

export enum ErrorCode {
  // Bank Connection errors (2000-2099)
  CONNECTION_NOT_FOUND = 2022,
  CONNECTION_UPDATE_NOT_FOUND = 2023,
  CONNECTION_ALREADY_EXISTS = 2026,
  ADD_CONNECTION_FAILED = 2027,
  READ_CONNECTION_FAILED = 2028,
  REMOVE_CONNECTION_FAILED = 2029,
  UPDATE_CONNECTION_FAILED = 2030,
  SYNC_FAILED = 2031,
  
  // Request validation errors (2300-2399)
  INVALID_REQUEST = 2032,
  INVALID_ACTION = 2033,
  MISSING_REQUIRED_ARGS = 2034,
  
  // Account Service errors (2100-2199)
  ACCOUNT_SERVICE_UNAVAILABLE = 2040,
  ACCOUNT_SERVICE_ERROR = 2041,
  ACCOUNT_SERVICE_TIMEOUT = 2042,
  
  // Database errors (2200-2299)
  DATABASE_ERROR = 2050,
  DATABASE_CONNECTION_ERROR = 2051,
  DATABASE_QUERY_ERROR = 2052,
  
  // System/Internal errors (2400-2499)
  INTERNAL_ERROR = 2500,
  UNKNOWN_ERROR = 2599,
}

/**
 * Get error code from error object or error message
 */
export function getErrorCode(error: any): ErrorCode {
  if (error && typeof error === 'object') {
    if (error.code) {
      return error.code as ErrorCode;
    }
    if (error.errorCode) {
      return error.errorCode as ErrorCode;
    }
    
    // Check error message for specific patterns
    const errorMessage = String(error.message || error);
    
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connect')) {
      return ErrorCode.ACCOUNT_SERVICE_UNAVAILABLE;
    }
    if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('timeout')) {
      return ErrorCode.ACCOUNT_SERVICE_TIMEOUT;
    }
    if (errorMessage.includes('database') || errorMessage.includes('Database')) {
      return ErrorCode.DATABASE_ERROR;
    }
    if (errorMessage.includes('connection') && errorMessage.includes('not found')) {
      return ErrorCode.CONNECTION_NOT_FOUND;
    }
    if (errorMessage.includes('already exists')) {
      return ErrorCode.CONNECTION_ALREADY_EXISTS;
    }
  }
  
  return ErrorCode.UNKNOWN_ERROR;
}

