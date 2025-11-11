# RLS 보안 설계 베스트 프랙티스

## 개요

Row Level Security (RLS) 정책 설계 시 반드시 고려해야 할 보안 원칙과 실제 취약점 사례를 다룹니다.

## 핵심 보안 원칙

### 1. 권한 분리 (Separation of Privilege)

**원칙**: 사용자가 자신의 권한 레벨을 변경할 수 없어야 합니다.

#### ❌ 취약한 설계

```sql
-- 문제: 사용자가 모든 필드를 수정 가능
CREATE POLICY "users_can_update_own_profile" ON members
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_id);
```

**공격 시나리오**:
```sql
-- 일반 사용자가 자신을 관리자로 승격
UPDATE members
SET role_id = (SELECT role_id FROM roles WHERE name = '관리자')
WHERE auth_id = auth.uid();

-- 비활성화된 사용자가 스스로 활성화
UPDATE members
SET is_active = true
WHERE auth_id = auth.uid();
```

#### ✅ 안전한 설계

```sql
-- 해결: 사용자는 프로필 정보만 수정 가능
CREATE POLICY "users_update_profile_only" ON members
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_id)
WITH CHECK (
  auth.uid() = auth_id
  AND role_id = (SELECT role_id FROM members WHERE auth_id = auth.uid())
  AND is_active = (SELECT is_active FROM members WHERE auth_id = auth.uid())
);

-- 관리자만 권한 변경 가능 (단, 자기 자신은 제외)
CREATE POLICY "admin_update_roles" ON members
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name = '관리자'
      AND m.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name = '관리자'
      AND m.is_active = true
  )
  AND (
    auth.uid() != auth_id  -- 다른 사용자 수정
    OR (  -- 자기 자신 수정 시 제한
      role_id = (SELECT role_id FROM members WHERE auth_id = auth.uid())
      AND is_active = true
    )
  )
);
```

### 2. 활성화 상태 검증 (Active Status Check)

**원칙**: 비활성화된 사용자는 어떤 작업도 수행할 수 없어야 합니다.

#### ❌ 취약한 설계

```sql
-- 문제: is_active 체크 없음
CREATE POLICY "users_can_create_tasks" ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  member_id IN (
    SELECT member_id FROM members WHERE auth_id = auth.uid()
  )
);
```

**문제점**: 비활성화된 사용자도 업무를 작성할 수 있음

#### ✅ 안전한 설계

```sql
CREATE POLICY "active_users_can_create_tasks" ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members
    WHERE auth_id = auth.uid()
      AND member_id = tasks.member_id
      AND is_active = true  -- 반드시 활성화 체크
  )
);
```

### 3. 명시적 작업 분리 (Explicit Operation Separation)

**원칙**: SELECT, INSERT, UPDATE, DELETE를 별도 정책으로 분리합니다.

#### ❌ 취약한 설계

```sql
-- 문제: 모든 작업을 하나의 정책으로
CREATE POLICY "all_operations" ON tasks
FOR ALL
TO authenticated
USING (member_id IN (SELECT member_id FROM members WHERE auth_id = auth.uid()));
```

**문제점**:
- WITH CHECK 누락으로 INSERT/UPDATE 시 검증 부족
- 세밀한 권한 제어 불가능

#### ✅ 안전한 설계

```sql
-- SELECT: 조회 정책
CREATE POLICY "tasks_select" ON tasks
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members
    WHERE auth_id = auth.uid()
      AND member_id = tasks.member_id
      AND is_active = true
  )
);

-- INSERT: 생성 정책
CREATE POLICY "tasks_insert" ON tasks
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members
    WHERE auth_id = auth.uid()
      AND member_id = tasks.member_id
      AND is_active = true
  )
);

-- UPDATE: 수정 정책 (USING + WITH CHECK)
CREATE POLICY "tasks_update" ON tasks
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members
    WHERE auth_id = auth.uid()
      AND member_id = tasks.member_id
      AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members
    WHERE auth_id = auth.uid()
      AND member_id = tasks.member_id
      AND is_active = true
  )
);

-- DELETE: 삭제 정책
CREATE POLICY "tasks_delete" ON tasks
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members
    WHERE auth_id = auth.uid()
      AND member_id = tasks.member_id
      AND is_active = true
  )
);
```

