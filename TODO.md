# TODO

## 프로젝트 개요

업무 보고 시스템 - Serverless (Backendless) React 애플리케이션

## 완료된 작업

### Phase 1: 프로젝트 초기화 ✅ (2025-11-09 완료)
- [x] 프로젝트 문서화
- [x] 기술 스택 검토 및 선정
- [x] 작업 계획 수립
- [x] Git 컨벤션 정의
- [x] Vite React TypeScript 프로젝트 초기화
- [x] 핵심 패키지 설치 (Supabase, Jotai, TanStack Query 등)
- [x] 개발 도구 설정 (Biome, Tailwind CSS v4)
- [x] 기본 폴더 구조 생성

### Phase 2: 인증 및 DB ✅ (2025-11-09 완료)
- [x] Supabase 프로젝트 연결
- [x] Supabase 데이터베이스 테이블 생성 (10개 테이블)
- [x] RLS 보안 정책 설정
- [x] Legacy 데이터베이스 분석 및 문서화
- [x] TypeScript 타입 정의 생성
- [x] Supabase API 서비스 함수 구현
- [x] 로그인/회원가입 페이지 구현
- [x] 비밀번호 찾기/재설정 기능
- [x] 비밀번호 변경 기능
- [x] 권한 관리 시스템 구현 (RBAC)
- [x] 환경 변수 설정 (.env, .env.example)
- [x] 기본 컴포넌트 구조 (Layout, Dashboard, AuthWrapper)
- [x] 인증 시스템 (useAuth 훅, Jotai 상태 관리)

### Phase 3: 핵심 기능 ✅ (2025-11-09 완료)
- [x] React Router DOM 설치 및 라우팅 구조 설계
- [x] React Router 설정 및 페이지 구성
  - [x] AppRouter 컴포넌트 구현 (보호된 라우트, 인증 리다이렉션)
  - [x] Layout 컴포넌트 네비게이션 구현
  - [x] Sidebar 권한 기반 메뉴 시스템
- [x] 사용자 등록 시 members 테이블 연동
  - [x] 회원가입 기능 (name, accountId 필드)
  - [x] useAuth 훅에서 자동 프로필 생성
  - [x] Supabase Auth와 members 테이블 완전 통합
- [x] 업무 보고 작성 페이지
  - [x] TaskForm 페이지 완성 (React Hook Form + Zod 검증)
  - [x] 계층적 드롭다운 (비용그룹 → 서비스 → 프로젝트)
  - [x] TanStack Query 데이터 페칭 및 뮤테이션
  - [x] 업무 수정/삭제 기능
- [x] 업무 보고 목록/조회 페이지
  - [x] TaskList 페이지 완전 구현
  - [x] 고급 필터링 및 검색 기능
  - [x] 페이지네이션 구현
  - [x] 상세 보기 모달
- [x] 대시보드 상세 구현
  - [x] 통계 차트 및 요약 정보
  - [x] 일별 업무 추이 차트
  - [x] 프로젝트별/사용자별 통계
  - [x] 최근 업무 목록
  - [x] 날짜 범위 필터
- [x] 실제 데이터 연동 테스트
  - [x] 종합 테스트 페이지 구현 (`/test` 라우트)
  - [x] Supabase 연결, 회원가입, 로그인, CRUD 테스트

### Phase 4: 관리자 기능 ✅ (2025-11-10 완료)
- [x] 프로젝트 관리
  - [x] 프로젝트 목록/조회 페이지 (ProjectList)
  - [x] 프로젝트 생성/수정 페이지 (ProjectForm)
  - [x] 플랫폼별 필터링, 검색, 페이지네이션
  - [x] CRUD 기능 완전 구현
- [x] 서비스 관리
  - [x] 서비스 목록/조회 페이지 (ServiceList)
  - [x] 서비스 생성/수정 페이지 (ServiceForm)
  - [x] 청구 그룹별 필터링, 검색
  - [x] CRUD 기능 완전 구현
- [x] 청구 그룹 관리
  - [x] 청구 그룹 목록/조회 페이지 (CostGroupList)
  - [x] 청구 그룹 생성/수정 페이지 (CostGroupForm)
  - [x] CRUD 기능 완전 구현
