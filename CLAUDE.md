# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 정책
답변은 한글을 우선시 한다.
라이브러리는 호환성 이슈가 없다면 최대한 최신버전을 유지한다.

## Project Overview

This is a work reporting system (업무 보고 시스템) built as a serverless (backendless) application with a modern React stack. The system allows users to track and report their work tasks, manage projects, and handle authentication through Supabase.

## Tech Stack

- **Frontend**: React 19 (CSR) with TypeScript
- **State Management**: Jotai
- **API Communication**: TanStack Query + ofetch
- **Styling**: Tailwind CSS v4 + @tailwindcss/vite
- **Build Tool**: Vite 7
- **Code Quality**: Biome (linting)
- **Form Management**: React Hook Form with zod validation
- **Date Handling**: date-fns
- **Routing**: React Router DOM v7
- **Database**: Supabase
- **Authentication**: Supabase Client SDK Auth module

## Project Requirements

- Node.js v20+
- pnpm v8+

## Development Commands

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (http://localhost:5173)
pnpm dev

# 프로덕션 빌드
pnpm build

# 빌드 결과 미리보기
pnpm preview

# 린팅 검사
pnpm lint

# 린팅 자동 수정
pnpm lint:fix
```

## Environment Setup

환경 변수는 `.env` 파일에 저장하며, `.env.example`을 복사하여 사용:

```bash
cp .env.example .env
```

필수 환경 변수:
- `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

## Architecture Overview

### 프로젝트 구조
```
src/
├── components/      # React 컴포넌트
│   ├── AppRouter.tsx      # 라우팅 설정
│   ├── AuthWrapper.tsx    # 인증 래퍼
│   ├── Layout.tsx         # 레이아웃 컴포넌트
│   └── LoginForm.tsx      # 로그인 폼
├── pages/          # 페이지 컴포넌트
│   ├── Dashboard.tsx      # 대시보드
│   ├── TaskList.tsx       # 업무 목록
│   └── TaskForm.tsx       # 업무 작성/수정 폼
├── hooks/          # 커스텀 훅
│   └── useAuth.ts        # 인증 관련 훅
├── stores/         # Jotai 상태 관리
│   └── authStore.ts      # 인증 상태
├── services/       # API 통신
│   └── api.ts            # Supabase API 래퍼
├── lib/            # 라이브러리 설정
│   └── supabase.ts       # Supabase 클라이언트
├── types/          # TypeScript 타입 정의
│   └── database.ts       # 데이터베이스 타입
└── App.tsx         # 앱 엔트리포인트
```

### 상태 관리 전략
- **서버 상태**: TanStack Query로 관리 (API 데이터, 캐싱)
- **전역 클라이언트 상태**: Jotai로 관리 (인증 정보, UI 상태)
- **지역 상태**: React useState
- **폼 상태**: React Hook Form
- **URL 상태**: React Router useSearchParams

### 인증 플로우
1. Supabase Auth 모듈 사용 (`src/lib/supabase.ts`)
2. 인증 상태는 Jotai atom으로 전역 관리 (`src/stores/authStore.ts`)
3. `AuthWrapper` 컴포넌트가 보호된 라우트 처리
4. `useAuth` 훅으로 인증 로직 캡슐화
5. 세션 자동 갱신 및 지속성 설정됨

### API 통신 패턴
- `src/services/api.ts`에서 Supabase 클라이언트 사용
- TanStack Query로 데이터 페칭, 캐싱, 재시도 처리
- 에러 처리는 `.doc/error-handling-strategy.md` 문서 참조
- 낙관적 업데이트 적용 권장

## Database Architecture

Supabase PostgreSQL 데이터베이스 사용. 주요 테이블:
- **MEMBER_TBL**: 사용자 정보, 역할 기반 권한
- **TASK_TBL**: 업무 보고, 시간 추적, 프로젝트/서비스 연결
- **PROJECT_TBL**: 프로젝트 정보, 플랫폼, 버전 관리
- **SERVICE_TBL**: 서비스 분류, 청구 그룹 연결
- **COST_GRP_TBL**: 청구 그룹 관리
- **ROLE_TBL / PERMISSION_TBL**: RBAC 시스템
- **HOLIDAY_TBL**: 공휴일 정보
- **CODE_TBL**: 공통 코드 관리

타입 정의: `src/types/database.ts`에서 Supabase 타입 확인
전체 ERD: `.doc/database-erd.md` 참조

## Code Conventions

### Git Commit Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
<type>(<scope>): <description>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`

**Scopes**: `be`, `fe`, `db`, `auth`, `ui`, `api`, `config`, `docs`

**Examples**:
- `feat(fe): 업무 목록 페이지 구현`
- `fix(auth): 세션 만료 처리 수정`
- `refactor(api): Supabase 클라이언트 에러 핸들링 개선`

### Branch Naming
```
<type>/<scope>/<short-description>
```
Examples: `feat/auth/social-login`, `fix/fe/task-form-validation`

### JSDoc Documentation
모든 함수, 클래스, 모듈에 JSDoc 주석 작성:
- 함수/클래스 목적 및 설명
- 파라미터 타입 및 설명
- 반환 타입 및 설명
- 복잡한 API는 사용 예시 포함
- `@throws` 태그로 에러 조건 명시

상세 가이드: `.doc/jsdoc-guide.md` 참조

### TypeScript
- 타입 추론 최대한 활용, 불필요한 명시적 타입 지양
- `any` 타입 사용 금지, `unknown` 사용
- Supabase 타입은 `src/types/database.ts`에서 import

### React Patterns
- 함수형 컴포넌트만 사용
- 커스텀 훅으로 로직 재사용
- Props는 interface로 정의
- 컴포넌트는 단일 책임 원칙 준수

## Important Design Patterns

### TanStack Query 사용 패턴
```typescript
// 커스텀 훅 패턴 사용
export function useTasks(query: TaskQuery) {
  return useQuery({
    queryKey: ['tasks', query],
    queryFn: () => taskAPI.getTasks(query),
    onError: handleError,
  });
}

// Mutation 사용 시 낙관적 업데이트 적용
export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskAPI.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
```

### Jotai Atom 패턴
```typescript
// Atom 정의는 stores/ 디렉토리에
export const userAtom = atom<User | null>(null);

// 파생 atom으로 계산된 값
export const isAuthenticatedAtom = atom((get) => {
  const user = get(userAtom);
  return user !== null;
});
```

### 에러 처리
- 모든 API 호출에 에러 핸들링 필수
- `AppError` 클래스 사용 (`.doc/error-handling-strategy.md` 참조)
- 사용자 친화적 에러 메시지 제공
- 재시도 가능한 에러는 자동 재시도 로직 적용

## Key Documentation

`.doc/` 디렉토리의 주요 문서:

**핵심 설계 문서**:
- `technical-specification.md`: 시스템 아키텍처 및 데이터베이스 설계
- `state-management-design.md`: 상태 관리 전략 (TanStack Query + Jotai)
- `error-handling-strategy.md`: 통합 에러 처리 전략
- `domain-model.md`: 도메인 모델 설계

**API 명세**:
- `api-specification.md`: API 엔드포인트 전체 목록
- `api-specification-*.md`: 모듈별 상세 API 명세

**기타**:
- `database-erd.md`: 데이터베이스 구조 및 관계
- `git-convention.md`: Git 워크플로우 및 커밋 가이드
- `jsdoc-guide.md`: 코드 문서화 표준
- `security-design.md`: 보안 설계
- `test-strategy.md`: 테스트 전략
