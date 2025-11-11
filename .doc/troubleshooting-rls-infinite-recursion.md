# RLS Infinite Recursion 문제 해결 가이드

## 문제 증상

회원가입 후 다음과 같은 현상 발생:
- Supabase Authentication > Users에는 사용자가 정상 등록됨
- `members` 테이블에는 사용자 레코드가 생성되지 않음
- API 요청 시 500 에러 발생
- 에러 메시지: `"infinite recursion detected in policy for relation 'members'"`

## 원인 분석

### 1. 순환 참조 발생 구조

```sql
-- members 테이블 정책
CREATE POLICY "사용자는 자신의 프로필만 조회 가능" ON members
FOR SELECT USING (auth.uid() = auth_id);

-- tasks 테이블 정책
CREATE POLICY "사용자는 자신의 업무 보고만 조회 가능" ON tasks
FOR SELECT USING (
    member_id IN (
        SELECT member_id FROM members WHERE auth_id = auth.uid()
    )
);
```

**순환 참조 흐름**:
1. tasks 정책이 members 테이블을 조회
2. members 조회 시 members의 SELECT 정책이 실행됨
3. 해당 정책이 다시 자기 자신을 참조
4. 무한 루프 발생

### 2. INSERT 정책 누락

`members` 테이블에 INSERT 정책이 없어서 트리거가 레코드를 생성할 수 없음.

## 해결 방법

### 방법 1: SQL 스크립트 실행 (권장) ⭐

1. Supabase Dashboard 접속
2. SQL Editor 메뉴 클릭
3. 프로젝트 루트의 **`supabase_rls_fix_secure.sql`** 파일 내용 복사
4. SQL Editor에 붙여넣기
5. **Run** 버튼 클릭

**⚠️ 중요**: `supabase_rls_fix_secure.sql` 사용 (보안 강화 버전)
- ~~`supabase_rls_fix.sql`~~: 사용하지 마세요 (취약점 있음)
- ✅ `supabase_rls_fix_secure.sql`: 권한 분리 및 보안 강화됨

### 방법 2: 단계별 수동 수정

#### 단계 1: 기존 문제 정책 삭제

```sql
-- members 테이블 정책 삭제
DROP POLICY IF EXISTS "사용자는 자신의 프로필만 조회 가능" ON members;

-- tasks 테이블 정책 삭제
DROP POLICY IF EXISTS "사용자는 자신의 업무 보고만 조회 가능" ON tasks;
DROP POLICY IF EXISTS "사용자는 자신의 업무 보고만 작성/수정 가능" ON tasks;
```

#### 단계 2: 새 정책 생성 (순환 참조 방지)

```sql
-- members 테이블: 사용자 자신의 프로필 조회
CREATE POLICY "사용자는 자신의 프로필 조회 가능"
ON members
FOR SELECT
TO authenticated
USING (auth.uid() = auth_id);

-- members 테이블: 관리자/매니저는 모든 사용자 조회
CREATE POLICY "관리자와 매니저는 모든 사용자 조회 가능"
ON members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
);

-- tasks 테이블: 각 작업별로 명확한 정책 분리
CREATE POLICY "사용자는 자신의 업무만 조회"
ON tasks
FOR SELECT
TO authenticated
USING (
  member_id IN (
    SELECT member_id FROM members WHERE auth_id = auth.uid()
  )
);

CREATE POLICY "관리자와 매니저는 모든 업무 조회"
ON tasks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
);
```

#### 단계 3: Pending User 역할 추가

```sql
INSERT INTO roles (name, description, is_active)
VALUES ('Pending User', '승인 대기 중인 사용자', false)
ON CONFLICT (name) DO NOTHING;
```

#### 단계 4: 확인

```sql
-- 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('members', 'tasks')
ORDER BY tablename, policyname;
```

### 방법 3: 임시 RLS 비활성화 (개발 환경 전용)

⚠️ **주의**: 프로덕션 환경에서는 절대 사용하지 마세요!

```sql
-- RLS 임시 비활성화
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- 테스트 후 반드시 재활성화
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
```

## 수정 후 테스트

### 1. 기존 사용자 정리 (선택사항)

문제가 있는 기존 테스트 사용자를 삭제:

```sql
-- auth.users에서 삭제 (members도 CASCADE로 자동 삭제됨)
DELETE FROM auth.users WHERE email = 'test@example.com';
```

### 2. 새로운 회원가입 테스트

1. 애플리케이션에서 회원가입
2. 이메일 인증 완료
3. Supabase Dashboard 확인:
   - **Authentication > Users**: 사용자 존재 확인
   - **Table Editor > members**: 레코드 생성 확인
4. 확인 SQL:

```sql
SELECT
  m.member_id,
  m.email,
  m.name,
  m.is_active,
  r.name as role_name,
  m.created_at
FROM members m
LEFT JOIN roles r ON m.role_id = r.role_id
WHERE m.email = 'test@example.com';
```

**예상 결과**:
- `is_active`: `false`
- `role_name`: `Pending User`

### 3. 첫 관리자 승인

회원가입 테스트 성공 후, 첫 관리자 승인:

```sql
UPDATE members
SET
  is_active = true,
  role_id = (SELECT role_id FROM roles WHERE name = '관리자' LIMIT 1),
  updated_at = NOW()
WHERE email = 'your-admin@example.com';
```

