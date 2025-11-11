# RLS 정책 적용 체크리스트

이 체크리스트를 순서대로 따라하세요.

## ☑️ 사전 확인

- [ ] Supabase 프로젝트 생성 완료
- [ ] `.env` 파일 설정 완료 (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [ ] 데이터베이스 스키마 생성 완료 (`supabase_schema.sql` 실행)

## 1️⃣ RLS 정책 적용

### 1-1. SQL 파일 준비
- [ ] `supabase_rls_fix_secure.sql` 파일 열기
- [ ] 전체 내용 복사 (Ctrl+A, Ctrl+C)

### 1-2. Supabase에서 실행
- [ ] https://supabase.com 접속
- [ ] 프로젝트 선택
- [ ] 좌측 메뉴 **SQL Editor** 클릭
- [ ] 복사한 내용 붙여넣기
- [ ] 우측 상단 **Run** 버튼 클릭
- [ ] ✅ 성공 메시지 확인

### 1-3. 정책 확인
```sql
-- members 테이블 정책 확인 (4개)
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'members'
ORDER BY cmd, policyname;
```

예상 결과:
```
members_select_admin_manager    | SELECT
members_select_own              | SELECT
members_update_admin_full       | UPDATE
members_update_own_profile_only | UPDATE
```

- [ ] 4개 정책 확인 완료

## 2️⃣ 회원가입 테스트

### 2-1. 애플리케이션 실행
터미널에서:
```bash
pnpm dev
```
- [ ] http://localhost:5173 접속 성공

### 2-2. 회원가입 진행
- [ ] 회원가입 페이지 접속
- [ ] 정보 입력:
  - 이메일: (본인 이메일)
  - 비밀번호: (안전한 비밀번호)
  - 이름: (본인 이름)
  - 아이디: (계정 ID)
- [ ] 가입 완료

### 2-3. 가입 결과 확인

Supabase SQL Editor에서:
```sql
-- 1. auth.users 확인
SELECT id, email, created_at
FROM auth.users
WHERE email = '본인이메일@example.com';
```
- [ ] auth.users에 사용자 존재

```sql
-- 2. members 테이블 확인 (⭐ 중요)
SELECT
  m.member_id,
  m.email,
  m.name,
  m.is_active,
  r.name as role_name
FROM members m
LEFT JOIN roles r ON m.role_id = r.role_id
WHERE m.email = '본인이메일@example.com';
```

예상 결과:
- `is_active`: `false`
- `role_name`: `Pending User`

- [ ] members 테이블에 레코드 생성됨
- [ ] `is_active = false` 확인
- [ ] `role_name = Pending User` 확인

**❌ 만약 members 테이블에 레코드가 없다면**:
→ [`.doc/troubleshooting-rls-infinite-recursion.md`](.doc/troubleshooting-rls-infinite-recursion.md) 참조

## 3️⃣ 첫 관리자 승인

Supabase SQL Editor에서:
```sql
-- ⚠️ 이메일 주소를 본인 것으로 변경!
UPDATE members
SET
  is_active = true,
  role_id = (SELECT role_id FROM roles WHERE name = '관리자' LIMIT 1),
  updated_at = NOW()
WHERE email = '본인이메일@example.com';
```
- [ ] `1 row affected` 확인

### 확인
```sql
SELECT
  m.email,
  m.is_active,
  r.name as role_name
FROM members m
JOIN roles r ON m.role_id = r.role_id
WHERE m.email = '본인이메일@example.com';
```

예상 결과:
- `is_active`: `true`
- `role_name`: `관리자`

- [ ] 관리자 승인 완료

## 4️⃣ 애플리케이션 로그인

### 4-1. 로그인
- [ ] 애플리케이션에서 로그아웃 (로그인 상태라면)
- [ ] 로그인 페이지에서 로그인
- [ ] 로그인 성공

### 4-2. 권한 확인
- [ ] 좌측 사이드바에 모든 메뉴 표시됨
- [ ] "사용자 관리" 메뉴 존재
- [ ] "프로젝트 관리" 메뉴 존재
- [ ] "서비스 관리" 메뉴 존재
- [ ] "팀 업무 조회" 메뉴 존재
- [ ] "리소스 통계" 메뉴 존재

### 4-3. 업무 작성 테스트
- [ ] "업무 목록" 클릭
- [ ] "새 업무 작성" 클릭
- [ ] 업무 정보 입력 후 저장
- [ ] 업무 목록에 표시됨

## 5️⃣ 보안 테스트 (선택사항)

### 5-1. 테스트용 일반 사용자 생성

1. 새 브라우저 시크릿 모드로 http://localhost:5173 접속
2. 회원가입: `test@example.com`
3. Supabase에서 승인:
```sql
UPDATE members
SET
  is_active = true,
  role_id = (SELECT role_id FROM roles WHERE name = '직원' LIMIT 1)
WHERE email = 'test@example.com';
```
- [ ] 테스트 사용자 생성 완료

### 5-2. 권한 상승 시도 (실패해야 함)

브라우저 개발자 도구 콘솔에서:
```javascript
// ❌ 실패해야 함
const response = await fetch('https://YOUR-PROJECT.supabase.co/rest/v1/members?auth_id=eq.YOUR-AUTH-ID', {
  method: 'PATCH',
  headers: {
    'apikey': 'YOUR-ANON-KEY',
    'Authorization': 'Bearer YOUR-JWT',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    role_id: 1  // 관리자로 변경 시도
  })
});
console.log(await response.json());
```

예상: RLS policy 에러

- [ ] 권한 상승 시도 실패 확인

### 5-3. 이름 변경 시도 (성공해야 함)

```javascript
// ✅ 성공해야 함
const response = await fetch('https://YOUR-PROJECT.supabase.co/rest/v1/members?auth_id=eq.YOUR-AUTH-ID', {
  method: 'PATCH',
  headers: {
    'apikey': 'YOUR-ANON-KEY',
    'Authorization': 'Bearer YOUR-JWT',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: '새로운이름'
  })
});
console.log(await response.json());
```

- [ ] 이름 변경 성공 확인

## ✅ 완료!

모든 체크리스트 완료 시:
- [x] RLS 정책 적용 완료
- [x] 회원가입 정상 작동
- [x] 첫 관리자 승인 완료
- [x] 애플리케이션 로그인 성공
- [x] 모든 메뉴 접근 가능
- [x] 보안 테스트 통과 (선택사항)

🎉 **시스템이 정상적으로 구동됩니다!**

## 📚 다음 단계

- [초기 데이터 설정](.doc/initial-setup.md#2-기본-역할-및-권한-설정)
- [기본 프로젝트/서비스 생성](.doc/initial-setup.md#3-기본-데이터-설정)
- 팀원 초대 및 역할 할당

## ⚠️ 문제 발생 시

- [RLS Infinite Recursion 해결](.doc/troubleshooting-rls-infinite-recursion.md)
- [RLS 검증 가이드](.doc/rls-verification-guide.md)
- [보안 베스트 프랙티스](.doc/security-rls-best-practices.md)

---

**작성일**: 2025-11-11
