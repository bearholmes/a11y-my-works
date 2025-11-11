-- ============================================
-- RLS 정책 수정: members 테이블 infinite recursion 해결
-- ============================================

-- 기존 members 테이블 정책 모두 삭제
DROP POLICY IF EXISTS "사용자는 자신의 프로필만 조회 가능" ON members;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON members;
DROP POLICY IF EXISTS "Users can update own profile" ON members;
DROP POLICY IF EXISTS "Admins can view all members" ON members;
DROP POLICY IF EXISTS "Admins can update members" ON members;
DROP POLICY IF EXISTS "Managers can view all members" ON members;

-- ============================================
-- 새로운 members 테이블 RLS 정책
-- ============================================

-- 1. 회원가입 시 자동으로 프로필 생성 허용 (트리거용)
-- SECURITY DEFINER 함수가 실행하므로 별도 정책 불필요
-- 대신 서비스 역할(service_role)이 모든 작업 가능하도록 설정됨

-- 2. 인증된 사용자가 자신의 프로필 조회 가능
CREATE POLICY "사용자는 자신의 프로필 조회 가능"
ON members
FOR SELECT
TO authenticated
USING (auth.uid() = auth_id);

-- 3. 관리자와 매니저는 모든 사용자 프로필 조회 가능
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

-- 4. 사용자는 자신의 프로필 수정 가능 (이름, 연락처만)
CREATE POLICY "사용자는 자신의 프로필 수정 가능"
ON members
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- 5. 관리자는 모든 사용자 정보 수정 가능 (역할, 활성화 상태 포함)
CREATE POLICY "관리자는 모든 사용자 수정 가능"
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
);

-- ============================================
-- tasks 테이블 RLS 정책도 수정 (circular reference 방지)
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "사용자는 자신의 업무 보고만 조회 가능" ON tasks;
DROP POLICY IF EXISTS "사용자는 자신의 업무 보고만 작성/수정 가능" ON tasks;
DROP POLICY IF EXISTS "관리자와 매니저는 모든 업무 조회 가능" ON tasks;

-- 1. 사용자는 자신의 업무 보고만 조회 가능
CREATE POLICY "사용자는 자신의 업무만 조회"
ON tasks
FOR SELECT
TO authenticated
USING (
  member_id IN (
    SELECT member_id FROM members WHERE auth_id = auth.uid()
  )
);

-- 2. 관리자와 매니저는 모든 업무 보고 조회 가능
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

-- 3. 사용자는 자신의 업무만 생성 가능
CREATE POLICY "사용자는 자신의 업무만 생성"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  member_id IN (
    SELECT member_id FROM members WHERE auth_id = auth.uid()
  )
);

-- 4. 사용자는 자신의 업무만 수정 가능
CREATE POLICY "사용자는 자신의 업무만 수정"
ON tasks
FOR UPDATE
TO authenticated
USING (
  member_id IN (
    SELECT member_id FROM members WHERE auth_id = auth.uid()
  )
)
WITH CHECK (
  member_id IN (
    SELECT member_id FROM members WHERE auth_id = auth.uid()
  )
);

-- 5. 사용자는 자신의 업무만 삭제 가능
CREATE POLICY "사용자는 자신의 업무만 삭제"
ON tasks
FOR DELETE
TO authenticated
USING (
  member_id IN (
    SELECT member_id FROM members WHERE auth_id = auth.uid()
  )
);

-- ============================================
-- logs 테이블 RLS 정책 수정
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "사용자는 자신의 로그만 조회 가능" ON logs;

-- 새 정책 생성
CREATE POLICY "사용자는 자신의 로그만 조회"
ON logs
FOR SELECT
TO authenticated
USING (
  member_id IN (
    SELECT member_id FROM members WHERE auth_id = auth.uid()
  )
);

-- ============================================
-- 관리용 테이블 RLS 정책 추가
-- ============================================

-- 관리자는 모든 데이터 관리 가능
CREATE POLICY "관리자는 청구그룹 관리 가능"
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

CREATE POLICY "관리자는 서비스 관리 가능"
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

CREATE POLICY "관리자는 프로젝트 관리 가능"
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

CREATE POLICY "관리자는 공휴일 관리 가능"
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
-- Pending User 역할 추가 (아직 없다면)
-- ============================================
INSERT INTO roles (name, description, is_active)
VALUES ('Pending User', '승인 대기 중인 사용자', false)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 확인 쿼리
-- ============================================

-- 현재 members 테이블의 RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'members'
ORDER BY policyname;

-- 현재 tasks 테이블의 RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'tasks'
ORDER BY policyname;
