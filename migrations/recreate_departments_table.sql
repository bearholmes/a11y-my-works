-- ========================================
-- 부서 테이블 재생성 (code 컬럼 제거)
-- ⚠️ 경고: 기존 부서 데이터가 모두 삭제됩니다!
-- ========================================

-- 1. 기존 departments 테이블 삭제
DROP TABLE IF EXISTS public.departments CASCADE;

-- 2. departments 테이블 재생성 (code 컬럼 없이)
CREATE TABLE public.departments (
  -- 기본 정보
  department_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
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
  CONSTRAINT check_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- 3. 인덱스 생성
CREATE INDEX idx_departments_parent ON public.departments(parent_department_id);
CREATE INDEX idx_departments_is_active ON public.departments(is_active);
CREATE INDEX idx_departments_path ON public.departments(path);

-- 4. 테이블 설명
COMMENT ON TABLE public.departments IS '부서 마스터 테이블 - 계층 구조 지원 (Materialized Path 패턴)';
COMMENT ON COLUMN public.departments.department_id IS '부서 고유 식별자';
COMMENT ON COLUMN public.departments.name IS '부서명';
COMMENT ON COLUMN public.departments.description IS '부서 설명';
COMMENT ON COLUMN public.departments.parent_department_id IS '상위 부서 ID (NULL = 최상위 부서)';
COMMENT ON COLUMN public.departments.depth IS '계층 깊이 (0 = 최상위)';
COMMENT ON COLUMN public.departments.path IS '계층 경로 (Materialized Path, 예: /1/2/5)';
COMMENT ON COLUMN public.departments.is_active IS '활성 상태';
COMMENT ON COLUMN public.departments.sort_order IS '표시 순서';
COMMENT ON COLUMN public.departments.created_at IS '생성일시';
COMMENT ON COLUMN public.departments.updated_at IS '갱신일시';

-- 5. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.update_departments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_departments_updated_at();

-- 6. RLS 활성화
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- 7. RLS 정책
CREATE POLICY "부서 조회 허용"
  ON public.departments
  FOR SELECT
  TO authenticated
  USING (true);

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

-- 8. members 테이블의 department_id 외래키 복구
ALTER TABLE public.members
  ADD CONSTRAINT members_department_id_fkey
  FOREIGN KEY (department_id)
  REFERENCES public.departments(department_id)
  ON DELETE SET NULL;

-- 9. 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 부서 테이블이 재생성되었습니다 (code 컬럼 제거됨)';
  RAISE NOTICE '⚠️  기존 부서 데이터는 모두 삭제되었습니다.';
  RAISE NOTICE '   샘플 데이터를 추가하려면 별도 INSERT 문을 실행하세요.';
END $$;
