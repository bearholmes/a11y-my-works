-- A11yWorks 업무 보고 시스템 데이터베이스 스키마
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 1. 역할(Roles) 테이블
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,  -- UNIQUE 제약 추가
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 권한(Permissions) 테이블
CREATE TABLE permissions (
    permission_id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. 역할-권한 매핑(RolePermissions) 테이블
CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(permission_id) ON DELETE CASCADE,
    read_access BOOLEAN DEFAULT FALSE,
    write_access BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- 4. 청구 그룹(CostGroups) 테이블
CREATE TABLE cost_groups (
    cost_group_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. 서비스(Services) 테이블
CREATE TABLE services (
    service_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cost_group_id INTEGER REFERENCES cost_groups(cost_group_id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. 코드 그룹(CodeGroups) 테이블
CREATE TABLE code_groups (
    code_group_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. 코드(Codes) 테이블
CREATE TABLE codes (
    code_id SERIAL PRIMARY KEY,
    code_group_id INTEGER REFERENCES code_groups(code_group_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key VARCHAR(50) NOT NULL,
    value VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 8. 프로젝트(Projects) 테이블
CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    service_id INTEGER REFERENCES services(service_id),
    platform_id INTEGER REFERENCES codes(code_id),
    version VARCHAR(50),
    task_type VARCHAR(100),
    memo TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. 프로젝트 URL(ProjectUrls) 테이블
CREATE TABLE project_urls (
    url_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(project_id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    description VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 10. 사용자(Members) 테이블 - Supabase Auth와 연동
CREATE TABLE members (
    member_id SERIAL PRIMARY KEY,
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(20),
    role_id INTEGER REFERENCES roles(role_id),
    is_active BOOLEAN DEFAULT TRUE,
    requires_daily_report BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- members 테이블 컬럼 설명
COMMENT ON COLUMN members.requires_daily_report IS '일일 업무보고 작성 의무 여부. TRUE=작성 필수(기본값), FALSE=작성 불필요';

-- members 테이블 인덱스
CREATE INDEX idx_members_requires_daily_report
ON members(requires_daily_report)
WHERE is_active = TRUE;

-- 11. 업무 보고(Tasks) 테이블
CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(member_id),
    task_date DATE NOT NULL,
    task_type VARCHAR(100),
    task_name VARCHAR(200) NOT NULL,
    task_detail TEXT,
    task_url TEXT,
    work_time INTEGER, -- 작업시간(분)
    cost_group_id INTEGER REFERENCES cost_groups(cost_group_id),
    service_id INTEGER REFERENCES services(service_id),
    project_id INTEGER REFERENCES projects(project_id),
    platform_id INTEGER REFERENCES codes(code_id),
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 12. 공휴일(Holidays) 테이블
CREATE TABLE holidays (
    holiday_id SERIAL PRIMARY KEY,
    holiday_date DATE UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 13. 시스템 로그(Logs) 테이블
CREATE TABLE logs (
    log_id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(member_id),
    type VARCHAR(50) NOT NULL,
    comment TEXT,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 기본 데이터 삽입
INSERT INTO roles (name, description) VALUES
('관리자', '시스템 전체 관리 권한'),
('매니저', '팀 관리 및 업무 승인 권한'),
('직원', '업무 보고 작성 권한'),
('Pending User', '승인 대기 중인 사용자');

INSERT INTO permissions (key, name) VALUES
('task.read', '업무 보고 조회'),
('task.write', '업무 보고 작성'),
('project.read', '프로젝트 조회'),
('project.write', '프로젝트 관리'),
('member.read', '사용자 조회'),
('member.write', '사용자 관리');

INSERT INTO role_permissions (role_id, permission_id, read_access, write_access) VALUES
(1, 1, TRUE, TRUE), -- 관리자 - 업무 보고
(1, 2, TRUE, TRUE),
(1, 3, TRUE, TRUE), -- 관리자 - 프로젝트
(1, 4, TRUE, TRUE),
(1, 5, TRUE, TRUE), -- 관리자 - 사용자
(1, 6, TRUE, TRUE),
(2, 1, TRUE, TRUE), -- 매니저 - 업무 보고
(2, 2, TRUE, TRUE),
(2, 3, TRUE, TRUE), -- 매니저 - 프로젝트
(2, 4, FALSE, FALSE),
(2, 5, TRUE, FALSE), -- 매니저 - 사용자
(2, 6, FALSE, FALSE),
(3, 1, TRUE, FALSE), -- 직원 - 업무 보고
(3, 2, TRUE, TRUE);

INSERT INTO cost_groups (name, description) VALUES
('내부사업', '사내 프로젝트 및 업무'),
('카카오', '카카오 관련 프로젝트');

INSERT INTO code_groups (name, description) VALUES
('PLATFORM', '플랫폼 구분'),
('WORK_TYPE', '업무 유형 구분'),
('CATEGORY', '카테고리 구분');

INSERT INTO codes (code_group_id, name, key, value, sort_order) VALUES
-- 플랫폼
(1, 'PC-Web', 'PC-Web', 'PC-Web', 1),
(1, 'M-Web', 'M-Web', 'M-Web', 2),
(1, 'iOS-App', 'iOS-App', 'iOS-App', 3),
(1, 'AOS-App', 'AOS-App', 'AOS-App', 4),
(1, 'Win-App', 'Win-App', 'Win-App', 5),
-- 업무유형
(2, 'QA', 'QA', 'QA', 1),
(2, '모니터링', '모니터링', '모니터링', 2),
(2, '컨설팅', '컨설팅', '컨설팅', 3),
(2, '교육', '교육', '교육', 4),
-- 카테고리
(3, '프로젝트', '프로젝트', '프로젝트', 1),
(3, '데이터 버퍼', '데이터 버퍼', '데이터 버퍼', 2),
(3, '일반 버퍼', '일반 버퍼', '일반 버퍼', 3),
(3, '기타 버퍼', '기타 버퍼', '기타 버퍼', 4),
(3, '매니징 버퍼', '매니징 버퍼', '매니징 버퍼', 5),
(3, '휴가', '휴가', '휴가', 6);

-- RLS (Row Level Security) 설정
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책 설정

-- 1. 공개 읽기 가능한 테이블들 (모든 인증된 사용자)
CREATE POLICY "인증된 사용자는 역할 정보 조회 가능" ON roles
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "인증된 사용자는 권한 정보 조회 가능" ON permissions
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "인증된 사용자는 역할권한 정보 조회 가능" ON role_permissions
FOR SELECT USING (auth.role() = 'authenticated');

-- INSERT 정책: member.write 권한을 가진 사용자만 역할 권한 추가 가능
CREATE POLICY "member.write 권한을 가진 사용자는 역할권한 추가 가능"
ON role_permissions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members m
    INNER JOIN role_permissions rp ON m.role_id = rp.role_id
    INNER JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE m.auth_id = auth.uid()
    AND p.key = 'member.write'
    AND rp.write_access = true
    AND m.is_active = true
  )
);

-- UPDATE 정책: member.write 권한을 가진 사용자만 역할 권한 수정 가능
CREATE POLICY "member.write 권한을 가진 사용자는 역할권한 수정 가능"
ON role_permissions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM members m
    INNER JOIN role_permissions rp ON m.role_id = rp.role_id
    INNER JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE m.auth_id = auth.uid()
    AND p.key = 'member.write'
    AND rp.write_access = true
    AND m.is_active = true
  )
);

-- DELETE 정책: member.write 권한을 가진 사용자만 역할 권한 삭제 가능
CREATE POLICY "member.write 권한을 가진 사용자는 역할권한 삭제 가능"
ON role_permissions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM members m
    INNER JOIN role_permissions rp ON m.role_id = rp.role_id
    INNER JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE m.auth_id = auth.uid()
    AND p.key = 'member.write'
    AND rp.write_access = true
    AND m.is_active = true
  )
);

CREATE POLICY "인증된 사용자는 청구그룹 정보 조회 가능" ON cost_groups
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "인증된 사용자는 서비스 정보 조회 가능" ON services
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "인증된 사용자는 코드그룹 정보 조회 가능" ON code_groups
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "인증된 사용자는 코드 정보 조회 가능" ON codes
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "인증된 사용자는 프로젝트 정보 조회 가능" ON projects
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "인증된 사용자는 프로젝트URL 정보 조회 가능" ON project_urls
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "인증된 사용자는 공휴일 정보 조회 가능" ON holidays
FOR SELECT USING (auth.role() = 'authenticated');

-- 2. 사용자별 데이터 접근 제어 (순환 참조 없는 안전한 정책)

-- members 테이블: 모든 인증된 사용자 조회 가능
CREATE POLICY "authenticated_select_members" ON members
FOR SELECT TO authenticated
USING (true);

-- 자신의 프로필만 수정 가능 (role_id, is_active는 변경 불가)
CREATE POLICY "update_own_profile" ON members
FOR UPDATE TO authenticated
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- tasks 테이블: 활성화된 사용자만 자신의 업무 조회 또는 관리자/매니저는 전체 조회
CREATE POLICY "tasks_select" ON tasks
FOR SELECT TO authenticated
USING (
  member_id IN (
    SELECT m.member_id
    FROM members m
    WHERE m.auth_id = auth.uid()
      AND m.is_active = true
  )
  OR
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
);

-- 활성화된 사용자만 자신의 업무 생성
CREATE POLICY "tasks_insert" ON tasks
FOR INSERT TO authenticated
WITH CHECK (
  member_id IN (
    SELECT m.member_id
    FROM members m
    WHERE m.auth_id = auth.uid()
      AND m.is_active = true
  )
);

-- 활성화된 사용자만 자신의 업무 수정
CREATE POLICY "tasks_update" ON tasks
FOR UPDATE TO authenticated
USING (
  member_id IN (
    SELECT m.member_id
    FROM members m
    WHERE m.auth_id = auth.uid()
      AND m.is_active = true
  )
)
WITH CHECK (
  member_id IN (
    SELECT m.member_id
    FROM members m
    WHERE m.auth_id = auth.uid()
      AND m.is_active = true
  )
);

-- 활성화된 사용자만 자신의 업무 삭제
CREATE POLICY "tasks_delete" ON tasks
FOR DELETE TO authenticated
USING (
  member_id IN (
    SELECT m.member_id
    FROM members m
    WHERE m.auth_id = auth.uid()
      AND m.is_active = true
  )
);

-- logs 테이블
CREATE POLICY "logs_select" ON logs
FOR SELECT TO authenticated
USING (
  member_id IN (
    SELECT m.member_id
    FROM members m
    WHERE m.auth_id = auth.uid()
  )
);

CREATE POLICY "logs_insert" ON logs
FOR INSERT TO authenticated
WITH CHECK (
  member_id IN (
    SELECT m.member_id
    FROM members m
    WHERE m.auth_id = auth.uid()
  )
);

-- 읽기 전용 테이블: 모든 인증된 사용자가 조회 가능
CREATE POLICY "cost_groups_select_all" ON cost_groups
FOR SELECT TO authenticated
USING (true);

-- 관리자/매니저만 청구 그룹 생성 가능
CREATE POLICY "cost_groups_insert_admin" ON cost_groups
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
);

-- 관리자/매니저만 청구 그룹 수정 가능
CREATE POLICY "cost_groups_update_admin" ON cost_groups
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
);

-- 관리자/매니저만 청구 그룹 삭제 가능
CREATE POLICY "cost_groups_delete_admin" ON cost_groups
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
);

CREATE POLICY "services_select_all" ON services
FOR SELECT TO authenticated
USING (true);

-- 관리자/매니저만 서비스 생성/수정/삭제 가능
CREATE POLICY "services_insert_admin" ON services
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
);

CREATE POLICY "services_update_admin" ON services
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
);

CREATE POLICY "services_delete_admin" ON services
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
);

