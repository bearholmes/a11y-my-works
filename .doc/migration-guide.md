# 데이터베이스 마이그레이션 가이드

## 개요

이 문서는 기존 운영 중인 데이터베이스에 새로운 기능을 추가할 때 필요한 마이그레이션 절차를 설명합니다.

## ⚠️ 주의사항

1. **반드시 백업을 먼저 생성하세요!**
2. 가능하면 개발/스테이징 환경에서 먼저 테스트하세요
3. 프로덕션 환경에서는 트래픽이 적은 시간대에 진행하세요
4. 마이그레이션 중 에러 발생 시 즉시 중단하고 롤백하세요

## 마이그레이션 목록

### Migration-001: Pending User 역할 추가 (2025-01-10)

**목적**: 자체 가입한 사용자에게 권한이 없는 Pending User 역할을 자동 할당

**영향받는 테이블**:
- `roles` - Pending User 역할 추가
- `members` - 기존 role_id가 NULL인 회원 업데이트
- `auth.users` - 트리거 추가

**예상 소요 시간**: 약 5분 (데이터 양에 따라 다름)

## 마이그레이션 실행 방법

### Step 1: 백업 생성

**Supabase Dashboard 사용**:
1. Supabase Dashboard 로그인
2. Database > Backups 메뉴로 이동
3. "Create backup" 클릭
4. 백업 이름 입력 (예: `before-migration-001`)
5. 백업 완료 대기

