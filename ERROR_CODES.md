# Error Codes Reference

This document lists all error codes used by the Bank Sync Service API.

## Error Code Ranges

- **2000-2099**: Bank Connection errors
- **2100-2199**: Account Service errors  
- **2200-2299**: Database errors
- **2300-2399**: Validation errors
- **2400-2499**: System/Internal errors

## Error Codes

### Bank Connection Errors (2000-2099)

| Code | Name | Description |
|------|------|-------------|
| 2022 | `CONNECTION_NOT_FOUND` | Connection not found when attempting to remove |
| 2023 | `CONNECTION_UPDATE_NOT_FOUND` | Connection not found when attempting to update |
| 2026 | `CONNECTION_ALREADY_EXISTS` | Bank connection already exists for the user |
| 2027 | `ADD_CONNECTION_FAILED` | Failed to add bank connection (generic error) |
| 2028 | `READ_CONNECTION_FAILED` | Failed to read bank connections (generic error) |
| 2029 | `REMOVE_CONNECTION_FAILED` | Failed to remove bank connection (generic error) |
| 2030 | `UPDATE_CONNECTION_FAILED` | Failed to update bank connection (generic error) |
| 2031 | `SYNC_FAILED` | Failed to synchronize bank connections (generic error) |

### Validation Errors (2300-2399)

| Code | Name | Description |
|------|------|-------------|
| 2032 | `INVALID_REQUEST` | Invalid request (missing or malformed request body) |
| 2033 | `INVALID_ACTION` | Invalid action specified in the request |
| 2034 | `MISSING_REQUIRED_ARGS` | Missing required arguments in the request |

### Account Service Errors (2100-2199)

| Code | Name | Description |
|------|------|-------------|
| 2040 | `ACCOUNT_SERVICE_UNAVAILABLE` | Account service is not available (connection refused) |
| 2041 | `ACCOUNT_SERVICE_ERROR` | Account service returned an error |
| 2042 | `ACCOUNT_SERVICE_TIMEOUT` | Account service request timed out |

### Database Errors (2200-2299)

| Code | Name | Description |
|------|------|-------------|
| 2050 | `DATABASE_ERROR` | Generic database error |
| 2051 | `DATABASE_CONNECTION_ERROR` | Database connection error |
| 2052 | `DATABASE_QUERY_ERROR` | Database query execution error |

### System/Internal Errors (2400-2499)

| Code | Name | Description |
|------|------|-------------|
| 2500 | `INTERNAL_ERROR` | Internal server error |
| 2599 | `UNKNOWN_ERROR` | Unknown or unclassified error |

## Error Response Format

All error responses follow this format:

```json
{
  "action": "action-name",
  "error": "Human-readable error message",
  "errorCode": 2026
}
```

## Usage Examples

### Connection Already Exists
```json
{
  "action": "add-bank-connection",
  "error": "Bank connection CHASE:user123 already exists for user abc-123",
  "errorCode": 2026
}
```

### Invalid Action
```json
{
  "action": "invalid-action",
  "error": "Invalid action: invalid-action",
  "errorCode": 2033
}
```

### Account Service Unavailable
```json
{
  "action": "sync",
  "error": "Error: connect ECONNREFUSED 127.0.0.1:9000",
  "errorCode": 2040
}
```

## Implementation Notes

- Error codes are defined in `src/models/error-codes.ts`
- The `getErrorCode()` function automatically maps common error patterns to appropriate error codes
- All error responses now include an `errorCode` field
- Error codes are designed to be stable and should not change between versions