### 4. 순환 참조 방지 (Avoid Circular References)

**원칙**: 정책 내에서 자기 자신이나 상호 참조하는 테이블을 조회하지 않습니다.

#### ❌ 취약한 설계

```sql
-- members 테이블 정책
CREATE POLICY "members_select" ON members
FOR SELECT USING (auth.uid() = auth_id);

-- tasks 테이블 정책
CREATE POLICY "tasks_select" ON tasks
FOR SELECT USING (
  member_id IN (
    SELECT member_id FROM members WHERE auth_id = auth.uid()
  )
);
```

**문제점**: tasks 조회 → members 조회 → members 정책 실행 → 무한 루프 가능

#### ✅ 안전한 설계

```sql
-- 정책에서 직접 auth.uid() 사용 (테이블 재조회 최소화)
CREATE POLICY "tasks_select_own" ON tasks
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members
    WHERE auth_id = auth.uid()
      AND member_id = tasks.member_id
  )
);

-- 또는 SECURITY DEFINER 함수 사용
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name = '관리자'
      AND m.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE POLICY "admin_access" ON tasks
FOR ALL TO authenticated
USING (is_admin());
```

### 5. 최소 권한 원칙 (Principle of Least Privilege)

**원칙**: 사용자에게 필요한 최소한의 권한만 부여합니다.

#### ❌ 과도한 권한

```sql
-- 문제: 매니저에게 모든 권한
CREATE POLICY "manager_all_access" ON members
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid() AND r.name = '매니저'
  )
);
```

#### ✅ 필요한 권한만 부여

```sql
-- 매니저는 조회만 가능
CREATE POLICY "manager_view_members" ON members
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
);

-- 수정은 관리자만
CREATE POLICY "admin_update_members" ON members
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name = '관리자'
      AND m.is_active = true
  )
);
```

## 실전 취약점 사례

### 사례 1: 권한 상승 (Privilege Escalation)

**취약점**:
```sql
CREATE POLICY "update_own_profile" ON members
FOR UPDATE USING (auth.uid() = auth_id);
```

**공격**:
```sql
-- 일반 사용자가 실행
UPDATE members
SET role_id = 1  -- 관리자 역할
WHERE auth_id = auth.uid();
```

**수정**:
```sql
CREATE POLICY "update_profile_only" ON members
FOR UPDATE
USING (auth.uid() = auth_id)
WITH CHECK (
  role_id = (SELECT role_id FROM members WHERE auth_id = auth.uid())
  AND is_active = (SELECT is_active FROM members WHERE auth_id = auth.uid())
);
```

### 사례 2: 비활성 계정 우회

**취약점**:
```sql
CREATE POLICY "insert_tasks" ON tasks
FOR INSERT
WITH CHECK (member_id IN (SELECT member_id FROM members WHERE auth_id = auth.uid()));
```

**공격**:
비활성화된 계정으로 업무 작성 가능

**수정**:
```sql
CREATE POLICY "active_users_insert_tasks" ON tasks
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members
    WHERE auth_id = auth.uid()
      AND member_id = tasks.member_id
      AND is_active = true
  )
);
```

### 사례 3: 마지막 관리자 삭제

**취약점**:
```sql
CREATE POLICY "admin_update_all" ON members
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid() AND r.name = '관리자'
  )
);
```

**공격**:
```sql
-- 마지막 관리자가 자신을 일반 사용자로 변경
UPDATE members
SET role_id = 3
WHERE auth_id = auth.uid();
```

**수정**:
```sql
CREATE POLICY "admin_update_safe" ON members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name = '관리자'
      AND m.is_active = true
  )
)
WITH CHECK (
  -- 자기 자신의 role_id 변경 방지
  (auth.uid() != auth_id)
  OR (
    role_id = (SELECT role_id FROM members WHERE auth_id = auth.uid())
    AND is_active = true
  )
);
```

## 보안 테스트 체크리스트

### 회원 관리 (members 테이블)

