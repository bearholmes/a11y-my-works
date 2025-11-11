-- ============================================
-- RLS 정책 수정: 보안 강화 버전
-- ============================================
-- 문제: 사용자가 자신의 role_id를 관리자로 변경할 수 있는 취약점
-- 해결: role_id, is_active 변경은 오직 관리자만 가능하도록 분리

-- ============================================
-- 1. 기존 정책 모두 삭제
-- ============================================

-- members 테이블
DROP POLICY IF EXISTS "사용자는 자신의 프로필만 조회 가능" ON members;
DROP POLICY IF EXISTS "사용자는 자신의 프로필 조회 가능" ON members;
DROP POLICY IF EXISTS "관리자와 매니저는 모든 사용자 조회 가능" ON members;
DROP POLICY IF EXISTS "사용자는 자신의 프로필 수정 가능" ON members;
DROP POLICY IF EXISTS "관리자는 모든 사용자 수정 가능" ON members;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON members;
DROP POLICY IF EXISTS "Users can update own profile" ON members;
DROP POLICY IF EXISTS "Admins can view all members" ON members;
DROP POLICY IF EXISTS "Admins can update members" ON members;
DROP POLICY IF EXISTS "Managers can view all members" ON members;

-- tasks 테이블
DROP POLICY IF EXISTS "사용자는 자신의 업무 보고만 조회 가능" ON tasks;
DROP POLICY IF EXISTS "사용자는 자신의 업무 보고만 작성/수정 가능" ON tasks;
DROP POLICY IF EXISTS "사용자는 자신의 업무만 조회" ON tasks;
DROP POLICY IF EXISTS "관리자와 매니저는 모든 업무 조회" ON tasks;
DROP POLICY IF EXISTS "사용자는 자신의 업무만 생성" ON tasks;
DROP POLICY IF EXISTS "사용자는 자신의 업무만 수정" ON tasks;
DROP POLICY IF EXISTS "사용자는 자신의 업무만 삭제" ON tasks;

-- logs 테이블
DROP POLICY IF EXISTS "사용자는 자신의 로그만 조회 가능" ON logs;
DROP POLICY IF EXISTS "사용자는 자신의 로그만 조회" ON logs;

-- ============================================
-- 2. members 테이블: 보안 강화 정책
-- ============================================

-- 📖 SELECT: 자신의 프로필 조회
CREATE POLICY "members_select_own"
ON members
FOR SELECT
TO authenticated
USING (auth.uid() = auth_id);

-- 📖 SELECT: 활성화된 관리자와 매니저는 모든 사용자 조회
-- 주의: is_active = true 체크로 비활성화된 관리자는 권한 없음
CREATE POLICY "members_select_admin_manager"
ON members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true  -- 반드시 활성화된 관리자만
  )
);

-- ✏️ UPDATE: 사용자는 name, mobile만 수정 가능 (role_id, is_active 제외)
-- 중요: WITH CHECK에서 role_id와 is_active 변경 불가 강제
CREATE POLICY "members_update_own_profile_only"
ON members
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_id)
WITH CHECK (
  auth.uid() = auth_id
  AND role_id = (SELECT role_id FROM members WHERE auth_id = auth.uid())  -- role_id 변경 불가
  AND is_active = (SELECT is_active FROM members WHERE auth_id = auth.uid())  -- is_active 변경 불가
);

-- ✏️ UPDATE: 관리자만 모든 필드 수정 가능 (role_id, is_active 포함)
-- 주의: 관리자도 자기 자신의 role_id는 변경할 수 없도록 추가 체크
CREATE POLICY "members_update_admin_full"
ON members
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
  -- 관리자가 자기 자신의 역할을 변경하려는 경우 방지
  AND (
    auth.uid() != auth_id  -- 다른 사용자 수정 OR
    OR (
      role_id = (SELECT role_id FROM members WHERE auth_id = auth.uid())  -- 자신의 role_id는 유지
      AND is_active = true  -- 자신을 비활성화 불가
    )
  )
);

-- ============================================
-- 3. tasks 테이블: 명확한 권한 분리
-- ============================================

