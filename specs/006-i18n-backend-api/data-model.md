# Data Model: Backend Internationalization

## Entities

### SupportedLanguage

**Purpose**: Define supported languages and their metadata

```typescript
interface SupportedLanguage {
  code: string; // 'en', 'ko'
  name: string; // 'English', '한국어'
  isDefault: boolean; // true for 'en'
  isRTL: boolean; // false for both en/ko
}
```

### LanguageMessage

**Purpose**: Store translated messages for different contexts

```typescript
interface LanguageMessage {
  key: string; // 'auth.user_not_found'
  translations: {
    [languageCode: string]: string; // { en: "User not found", ko: "사용자를 찾을 수 없습니다" }
  };
  context?: string; // 'auth', 'validation', 'error'
  interpolation?: {
    // for dynamic values
    [key: string]: string;
  };
}
```

### LocalizedErrorResponse

**Purpose**: API error response with localized message

```typescript
interface LocalizedErrorResponse {
  status: "error";
  timestamp: string;
  error: {
    code: string; // 'USER_NOT_FOUND'
    message: string; // Localized message
    messageKey: string; // 'auth.user_not_found' (for debugging)
    language: string; // Detected language code
  };
  path: string;
}
```

## Relationships

- **SupportedLanguage** ↔ **LanguageMessage**: One-to-Many (language has many messages)
- **LanguageMessage** ↔ **API Response**: One-to-Many (message used in many responses)

## Validation Rules

### Language Code Validation

- Must be 2-letter ISO code (en, ko)
- Must be in supported languages list
- Default fallback to 'en'

### Message Key Validation

- Must follow dot notation: `context.specific_key`
- Must have English translation (required)
- Korean translation optional (fallback to English)

## State Transitions

### Language Detection Flow

1. **Header Present** → Validate language code → Use if supported
2. **Header Missing** → Use default language (en)
3. **Invalid Code** → Log warning → Use default language (en)

### Message Resolution Flow

1. **Request Language** → Load message file → Find by key
2. **Message Found** → Return localized text
3. **Message Missing** → Fallback to English → Return or log error
