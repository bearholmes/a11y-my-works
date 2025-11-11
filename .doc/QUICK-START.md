# 빠른 시작 가이드 (Quick Start)

## 🚀 5분 안에 시스템 구동하기

### 1단계: RLS 정책 적용 (2분)

1. **Supabase Dashboard** 접속 → **SQL Editor** 클릭
2. `supabase_rls_fix_secure.sql` 파일 내용 복사하여 실행
3. ✅ 성공 메시지 확인

### 2단계: 회원가입 테스트 (1분)

1. 터미널에서 애플리케이션 실행:
   ```bash
   pnpm dev
   ```
2. http://localhost:5173 접속
3. 회원가입 진행

### 3단계: 첫 관리자 승인 (2분)

Supabase **SQL Editor**에서 실행:

```sql
-- 본인 이메일로 변경!
UPDATE members
SET
  is_active = true,
  role_id = (SELECT role_id FROM roles WHERE name = '관리자' LIMIT 1),
  updated_at = NOW()
WHERE email = 'your-email@example.com';
```

### 4단계: 로그인 및 확인

1. 애플리케이션에 로그인
2. 모든 메뉴 표시 확인
3. 완료! 🎉

---

## 📚 상세 가이드

문제가 발생하면 아래 문서 참조:

### 초기 설정
- `.doc/initial-setup.md` - 전체 초기 설정 가이드
- `.doc/setup-method-2-sql-editor.md` - SQL로 관리자 설정

### RLS 문제 해결
- `.doc/troubleshooting-rls-infinite-recursion.md` - Infinite recursion 에러 해결
- `.doc/rls-verification-guide.md` - RLS 적용 및 검증 상세 가이드
- `.doc/security-rls-best-practices.md` - 보안 설계 원칙

### 기능별 가이드
- `.doc/setup-method-1-table-editor.md` - GUI로 관리자 설정
- `.doc/setup-method-3-manual-db.md` - DB 직접 접근

---

## ⚠️ 주의사항

1. **반드시 `supabase_rls_fix_secure.sql` 사용**
   - ~~`supabase_rls_fix.sql`~~은 보안 취약점이 있어 사용 금지

2. **첫 관리자 이메일 확인**
   - 3단계에서 `your-email@example.com`을 실제 이메일로 변경

3. **개발/프로덕션 환경 분리**
   - 프로덕션은 별도 Supabase 프로젝트 사용 권장

---

**작성일**: 2025-11-11