-- 📖 SELECT: 활성화된 사용자만 자신의 업무 조회
CREATE POLICY "tasks_select_own"
ON tasks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    WHERE m.auth_id = auth.uid()
      AND m.member_id = tasks.member_id
      AND m.is_active = true  -- 활성화된 사용자만
  )
);

-- 📖 SELECT: 활성화된 관리자와 매니저는 모든 업무 조회
CREATE POLICY "tasks_select_admin_manager"
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

-- ➕ INSERT: 활성화된 사용자만 자신의 업무 생성
CREATE POLICY "tasks_insert_own"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members m
    WHERE m.auth_id = auth.uid()
      AND m.member_id = tasks.member_id
      AND m.is_active = true
  )
);

-- ✏️ UPDATE: 활성화된 사용자만 자신의 업무 수정
CREATE POLICY "tasks_update_own"
ON tasks
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    WHERE m.auth_id = auth.uid()
      AND m.member_id = tasks.member_id
      AND m.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members m
    WHERE m.auth_id = auth.uid()
      AND m.member_id = tasks.member_id
      AND m.is_active = true
  )
);

-- 🗑️ DELETE: 활성화된 사용자만 자신의 업무 삭제
CREATE POLICY "tasks_delete_own"
ON tasks
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    WHERE m.auth_id = auth.uid()
      AND m.member_id = tasks.member_id
      AND m.is_active = true
  )
);

-- ============================================
-- 4. logs 테이블
-- ============================================

CREATE POLICY "logs_select_own"
ON logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    WHERE m.auth_id = auth.uid()
      AND m.member_id = logs.member_id
      AND m.is_active = true
  )
);

CREATE POLICY "logs_insert_own"
ON logs
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members m
    WHERE m.auth_id = auth.uid()
      AND m.member_id = logs.member_id
      AND m.is_active = true
  )
);

-- ============================================
-- 5. 관리용 테이블 (관리자만 수정 가능)
-- ============================================

-- cost_groups
CREATE POLICY "cost_groups_admin_all"
ON cost_groups
FOR ALL
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
);

-- services
CREATE POLICY "services_admin_all"
ON services
FOR ALL
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
);

-- projects
CREATE POLICY "projects_admin_all"
ON projects
FOR ALL
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
);

-- project_urls
CREATE POLICY "project_urls_admin_all"
ON project_urls
FOR ALL
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
);

-- holidays
CREATE POLICY "holidays_admin_all"
ON holidays
FOR ALL
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
);

-- ============================================
-- 6. Pending User 역할 생성
-- ============================================
INSERT INTO roles (name, description, is_active)
VALUES ('Pending User', '승인 대기 중인 사용자', false)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 7. 확인 쿼리
-- ============================================

-- members 테이블 정책 확인
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual as using_expression,
  with_check
FROM pg_policies
WHERE tablename = 'members'
ORDER BY cmd, policyname;

-- tasks 테이블 정책 확인
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'tasks'
ORDER BY cmd, policyname;

-- ============================================
-- 8. 보안 테스트 쿼리
-- ============================================

-- 테스트 1: 일반 사용자가 자신의 role_id를 변경하려고 시도 (실패해야 함)
-- UPDATE members SET role_id = 1 WHERE auth_id = auth.uid();
-- 예상: 권한 오류 또는 정책 위반

-- 테스트 2: 일반 사용자가 자신의 is_active를 true로 변경하려고 시도 (실패해야 함)
-- UPDATE members SET is_active = true WHERE auth_id = auth.uid();
-- 예상: 권한 오류 또는 정책 위반

-- 테스트 3: 일반 사용자가 이름만 변경 (성공해야 함)
-- UPDATE members SET name = '새이름' WHERE auth_id = auth.uid();
-- 예상: 성공

-- 테스트 4: 비활성화된 사용자가 업무 작성 시도 (실패해야 함)
-- INSERT INTO tasks (...) VALUES (...);
-- 예상: 권한 오류

COMMENT ON POLICY "members_update_own_profile_only" ON members IS
'사용자는 자신의 name, mobile만 수정 가능. role_id와 is_active는 변경 불가';

COMMENT ON POLICY "members_update_admin_full" ON members IS
'관리자는 다른 사용자의 모든 필드를 수정 가능하지만, 자기 자신의 role_id 변경이나 비활성화는 불가';
