# MinIO/S3 파일 스토리지 배포 가이드

## 📋 개요

이 문서는 ThreadFileSharing 프로젝트에서 MinIO (로컬 개발)와 AWS S3 (프로덕션) 환경을 설정하는 방법을 설명합니다.

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   (Next.js)     │◄──►│   (NestJS)      │
└─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Storage Layer  │
                       │                 │
                       │  Local: MinIO   │
                       │  Prod: AWS S3   │
                       └─────────────────┘
```

## 🔧 환경별 설정

### 로컬 개발 환경 (MinIO)

#### 1. Docker Compose 설정

```yaml
# docker-compose.yml
services:
  minio:
    image: minio/minio:latest
    container_name: threadfilesharing-minio
    ports:
      - "9000:9000" # MinIO API
      - "9001:9001" # MinIO Console
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

volumes:
  minio_data:
```

#### 2. 환경 변수 설정

```bash
# packages/backend/.env
NODE_ENV=local

# MinIO 설정
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=threadfilesharing
```

#### 3. MinIO 초기화

```bash
# MinIO 서버 시작
docker-compose up -d minio

# MinIO Console 접속
# http://localhost:9001
# Username: minioadmin
# Password: minioadmin

# 버킷 생성 확인 (자동 생성됨)
curl http://localhost:9000/minio/health/live
```

### 프로덕션 환경 (AWS S3)

#### 1. AWS S3 설정

```bash
# packages/backend/.env
NODE_ENV=production

# AWS S3 설정
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-production-bucket
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

#### 2. AWS IAM 정책

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetObjectVersion"
      ],
      "Resource": "arn:aws:s3:::your-production-bucket/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:GetBucketLocation"],
      "Resource": "arn:aws:s3:::your-production-bucket"
    }
  ]
}
```

## 🚀 배포 단계

### 1. 로컬 개발 환경 설정

```bash
# 1. Docker Compose로 MinIO 시작
docker-compose up -d minio

# 2. MinIO 헬스체크
curl http://localhost:9000/minio/health/live

# 3. 백엔드 서버 시작
cd packages/backend
pnpm install
pnpm start:dev

# 4. 환경 확인
curl http://localhost:3001/api/v1/health
```

### 2. 프로덕션 환경 배포

```bash
# 1. 환경 변수 설정
export NODE_ENV=production
export AWS_REGION=us-east-1
export AWS_S3_BUCKET_NAME=your-production-bucket

# 2. AWS 자격 증명 설정
aws configure

# 3. S3 버킷 생성 (필요시)
aws s3 mb s3://your-production-bucket --region us-east-1

# 4. 백엔드 빌드 및 배포
cd packages/backend
pnpm install --production
pnpm build
pnpm start:prod
```

## 🔍 모니터링 및 진단

### MinIO 모니터링

```bash
# MinIO 서버 상태 확인
curl http://localhost:9000/minio/health/live

# MinIO Console 접속
open http://localhost:9001

# Docker 로그 확인
docker logs threadfilesharing-minio
```

### AWS S3 모니터링

```bash
# S3 버킷 상태 확인
aws s3 ls s3://your-production-bucket

# CloudWatch 메트릭 확인
aws cloudwatch get-metric-statistics \
  --namespace AWS/S3 \
  --metric-name BucketSizeBytes \
  --dimensions Name=BucketName,Value=your-production-bucket \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Average
```

## 🛠️ 트러블슈팅

### 일반적인 문제들

#### 1. MinIO 연결 실패

```bash
# MinIO 서버 상태 확인
docker ps | grep minio

# MinIO 로그 확인
docker logs threadfilesharing-minio

# 포트 확인
netstat -tulpn | grep :9000
```

#### 2. AWS S3 자격 증명 오류

```bash
# AWS 자격 증명 확인
aws sts get-caller-identity

# 환경 변수 확인
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
```

#### 3. 파일 업로드 실패

```bash
# 백엔드 로그 확인
tail -f packages/backend/logs/app.log

# 네트워크 연결 확인
curl -v http://localhost:9000/minio/health/live
```

### 성능 최적화

#### 1. MinIO 성능 튜닝

```yaml
# docker-compose.yml
services:
  minio:
    environment:
      MINIO_CACHE_DRIVES: /tmp/cache
      MINIO_CACHE_EXCLUDE: "*.pdf,*.mp4"
      MINIO_CACHE_QUOTA: 80
      MINIO_CACHE_AFTER: 3
      MINIO_CACHE_WATERMARK_LOW: 70
      MINIO_CACHE_WATERMARK_HIGH: 90
```

#### 2. AWS S3 성능 최적화

```bash
# 멀티파트 업로드 설정
export AWS_S3_MULTIPART_THRESHOLD=64MB
export AWS_S3_MULTIPART_CHUNKSIZE=16MB
export AWS_S3_MAX_CONCURRENCY=10
```

## 📊 백업 및 복구

### MinIO 백업

```bash
# MinIO 데이터 백업
docker run --rm -v minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio-backup-$(date +%Y%m%d).tar.gz -C /data .

# MinIO 데이터 복구
docker run --rm -v minio_data:/data -v $(pwd):/backup alpine tar xzf /backup/minio-backup-20240101.tar.gz -C /data
```

### AWS S3 백업

```bash
# S3 버킷 백업
aws s3 sync s3://your-production-bucket s3://your-backup-bucket --delete

# 버전 관리 활성화
aws s3api put-bucket-versioning \
  --bucket your-production-bucket \
  --versioning-configuration Status=Enabled
```

## 🔒 보안 고려사항

### MinIO 보안

```bash
# 1. 기본 자격 증명 변경
MINIO_ROOT_USER=secure-username
MINIO_ROOT_PASSWORD=secure-password

# 2. TLS 활성화
MINIO_SERVER_URL=https://minio.yourdomain.com
MINIO_BROWSER_REDIRECT_URL=https://console.yourdomain.com
```

### AWS S3 보안

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyInsecureConnections",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::your-production-bucket",
        "arn:aws:s3:::your-production-bucket/*"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
```

## 📝 체크리스트

### 로컬 개발 환경

- [ ] Docker Compose로 MinIO 실행
- [ ] MinIO Console 접속 가능
- [ ] 백엔드 서버 시작
- [ ] 파일 업로드 테스트 성공
- [ ] 저장소 할당량 API 정상 작동

### 프로덕션 환경

- [ ] AWS S3 버킷 생성
- [ ] IAM 정책 설정
- [ ] 환경 변수 설정
- [ ] 백엔드 배포
- [ ] 파일 업로드 테스트 성공
- [ ] 모니터링 설정

## 🆘 지원 및 문의

문제가 발생하거나 추가 도움이 필요한 경우:

1. 로그 파일 확인: `packages/backend/logs/`
2. MinIO Console: http://localhost:9001
3. AWS CloudWatch 로그 확인
4. 개발팀에 문의

---

**마지막 업데이트**: 2025-10-03
**버전**: 1.0.0