## RLS 정책 설계 원칙

### 1. 순환 참조 방지

- 정책 내에서 동일 테이블을 참조하지 않기
- 다른 테이블 참조 시 무한 루프 가능성 검토
- 필요시 별도의 뷰(VIEW)나 함수 사용

### 2. 권한 분리 (Separation of Privilege) ⭐⭐⭐

**핵심 원칙**: 사용자가 자신의 권한(role_id, is_active)을 변경할 수 없도록 강제

```sql
-- ❌ 취약한 정책: 사용자가 role_id를 관리자로 변경 가능
CREATE POLICY "users_update" ON members
FOR UPDATE USING (auth.uid() = auth_id);

-- ✅ 안전한 정책: role_id와 is_active는 변경 불가
CREATE POLICY "users_update_profile_only" ON members
FOR UPDATE
USING (auth.uid() = auth_id)
WITH CHECK (
  auth.uid() = auth_id
  AND role_id = (SELECT role_id FROM members WHERE auth_id = auth.uid())
  AND is_active = (SELECT is_active FROM members WHERE auth_id = auth.uid())
);

-- ✅ 관리자만 권한 변경 가능
CREATE POLICY "admin_update_all" ON members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name = '관리자'
      AND m.is_active = true  -- 반드시 활성화된 관리자만
  )
)
WITH CHECK (...);
```

**보안 체크리스트**:
- [ ] 사용자는 `name`, `mobile` 같은 프로필 정보만 수정 가능
- [ ] `role_id`, `is_active` 변경은 오직 관리자만 가능
- [ ] 관리자도 자기 자신의 `role_id` 변경 불가 (마지막 관리자 보호)
- [ ] 모든 정책에서 `is_active = true` 체크 (비활성화된 사용자 차단)

### 3. 명확한 정책 분리

```sql
-- ❌ 나쁜 예: 모든 작업을 하나의 정책으로
CREATE POLICY "all_operations" ON table
FOR ALL USING (...);

-- ✅ 좋은 예: 작업별로 명확히 분리
CREATE POLICY "policy_select" ON table FOR SELECT USING (...);
CREATE POLICY "policy_insert" ON table FOR INSERT WITH CHECK (...);
CREATE POLICY "policy_update" ON table FOR UPDATE USING (...) WITH CHECK (...);
CREATE POLICY "policy_delete" ON table FOR DELETE USING (...);
```

### 3. SECURITY DEFINER 함수 활용

트리거나 복잡한 로직은 `SECURITY DEFINER` 함수로 처리:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 이 함수는 슈퍼유저 권한으로 실행되므로 RLS 우회
  INSERT INTO public.members (...) VALUES (...);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. 역할 기반 정책

```sql
-- 역할별로 분리된 정책
CREATE POLICY "admin_access" ON table
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid() AND r.name = '관리자'
  )
);

CREATE POLICY "user_access" ON table
FOR SELECT TO authenticated
USING (auth.uid() = owner_id);
```

## 문제 해결 체크리스트

### 필수 단계
- [ ] **`supabase_rls_fix_secure.sql`** 스크립트 실행 완료 (보안 강화 버전)
- [ ] `pg_policies` 뷰에서 정책 정상 확인
- [ ] 기존 테스트 사용자 삭제
- [ ] 새로운 회원가입 테스트 성공
- [ ] `members` 테이블에 레코드 생성 확인
- [ ] 첫 관리자 승인 완료
- [ ] 관리자로 로그인 및 전체 메뉴 접근 확인

### 보안 테스트
- [ ] 일반 사용자가 자신의 `role_id` 변경 시도 → 실패 확인
- [ ] 일반 사용자가 자신의 `is_active` 변경 시도 → 실패 확인
- [ ] 일반 사용자가 `name` 변경 시도 → 성공 확인
- [ ] 비활성화된 사용자가 업무 작성 시도 → 실패 확인
- [ ] 관리자가 다른 사용자의 역할 변경 → 성공 확인

## 관련 문서

- `.doc/initial-setup.md`: 초기 설정 전체 가이드
- `.doc/setup-method-2-sql-editor.md`: SQL Editor 사용 가이드
- `.doc/security-design.md`: 보안 설계 전체 문서
- `supabase_schema.sql`: 전체 데이터베이스 스키마
- **`supabase_rls_fix_secure.sql`**: RLS 정책 수정 스크립트 (보안 강화 버전) ⭐
- ~~`supabase_rls_fix.sql`~~: 사용 금지 (보안 취약점 있음)

## 추가 디버깅

### RLS 정책 실행 로그 확인

```sql
-- PostgreSQL 로그 레벨 변경 (관리자 권한 필요)
SET log_min_messages = DEBUG1;

-- 쿼리 실행 후 로그 확인
SELECT * FROM members WHERE auth_id = auth.uid();
```

### 정책 시뮬레이션

특정 사용자 권한으로 쿼리 테스트:

```sql
-- 특정 auth_id로 설정
SET request.jwt.claim.sub = 'user-uuid-here';

-- 쿼리 실행
SELECT * FROM members WHERE auth_id = auth.uid();
```

---

**작성일**: 2025-11-11
**최종 수정**: 2025-11-11
**관련 이슈**: Members 테이블 infinite recursion in RLS policy
