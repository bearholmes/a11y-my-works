# 방법 3: 데이터베이스 직접 접근을 통한 수동 설정

## 개요
PostgreSQL 클라이언트나 CLI를 사용하여 데이터베이스에 직접 접속하여 첫 관리자를 설정하는 방법입니다.
로컬 개발 환경이나 직접 DB 접근이 가능한 경우에 사용합니다.

## 사전 준비

### 필요한 도구
- PostgreSQL 클라이언트 (psql, pgAdmin, DBeaver, TablePlus 등)
- Supabase 프로젝트의 DB 연결 정보

### DB 연결 정보 확인
1. Supabase Dashboard 접속
2. 프로젝트 선택
3. **Settings** > **Database** 메뉴
4. **Connection string** 또는 **Connection pooling** 정보 확인

연결 정보 예시:
```
Host: db.xxxxxxxxxxxxxx.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [your-password]
```

## 방법 3-1: psql (PostgreSQL CLI) 사용

### 1단계: psql 접속
```bash
psql "postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxxx.supabase.co:5432/postgres"
```

또는

```bash
psql -h db.xxxxxxxxxxxxxx.supabase.co -p 5432 -U postgres -d postgres
```

### 2단계: 관리자 역할 생성
```sql
INSERT INTO roles (name, description, is_active)
VALUES ('관리자', '시스템 관리자 - 전체 권한', true)
ON CONFLICT (name) DO NOTHING;
```

### 3단계: 사용자 확인
```sql
SELECT member_id, email, name, is_active, role_id
FROM members;
```

### 4단계: 사용자를 관리자로 승인
```sql
UPDATE members
SET
  is_active = true,
  role_id = (SELECT role_id FROM roles WHERE name = '관리자' LIMIT 1),
  updated_at = NOW()
WHERE email = 'your-email@example.com'; -- 실제 이메일로 변경
```

### 5단계: 확인
```sql
SELECT
  m.member_id,
  m.email,
  m.name,
  m.is_active,
  r.name as role_name
FROM members m
LEFT JOIN roles r ON m.role_id = r.role_id
WHERE m.email = 'your-email@example.com';
```

### 6단계: 접속 종료
```sql
\q
```

## 방법 3-2: GUI 클라이언트 (pgAdmin, DBeaver 등) 사용

### 1단계: 새 연결 생성
**pgAdmin 예시:**
1. Servers 우클릭 > Create > Server
2. General 탭:
   - Name: My Supabase Project
3. Connection 탭:
   - Host: db.xxxxxxxxxxxxxx.supabase.co
   - Port: 5432
   - Database: postgres
   - Username: postgres
   - Password: [your-password]
4. Save

**DBeaver 예시:**
1. New Connection 클릭
2. PostgreSQL 선택
3. Connection settings:
   - Host: db.xxxxxxxxxxxxxx.supabase.co
   - Port: 5432
   - Database: postgres
   - Username: postgres
   - Password: [your-password]
4. Test Connection
5. Finish

### 2단계: Query Tool/SQL Editor 열기
- pgAdmin: Tools > Query Tool
- DBeaver: SQL Editor 아이콘 클릭

### 3단계: SQL 실행
```sql
-- 관리자 역할 생성
INSERT INTO roles (name, description, is_active)
VALUES ('관리자', '시스템 관리자', true)
ON CONFLICT (name) DO NOTHING;

-- 사용자를 관리자로 승인
UPDATE members
SET
  is_active = true,
  role_id = (SELECT role_id FROM roles WHERE name = '관리자' LIMIT 1),
  updated_at = NOW()
WHERE email = 'your-email@example.com';

-- 확인
SELECT
  m.member_id,
  m.email,
  m.name,
  m.is_active,
  r.name as role_name
FROM members m
LEFT JOIN roles r ON m.role_id = r.role_id
WHERE m.email = 'your-email@example.com';
```

## 방법 3-3: TablePlus 사용

