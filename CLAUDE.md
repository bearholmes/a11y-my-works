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
- **Styling**: Tailwind CSS + TailwindPlus
- **Build Tool**: Vite
- **Code Quality**: Biome (linting)
- **Form Management**: React Hook Form with zod validation
- **Date Handling**: date-fns
- **Database**: Supabase
- **Authentication**: Supabase Client SDK Auth module

## Project Requirements

- Node.js v20+
- pnpm v8+

## Development Setup

프로젝트는 현재 초기 설정 단계입니다. package.json, vite.config 등의 설정 파일이 아직 생성되지 않았습니다.

### 예상 개발 명령어 (설정 완료 후)
```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 린팅
pnpm lint

# 타입 체크
pnpm typecheck
```

### 현재 완료된 작업
- 프로젝트 문서화 (.doc 디렉토리)
- Git 커밋 및 PR 컨벤션 정의
- 데이터베이스 ERD 설계
- JSDoc 가이드라인 작성

### 다음 필요 작업
- React 프로젝트 초기화 (Vite)
- 패키지 의존성 설정
- Tailwind CSS 설정
- Supabase 클라이언트 설정
- 개발 환경 구축

## Database Architecture

The system uses Supabase with the following key entities:
- **Members**: User management with role-based permissions
- **Tasks**: Work reporting with time tracking, project/service associations
- **Projects**: Project management with platform and version tracking
- **Services**: Service categorization linked to cost groups
- **Cost Groups**: Billing/cost organization
- **Roles & Permissions**: RBAC system for access control

Key relationships:
- Members have Roles with specific Permissions
- Tasks belong to Members and are linked to Projects/Services
- Projects are part of Services, which belong to Cost Groups

## Code Conventions

### Git Commit Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/) format:
```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`

Scopes: `be`, `fe`, `db`, `auth`, `ui`, `api`, `config`, `docs`

### JSDoc Documentation
All functions, classes, and modules should include JSDoc comments with:
- Function/class purpose and description
- Parameter types and descriptions
- Return types and descriptions  
- Usage examples for complex APIs
- `@throws` for error conditions

### Branch Naming
```
<type>/<scope>/<short-description>
```
Examples: `feat/auth/social-login`, `fix/be/memory-leak`

## Environment Configuration

Supabase configuration should be stored in `.env` file (local only, not committed to repository).

## Documentation

Key documentation files in `.doc/` directory:
- `technical-specification.md`: System architecture and database design
- `database-erd.md`: Database structure and relationships
- `git-convention.md`: Git workflow and commit guidelines  
- `jsdoc-guide.md`: Code documentation standards
- `erd.vuerd.json`: Visual database schema (use ERD Editor to view)
