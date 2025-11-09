-- ============================================
-- 마이그레이션: Pending User 역할 추가 및 기존 데이터 처리
-- 작성일: 2025-01-10
-- 설명: 기존 members 테이블에 Pending User 역할을 추가하고,
--       역할이 없는 기존 회원들을 Pending User로 업데이트
-- ============================================

-- ========================================
-- Step 1: 백업 (필수)
-- ========================================
-- 실행 전 반드시 백업을 생성하세요!
-- Supabase Dashboard > Database > Backups

-- ========================================
-- Step 2: Pending User 역할 생성
-- ========================================
BEGIN;

-- Pending User 역할 추가 (role_id=4로 고정)
INSERT INTO public.roles (role_id, name, description, is_active, created_at, updated_at)
VALUES (
  4,
  'Pending User',
  '승인 대기 중인 사용자 (모든 권한 없음)',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (role_id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 확인
SELECT role_id, name, description, is_active FROM public.roles ORDER BY role_id;

COMMIT;

-- ========================================
-- Step 3: 기존 회원 데이터 마이그레이션
-- ========================================
BEGIN;

-- 3-1. 현재 상태 확인
SELECT
  COUNT(*) as total_members,
  COUNT(CASE WHEN role_id IS NULL THEN 1 END) as members_without_role,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_members
FROM public.members;

-- 3-2. role_id가 NULL이고 is_active가 false인 회원들을 Pending User로 업데이트
UPDATE public.members
SET
  role_id = 4,
  updated_at = NOW()
WHERE
  role_id IS NULL
  AND is_active = false;

-- 3-3. 업데이트 결과 확인
SELECT
  m.member_id,
  m.name,
  m.email,
  m.role_id,
  r.name as role_name,
  m.is_active
FROM public.members m
LEFT JOIN public.roles r ON m.role_id = r.role_id
WHERE m.role_id = 4 OR m.role_id IS NULL
ORDER BY m.created_at DESC;

COMMIT;

-- ========================================
-- Step 4: Auth 트리거 생성/업데이트
-- ========================================
BEGIN;

-- 4-1. auth.users 생성 시 members 레코드 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
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

  -- members 테이블에 레코드 생성
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4-2. 기존 트리거가 있으면 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4-3. auth.users INSERT 시 트리거 실행
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4-4. 주석 추가
COMMENT ON FUNCTION public.handle_new_user() IS 'Supabase Auth 사용자 생성 시 members 테이블에 자동으로 레코드를 생성합니다. invited=true면 초대된 사용자(자동 승인), false/null이면 자체 가입(Pending User 역할, 승인 대기)';

COMMIT;

-- ========================================
-- Step 5: 최종 검증
-- ========================================

-- 5-1. 역할별 회원 수 확인
SELECT
  r.role_id,
  r.name as role_name,
  COUNT(m.member_id) as member_count
FROM public.roles r
LEFT JOIN public.members m ON r.role_id = m.role_id
GROUP BY r.role_id, r.name
ORDER BY r.role_id;

-- 5-2. 역할이 없는 회원 확인 (0이어야 함)
SELECT
  m.member_id,
  m.name,
  m.email,
  m.role_id,
  m.is_active
FROM public.members m
WHERE m.role_id IS NULL;

-- 5-3. Pending User 회원 목록 확인
SELECT
  m.member_id,
  m.name,
  m.email,
  m.is_active,
  m.created_at
FROM public.members m
WHERE m.role_id = 4
ORDER BY m.created_at DESC;

-- ========================================
-- 롤백 방법 (문제 발생 시)
-- ========================================
-- 주의: 이 스크립트는 마이그레이션 전 백업이 있을 때만 안전합니다!
/*
BEGIN;

-- Pending User 역할을 가진 회원들의 role_id를 NULL로 되돌림
UPDATE public.members
SET role_id = NULL, updated_at = NOW()
WHERE role_id = 4;

-- Pending User 역할 삭제
DELETE FROM public.roles WHERE role_id = 4;

-- 트리거 제거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

COMMIT;
*/