### 1단계: 새 연결 생성
1. TablePlus 실행
2. Create a new connection
3. PostgreSQL 선택
4. 연결 정보 입력:
   - Name: Supabase Project
   - Host: db.xxxxxxxxxxxxxx.supabase.co
   - Port: 5432
   - User: postgres
   - Password: [your-password]
   - Database: postgres
5. Test 후 Connect

### 2단계: SQL 실행
1. 상단의 SQL 아이콘 클릭
2. 위의 SQL 스크립트 입력 및 실행

## 장점
- 전체 DB 구조를 볼 수 있음
- 복잡한 쿼리 실행 가능
- 로컬 환경에서 작업 가능
- 트랜잭션 관리 용이
- 백업/복원 가능

## 단점
- DB 연결 정보 필요
- 클라이언트 도구 설치 필요
- 보안 위험 (연결 정보 노출 가능성)
- Supabase 콘솔보다 복잡

## 보안 고려사항

### ⚠️ 중요: 연결 정보 보안
1. **연결 정보를 절대 Git에 커밋하지 마세요**
2. **환경 변수로 관리하세요**
   ```bash
   # .env.local
   DB_HOST=db.xxxxxxxxxxxxxx.supabase.co
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your-password
   DB_NAME=postgres
   ```
3. **프로덕션 DB는 IP 화이트리스트 설정**
4. **읽기 전용 계정 사용 고려**

### Supabase에서 IP 화이트리스트 설정
1. Supabase Dashboard
2. Settings > Database
3. Connection pooling 섹션
4. Allowed IP addresses 설정

## 문제 해결

### "connection refused" 오류
**원인**: 방화벽 또는 IP 제한
**해결**:
1. Supabase 프로젝트의 네트워크 설정 확인
2. 본인 IP가 허용되어 있는지 확인
3. VPN 사용 시 비활성화 후 재시도

### "password authentication failed" 오류
**원인**: 잘못된 비밀번호
**해결**:
1. Supabase Dashboard에서 DB 비밀번호 재확인
2. 비밀번호 재설정 (Settings > Database > Reset database password)

### "SSL connection required" 오류
**원인**: SSL 연결 필요
**해결**:
- psql: `psql "postgresql://...?sslmode=require"`
- GUI 클라이언트: SSL 설정 활성화

## 비교: 언제 이 방법을 사용할까?

### 사용 권장 상황
- 로컬 개발 환경
- 복잡한 데이터 마이그레이션
- 대량의 초기 데이터 삽입
- 데이터베이스 구조 분석 필요
- 백업/복원 작업

### 사용 비권장 상황
- 간단한 관리자 설정 (→ 방법 1, 2 사용)
- 프로덕션 환경 (→ Supabase 콘솔 사용)
- DB 지식이 부족한 경우
- 보안이 중요한 경우

## 추천 클라이언트 도구

### 1. TablePlus (★★★★★)
- **가격**: 무료 (제한적) / 유료
- **OS**: macOS, Windows, Linux
- **장점**: 빠르고 직관적, 아름다운 UI
- **단점**: 유료 (1회 구매)

### 2. DBeaver (★★★★☆)
- **가격**: 무료 (Community Edition)
- **OS**: macOS, Windows, Linux
- **장점**: 무료, 강력한 기능
- **단점**: 다소 무거움

### 3. pgAdmin (★★★☆☆)
- **가격**: 무료
- **OS**: macOS, Windows, Linux
- **장점**: 공식 PostgreSQL 클라이언트, 무료
- **단점**: UI가 다소 구식

### 4. psql (★★★★☆)
- **가격**: 무료
- **OS**: macOS, Windows, Linux
- **장점**: 빠르고 가벼움, 스크립팅 용이
- **단점**: CLI, 학습 곡선

---

**권장 대상**: 개발자, DB 관리자, 대량 작업이 필요한 경우
**비권장 대상**: DB 초보자, 프로덕션 환경 단순 관리
**작성일**: 2025-11-11
