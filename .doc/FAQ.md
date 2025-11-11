# 자주 묻는 질문 (FAQ)

## 회원가입 및 로그인

### Q1. 회원가입했는데 members 테이블에 사용자가 안 보여요
**A**: `debug_trigger.sql`을 실행하세요. 트리거가 제대로 작동하지 않는 경우입니다.

```sql
-- Supabase SQL Editor에서 실행
-- debug_trigger.sql 파일 전체 복사하여 실행
```

이 스크립트는:
- 트리거 재생성
- 기존 누락된 사용자 복구
- Pending User 역할 자동 생성

### Q2. 회원가입 시 "infinite recursion" 에러가 나요
**A**: RLS 정책에 순환 참조가 있습니다. `supabase_rls_fix_secure_v2.sql`을 실행하세요.

상세 가이드: `.doc/troubleshooting-rls-infinite-recursion.md`

### Q3. 회원가입 시 name과 account_id가 빈 값으로 저장돼요
**A**: 프론트엔드 코드가 최신 버전인지 확인하세요.

`src/hooks/useAuth.ts`에서 `options.data`를 통해 전달해야 합니다:
```typescript
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      name: profile?.name || '',
      account_id: profile?.account_id || '',
    },
  },
});
```

### Q4. 로그인은 되는데 "승인 대기 중" 화면만 나와요
**A**: `is_active = true`이고 `role_id`가 설정되어야 합니다.

```sql
-- 두 가지 모두 설정 필요
UPDATE members
SET
  is_active = true,
  role_id = (SELECT role_id FROM roles WHERE name = '직원'),
  updated_at = NOW()
WHERE email = 'user@example.com';
```

**주의**: `is_active = true`만으로는 부족합니다! `role_id`도 반드시 설정하세요.

## 권한 및 역할

### Q5. 사용자가 자기 role_id를 변경할 수 있나요?
**A**: 아니요, RLS 정책으로 차단됩니다.

사용자는 `name`, `mobile` 같은 프로필 정보만 수정 가능합니다.
`role_id`와 `is_active`는 오직 관리자만 변경할 수 있습니다.

### Q6. is_active를 true로 하면 바로 로그인되나요?
**A**: 로그인은 되지만 **권한이 없으면 사용할 수 없습니다**.

로그인 가능 vs 시스템 사용 가능:
- 로그인 가능: `auth.users`에 계정 + 이메일 인증
- 시스템 사용 가능: `is_active = true` + `role_id` 설정

### Q7. 탈퇴 기능이 있나요?
**A**: 완전 탈퇴는 없고, **소프트 삭제(비활성화)**만 있습니다.

관리자가 사용자를 비활성화하면:
- ✅ 로그인 차단
- ✅ 데이터 보존 (업무, 로그)
- ✅ 복구 가능

이는 의도된 설계입니다:
- 퇴사자의 과거 업무 기록 유지
- 통계 데이터 무결성
- 법적 요구사항 충족

## 데이터베이스

### Q8. "ON CONFLICT" 에러가 나요
**A**: `roles` 테이블에 UNIQUE 제약이 없습니다.

`supabase_rls_fix_secure_v2.sql`을 사용하세요. 이 파일은 자동으로 UNIQUE 제약을 추가합니다.

### Q9. 처음부터 DB를 생성하려면 어떤 파일을 실행하나요?
**A**: `supabase_schema.sql`을 실행하세요.

이 파일은:
- 모든 테이블 생성
- 기본 데이터 삽입
- 보안 강화 RLS 정책 포함
- 트리거 설정

```sql
-- Supabase SQL Editor에서
-- supabase_schema.sql 전체 복사하여 실행
```

### Q10. 기존 DB에 RLS 정책만 업데이트하려면?
**A**: `supabase_rls_fix_secure_v2.sql`을 실행하세요.

이 파일은:
- 기존 정책 삭제
- 보안 강화 정책으로 교체
- UNIQUE 제약 자동 추가

## 초기 설정

### Q11. 첫 관리자는 어떻게 설정하나요?
**A**: 3가지 방법이 있습니다.

**방법 1: SQL Editor (권장)**
```sql
UPDATE members
SET
  is_active = true,
  role_id = (SELECT role_id FROM roles WHERE name = '관리자'),
  updated_at = NOW()
WHERE email = 'your-email@example.com';
```

