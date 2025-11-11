# a11y-my-works

업무보고시스템 토이프로젝트

## 개발환경

서버리스(Backendless) 서비스

### 프론트 엔드 

- Node.js v20 이상
- pnpm v8 이상
- **프레임워크**: React 19 (CSR)
- **상태 관리**: Jotai
- **API 통신**: TanStack Query + ofetch
- **스타일링**: Tailwind CSS + TailwindPlus
- **빌드 도구**: Vite
- **개발 언어**: TypeScript
- **코드린트**: Biome
- **React Hook Form**: 폼 관리 및 유효성 검증
- **zod**: 타입스크립트 스키마 검증
- **date-fns**: 날짜 처리

### 데이터 환경

- 데이터 베이스 : Supabase
- 인증 : Supabase 클라이언트 SDK Auth 모듈
- Supabase 설정 값은 .env에 보관하고 이를 로컬에서만 저장되도록 함

## 빠른 시작

처음 시스템을 설정하는 경우:

1. **RLS 정책 적용**: `supabase_rls_fix_secure.sql` 실행
2. **회원가입**: 애플리케이션에서 가입
3. **관리자 승인**: SQL로 첫 관리자 승인
4. **로그인**: 완료!

상세 가이드: [`.doc/QUICK-START.md`](.doc/QUICK-START.md)

## 문서

### 초기 설정
- [빠른 시작 가이드](.doc/QUICK-START.md) - 5분 안에 시스템 구동
- [초기 설정 가이드](.doc/initial-setup.md) - 전체 초기 설정 절차
- [방법 1: Table Editor 사용](.doc/setup-method-1-table-editor.md) - GUI로 관리자 설정
- [방법 2: SQL Editor 사용](.doc/setup-method-2-sql-editor.md) - SQL로 관리자 설정 (권장)
- [방법 3: DB 직접 접근](.doc/setup-method-3-manual-db.md) - PostgreSQL 클라이언트 사용

### 문제 해결
- [RLS Infinite Recursion 해결](.doc/troubleshooting-rls-infinite-recursion.md) - 회원가입 시 에러 해결
- [RLS 검증 가이드](.doc/rls-verification-guide.md) - RLS 정책 적용 및 테스트

### 보안
- [RLS 보안 베스트 프랙티스](.doc/security-rls-best-practices.md) - 보안 설계 원칙

