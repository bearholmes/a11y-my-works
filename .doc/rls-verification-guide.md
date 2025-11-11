# RLS 정책 적용 및 검증 가이드

## 1단계: RLS 정책 적용

### Supabase SQL Editor에서 실행

1. Supabase Dashboard 접속
2. SQL Editor 클릭
3. 아래 순서대로 실행:

#### 1-1. 현재 정책 확인 (선택사항)

```sql
-- 현재 members 테이블의 정책 확인
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'members';

-- 현재 tasks 테이블의 정책 확인
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'tasks';
```

#### 1-2. 보안 강화 정책 적용

프로젝트 루트의 **`supabase_rls_fix_secure.sql`** 파일 내용을 복사하여 실행

✅ 성공 메시지 확인

#### 1-3. 적용 확인

```sql
-- members 테이블 정책 확인 (4개여야 함)
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'members'
ORDER BY cmd, policyname;

-- 예상 결과:
-- members_select_own (SELECT)
-- members_select_admin_manager (SELECT)
-- members_update_own_profile_only (UPDATE)
-- members_update_admin_full (UPDATE)

-- tasks 테이블 정책 확인 (5개여야 함)
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'tasks'
ORDER BY cmd, policyname;

-- 예상 결과:
-- tasks_select_own (SELECT)
-- tasks_select_admin_manager (SELECT)
-- tasks_insert_own (INSERT)
-- tasks_update_own (UPDATE)
-- tasks_delete_own (DELETE)
```

## 2단계: 회원가입 테스트

### 2-1. 기존 테스트 데이터 정리 (선택사항)

```sql
-- 테스트 계정 삭제 (CASCADE로 members도 자동 삭제)
DELETE FROM auth.users WHERE email = 'test@example.com';
```

### 2-2. 애플리케이션에서 회원가입

1. 애플리케이션 실행: `pnpm dev`
2. 회원가입 페이지 접속
3. 테스트 계정으로 가입:
   - 이메일: `test@example.com`
   - 비밀번호: 적절한 비밀번호
   - 이름: `테스트유저`
   - 아이디: `testuser`

### 2-3. 가입 결과 확인

```sql
-- auth.users에 생성되었는지 확인
SELECT id, email, created_at
FROM auth.users
WHERE email = 'test@example.com';

-- members 테이블에 생성되었는지 확인 (⭐ 중요)
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

-- 예상 결과:
-- is_active: false
-- role_name: Pending User
```

**✅ 성공 조건**: members 테이블에 레코드가 생성되고 `is_active = false`, `role_name = Pending User`

**❌ 실패 시**:
- 여전히 infinite recursion 에러 발생하면 정책이 제대로 적용되지 않은 것
- 1단계 다시 확인

## 3단계: 보안 테스트

### 3-1. 테스트용 관리자 먼저 생성

```sql
-- 첫 관리자 승인
UPDATE members
SET
  is_active = true,
  role_id = (SELECT role_id FROM roles WHERE name = '관리자' LIMIT 1),
  updated_at = NOW()
WHERE email = 'your-admin@example.com';  -- 실제 관리자 이메일로 변경

-- 확인
SELECT
  m.email,
  m.is_active,
  r.name as role_name
FROM members m
JOIN roles r ON m.role_id = r.role_id
WHERE m.email = 'your-admin@example.com';
```

### 3-2. 보안 테스트 실행

#### 테스트 1: 일반 사용자가 자신의 role_id 변경 시도 (실패해야 함)

```sql
-- 테스트 사용자로 권한 설정
SET request.jwt.claim.sub = '(test@example.com의 auth_id)';

-- role_id 변경 시도
UPDATE members
SET role_id = (SELECT role_id FROM roles WHERE name = '관리자')
WHERE email = 'test@example.com';

-- 예상 결과: 에러 또는 0 rows affected
-- "new row violates row-level security policy" 에러 발생해야 함
```

#### 테스트 2: 일반 사용자가 자신의 is_active 변경 시도 (실패해야 함)

```sql
UPDATE members
SET is_active = true
WHERE email = 'test@example.com';

-- 예상 결과: 에러 또는 0 rows affected
```

#### 테스트 3: 일반 사용자가 이름 변경 (성공해야 함)

먼저 test@example.com 사용자를 활성화:

```sql
-- 관리자로 테스트 사용자 활성화 (일반 사용자 역할로)
UPDATE members
SET
  is_active = true,
  role_id = (SELECT role_id FROM roles WHERE name = '직원' LIMIT 1)
WHERE email = 'test@example.com';
```

이제 이름 변경 시도:

```sql
UPDATE members
SET name = '새로운이름'
WHERE email = 'test@example.com';

-- 예상 결과: 1 row affected (성공)

-- 확인
SELECT name FROM members WHERE email = 'test@example.com';
-- 결과: '새로운이름'
```

#### 테스트 4: 비활성 사용자가 업무 작성 시도 (실패해야 함)

```sql
-- 테스트 사용자 비활성화
UPDATE members SET is_active = false WHERE email = 'test@example.com';

-- 업무 생성 시도 (애플리케이션에서 시도하거나 SQL로)
INSERT INTO tasks (
  member_id,
  task_date,
  task_name,
  work_time
) VALUES (
  (SELECT member_id FROM members WHERE email = 'test@example.com'),
  CURRENT_DATE,
  '테스트 업무',
  60
);

-- 예상 결과: "new row violates row-level security policy" 에러
```

#### 테스트 5: 활성 사용자가 업무 작성 (성공해야 함)

