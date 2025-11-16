-- ========================================
-- 부서 RLS 정책 완전 재설정
-- ========================================

-- 1. 모든 기존 정책 삭제 (IF EXISTS로 안전하게)
DROP POLICY IF EXISTS "부서 조회 허용" ON public.departments;
DROP POLICY IF EXISTS "부서 관리 권한" ON public.departments;
DROP POLICY IF EXISTS "부서 생성 권한" ON public.departments;
DROP POLICY IF EXISTS "부서 수정 권한" ON public.departments;
DROP POLICY IF EXISTS "부서 삭제 권한" ON public.departments;
DROP POLICY IF EXISTS "인증된 사용자는 부서 정보 조회 가능" ON public.departments;
DROP POLICY IF EXISTS "departments_select_all" ON public.departments;
DROP POLICY IF EXISTS "departments_insert_admin" ON public.departments;
DROP POLICY IF EXISTS "departments_update_admin" ON public.departments;
DROP POLICY IF EXISTS "departments_delete_admin" ON public.departments;

-- 2. SELECT 정책 (모든 인증된 사용자)
CREATE POLICY "부서 조회 허용"
  ON public.departments
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. INSERT 정책 (관리자 + PERM_06 쓰기 권한)
CREATE POLICY "부서 생성 권한"
  ON public.departments
  FOR INSERT
  TO authenticated
  WITH CHECK (
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

-- 4. UPDATE 정책 (관리자 + PERM_06 쓰기 권한)
CREATE POLICY "부서 수정 권한"
  ON public.departments
  FOR UPDATE
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
  )
  WITH CHECK (
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

-- 5. DELETE 정책 (관리자 + PERM_06 쓰기 권한)
CREATE POLICY "부서 삭제 권한"
  ON public.departments
  FOR DELETE
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

-- 6. 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 부서 RLS 정책이 완전히 재설정되었습니다.';
  RAISE NOTICE '   - 모든 기존 정책 삭제 완료';
  RAISE NOTICE '   - 새로운 정책 (SELECT/INSERT/UPDATE/DELETE) 생성 완료';
  RAISE NOTICE '   - 권한: ADMIN 역할 또는 PERM_06 쓰기 권한';
END $$;
