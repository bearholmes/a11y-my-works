-- ============================================
-- 모든 테이블 및 정책 삭제 (초기화)
-- ============================================

-- 1. 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. 함수 삭제
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. 테이블 삭제 (외래키 순서 고려)
DROP TABLE IF EXISTS logs CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS project_urls CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS cost_groups CASCADE;
DROP TABLE IF EXISTS holidays CASCADE;
DROP TABLE IF EXISTS codes CASCADE;
DROP TABLE IF EXISTS code_groups CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 4. 확인
SELECT
  tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
