# TODO

## 프로젝트 초기 설정

### Phase 1: 환경 설정 (1주)
- [x] Vite React TypeScript 프로젝트 초기화
- [x] 핵심 패키지 설치 (Supabase, Jotai, TanStack Query 등)
- [x] 개발 도구 설정 (Biome, Tailwind CSS)
- [x] 기본 폴더 구조 생성

### Phase 2: 인증 및 DB (1주)  
- [ ] Supabase 프로젝트 연결
- [ ] Supabase 데이터베이스 테이블 생성
- [ ] 로그인/회원가입 페이지
- [ ] 권한 관리 시스템
- [ ] 기본 라우팅 설정

### Phase 3: 핵심 기능 (2주)
- [ ] 업무 보고 작성 폼
- [ ] 업무 보고 목록/조회
- [ ] 프로젝트/서비스 관리
- [ ] 대시보드 페이지

### Phase 4: 고급 기능 (1-2주)
- [ ] 실시간 업데이트
- [ ] 반응형 디자인
- [ ] 성능 최적화
- [ ] 접근성 개선

### Phase 5: 배포 (1주)
- [ ] 테스트 작성
- [ ] 프로덕션 빌드
- [ ] 배포 설정

## 즉시 시작할 작업

1. **프로젝트 초기화**
   ```bash
   pnpm create vite . --template react-ts
   ```

2. **의존성 설치**
   ```bash
   pnpm add @supabase/supabase-js jotai @tanstack/react-query react-hook-form @hookform/resolvers zod
   ```

3. **개발 도구**
   ```bash
   pnpm add -D @biomejs/biome tailwindcss postcss autoprefixer
   ```

## 완료된 작업

### Phase 1: 프로젝트 초기화 (2025-11-09 완료)
- [x] 프로젝트 문서화
- [x] 기술 스택 검토
- [x] 작업 계획 수립
- [x] Git 컨벤션 정의
- [x] Vite React TypeScript 프로젝트 초기화
- [x] 핵심 패키지 설치 (Supabase, Jotai, TanStack Query 등)
- [x] 개발 도구 설정 (Biome, Tailwind CSS)
- [x] 기본 폴더 구조 생성

### Phase 2: 인증 및 DB (2025-11-09 완료)
- [x] Supabase 프로젝트 연결
- [x] Supabase 데이터베이스 테이블 생성
- [x] 로그인/회원가입 페이지 구현
- [x] 권한 관리 시스템 구현
- [x] 환경 변수 설정 (.env, .env.example)
- [x] 기본 컴포넌트 구조 (Layout, Dashboard, AuthWrapper)
- [x] 인증 시스템 (useAuth 훅, Jotai 상태 관리)
- [x] 개발 서버 실행 및 검증 (http://localhost:5175)
- [x] RLS 보안 정책 설정
- [x] Legacy 데이터베이스 분석 및 문서화
- [x] TypeScript 타입 정의 생성
- [x] Supabase API 서비스 함수 구현

### Phase 3: 핵심 기능 (2025-11-09 완료)
- [x] React Router DOM 설치 및 라우팅 구조 설계
- [x] React Router 설정 및 페이지 구성
  - [x] AppRouter 컴포넌트 구현 (보호된 라우트, 인증 리다이렉션)
  - [x] Layout 컴포넌트 네비게이션 구현
  - [x] 기본 페이지들 생성 (Dashboard, TaskList, TaskForm)
- [x] 사용자 등록 시 members 테이블 연동
  - [x] LoginForm에 회원가입 기능 추가 (name, accountId 필드)
  - [x] useAuth 훅에서 자동 프로필 생성 기능 구현
  - [x] Supabase Auth와 members 테이블 완전 통합
- [x] 업무 보고 작성 페이지 구현
  - [x] TaskForm 페이지 완성 (React Hook Form + Zod 검증)
  - [x] 계층적 드롭다운 구현 (비용그룹 → 서비스 → 프로젝트)
  - [x] TanStack Query를 이용한 데이터 페칭 및 뮤테이션
- [x] 실제 데이터 연동 테스트
  - [x] 종합 테스트 페이지 구현 (`/test` 라우트)
  - [x] Supabase 연결, 회원가입, 로그인, CRUD 테스트 자동화
  - [x] TypeScript 타입 오류 수정 및 안정적인 빌드 환경 구축
- [ ] 업무 보고 목록/조회 페이지 구현
- [ ] 프로젝트/서비스 관리 페이지
- [ ] 대시보드 상세 구현

### Phase 4: 추가 기능 구현 (다음 작업)
- [ ] 업무 보고 목록/조회 페이지
  - [ ] TaskList 페이지 상세 구현
  - [ ] 필터링 및 검색 기능
  - [ ] 페이지네이션 구현
  - [ ] 업무 수정/삭제 기능
- [ ] 대시보드 상세 구현
  - [ ] 통계 차트 및 요약 정보
  - [ ] 최근 업무 목록
  - [ ] 진행률 표시
- [ ] 프로젝트/서비스 관리
  - [ ] 관리자 전용 페이지
  - [ ] CRUD 기능 구현
- [ ] 사용자 관리 시스템
  - [ ] 프로필 수정 기능
  - [ ] 권한별 접근 제어

### Phase 5: 고급 기능 및 최적화
- [ ] 실시간 업데이트 (Supabase Realtime)
- [ ] 반응형 디자인 개선
- [ ] 성능 최적화 (코드 스플리팅, 레이지 로딩)
- [ ] 접근성 개선 (ARIA, 키보드 네비게이션)
- [ ] PWA 기능 추가

### Phase 6: 배포 및 운영
- [ ] 단위 테스트 작성
- [ ] E2E 테스트 구현
- [ ] 프로덕션 빌드 최적화
- [ ] 배포 설정 (Vercel/Netlify)
- [ ] 모니터링 설정

## 현재 상태 (2025-11-09)

✅ **완료된 기능:**
- 사용자 인증 시스템 (회원가입, 로그인, 로그아웃)
- 업무 보고 작성 기능 (폼 검증, 계층적 드롭다운)
- 기본 라우팅 및 네비게이션
- Supabase 데이터베이스 연동
- TypeScript 타입 안정성
- 실시간 테스트 환경

🚀 **개발 서버:** http://localhost:5173
🧪 **테스트 페이지:** http://localhost:5173/test

## 참고 링크

- 작업 계획: `.doc/work-plan.md`
- 기술 명세: `.doc/technical-specification.md`
- ERD: `.doc/database-erd.md`