```sql
-- 테스트 사용자 활성화
UPDATE members SET is_active = true WHERE email = 'test@example.com';

-- 업무 생성 시도
INSERT INTO tasks (
  member_id,
  task_date,
  task_name,
  work_time
) VALUES (
  (SELECT member_id FROM members WHERE email = 'test@example.com'),
  CURRENT_DATE,
  '테스트 업무',
  60
);

-- 예상 결과: 성공 (1 row inserted)

-- 확인
SELECT task_name, work_time
FROM tasks
WHERE member_id = (SELECT member_id FROM members WHERE email = 'test@example.com');
```

#### 테스트 6: 관리자가 다른 사용자 역할 변경 (성공해야 함)

```sql
-- 관리자로 로그인한 상태에서
UPDATE members
SET role_id = (SELECT role_id FROM roles WHERE name = '매니저')
WHERE email = 'test@example.com';

-- 예상 결과: 1 row affected (성공)

-- 확인
SELECT
  m.email,
  r.name as role_name
FROM members m
JOIN roles r ON m.role_id = r.role_id
WHERE m.email = 'test@example.com';
-- 결과: role_name = '매니저'
```

#### 테스트 7: 관리자가 자신의 role_id 변경 시도 (실패해야 함)

```sql
-- 관리자로 로그인한 상태에서
UPDATE members
SET role_id = (SELECT role_id FROM roles WHERE name = '직원')
WHERE email = 'your-admin@example.com';

-- 예상 결과: 에러 또는 0 rows affected
-- "new row violates row-level security policy"
```

## 4단계: 애플리케이션 통합 테스트

### 4-1. 로그인 및 기본 기능

1. **관리자로 로그인**
   - 모든 메뉴 표시 확인
   - 사용자 관리 접근 가능
   - 프로젝트/서비스 관리 접근 가능

2. **일반 사용자로 로그인** (test@example.com)
   - 제한된 메뉴만 표시
   - 자신의 업무만 조회
   - 업무 작성/수정 가능
   - 사용자 관리 접근 불가

3. **비활성 사용자 로그인 시도**
   - "승인 대기 중" 화면 표시
   - 업무 작성 불가

### 4-2. 브라우저 개발자 도구 테스트

관리자 계정이 아닌데 브라우저 콘솔에서 API 직접 호출 시도:

```javascript
// 브라우저 콘솔에서 실행
const { data: supabase } = window;

// 일반 사용자가 자신의 role_id 변경 시도
const { data, error } = await supabase
  .from('members')
  .update({ role_id: 1 })  // 관리자 role_id
  .eq('auth_id', supabase.auth.user().id);

console.log('Error:', error);
// 예상: RLS policy 위반 에러
```

## 5단계: 최종 확인

### 보안 체크리스트

- [ ] 회원가입 시 members 테이블에 자동 생성됨
- [ ] 신규 가입자는 `Pending User` 역할, `is_active = false`
- [ ] 일반 사용자가 `role_id` 변경 불가
- [ ] 일반 사용자가 `is_active` 변경 불가
- [ ] 일반 사용자가 `name`, `mobile` 변경 가능
- [ ] 비활성 사용자가 업무 작성 불가
- [ ] 활성 사용자가 자신의 업무만 조회
- [ ] 관리자가 모든 사용자 조회 가능
- [ ] 관리자가 다른 사용자 역할 변경 가능
- [ ] 관리자가 자신의 `role_id` 변경 불가
- [ ] 매니저가 모든 업무 조회 가능
- [ ] 매니저가 사용자 정보 수정 불가

### 정책 요약

```sql
-- 최종 확인: 모든 테이블의 RLS 정책 개수
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 예상 결과:
-- cost_groups: 1
-- holidays: 1
-- logs: 2
-- members: 4
-- project_urls: 1
-- projects: 1
-- services: 1
-- tasks: 5
```

## 문제 해결

### 여전히 infinite recursion 에러 발생

```sql
-- 1. 모든 정책 확인
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('members', 'tasks')
ORDER BY tablename, policyname;

-- 2. 기존 정책 완전 삭제 후 재적용
DROP POLICY IF EXISTS "사용자는 자신의 프로필만 조회 가능" ON members;
DROP POLICY IF EXISTS "사용자는 자신의 업무 보고만 조회 가능" ON tasks;
-- ... (supabase_rls_fix_secure.sql의 DROP POLICY 부분 모두 실행)

-- 3. 새 정책 적용
-- supabase_rls_fix_secure.sql의 CREATE POLICY 부분 실행
```

### members 테이블에 여전히 레코드 생성 안됨

```sql
-- 트리거 확인
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND trigger_schema = 'auth';

-- 트리거가 없으면 재생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 정책 적용 후 기존 사용자 로그인 불가

```sql
-- 기존 사용자들이 role_id = NULL인 경우
UPDATE members
SET role_id = (SELECT role_id FROM roles WHERE name = '직원')
WHERE role_id IS NULL;
```

## 다음 단계

RLS 정책이 정상 작동하면:

1. `.doc/initial-setup.md` 가이드로 초기 데이터 설정
2. `.doc/setup-method-2-sql-editor.md`로 첫 관리자 승인
3. 애플리케이션에서 정상 운영

---

**작성일**: 2025-11-11
**관련 파일**:
- `supabase_rls_fix_secure.sql`
- `.doc/troubleshooting-rls-infinite-recursion.md`
- `.doc/security-rls-best-practices.md`
