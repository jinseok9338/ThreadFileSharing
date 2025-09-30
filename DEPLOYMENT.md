# ThreadFileSharing 배포 가이드

## Docker Compose를 이용한 배포

### 사전 요구사항

- Docker 20.10+
- Docker Compose 2.0+
- 최소 2GB RAM
- 최소 10GB 디스크 공간

### 환경 설정

1. **환경 변수 파일 생성**

```bash
# .env.local 파일 생성 (로컬 개발용)
cp .env.example .env.local

# 환경 변수 설정
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=dev_password
DATABASE_NAME=threadfilesharing_local
NODE_ENV=local
PORT=3001
```

2. **환경별 설정**

```bash
# 개발 환경
cp .env.example .env.development

# 스테이징 환경
cp .env.example .env.staging

# 프로덕션 환경
cp .env.example .env.production
```

### 배포 단계

#### 1. 전체 스택 배포

```bash
# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

#### 2. 단계별 배포

```bash
# 1단계: 데이터베이스 시작
docker-compose up -d postgres

# 2단계: 데이터베이스 준비 대기
sleep 30

# 3단계: 백엔드 애플리케이션 시작
docker-compose up -d backend

# 4단계: Redis 시작 (선택사항)
docker-compose up -d redis
```

#### 3. 헬스체크 확인

```bash
# 기본 헬스체크
curl http://localhost:3001/health

# 데이터베이스 헬스체크
curl http://localhost:3001/health/database

# 준비 상태 확인
curl http://localhost:3001/health/ready

# 생존 상태 확인
curl http://localhost:3001/health/live
```

### 서비스 관리

#### 시작/중지/재시작

```bash
# 서비스 시작
docker-compose start

# 서비스 중지
docker-compose stop

# 서비스 재시작
docker-compose restart

# 서비스 완전 중지 및 컨테이너 제거
docker-compose down
```

#### 로그 관리

```bash
# 모든 서비스 로그
docker-compose logs

# 특정 서비스 로그
docker-compose logs backend
docker-compose logs postgres

# 실시간 로그 모니터링
docker-compose logs -f backend
```

#### 데이터 관리

```bash
# 데이터베이스 백업
docker-compose exec postgres pg_dump -U postgres threadfilesharing_local > backup.sql

# 데이터베이스 복원
docker-compose exec -T postgres psql -U postgres threadfilesharing_local < backup.sql

# 볼륨 데이터 확인
docker volume ls
docker volume inspect threadfilesharing_postgres_data
```

### 모니터링

#### 컨테이너 상태 확인

```bash
# 실행 중인 컨테이너
docker-compose ps

# 리소스 사용량
docker stats

# 컨테이너 상세 정보
docker-compose config
```

#### API 엔드포인트

- **애플리케이션**: http://localhost:3001
- **헬스체크**: http://localhost:3001/health
- **API 문서**: http://localhost:3001/api
- **데이터베이스**: localhost:5432
- **Redis**: localhost:6379

### 문제 해결

#### 일반적인 문제들

1. **포트 충돌**

```bash
# 포트 사용 중인 프로세스 확인
lsof -i :3001
lsof -i :5432

# 프로세스 종료
kill -9 <PID>
```

2. **데이터베이스 연결 실패**

```bash
# 데이터베이스 컨테이너 상태 확인
docker-compose logs postgres

# 데이터베이스 재시작
docker-compose restart postgres
```

3. **메모리 부족**

```bash
# Docker 메모리 사용량 확인
docker system df
docker system prune -a
```

#### 로그 분석

```bash
# 에러 로그 필터링
docker-compose logs backend | grep ERROR

# 특정 시간대 로그
docker-compose logs --since="2024-01-01T00:00:00" backend
```

### 보안 고려사항

1. **환경 변수 보안**

   - `.env` 파일을 `.gitignore`에 추가
   - 프로덕션에서는 Docker Secrets 사용

2. **네트워크 보안**

   - 프로덕션에서는 방화벽 설정
   - HTTPS 사용 권장

3. **데이터베이스 보안**
   - 강력한 비밀번호 사용
   - SSL 연결 활성화

### 성능 최적화

1. **리소스 제한 설정**

```yaml
# docker-compose.yml에 추가
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

2. **로깅 최적화**

```yaml
# 로그 드라이버 설정
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 백업 및 복구

1. **정기 백업 스크립트**

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U postgres threadfilesharing_local > "backup_${DATE}.sql"
```

2. **자동 복구**

```bash
#!/bin/bash
# restore.sh
docker-compose down
docker-compose up -d postgres
sleep 30
docker-compose exec -T postgres psql -U postgres threadfilesharing_local < backup.sql
docker-compose up -d backend
```

### 업데이트 및 배포

1. **애플리케이션 업데이트**

```bash
# 새 버전 빌드
docker-compose build backend

# 무중단 배포
docker-compose up -d --no-deps backend
```

2. **데이터베이스 마이그레이션**

```bash
# 마이그레이션 실행
docker-compose exec backend npm run migration:run
```

이 가이드를 따라하면 ThreadFileSharing 애플리케이션을 Docker Compose로 안전하고 효율적으로 배포할 수 있습니다.