**또는 SQL 명령어**:
```bash
# pg_dump 사용 (로컬에서 실행)
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: 마이그레이션 SQL 실행

**Supabase SQL Editor 사용**:
1. Supabase Dashboard > SQL Editor 메뉴로 이동
2. "New query" 클릭
3. `.doc/sql/migration-001-pending-user-role.sql` 파일 내용 복사
4. SQL Editor에 붙여넣기
5. 각 단계를 **하나씩 실행** (전체 실행 X)

**단계별 실행 순서**:

#### 2-1. Step 2 실행 (Pending User 역할 생성)
```sql
BEGIN;
INSERT INTO public.roles (role_id, name, description, is_active, created_at, updated_at)
VALUES (4, 'Pending User', '승인 대기 중인 사용자 (모든 권한 없음)', true, NOW(), NOW())
ON CONFLICT (role_id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();
COMMIT;
```

**확인**:
```sql
SELECT role_id, name, description FROM public.roles ORDER BY role_id;
```

예상 결과:
```
role_id | name          | description
--------|---------------|-------------
1       | Admin         | ...
2       | Manager       | ...
3       | Employee      | ...
4       | Pending User  | 승인 대기 중인 사용자 (모든 권한 없음)
```

#### 2-2. Step 3 실행 (기존 회원 데이터 마이그레이션)

**먼저 현재 상태 확인**:
```sql
SELECT
  COUNT(*) as total_members,
  COUNT(CASE WHEN role_id IS NULL THEN 1 END) as members_without_role,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_members
FROM public.members;
```

**결과 예시**:
```
total_members | members_without_role | inactive_members
--------------|---------------------|------------------
10            | 2                   | 3
```

**업데이트 실행**:
```sql
BEGIN;
UPDATE public.members
SET role_id = 4, updated_at = NOW()
WHERE role_id IS NULL AND is_active = false;
COMMIT;
```

**결과 확인**:
```sql
SELECT m.member_id, m.name, m.email, m.role_id, r.name as role_name, m.is_active
FROM public.members m
LEFT JOIN public.roles r ON m.role_id = r.role_id
WHERE m.role_id = 4
ORDER BY m.created_at DESC;
```

#### 2-3. Step 4 실행 (Auth 트리거 생성)

**트리거 함수 생성**:
```sql
-- migration-001-pending-user-role.sql의 Step 4 전체 실행
BEGIN;
CREATE OR REPLACE FUNCTION public.handle_new_user() ...
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created ...
COMMIT;
```

**확인**:
```sql
-- 트리거 확인
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

#### 2-4. Step 5 실행 (최종 검증)

**역할별 회원 수 확인**:
```sql
SELECT r.role_id, r.name as role_name, COUNT(m.member_id) as member_count
FROM public.roles r
LEFT JOIN public.members m ON r.role_id = m.role_id
GROUP BY r.role_id, r.name
ORDER BY r.role_id;
```

**역할이 없는 회원 확인 (0이어야 함)**:
```sql
SELECT member_id, name, email, role_id, is_active
FROM public.members
WHERE role_id IS NULL;
```

### Step 3: 애플리케이션 코드 배포

마이그레이션이 완료되면 프론트엔드 코드를 배포합니다:

1. 로컬에서 빌드 테스트
```bash
pnpm build
```

2. Git 커밋 및 푸시
```bash
git add .
git commit -m "feat: Pending User 역할 추가 및 승인 프로세스 구현"
git push origin main
```

3. 배포 환경에 반영 (Vercel, Netlify 등)

### Step 4: 동작 확인

**새 회원 가입 테스트**:
1. 로그아웃
2. 새 이메일로 회원가입
3. 이메일 확인
4. 로그인 시도
5. PendingApprovalScreen이 표시되는지 확인
6. Database에서 해당 회원의 role_id가 4인지 확인

**관리자 승인 테스트**:
1. 관리자 계정으로 로그인
2. 사용자 관리 페이지로 이동
3. Pending User가 "승인 대기" 배지와 함께 표시되는지 확인
4. "승인" 버튼 클릭하여 역할 할당
5. 승인된 사용자로 로그인하여 정상 접근 확인

**초대 기능 테스트**:
1. 관리자 계정으로 "사용자 초대" 버튼 클릭
2. 이메일, 이름, 역할 입력 후 "초대 보내기"
3. 초대 이메일 수신 확인 (SMTP 설정 필요)
4. 초대 링크로 가입 후 바로 접근 가능한지 확인

## 롤백 방법

문제 발생 시 다음 순서로 롤백합니다:

### 방법 1: Supabase 백업에서 복원

1. Supabase Dashboard > Database > Backups
2. 이전에 생성한 백업 선택
3. "Restore" 클릭
4. 복원 완료 대기

### 방법 2: SQL로 롤백

```sql
BEGIN;

-- Pending User 역할을 가진 회원들의 role_id를 NULL로 되돌림
UPDATE public.members
SET role_id = NULL, updated_at = NOW()
WHERE role_id = 4;

-- Pending User 역할 삭제
DELETE FROM public.roles WHERE role_id = 4;

-- 트리거 제거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

COMMIT;
```

**주의**: 롤백 후에는 이전 버전의 프론트엔드 코드도 다시 배포해야 합니다!

## 트러블슈팅

### 문제 1: "role_id 4가 이미 존재합니다" 에러

**원인**: 이미 Pending User 역할이 생성되어 있음

**해결**:
```sql
-- 기존 역할 확인
SELECT * FROM public.roles WHERE role_id = 4;

-- 이미 있다면 업데이트만 실행
UPDATE public.roles
SET name = 'Pending User', description = '승인 대기 중인 사용자 (모든 권한 없음)', updated_at = NOW()
WHERE role_id = 4;
```

### 문제 2: "트리거가 이미 존재합니다" 에러

**원인**: 이미 트리거가 생성되어 있음

**해결**:
```sql
-- 기존 트리거 제거 후 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- 그 다음 CREATE TRIGGER 실행
```

### 문제 3: 회원 가입 후 role_id가 여전히 NULL

**원인**: 트리거가 제대로 동작하지 않음

**확인**:
```sql
-- 트리거 존재 확인
SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';

-- 함수 존재 확인
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'handle_new_user';
```

**해결**: Step 4를 다시 실행

### 문제 4: Pending User가 페이지에 접근 가능

**원인**: 프론트엔드 코드가 최신 버전이 아님

**확인**:
- `src/App.tsx` 60번째 줄에 `|| member.role_id === 4` 조건 있는지 확인

**해결**: 최신 코드를 다시 빌드하고 배포

## 체크리스트

마이그레이션 실행 전 체크리스트:

- [ ] 백업 생성 완료
- [ ] 개발 환경에서 테스트 완료 (선택)
- [ ] 마이그레이션 SQL 파일 준비
- [ ] 프론트엔드 코드 준비 완료
- [ ] 롤백 계획 수립
- [ ] 트래픽이 적은 시간대 확인 (프로덕션)

마이그레이션 실행 후 체크리스트:

- [ ] Pending User 역할 생성 확인
- [ ] 기존 회원 데이터 업데이트 확인
- [ ] 트리거 생성 확인
- [ ] 역할이 없는 회원 0명 확인
- [ ] 새 회원 가입 테스트 통과
- [ ] 관리자 승인 기능 테스트 통과
- [ ] 초대 기능 테스트 통과 (SMTP 설정 시)
- [ ] 프론트엔드 배포 완료

## 참고 문서

- `.doc/authentication-flow.md` - 인증 시스템 전체 흐름
- `.doc/authorization-system.md` - 역할 및 권한 시스템
- `.doc/sql/migration-001-pending-user-role.sql` - 마이그레이션 SQL
- `.doc/sql/create-pending-user-role.sql` - 신규 설치용 SQL
- `.doc/sql/create-auth-trigger.sql` - Auth 트리거 SQL
