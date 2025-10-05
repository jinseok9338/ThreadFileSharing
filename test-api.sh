#!/bin/bash

# API 테스트 스크립트
BASE_URL="http://localhost:3001"
TEST_EMAIL="test-owner@example.com"
TEST_PASSWORD="TestPassword123!"
TEST_FULLNAME="Test Owner User"
TEST_COMPANY="TestCompany"

echo "🚀 ThreadFileSharing API 테스트 시작"
echo "=================================="

# 1단계: 사용자 등록
echo ""
echo "1️⃣ 사용자 등록 테스트"
echo "-------------------"
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"fullName\": \"$TEST_FULLNAME\",
    \"companyName\": \"$TEST_COMPANY\"
  }")

REGISTER_STATUS=$(echo $REGISTER_RESPONSE | jq -r '.status')
echo "등록 결과: $REGISTER_STATUS"

if [ "$REGISTER_STATUS" = "success" ]; then
  echo "✅ 사용자 등록 성공"
else
  echo "⚠️ 사용자 등록 실패 (이미 존재할 수 있음)"
fi

# 2단계: 로그인
echo ""
echo "2️⃣ 사용자 로그인 테스트"
echo "-------------------"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

LOGIN_STATUS=$(echo $LOGIN_RESPONSE | jq -r '.status')
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')

if [ "$LOGIN_STATUS" = "success" ]; then
  echo "✅ 로그인 성공"
  echo "토큰: ${TOKEN:0:50}..."
else
  echo "❌ 로그인 실패"
  exit 1
fi

