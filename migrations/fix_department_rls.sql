-- ========================================
-- 부서 RLS 정책 수정
-- ========================================

-- 1. 기존 정책 삭제
DROP POLICY IF EXISTS "부서 조회 허용" ON public.departments;
DROP POLICY IF EXISTS "부서 관리 권한" ON public.departments;

-- 2. SELECT 정책 (모든 인증된 사용자)
CREATE POLICY "부서 조회 허용"
  ON public.departments
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. INSERT 정책 (관리자 + 사용자관리 권한)
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

-- 4. UPDATE 정책 (관리자 + 사용자관리 권한)
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

-- 5. DELETE 정책 (관리자 + 사용자관리 권한)
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
  RAISE NOTICE '✅ 부서 RLS 정책이 수정되었습니다.';
  RAISE NOTICE '   - INSERT/UPDATE에 WITH CHECK 절 추가';
  RAISE NOTICE '   - 정책을 SELECT/INSERT/UPDATE/DELETE로 분리';
END $$;
