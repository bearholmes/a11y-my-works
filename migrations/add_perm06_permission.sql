-- ========================================
-- PERM_06 권한 생성 및 관리자 역할에 할당
-- ========================================

-- 1. PERM_06 권한 생성 (이미 존재하면 무시)
INSERT INTO permissions (key, name)
VALUES ('PERM_06', '사용자 관리')
ON CONFLICT (key) DO NOTHING;

-- 2. 관리자 역할 찾기 및 PERM_06 할당
-- '관리자' 또는 'ADMIN' 역할에 PERM_06 쓰기 권한 부여
DO $$
DECLARE
  admin_role_id INTEGER;
  perm_06_id INTEGER;
BEGIN
  -- PERM_06 권한 ID 조회
  SELECT permission_id INTO perm_06_id FROM permissions WHERE key = 'PERM_06';

  -- '관리자' 역할 찾기
  SELECT role_id INTO admin_role_id FROM roles WHERE name IN ('관리자', 'ADMIN') LIMIT 1;

  IF admin_role_id IS NOT NULL AND perm_06_id IS NOT NULL THEN
    -- 이미 존재하면 UPDATE, 없으면 INSERT
    INSERT INTO role_permissions (role_id, permission_id, read_access, write_access)
    VALUES (admin_role_id, perm_06_id, true, true)
    ON CONFLICT (role_id, permission_id)
    DO UPDATE SET read_access = true, write_access = true;

    RAISE NOTICE '✅ PERM_06 권한이 관리자 역할(ID: %)에 할당되었습니다.', admin_role_id;
  ELSE
    RAISE NOTICE '❌ 관리자 역할 또는 PERM_06 권한을 찾을 수 없습니다.';
  END IF;
END $$;

-- 3. 결과 확인
SELECT
  r.name as role_name,
  p.key as permission_key,
  p.name as permission_name,
  rp.read_access,
  rp.write_access
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.role_id
JOIN permissions p ON rp.permission_id = p.permission_id
WHERE p.key = 'PERM_06';