- [x] 공휴일 관리
  - [x] 공휴일 목록/조회 페이지 (HolidayList)
  - [x] 공휴일 생성/수정 페이지 (HolidayForm)
  - [x] 연도별 필터링
  - [x] CRUD 기능 완전 구현
- [x] 사용자 관리
  - [x] 사용자 목록/조회 페이지 (MemberList)
  - [x] 사용자 생성/수정 페이지 (MemberForm)
  - [x] 사용자 승인/거절 기능
  - [x] 사용자 활성화/비활성화
  - [x] 관리자의 사용자 비밀번호 초기화
  - [x] 프로필 수정 페이지 (Profile)
- [x] 역할 관리
  - [x] 역할 목록/조회 페이지 (RoleList)
  - [x] 역할 생성/수정 페이지 (RoleForm)
  - [x] 권한 할당 기능
  - [x] CRUD 기능 완전 구현
- [x] 권한별 접근 제어
  - [x] usePermission 훅 구현
  - [x] PermissionGuard 컴포넌트
  - [x] 403 Forbidden 페이지
  - [x] 페이지별 권한 체크 적용
  - [x] 사이드바 메뉴 권한별 표시

### Phase 5: 성능 최적화 ✅ (2025-11-10 완료)
- [x] 코드 스플리팅 및 레이지 로딩
  - [x] React.lazy()를 사용한 페이지 컴포넌트 동적 import
  - [x] Suspense를 사용한 로딩 상태 관리
  - [x] 17개 페이지 컴포넌트 레이지 로딩 적용
- [x] Vite 빌드 최적화
  - [x] manualChunks로 vendor 청크 분리
  - [x] 6개 vendor 청크 생성 (react, form, query, state, supabase, utils)
  - [x] 메인 번들 크기 51% 감소 (680 kB → 327 kB)
  - [x] 브라우저 캐싱 효율 최적화

## 진행 중인 작업

현재 모든 Phase 6까지 완료되었습니다.

### Phase 6: 접근성 개선 ✅ (2025-11-11 완료)
- [x] ARIA 라벨 및 역할 추가
  - [x] Layout 컴포넌트 (헤더, 사이드바, 드롭다운)
  - [x] Sidebar 컴포넌트 (네비게이션, 메뉴 아이템)
  - [x] LoginForm 컴포넌트 (폼 필드, 에러 메시지)
  - [x] PermissionGuard 컴포넌트 (로딩 상태)
  - [x] AppRouter 컴포넌트 (PageLoader)
- [x] 키보드 단축키 구현
  - [x] useKeyboardShortcuts 훅 생성
  - [x] 글로벌 단축키 (Alt + H/T/N/P/S/M)
  - [x] KeyboardShortcutsModal 컴포넌트
  - [x] Esc 키로 모달/드롭다운 닫기
  - [x] Alt + / 로 단축키 도움말 표시
- [x] 포커스 관리 개선
  - [x] Skip to main content 링크
  - [x] 포커스 가시성 스타일 (outline)
  - [x] 모달 포커스 트랩
  - [x] sr-only 및 sr-only-focusable 유틸리티
- [x] 빌드 테스트 및 검증

### Phase 6.5: 네비게이션 개선 ✅ (2025-11-11 완료)
- [x] 좌측 메뉴 2depth 구조로 변경
  - [x] 메뉴를 4개 그룹으로 구조화
    - [x] 나의 업무 (대시보드, 업무 보고, 업무 등록)
    - [x] 팀 관리 (팀 업무 조회, 리소스 통계)
    - [x] 프로젝트 관리 (청구 그룹, 서비스, 프로젝트, 공휴일)
    - [x] 시스템 관리 (관리자 대시보드, 사용자 관리, 역할 관리)
  - [x] 권한별 자동 필터링
  - [x] 접을 수 있는(collapsible) 메뉴 UI
  - [x] 하위 메뉴 활성화 시 부모 메뉴 하이라이트
- [x] 사이드바 독립 스크롤
  - [x] body 스크롤과 분리된 내부 스크롤 구현
  - [x] 로고와 하단 정보는 고정, 메뉴만 스크롤