- [ ] 일반 사용자가 자신의 `role_id` 변경 시도 → 실패
- [ ] 일반 사용자가 자신의 `is_active` 변경 시도 → 실패
- [ ] 일반 사용자가 자신의 `name`, `mobile` 변경 → 성공
- [ ] 비활성화된 사용자가 로그인 → 차단
- [ ] 관리자가 다른 사용자 `role_id` 변경 → 성공
- [ ] 관리자가 자기 자신의 `role_id` 변경 → 실패
- [ ] 마지막 관리자가 자신을 비활성화 → 실패

### 업무 관리 (tasks 테이블)

- [ ] 활성화된 사용자가 업무 작성 → 성공
- [ ] 비활성화된 사용자가 업무 작성 → 실패
- [ ] 사용자가 자신의 업무 조회 → 성공
- [ ] 사용자가 타인의 업무 조회 → 실패
- [ ] 매니저가 모든 업무 조회 → 성공
- [ ] 사용자가 자신의 업무 수정 → 성공
- [ ] 사용자가 타인의 업무 수정 → 실패

### 관리 테이블 (projects, services, cost_groups 등)

- [ ] 관리자가 데이터 생성/수정/삭제 → 성공
- [ ] 매니저가 데이터 조회 → 성공
- [ ] 매니저가 데이터 수정 → 실패
- [ ] 일반 사용자가 데이터 조회 → 성공
- [ ] 일반 사용자가 데이터 수정 → 실패

## SQL 주입 방지

RLS 정책 내에서도 SQL 주입 가능성을 고려해야 합니다.

### ❌ 취약한 코드

```sql
-- 동적 SQL 사용 시 주의
CREATE OR REPLACE FUNCTION check_permission(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- SQL Injection 가능
  EXECUTE 'SELECT EXISTS (SELECT 1 FROM roles WHERE name = ''' || role_name || ''')';
END;
$$ LANGUAGE plpgsql;
```

### ✅ 안전한 코드

```sql
-- 파라미터 바인딩 사용
CREATE OR REPLACE FUNCTION check_permission(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM roles WHERE name = role_name
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

## 정책 명명 규칙

명확한 정책 이름으로 유지보수성 향상:

```sql
-- 패턴: {table}_{operation}_{scope}
CREATE POLICY "members_select_own" ON members FOR SELECT ...;
CREATE POLICY "members_select_admin" ON members FOR SELECT ...;
CREATE POLICY "members_update_profile_only" ON members FOR UPDATE ...;
CREATE POLICY "members_update_admin_full" ON members FOR UPDATE ...;
CREATE POLICY "tasks_insert_active_users" ON tasks FOR INSERT ...;
CREATE POLICY "tasks_delete_own" ON tasks FOR DELETE ...;
```

## 모니터링 및 감사

### 정책 실행 로그

```sql
-- 로그 레벨 설정
ALTER DATABASE your_db SET log_min_messages = 'debug1';
ALTER DATABASE your_db SET log_statement = 'all';

-- 특정 테이블의 정책 확인
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'members'
ORDER BY cmd, policyname;
```

### 권한 변경 감사

```sql
-- 권한 변경 로그 테이블
CREATE TABLE audit_logs (
  audit_id SERIAL PRIMARY KEY,
  table_name VARCHAR(50),
  record_id INTEGER,
  action VARCHAR(20),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP DEFAULT NOW()
);

-- 트리거 함수
CREATE OR REPLACE FUNCTION audit_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND (OLD.role_id != NEW.role_id OR OLD.is_active != NEW.is_active)) THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (
      TG_TABLE_NAME,
      NEW.member_id,
      'UPDATE',
      jsonb_build_object('role_id', OLD.role_id, 'is_active', OLD.is_active),
      jsonb_build_object('role_id', NEW.role_id, 'is_active', NEW.is_active),
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER members_audit_trigger
AFTER UPDATE ON members
FOR EACH ROW
EXECUTE FUNCTION audit_role_changes();
```

## 참고 자료

- [Supabase RLS 공식 문서](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [OWASP Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)

---

**작성일**: 2025-11-11
**최종 수정**: 2025-11-11