# 3단계: 사용자 프로필 조회
echo ""
echo "3️⃣ 사용자 프로필 조회 테스트"
echo "------------------------"
PROFILE_RESPONSE=$(curl -s -X GET $BASE_URL/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN")

PROFILE_STATUS=$(echo $PROFILE_RESPONSE | jq -r '.status')
if [ "$PROFILE_STATUS" = "success" ]; then
  echo "✅ 사용자 프로필 조회 성공"
  USER_EMAIL=$(echo $PROFILE_RESPONSE | jq -r '.data.user.email')
  USER_ROLE=$(echo $PROFILE_RESPONSE | jq -r '.data.user.companyRole')
  echo "이메일: $USER_EMAIL"
  echo "역할: $USER_ROLE"
else
  echo "❌ 사용자 프로필 조회 실패"
fi

# 4단계: 회사 정보 조회
echo ""
echo "4️⃣ 회사 정보 조회 테스트"
echo "---------------------"
COMPANY_RESPONSE=$(curl -s -X GET $BASE_URL/api/v1/companies/me \
  -H "Authorization: Bearer $TOKEN")

COMPANY_STATUS=$(echo $COMPANY_RESPONSE | jq -r '.status')
if [ "$COMPANY_STATUS" = "success" ]; then
  echo "✅ 회사 정보 조회 성공"
  COMPANY_NAME=$(echo $COMPANY_RESPONSE | jq -r '.data.name')
  COMPANY_PLAN=$(echo $COMPANY_RESPONSE | jq -r '.data.plan')
  echo "회사명: $COMPANY_NAME"
  echo "플랜: $COMPANY_PLAN"
else
  echo "❌ 회사 정보 조회 실패"
fi

# 5단계: 회사 멤버 목록
echo ""
echo "5️⃣ 회사 멤버 목록 테스트"
echo "---------------------"
MEMBERS_RESPONSE=$(curl -s -X GET $BASE_URL/api/v1/companies/me/members \
  -H "Authorization: Bearer $TOKEN")

MEMBERS_STATUS=$(echo $MEMBERS_RESPONSE | jq -r '.status')
if [ "$MEMBERS_STATUS" = "success" ]; then
  echo "✅ 회사 멤버 목록 조회 성공"
  MEMBER_COUNT=$(echo $MEMBERS_RESPONSE | jq -r '.data | length')
  echo "멤버 수: $MEMBER_COUNT"
else
  echo "❌ 회사 멤버 목록 조회 실패"
fi

# 6단계: 회사 사용량 통계
echo ""
echo "6️⃣ 회사 사용량 통계 테스트"
echo "------------------------"
USAGE_RESPONSE=$(curl -s -X GET $BASE_URL/api/v1/companies/me/usage \
  -H "Authorization: Bearer $TOKEN")

USAGE_STATUS=$(echo $USAGE_RESPONSE | jq -r '.status')
if [ "$USAGE_STATUS" = "success" ]; then
  echo "✅ 회사 사용량 통계 조회 성공"
  USER_COUNT=$(echo $USAGE_RESPONSE | jq -r '.data.userCount')
  STORAGE_USED=$(echo $USAGE_RESPONSE | jq -r '.data.storageUsed')
  echo "사용자 수: $USER_COUNT"
  echo "사용 스토리지: $STORAGE_USED bytes"
else
  echo "❌ 회사 사용량 통계 조회 실패"
fi

# 7단계: 채팅방 목록
echo ""
echo "7️⃣ 채팅방 목록 테스트"
echo "-------------------"
CHATROOMS_RESPONSE=$(curl -s -X GET $BASE_URL/api/v1/chatrooms \
  -H "Authorization: Bearer $TOKEN")

CHATROOMS_STATUS=$(echo $CHATROOMS_RESPONSE | jq -r '.status')
if [ "$CHATROOMS_STATUS" = "success" ]; then
  echo "✅ 채팅방 목록 조회 성공"
  CHATROOM_COUNT=$(echo $CHATROOMS_RESPONSE | jq -r '.data | length')
  echo "채팅방 수: $CHATROOM_COUNT"
else
  echo "❌ 채팅방 목록 조회 실패"
fi

# 8단계: 스레드 목록
echo ""
echo "8️⃣ 스레드 목록 테스트"
echo "-------------------"
THREADS_RESPONSE=$(curl -s -X GET $BASE_URL/api/v1/threads \
  -H "Authorization: Bearer $TOKEN")

THREADS_STATUS=$(echo $THREADS_RESPONSE | jq -r '.status')
if [ "$THREADS_STATUS" = "success" ]; then
  echo "✅ 스레드 목록 조회 성공"
  THREAD_COUNT=$(echo $THREADS_RESPONSE | jq -r '.data | length')
  echo "스레드 수: $THREAD_COUNT"
else
  echo "❌ 스레드 목록 조회 실패"
fi

# 9단계: 파일 목록
echo ""
echo "9️⃣ 파일 목록 테스트"
echo "-----------------"
FILES_RESPONSE=$(curl -s -X GET $BASE_URL/api/v1/files \
  -H "Authorization: Bearer $TOKEN")

FILES_STATUS=$(echo $FILES_RESPONSE | jq -r '.status')
if [ "$FILES_STATUS" = "success" ]; then
  echo "✅ 파일 목록 조회 성공"
  FILE_COUNT=$(echo $FILES_RESPONSE | jq -r '.data.files | length')
  echo "파일 수: $FILE_COUNT"
else
  echo "❌ 파일 목록 조회 실패"
fi

# 10단계: 헬스체크
echo ""
echo "🔟 헬스체크 테스트"
echo "----------------"
HEALTH_RESPONSE=$(curl -s -X GET $BASE_URL/api/v1/health)

HEALTH_STATUS=$(echo $HEALTH_RESPONSE | jq -r '.status')
if [ "$HEALTH_STATUS" = "success" ]; then
  echo "✅ 헬스체크 성공"
  UPTIME=$(echo $HEALTH_RESPONSE | jq -r '.data.uptime')
  echo "업타임: ${UPTIME}초"
else
  echo "❌ 헬스체크 실패"
fi

echo ""
echo "=================================="
echo "🎉 API 테스트 완료!"
echo "=================================="
