-- ========================================
-- 부서 코드 필드 제거 마이그레이션
-- ========================================

-- 1. departments 테이블에서 code 컬럼 제거
ALTER TABLE public.departments DROP COLUMN IF EXISTS code;

-- 2. code 관련 인덱스 제거 (있는 경우)
DROP INDEX IF EXISTS public.idx_departments_code;

-- 3. 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 부서 코드 컬럼이 성공적으로 제거되었습니다.';
  RAISE NOTICE '   - departments.code 컬럼 삭제';
  RAISE NOTICE '   - idx_departments_code 인덱스 삭제';
END $$;
