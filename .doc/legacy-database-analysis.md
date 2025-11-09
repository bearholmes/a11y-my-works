# Legacy 데이터베이스 분석 문서

## 개요

기존 `.tmp/database` 폴더의 Sequelize 기반 데이터베이스 구조를 분석하여 Supabase로 마이그레이션하기 위한 정보를 정리했습니다.

## 분석된 파일들

### 1. 마이그레이션 파일
- `migrations/20230219024830-create.cjs` - 기본 테이블 생성
- `migrations/20240327000000-create-reports.cjs` - 리포트 테이블
- `migrations/20240327000001-add-report-enhancements.cjs` - 리포트 개선사항
- `migrations/20240327000002-add-report-md-mm-stats.cjs` - 리포트 통계

### 2. 시드 데이터
- `seeders/20230226000859-init.cjs` - 초기 데이터

### 3. 모델 파일들
- `models/` 디렉토리의 Sequelize 모델들

## 핵심 데이터 구조

### 코드 관리 (CODE_TBL)

#### 플랫폼 (PLATFORM)
- PC-Web
- M-Web 
- iOS-App
- AOS-App
- Win-App

#### 업무 유형 (WORK_TYPE)
- QA
- 모니터링
- 컨설팅
- 교육

#### 카테고리 (CATEGORY)
- 프로젝트
- 데이터 버퍼
- 일반 버퍼
- 기타 버퍼
- 매니징 버퍼 (관리자 전용)
- 휴가

### 역할 관리 (ROLE_TBL)
- 관리자 (전체 시스템 관리)
- 매니저 (팀 관리 및 승인)
- 직원 (업무 보고 작성)

### 권한 시스템 (PERMISSION_TBL)
- 읽기/쓰기 권한으로 구분
- 역할별 세부 권한 설정

### 공휴일 관리 (HOLIDAY_TBL)
- 2023~2024년 한국 공휴일 데이터
- 대체 휴무일 포함
- 선거일 등 임시공휴일 포함

### 기본 관리자 계정
- accountId: 'super.admin'
- name: '관리자'
- 해시된 패스워드로 저장

## Supabase 마이그레이션 시 고려사항

### 1. 테이블 구조 변경
- Sequelize BIGINT → PostgreSQL SERIAL
- 테이블명 변경: `TBL` 접미사 제거
- 컬럼명 snake_case 변환

### 2. 인증 시스템 변경
- 기존: 자체 인증 (pwd, hash 컬럼)
- 신규: Supabase Auth 연동 (auth_id UUID)

### 3. RLS (Row Level Security) 적용
- 사용자별 데이터 접근 제어
- 역할 기반 권한 관리

### 4. 데이터 타입 매핑
```sql
-- Sequelize → PostgreSQL
BIGINT → SERIAL
STRING(255) → VARCHAR(255)
DATEONLY → DATE
BOOLEAN → BOOLEAN
TEXT → TEXT
```

### 5. 외래키 제약조건
- 기존: Sequelize associations
- 신규: PostgreSQL REFERENCES

## 마이그레이션 전략

### Phase 1: 스키마 생성
- ✅ 테이블 구조 정의
- ✅ 기본 데이터 삽입
- ✅ RLS 정책 설정

### Phase 2: 데이터 마이그레이션
- [ ] 기존 데이터 추출
- [ ] 데이터 변환 스크립트
- [ ] Supabase 데이터 삽입

### Phase 3: 애플리케이션 연동
- [ ] Supabase 클라이언트 설정
- [ ] API 호출 구현
- [ ] 인증 플로우 구현

## 변경된 명명 규칙

### 테이블명
```
HOLIDAY_TBL → holidays
ROLE_TBL → roles  
PERMISSION_TBL → permissions
CODE_TBL → codes
MEMBER_TBL → members
TASK_TBL → tasks
PROJECT_TBL → projects
```

### 컬럼명
```
holidayId → holiday_id
createdAt → created_at
updatedAt → updated_at
isActive → is_active
costGroupId → cost_group_id
```

## 주요 차이점

### 기존 시스템
- Node.js + Sequelize + MySQL
- 자체 인증 시스템
- 테이블명 TBL 접미사
- camelCase 컬럼명

### 신규 시스템 
- React + Supabase + PostgreSQL
- Supabase Auth 연동
- 간결한 테이블명
- snake_case 컬럼명
- RLS 보안 정책

이 분석을 바탕으로 Supabase 스키마를 실제 업무에 맞게 조정했습니다.