## 다음 작업 (Phase 7)

### 코드 품질 개선
- [ ] Biome Linter 규칙 개선
  - [ ] 접근성 규칙 재활성화 및 위반 사항 수정
    - [ ] useSemanticElements: 시맨틱 HTML 요소 사용
    - [ ] useAriaPropsSupportedByRole: 올바른 ARIA 속성 사용
    - [ ] noRedundantRoles: 중복 role 속성 제거
    - [ ] useButtonType: button 타입 명시
    - [ ] noAriaHiddenOnFocusable: 포커스 가능한 요소에 aria-hidden 제거
    - [ ] noStaticElementInteractions: 정적 요소 인터랙션 개선
    - [ ] useKeyWithClickEvents: 클릭 이벤트에 키보드 이벤트 추가
    - [ ] noSvgWithoutTitle: SVG에 title 추가
  - [ ] 기타 규칙 개선
    - [ ] noUselessFragments: 불필요한 Fragment 제거
    - [ ] noArrayIndexKey: 배열 인덱스를 key로 사용하지 않기
    - [ ] noUnusedVariables: 사용하지 않는 변수 제거
  - [ ] TypeScript 타입 개선
    - [ ] any 타입 제거 및 명시적 타입 정의
    - [ ] src/services/api.ts의 any 타입들을 적절한 타입으로 변경

### 프로덕션 준비 및 배포
- [ ] 단위 테스트 작성
  - [ ] 컴포넌트 테스트
  - [ ] 훅 테스트
  - [ ] API 서비스 테스트
- [ ] E2E 테스트 구현
  - [ ] Playwright 또는 Cypress 설정
  - [ ] 주요 사용자 플로우 테스트
- [ ] 배포 설정 (Vercel/Netlify)
  - [ ] CI/CD 파이프라인
  - [ ] 자동 배포
  - [ ] 성능 모니터링


## 현재 상태 (2025-11-11)

✅ **완료된 기능:**
- 사용자 인증 시스템 (회원가입, 로그인, 로그아웃, 비밀번호 관리)
- 업무 보고 CRUD (작성, 조회, 수정, 삭제)
- 대시보드 (통계, 차트, 최근 업무)
- 프로젝트/서비스/청구그룹/공휴일 관리
- 사용자 관리 (승인, 역할 할당, 프로필)
- 역할 및 권한 관리 (RBAC)
- 권한 기반 접근 제어
- 코드 스플리팅 및 성능 최적화
- 반응형 디자인 (기본)
- **웹 접근성 (WCAG 2.1 AA 준수)**
  - ARIA 라벨 및 역할
  - 키보드 네비게이션 및 단축키
  - 포커스 관리 및 가시성
  - 스크린 리더 지원

📊 **프로젝트 통계:**
- 총 페이지: 20개 이상
- 총 API 엔드포인트: 50개 이상
- 빌드 크기: 메인 327 kB (gzip: 80 kB)
- 총 vendor 청크: 352 kB (gzip: 102 kB)

🚀 **개발 서버:** http://localhost:5173
🧪 **테스트 페이지:** http://localhost:5173/test

## 참고 링크

- 작업 계획: `.doc/work-plan.md`
- 기술 명세: `.doc/technical-specification.md`
- ERD: `.doc/database-erd.md`
- API 명세: `.doc/api-specification.md`
- 권한 설계: `.doc/security-design.md`
- Git 컨벤션: `.doc/git-convention.md`
- JSDoc 가이드: `.doc/jsdoc-guide.md`

## 기술 스택

**Frontend:**
- React 19 (CSR)
- TypeScript
- Vite 7
- React Router DOM v7
- TailwindCSS v4

**상태 관리:**
- Jotai (클라이언트 상태)
- TanStack Query (서버 상태)

**폼 & 검증:**
- React Hook Form
- Zod

**Backend:**
- Supabase (BaaS)
- PostgreSQL
- Supabase Auth
- Row Level Security (RLS)

**개발 도구:**
- Biome (린팅)
- pnpm (패키지 관리)
