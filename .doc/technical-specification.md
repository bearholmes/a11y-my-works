# 업무 보고 시스템 기술 명세

## 1. 시스템 아키텍처

### 1.1 전체 아키텍처
업무 보고 시스템은 프론트엔드와 백엔드가 분리된 클라이언트-서버 아키텍처로 구성됩니다.

```
[클라이언트] <---> [데이터베이스]
```

### 1.2 프론트엔드 아키텍처
- **프레임워크**: React 19 (CSR)
- **상태 관리**: Jotai
- **API 통신**: TanStack Query + ofetch

  
### 1.3 백엔드 아키텍처
- 데이터 베이스 : Supabase
- 인증 : Supabase 클라이언트 SDK Auth 모듈

## 2. 데이터베이스 설계

### 2.1 ER 다이어그램
시스템의 주요 엔티티와 관계는 다음과 같습니다:

- MEMBER_TBL: 사용자 정보 관리
- TASK_TBL: 업무보고 정보 관리
- PROJECT_TBL: 프로젝트 정보 관리
- SERVICE_TBL: 서비스 정보 관리
- COST_GRP_TBL: 청구그룹 정보 관리
- CODE_TBL: 공통코드 관리
- LOG_TBL: 시스템 로그 관리
- ROLE_TBL: 역할 정보 관리
- PERMISSION_TBL: 권한 정보 관리
- HOLIDAY_TBL: 공휴일 정보 관리
- PROJECT_URL_TBL: 프로젝트 URL 관리

### 2.2 주요 테이블 구조

#### 2.2.1 MEMBER_TBL (유저 정보)
- memberId: 유저 KEY (PK)
- accountId: 유저 ID
- name: 유저 이름
- pwd: 비밀번호 (암호화)
- isActive: 활성 유무
- roleId: 역할 KEY (FK)
- deptPath: 부서 정보
- createdAt: 생성일시
- updatedAt: 갱신일시

#### 2.2.2 TASK_TBL (업무 보고)
- taskId: 업무보고 KEY (PK)
- userId: 등록자 KEY (FK)
- date: 업무보고일
- accountId: 등록자 ID
- categoryName: 업무유형
- name: 업무 테스크명
- comment: 업무 세부내용
- url: 업무 링크
- workMinute: 업무시간(분)
- costGrpName: 청구대상
- serviceName: 서비스명
- projectName: 프로젝트명
- platformName: 플랫폼
- viewName: 뷰 이름
- version: 버전
- startTime: 업무시작시간
- endTime: 업무종료시간
- createdAt: 생성일시
- updatedAt: 갱신일시

#### 2.2.3 PROJECT_TBL (프로젝트)
- projectId: 프로젝트 KEY (PK)
- serviceId: 서비스 KEY (FK)
- name: 프로젝트명
- platformName: 플랫폼
- version: 버전
- type: 업무타입
- comment: 메모
- isActive: 활성유무
- createdAt: 생성일시
- updatedAt: 갱신일시

#### 2.2.4 SERVICE_TBL (서비스)
- serviceId: 서비스 KEY (PK)
- costGrpId: 청구그룹 KEY (FK)
- name: 서비스명
- comment: 메모
- createdAt: 생성일시
- updatedAt: 갱신일시

#### 2.2.5 COST_GRP_TBL (청구그룹)
- costGrpId: 청구그룹 KEY (PK)
- name: 청구그룹명
- comment: 메모
- createdAt: 생성일시
- updatedAt: 갱신일시
