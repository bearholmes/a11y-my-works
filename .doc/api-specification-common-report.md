# 공통 기능 및 리포트 API 명세서

## 개요

이 문서는 업무 보고 시스템의 공통 기능 및 리포트 관련 API를 설명합니다. 모든 API는 기본 URL `/api/v3`에서 시작합니다.

## 공통 API

### 1. 로그인 사용자 정보 조회

- **URL**: `/common/member`
- **Method**: `GET`
- **Description**: 현재 로그인한 사용자의 정보를 조회합니다.
- **권한**: 인증 필요
- **Response (200)**:
  ```json
  {
    "memberId": "회원ID",
    "accountId": "계정ID",
    "name": "이름",
    "email": "이메일",
    "roleId": "역할ID",
    "roleName": "역할명",
    "permissions": [
      {
        "key": "PERM_01",
        "name": "대시보드",
        "read": true,
        "write": true
      }
    ]
  }
  ```

### 2. 청구그룹 필터 조회

- **URL**: `/common/cost-grp`
- **Method**: `GET`
- **Description**: 청구그룹 필터 목록을 조회합니다.
- **권한**: 인증 필요
- **Response (200)**:
  ```json
  [
    {
      "costGrpId": "청구그룹ID",
      "name": "청구그룹명"
    }
  ]
  ```

### 3. 서비스 필터 조회

- **URL**: `/common/service`
- **Method**: `GET`
- **Description**: 서비스 필터 목록을 조회합니다.
- **권한**: 인증 필요
- **Query Parameters**:
  - `costGrpId`: 청구그룹 ID
- **Response (200)**:
  ```json
  [
    {
      "serviceId": "서비스ID",
      "name": "서비스명",
      "costGrpId": "청구그룹ID",
      "costGrpName": "청구그룹명"
    }
  ]
  ```

### 4. 카테고리 필터 조회

- **URL**: `/common/filter/category`
- **Method**: `GET`
- **Description**: 카테고리 필터 목록을 조회합니다.
- **권한**: 인증 필요
- **Response (200)**:
  ```json
  [
    {
      "key": "카테고리키",
      "name": "카테고리명"
    }
  ]
  ```

### 5. 플랫폼 필터 조회

- **URL**: `/common/filter/platform`
- **Method**: `GET`
- **Description**: 플랫폼 필터 목록을 조회합니다.
- **권한**: 인증 필요
- **Response (200)**:
  ```json
  [
    {
      "key": "플랫폼키",
      "name": "플랫폼명"
    }
  ]
  ```

### 6. 업무타입 필터 조회

- **URL**: `/common/filter/work-type`
- **Method**: `GET`
- **Description**: 업무타입 필터 목록을 조회합니다.
- **권한**: 인증 필요
- **Response (200)**:
  ```json
  [
    {
      "key": "업무타입키",
      "name": "업무타입명"
    }
  ]
  ```

### 7. 유저 검색 필터

- **URL**: `/common/filter/member`
- **Method**: `GET`
- **Description**: 유저 검색 필터 목록을 조회합니다.
- **권한**: 인증 필요
- **Query Parameters**:
  - `search`: 검색어 (이름, 계정ID)
- **Response (200)**:
  ```json
  [
    {
      "memberId": "회원ID",
      "accountId": "계정ID",
      "name": "이름"
    }
  ]
  ```

### 8. 대시보드 정보 조회

- **URL**: `/common/dashboard`
- **Method**: `GET`
- **Description**: 대시보드 정보를 조회합니다.
- **권한**: PERM_01(대시보드) 읽기 권한
- **Query Parameters**:
  - `period`: 기간 (today, week, month, year)
