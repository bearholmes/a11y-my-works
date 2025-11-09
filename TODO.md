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

- [x] 프로젝트 문서화
- [x] 기술 스택 검토
- [x] 작업 계획 수립
- [x] Git 컨벤션 정의

## 참고 링크

- 작업 계획: `.doc/work-plan.md`
- 기술 명세: `.doc/technical-specification.md`
- ERD: `.doc/database-erd.md`
