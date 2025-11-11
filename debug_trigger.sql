-- ============================================
-- 트리거 및 members 테이블 디버깅
-- ============================================

-- 1. 트리거 존재 여부 확인
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
  AND trigger_name = 'on_auth_user_created';

-- 2. 트리거 함수 존재 여부 확인
SELECT
  proname as function_name,
  prosrc as function_body
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 3. 현재 auth.users 목록
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 4. 현재 members 목록
SELECT member_id, auth_id, email, name, role_id, is_active, created_at
FROM members
ORDER BY created_at DESC
LIMIT 5;

-- 5. auth.users에는 있지만 members에는 없는 사용자 찾기
SELECT
  u.id as auth_id,
  u.email,
  u.created_at,
  m.member_id
FROM auth.users u
LEFT JOIN members m ON u.id = m.auth_id
WHERE m.member_id IS NULL;

-- 6. Pending User 역할 존재 확인
SELECT role_id, name, is_active
FROM roles
ORDER BY role_id;

-- ============================================
-- 문제 해결: 트리거 재생성
-- ============================================

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 함수 재생성 (SECURITY DEFINER로 RLS 우회)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role_id INTEGER;
  user_is_active BOOLEAN;
  pending_role_id INTEGER;
BEGIN
  -- Pending User 역할 ID 가져오기
  SELECT role_id INTO pending_role_id
  FROM public.roles
  WHERE name = 'Pending User'
  LIMIT 1;

  -- Pending User 역할이 없으면 생성
  IF pending_role_id IS NULL THEN
    INSERT INTO public.roles (name, description, is_active)
    VALUES ('Pending User', '승인 대기 중인 사용자', false)
    RETURNING role_id INTO pending_role_id;
  END IF;

  -- user_metadata에서 role_id와 invited 플래그 확인
  user_role_id := (NEW.raw_user_meta_data->>'role_id')::INTEGER;

  -- invited가 true면 초대된 사용자 (자동 승인)
  -- invited가 false/null이면 자체 가입 사용자 (승인 대기)
  IF (NEW.raw_user_meta_data->>'invited')::BOOLEAN = true THEN
    user_is_active := true;
    IF user_role_id IS NULL THEN
      user_role_id := pending_role_id;
    END IF;
  ELSE
    -- 자체 가입은 Pending User 역할 자동 할당 및 비활성화
    user_is_active := false;
    user_role_id := pending_role_id;
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
EXCEPTION
  WHEN OTHERS THEN
    -- 에러 로그 (Supabase 로그에 표시됨)
    RAISE WARNING 'Failed to create member profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 트리거 재생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 트리거 재생성 확인
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
  AND trigger_name = 'on_auth_user_created';

-- ============================================
-- 기존 누락된 사용자 수동 추가
-- ============================================

-- auth.users에는 있지만 members에는 없는 사용자를 자동으로 추가
INSERT INTO public.members (
  auth_id,
  email,
  name,
  account_id,
  role_id,
  is_active,
  created_at,
  updated_at
)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', ''),
  COALESCE(u.raw_user_meta_data->>'account_id', ''),
  (SELECT role_id FROM roles WHERE name = 'Pending User' LIMIT 1),
  false,
  NOW(),
  NOW()
FROM auth.users u
LEFT JOIN members m ON u.id = m.auth_id
WHERE m.member_id IS NULL;

-- 결과 확인
SELECT
  m.member_id,
  m.email,
  m.name,
  r.name as role_name,
  m.is_active,
  m.created_at
FROM members m
LEFT JOIN roles r ON m.role_id = r.role_id
ORDER BY m.created_at DESC;