- **Response (200)**:
  ```json
  {
    "summary": {
      "totalTasks": 150,
      "totalWorkTime": 9000,
      "avgWorkTimePerDay": 480
    },
    "byProject": [
      {
        "projectId": "프로젝트ID",
        "name": "프로젝트명",
        "totalTasks": 25,
        "totalWorkTime": 1500,
        "percentage": 16.7
      }
    ],
    "byCategory": [
      {
        "category": "개발",
        "totalTasks": 80,
        "totalWorkTime": 4800,
        "percentage": 53.3
      }
    ],
    "recentTasks": [
      {
        "taskId": "업무ID",
        "date": "2025-03-27",
        "taskName": "업무명",
        "projectName": "프로젝트명",
        "workMinute": 120
      }
    ]
  }
  ```

## 리포트 API

### 1. 청구별/업무타입별 리포트 생성

- **URL**: `/report/service`
- **Method**: `POST`
- **Description**: 청구별/업무타입별 리포트를 생성합니다.
- **권한**: PERM_02(업무보고) 읽기 권한
- **Request Body**:
  ```json
  {
    "startDate": "2025-01-01",
    "endDate": "2025-03-31",
    "costGrpIds": ["청구그룹ID1", "청구그룹ID2"],
    "serviceIds": ["서비스ID1", "서비스ID2"],
    "projectIds": ["프로젝트ID1", "프로젝트ID2"],
    "memberIds": ["회원ID1", "회원ID2"],
    "workTypes": ["개발", "기획"],
    "groupBy": "service", // service, project, member, workType 중 선택
    "format": "json" // json, excel, pdf 중 선택
  }
  ```
- **Response (200, JSON 형식)**:
  ```json
  {
    "period": "2025-01-01 ~ 2025-03-31",
    "summary": {
      "totalWorkTime": 15000,
      "totalWorkCount": 250
    },
    "details": [
      {
        "groupKey": "서비스ID1",
        "groupName": "서비스1",
        "totalWorkTime": 8000,
        "totalWorkCount": 150,
        "percentage": 53.3,
        "byWorkType": [
          {
            "workType": "개발",
            "workTime": 6000,
            "workCount": 120
          },
          {
            "workType": "기획",
            "workTime": 2000,
            "workCount": 30
          }
        ]
      },
      {
        "groupKey": "서비스ID2",
        "groupName": "서비스2",
        "totalWorkTime": 7000,
        "totalWorkCount": 100,
        "percentage": 46.7,
        "byWorkType": [
          {
            "workType": "개발",
            "workTime": 5000,
            "workCount": 80
          },
          {
            "workType": "기획",
            "workTime": 2000,
            "workCount": 20
          }
        ]
      }
    ]
  }
  ```

### 2. 업무 보고 목록 엑셀 다운로드

- **URL**: `/task/xls/download`
- **Method**: `GET`
- **Description**: 업무 보고 목록을 엑셀 파일로 다운로드합니다.
- **권한**: PERM_02(업무보고) 읽기 권한
- **Query Parameters**:
  - `startDate`: 시작 날짜 (YYYY-MM-DD)
  - `endDate`: 종료 날짜 (YYYY-MM-DD)
  - `projectId`: 프로젝트 ID
  - `serviceId`: 서비스 ID
  - `costGrpId`: 청구그룹 ID
  - `memberId`: 멤버 ID
- **Response**: 엑셀 파일 (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

## 로그 API

### 1. 로그 목록 조회

- **URL**: `/log`
- **Method**: `GET`
- **Description**: 시스템 로그 목록을 조회합니다.
- **권한**: PERM_10(사용자 로그) 읽기 권한
- **Query Parameters**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 10)
  - `startDate`: 시작 날짜 (YYYY-MM-DD)
  - `endDate`: 종료 날짜 (YYYY-MM-DD)
  - `memberId`: 멤버 ID
  - `type`: 로그 유형
  - `search`: 검색어
- **Response (200)**:
  ```json
  {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 50,
      "totalPages": 5
    },
    "data": [
      {
        "logId": "로그ID",
        "memberId": "회원ID",
        "accountId": "계정ID",
        "name": "이름",
        "type": "로그유형",
        "comment": "로그내용",
        "status": "상태",
        "createdAt": "2025-03-27T00:00:00.000Z"
      }
    ]
  }
  ```