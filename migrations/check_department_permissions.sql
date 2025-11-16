-- ========================================
-- 부서 관리 권한 진단 스크립트
-- ========================================

-- 1. PERM_06 권한이 존재하는지 확인
SELECT
  'PERM_06 권한 존재 여부' as check_name,
  CASE
    WHEN EXISTS (SELECT 1 FROM permissions WHERE key = 'PERM_06')
    THEN '✅ 존재함'
    ELSE '❌ 존재하지 않음 - 권한을 먼저 생성해야 함'
  END as result;

-- 2. 모든 권한 목록 확인
SELECT
  '현재 등록된 모든 권한' as check_name,
  permission_id,
  key,
  name
FROM permissions
ORDER BY permission_id;

-- 3. 모든 역할 목록 확인
SELECT
  '현재 등록된 모든 역할' as check_name,
  role_id,
  name,
  description
FROM roles
ORDER BY role_id;

-- 4. PERM_06 권한이 어떤 역할에 할당되었는지 확인
SELECT
  'PERM_06이 할당된 역할' as check_name,
  r.role_id,
  r.name as role_name,
  p.key as permission_key,
  p.name as permission_name,
  rp.read_access,
  rp.write_access
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.role_id
JOIN permissions p ON rp.permission_id = p.permission_id
WHERE p.key = 'PERM_06';

-- 5. 현재 로그인한 사용자의 정보 확인
SELECT
  '현재 사용자 정보' as check_name,
  m.member_id,
  m.name,
  m.email,
  r.name as role_name,
  m.is_active
FROM members m
JOIN roles r ON m.role_id = r.role_id
WHERE m.auth_id = auth.uid();

-- 6. 현재 사용자가 가진 모든 권한 확인
SELECT
  '현재 사용자의 권한' as check_name,
  p.key,
  p.name,
  rp.read_access,
  rp.write_access
FROM members m
JOIN roles r ON m.role_id = r.role_id
JOIN role_permissions rp ON rp.role_id = r.role_id
JOIN permissions p ON rp.permission_id = p.permission_id
WHERE m.auth_id = auth.uid()
ORDER BY p.key;

-- 7. 부서 생성 권한 체크 쿼리 테스트
SELECT
  '부서 생성 권한 체크 결과' as check_name,
  CASE
    WHEN EXISTS (
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
    THEN '✅ 부서 생성 권한 있음'
    ELSE '❌ 부서 생성 권한 없음'
  END as result;