CREATE POLICY "projects_select_all" ON projects
FOR SELECT TO authenticated
USING (true);

-- 관리자/매니저만 프로젝트 생성/수정/삭제 가능
CREATE POLICY "projects_insert_admin" ON projects
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
);

CREATE POLICY "projects_update_admin" ON projects
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
);

CREATE POLICY "projects_delete_admin" ON projects
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
);

CREATE POLICY "project_urls_select_all" ON project_urls
FOR SELECT TO authenticated
USING (true);

-- 관리자/매니저만 프로젝트 URL 생성/수정/삭제 가능
CREATE POLICY "project_urls_insert_admin" ON project_urls
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
);

CREATE POLICY "project_urls_update_admin" ON project_urls
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
);

CREATE POLICY "project_urls_delete_admin" ON project_urls
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name IN ('관리자', '매니저')
      AND m.is_active = true
  )
);

CREATE POLICY "holidays_select_all" ON holidays
FOR SELECT TO authenticated
USING (true);

-- 관리자만 공휴일 생성/수정/삭제 가능
CREATE POLICY "holidays_insert_admin" ON holidays
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name = '관리자'
      AND m.is_active = true
  )
);

CREATE POLICY "holidays_update_admin" ON holidays
FOR UPDATE TO authenticated
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

CREATE POLICY "holidays_delete_admin" ON holidays
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name = '관리자'
      AND m.is_active = true
  )
);