**방법 2: Table Editor (GUI)**
- Supabase Dashboard → Table Editor → members
- 해당 사용자 찾아서 수동 수정

**방법 3: DB 클라이언트**
- psql, pgAdmin, DBeaver 등 사용

상세: `.doc/setup-method-2-sql-editor.md`

### Q12. 역할(Role)은 어떤 게 있나요?
**A**: 기본 4가지 역할:

1. **관리자** (role_id: 1)
   - 전체 권한
   - 사용자 관리, 역할 변경 가능

2. **매니저** (role_id: 2)
   - 팀 관리
   - 모든 업무 조회 가능
   - 사용자 정보 수정 불가

3. **직원** (role_id: 3)
   - 일반 사용자
   - 본인 업무만 관리

4. **Pending User** (role_id: 4)
   - 승인 대기 중
   - 시스템 사용 불가

## RLS 정책

### Q13. RLS 정책이 제대로 적용되었는지 확인하려면?
**A**: 다음 쿼리로 확인하세요.

```sql
-- members 테이블 정책 (4개)
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'members'
ORDER BY cmd, policyname;

-- tasks 테이블 정책 (5개)
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'tasks'
ORDER BY cmd, policyname;
```

### Q14. 비활성화된 사용자도 업무를 작성할 수 있나요?
**A**: 아니요, 모든 RLS 정책에 `is_active = true` 체크가 있습니다.

```sql
-- 예시: tasks_insert_own 정책
CREATE POLICY "tasks_insert_own" ON tasks
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members m
    WHERE m.auth_id = auth.uid()
      AND m.member_id = tasks.member_id
      AND m.is_active = true  -- ⭐ 비활성화 차단
  )
);
```

## 프론트엔드

### Q15. 입력값에 공백이 포함되어 저장돼요
**A**: Zod 스키마에서 `.trim()` 처리하고 있습니다.

최신 코드라면 자동으로 trim됩니다:
```typescript
const signUpSchema = z.object({
  email: z.string().trim().email('...'),
  name: z.string().trim().min(1, '...'),
  accountId: z.string().trim().min(1, '...'),
});
```

### Q16. 키보드 단축키가 작동 안 해요
**A**: 입력 필드에서는 단축키가 비활성화됩니다.

지원되는 단축키:
- `Alt + H`: 홈
- `Alt + T`: 업무 목록
- `Alt + N`: 새 업무 작성
- `Alt + R`: 리소스 통계
- `Alt + P`: 프로젝트 관리
- `Alt + S`: 서비스 관리
- `Alt + M`: 사용자 관리

## 배포 및 운영

### Q17. 프로덕션 배포 시 주의사항은?
**A**:

1. **환경 분리**
   - 개발/프로덕션 Supabase 프로젝트 분리
   - `.env` 파일 별도 관리

2. **보안**
   - `VITE_SUPABASE_ANON_KEY`는 공개 가능
   - `service_role` 키는 절대 프론트엔드에 노출 금지
   - HTTPS 필수

3. **데이터베이스**
   - RLS 정책 활성화 확인
   - 백업 설정
   - Connection Pooling 설정

4. **모니터링**
   - Supabase Dashboard에서 로그 확인
   - 에러 트래킹 설정 (Sentry 등)

### Q18. Node.js 버전 경고가 나요
**A**: Vite 7은 Node.js 20.19+ 또는 22.12+를 요구합니다.

현재 사용 중: Node.js 20.16.0
권장: Node.js 20.19+ 업그레이드

```bash
# nvm 사용 시
nvm install 20.19
nvm use 20.19
```

## 기타

### Q19. 문서는 어디에 있나요?
**A**: `.doc/` 폴더에 모든 문서가 있습니다.

주요 문서:
- `QUICK-START.md`: 빠른 시작 (5분)
- `APPLY-CHECKLIST.md`: 단계별 체크리스트
- `troubleshooting-rls-infinite-recursion.md`: RLS 에러 해결
- `security-rls-best-practices.md`: 보안 베스트 프랙티스

### Q20. 버그를 발견했어요
**A**: GitHub Issues에 제보해주세요.

포함할 정보:
- 재현 단계
- 예상 동작 vs 실제 동작
- 에러 메시지 (있다면)
- 브라우저/환경 정보

---

**최종 업데이트**: 2025-11-11
