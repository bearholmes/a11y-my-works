-- ========================================
-- 부서 관리 테이블 및 관련 컬럼 추가
-- ========================================

-- 1. 부서 테이블 생성
CREATE TABLE IF NOT EXISTS public.departments (
  -- 기본 정보
  department_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,

  -- 계층 구조 (Self-Referencing FK)
  parent_department_id INTEGER REFERENCES public.departments(department_id) ON DELETE SET NULL,
  depth INTEGER DEFAULT 0 NOT NULL,
  path TEXT NOT NULL,

  -- 메타데이터
  is_active BOOLEAN DEFAULT true NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,

  -- 감사 필드
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- 제약조건
  CONSTRAINT check_depth CHECK (depth >= 0),
  CONSTRAINT check_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT check_code_format CHECK (code ~ '^[A-Z_]+$'),
  CONSTRAINT check_code_length CHECK (LENGTH(code) >= 2 AND LENGTH(code) <= 50)
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_departments_parent ON public.departments(parent_department_id);
CREATE INDEX IF NOT EXISTS idx_departments_is_active ON public.departments(is_active);
CREATE INDEX IF NOT EXISTS idx_departments_code ON public.departments(code);
CREATE INDEX IF NOT EXISTS idx_departments_path ON public.departments(path);

-- 3. 테이블 및 컬럼 주석
COMMENT ON TABLE public.departments IS '부서 마스터 테이블 - 계층 구조 지원 (Materialized Path 패턴)';
COMMENT ON COLUMN public.departments.department_id IS '부서 고유 식별자';
COMMENT ON COLUMN public.departments.name IS '부서명';
COMMENT ON COLUMN public.departments.code IS '부서 코드 (고유, 영문 대문자 및 언더스코어)';
COMMENT ON COLUMN public.departments.description IS '부서 설명';
COMMENT ON COLUMN public.departments.parent_department_id IS '상위 부서 ID (NULL = 최상위 부서)';
COMMENT ON COLUMN public.departments.depth IS '계층 깊이 (0 = 최상위)';
COMMENT ON COLUMN public.departments.path IS '계층 경로 (Materialized Path, 예: /1/2/5)';
COMMENT ON COLUMN public.departments.is_active IS '활성 상태';
COMMENT ON COLUMN public.departments.sort_order IS '표시 순서';
COMMENT ON COLUMN public.departments.created_at IS '생성일시';
COMMENT ON COLUMN public.departments.updated_at IS '갱신일시';

-- 4. members 테이블에 department_id 컬럼 추가
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'members'
      AND column_name = 'department_id'
  ) THEN
    ALTER TABLE public.members
    ADD COLUMN department_id INTEGER REFERENCES public.departments(department_id) ON DELETE SET NULL;

    CREATE INDEX idx_members_department ON public.members(department_id);

    COMMENT ON COLUMN public.members.department_id IS '소속 부서 ID';
  END IF;
END $$;

-- 5. updated_at 자동 갱신 트리거 함수 (departments용)
CREATE OR REPLACE FUNCTION public.update_departments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. updated_at 트리거 생성
DROP TRIGGER IF EXISTS trigger_departments_updated_at ON public.departments;
CREATE TRIGGER trigger_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_departments_updated_at();

-- 7. RLS (Row Level Security) 정책 활성화
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- 8. RLS 정책 생성
-- 조회: 모든 인증된 사용자
CREATE POLICY "부서 조회 허용"
  ON public.departments
  FOR SELECT
  TO authenticated
  USING (true);

-- 생성/수정/삭제: 관리자 또는 사용자 관리 권한 보유자만
CREATE POLICY "부서 관리 권한"
  ON public.departments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.members m
      JOIN public.roles r ON m.role_id = r.role_id
      WHERE m.auth_id = auth.uid()
        AND (
          r.name = 'ADMIN'
          OR EXISTS (
            SELECT 1
            FROM public.role_permissions rp
            JOIN public.permissions p ON rp.permission_id = p.permission_id
            WHERE rp.role_id = r.role_id
              AND p.key = 'PERM_06'
              AND rp.write_access = true
          )
        )
    )
  );

-- 9. 샘플 부서 데이터 삽입 (선택적)
INSERT INTO public.departments (name, code, description, parent_department_id, depth, path, is_active, sort_order)
VALUES
  ('개발팀', 'DEV', '소프트웨어 개발 부서', NULL, 0, '/1', true, 1),
  ('기획팀', 'PM', '기획 및 프로젝트 관리', NULL, 0, '/2', true, 2),
  ('디자인팀', 'DESIGN', 'UI/UX 디자인', NULL, 0, '/3', true, 3)
ON CONFLICT (code) DO NOTHING;

-- 10. 샘플 하위 부서 데이터 삽입 (선택적)
-- 개발팀 하위
DO $$
DECLARE
  dev_dept_id INTEGER;
BEGIN
  SELECT department_id INTO dev_dept_id FROM public.departments WHERE code = 'DEV';

  IF dev_dept_id IS NOT NULL THEN
    INSERT INTO public.departments (name, code, description, parent_department_id, depth, path, is_active, sort_order)
    VALUES
      ('프론트엔드팀', 'FE', '프론트엔드 개발', dev_dept_id, 1, '/' || dev_dept_id || '/' || (SELECT COALESCE(MAX(department_id), 0) + 1 FROM public.departments), true, 1),
      ('백엔드팀', 'BE', '백엔드 개발', dev_dept_id, 1, '/' || dev_dept_id || '/' || (SELECT COALESCE(MAX(department_id), 0) + 2 FROM public.departments), true, 2)
    ON CONFLICT (code) DO NOTHING;
  END IF;
END $$;

-- 11. 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 부서 테이블 및 관련 컬럼이 성공적으로 생성되었습니다.';
  RAISE NOTICE '   - departments 테이블 생성';
  RAISE NOTICE '   - members.department_id 컬럼 추가';
  RAISE NOTICE '   - RLS 정책 적용';
  RAISE NOTICE '   - 샘플 데이터 삽입 (개발팀, 기획팀, 디자인팀 등)';
END $$;