CREATE POLICY "roles_select_all" ON roles
FOR SELECT TO authenticated
USING (true);

-- 관리자만 역할 생성/수정/삭제 가능
CREATE POLICY "roles_insert_admin" ON roles
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name = '관리자'
      AND m.is_active = true
  )
);

CREATE POLICY "roles_update_admin" ON roles
FOR UPDATE TO authenticated
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

CREATE POLICY "roles_delete_admin" ON roles
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND r.name = '관리자'
      AND m.is_active = true
  )
);

CREATE POLICY "permissions_select_all" ON permissions
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "codes_select_all" ON codes
FOR SELECT TO authenticated
USING (true);

-- ============================================
-- Auth 트리거: 사용자 생성 시 members 자동 생성
-- ============================================

-- 1. auth.users 생성 시 members 레코드 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_id INTEGER;
  user_is_active BOOLEAN;
BEGIN
  -- user_metadata에서 role_id와 invited 플래그 확인
  user_role_id := (NEW.raw_user_meta_data->>'role_id')::INTEGER;

  -- invited가 true면 초대된 사용자 (자동 승인)
  -- invited가 false/null이면 자체 가입 사용자 (승인 대기)
  IF (NEW.raw_user_meta_data->>'invited')::BOOLEAN = true THEN
    user_is_active := true;
  ELSE
    -- 자체 가입은 Pending User 역할(role_id=4) 자동 할당 및 비활성화
    user_is_active := false;
    user_role_id := 4; -- Pending User 역할 고정
  END IF;

  -- members 테이블에 레코드 생성 (RLS 우회)
  INSERT INTO public.members (
    auth_id,
    email,
    name,
    account_id,
    role_id,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'account_id', ''),
    user_role_id,
    user_is_active,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Supabase Auth 사용자 생성 시 members 테이블에 자동으로 레코드를 생성합니다. invited=true면 초대된 사용자(자동 승인), false/null이면 자체 가입(Pending User 역할, 승인 대기)';
