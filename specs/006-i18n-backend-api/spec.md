# Feature Specification: Backend Internationalization (i18n) API

**Feature Branch**: `006-i18n-backend-api`  
**Created**: 2025-10-01  
**Status**: Draft  
**Input**: User description: "백엔드에서 메세지가 영어로 내려오니깐 프론트에서는 영어로 하는 수밖에 없어. X-Custom-language header에서 받아서 그거에 맞게 백엔드에서 내려줘야 할거 같아"

## User Scenarios & Testing

### Primary User Story

사용자가 프론트엔드에서 언어를 설정하면, 백엔드 API 응답 메시지도 해당 언어로 표시되어야 합니다.

### Acceptance Scenarios

1. **Given** 프론트엔드에서 한국어로 설정, **When** 로그인 API 호출, **Then** 에러 메시지가 한국어로 표시
2. **Given** 프론트엔드에서 영어로 설정, **When** 회원가입 API 호출, **Then** 에러 메시지가 영어로 표시
3. **Given** 언어 헤더가 없을 때, **When** API 호출, **Then** 기본 언어(영어)로 메시지 표시

### Edge Cases

- 지원하지 않는 언어 코드가 전달될 때?
- 잘못된 언어 헤더 형식이 전달될 때?
- 언어별 메시지가 없을 때 fallback 처리?

## Requirements

### Functional Requirements

- **FR-001**: 백엔드가 `X-Custom-Language` 헤더를 읽어서 언어 설정을 인식할 수 있어야 함
- **FR-002**: 지원하는 언어 목록을 관리할 수 있어야 함 (ko, en)
- **FR-003**: API 에러 메시지를 언어별로 다르게 반환할 수 있어야 함
- **FR-004**: 언어별 메시지 파일을 관리할 수 있어야 함
- **FR-005**: 언어 헤더가 없거나 지원하지 않는 언어일 때 기본 언어(영어)로 fallback해야 함

### Key Entities

- **LanguageMessage**: 언어별 메시지 템플릿과 번역본
- **SupportedLanguage**: 지원하는 언어 코드와 메타데이터
- **ErrorResponse**: 언어별 에러 메시지를 포함한 API 응답
