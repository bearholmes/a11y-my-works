# 데이터베이스 ERD 문서

이 문서는 업무 보고 시스템의 데이터베이스 구조를 설명합니다.

## ERD 다이어그램

현재 ERD는 `docs/erd.vuerd.json` 파일에 JSON 형식으로 저장되어 있습니다. 이 파일은 [ERD Editor](https://github.com/vuerd/vuerd) 도구를 사용하여 시각화하고 편집할 수 있습니다.

## 주요 테이블 및 관계

### 사용자 관련 테이블

1. **Members** - 사용자 정보
   - `memberId`: 사용자 고유 식별자 (PK)
   - `accountId`: 로그인 계정
   - `name`: 사용자 이름
   - `email`: 이메일
   - `mobile`: 휴대폰 번호
   - `pwd`: 암호화된 비밀번호
   - `hash`: 비밀번호 해시 솔트
   - `roleId`: 역할 ID (FK)
   - `isActive`: 활성 상태

2. **Roles** - 역할 정보
   - `roleId`: 역할 고유 식별자 (PK)
   - `name`: 역할 이름
   - `description`: 역할 설명
   - `isActive`: 활성 상태

3. **RolePermissions** - 역할-권한 매핑
   - `roleId`: 역할 ID (FK)
   - `permissionId`: 권한 ID (FK)
   - `read`: 읽기 권한
   - `write`: 쓰기 권한

4. **Permissions** - 권한 정보
   - `permissionId`: 권한 고유 식별자 (PK)
   - `key`: 권한 키
   - `name`: 권한 이름

### 업무 보고 관련 테이블

5. **Tasks** - 업무 보고
   - `taskId`: 업무 고유 식별자 (PK)
   - `memberId`: 작성자 ID (FK)
   - `taskDate`: 업무 날짜
   - `taskType`: 업무 유형
   - `taskName`: 업무 이름
   - `taskDetail`: 업무 세부 내용
   - `taskUrl`: 관련 URL
   - `workTime`: 작업 시간(분)
   - `costGroupId`: 청구 그룹 ID (FK)
   - `serviceId`: 서비스 ID (FK)
   - `projectId`: 프로젝트 ID (FK)
   - `platformId`: 플랫폼 ID (FK)
   - `startTime`: 시작 시간
   - `endTime`: 종료 시간

### 프로젝트 관련 테이블

6. **Projects** - 프로젝트
   - `projectId`: 프로젝트 고유 식별자 (PK)
   - `name`: 프로젝트명
   - `serviceId`: 서비스 ID (FK)
   - `platformId`: 플랫폼 ID (FK)
   - `version`: 버전
   - `taskType`: 업무 타입
   - `memo`: 메모
   - `isActive`: 활성 상태

7. **ProjectUrls** - 프로젝트 URL
   - `urlId`: URL 고유 식별자 (PK)
   - `projectId`: 프로젝트 ID (FK)
   - `url`: URL 주소
   - `description`: URL 설명

8. **Services** - 서비스
   - `serviceId`: 서비스 고유 식별자 (PK)
   - `name`: 서비스명
   - `costGroupId`: 청구 그룹 ID (FK)
   - `isActive`: 활성 상태

9. **CostGroups** - 청구 그룹
   - `costGroupId`: 청구 그룹 고유 식별자 (PK)
   - `name`: 청구 그룹명
   - `isActive`: 활성 상태

### 코드 관련 테이블

10. **CodeGroups** - 코드 그룹
    - `codeGroupId`: 코드 그룹 고유 식별자 (PK)
    - `name`: 코드 그룹명
    - `description`: 코드 그룹 설명
    - `isActive`: 활성 상태

11. **Codes** - 코드 항목
    - `codeId`: 코드 고유 식별자 (PK)
    - `codeGroupId`: 코드 그룹 ID (FK)
    - `name`: 코드명
    - `key`: 코드 키
    - `value`: 코드 값
    - `sort`: 정렬 순서
    - `isActive`: 활성 상태

### 기타 테이블

12. **Holidays** - 공휴일
    - `holidayId`: 공휴일 고유 식별자 (PK)
    - `holidayDate`: 공휴일 날짜
    - `name`: 공휴일명
    - `description`: 설명

13. **Logs** - 시스템 로그
    - `logId`: 로그 고유 식별자 (PK)
    - `memberId`: 사용자 ID (FK)
    - `type`: 로그 유형
    - `comment`: 로그 내용
    - `status`: 상태
    - `createdAt`: 생성일

## 테이블 간 주요 관계

1. Members ↔ Roles: 1:N (한 역할은 여러 사용자에게 할당 가능)
2. Roles ↔ Permissions: N:M (RolePermissions 테이블을 통해 관계 설정)
3. Tasks ↔ Members: N:1 (한 사용자는 여러 업무 보고 작성 가능)
4. Tasks ↔ Projects: N:1 (한 프로젝트에 여러 업무 보고 연결 가능)
5. Tasks ↔ Services: N:1 (한 서비스에 여러 업무 보고 연결 가능)
6. Tasks ↔ CostGroups: N:1 (한 청구 그룹에 여러 업무 보고 연결 가능)
7. Projects ↔ Services: N:1 (한 서비스에 여러 프로젝트 연결 가능)
8. Services ↔ CostGroups: N:1 (한 청구 그룹에 여러 서비스 연결 가능)
9. Projects ↔ ProjectUrls: 1:N (한 프로젝트에 여러 URL 연결 가능)
10. CodeGroups ↔ Codes: 1:N (한 코드 그룹에 여러 코드 항목 연결 가능)
