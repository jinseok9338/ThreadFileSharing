# Backend Internationalization Quickstart

## Setup Guide

### 1. Language Detection

The backend automatically detects the user's preferred language from the `X-Custom-Language` header.

```bash
# Korean request
curl -H "X-Custom-Language: ko" http://localhost:3001/api/v1/auth/login

# English request
curl -H "X-Custom-Language: en" http://localhost:3001/api/v1/auth/login

# No header (defaults to English)
curl http://localhost:3001/api/v1/auth/login
```

### 2. Supported Languages

Currently supports:

- **English (en)**: Default language
- **Korean (ko)**: Full translation

### 3. Error Response Examples

#### Korean Response

```json
{
  "status": "error",
  "timestamp": "2025-10-01T11:00:00.000Z",
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "사용자를 찾을 수 없습니다",
    "messageKey": "auth.user_not_found",
    "language": "ko"
  },
  "path": "/api/v1/auth/login"
}
```

#### English Response

```json
{
  "status": "error",
  "timestamp": "2025-10-01T11:00:00.000Z",
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found",
    "messageKey": "auth.user_not_found",
    "language": "en"
  },
  "path": "/api/v1/auth/login"
}
```

## Integration Testing

### Test Scenarios

1. **Language Detection Test**

   - Send request with `X-Custom-Language: ko`
   - Verify response contains `"language": "ko"`
   - Verify error message is in Korean

2. **Fallback Test**

   - Send request with unsupported language code
   - Verify response defaults to English
   - Verify error message is in English

3. **Missing Header Test**
   - Send request without language header
   - Verify response defaults to English
   - Verify error message is in English

### Bruno Test Collection

Run the Bruno tests in `tests/bruno/i18n/` to verify:

- Language detection middleware
- Message translation accuracy
- Fallback behavior
- All auth endpoints with different languages

## Message Management

### Adding New Messages

1. Add message key to `packages/backend/src/i18n/locales/en.json`
2. Add Korean translation to `packages/backend/src/i18n/locales/ko.json`
3. Use in service: `this.i18nService.translate('auth.new_message', language)`

### Message Key Convention

- Format: `context.specific_key`
- Examples: `auth.user_not_found`, `validation.email_invalid`, `error.server_error`

### Interpolation Support

Messages support dynamic values:

```json
{
  "auth.account_locked": "Account is locked. Try again in {{minutes}} minutes."
}
```
