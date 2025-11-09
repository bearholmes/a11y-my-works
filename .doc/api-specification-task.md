# 업무 보고 API 명세서

## 개요

이 문서는 업무 보고 시스템의 업무 보고 관련 API를 설명합니다. 모든 API는 기본 URL `/api/v3`에서 시작합니다.

## 업무 보고 API

### 1. 업무 보고 목록 조회

- **URL**: `/task`
- **Method**: `GET`
- **Description**: 업무 보고 목록을 조회합니다.
- **권한**: PERM_02(업무보고) 읽기 권한
- **Query Parameters**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 10)
  - `startDate`: 시작 날짜 (YYYY-MM-DD)
  - `endDate`: 종료 날짜 (YYYY-MM-DD)
  - `projectId`: 프로젝트 ID
  - `serviceId`: 서비스 ID
  - `costGrpId`: 청구그룹 ID
  - `memberId`: 멤버 ID
  - `search`: 검색어
- **Response (200)**:
  ```json
  {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 100,
      "totalPages": 10
    },
    "data": [
      {
        "taskId": "업무ID",
        "memberId": "회원ID",
        "accountId": "계정ID",
        "name": "이름",
        "date": "2025-03-27",
        "categoryName": "업무유형",
        "taskName": "업무명",
        "comment": "업무 내용",
        "url": "업무 URL",
        "workMinute": 120,
        "costGrpName": "청구그룹명",
        "serviceName": "서비스명",
        "projectName": "프로젝트명",
        "platformName": "플랫폼명",
        "viewName": "뷰 이름",
        "version": "버전",
        "startTime": "09:00",
        "endTime": "11:00",
        "createdAt": "2025-03-27T00:00:00.000Z",
        "updatedAt": "2025-03-27T00:00:00.000Z"
      }
    ]
  }
  ```
- **Response (403)**:
  ```json
  {
    "statusCode": 403,
    "error": "Forbidden",
    "message": "이 기능에 접근할 권한이 없습니다."
  }
  ```

### 2. 업무 보고 등록

- **URL**: `/task`
- **Method**: `POST`
- **Description**: 새로운 업무 보고를 등록합니다.
- **권한**: PERM_02(업무보고) 쓰기 권한
- **Request Body**:
  ```json
  {
    "date": "2025-03-27",
    "categoryName": "업무유형",
    "taskName": "업무명",
    "comment": "업무 세부내용",
    "url": "https://example.com",
    "workMinute": 120,
    "costGrpId": "청구그룹ID",
    "serviceId": "서비스ID",
    "projectId": "프로젝트ID",
    "platformName": "플랫폼명",
    "viewName": "뷰 이름",
    "version": "1.0",
    "startTime": "09:00",
    "endTime": "11:00"
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "업무 보고가 등록되었습니다.",
    "taskId": "생성된_업무ID"
  }
  ```
- **Response (400)**:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "필수 항목이 누락되었습니다."
  }
  ```

### 3. 업무 보고 상세 조회

- **URL**: `/task/:taskId`
- **Method**: `GET`
- **Description**: 특정 업무 보고의 상세 정보를 조회합니다.
- **권한**: PERM_02(업무보고) 읽기 권한
- **Path Parameters**:
  - `taskId`: 업무 보고 ID
- **Response (200)**:
  ```json
  {
    "taskId": "업무ID",
    "memberId": "회원ID",
    "accountId": "계정ID",
    "name": "이름",
    "date": "2025-03-27",
    "categoryName": "업무유형",
    "taskName": "업무명",
    "comment": "업무 내용",
    "url": "업무 URL",
    "workMinute": 120,
    "costGrpName": "청구그룹명",
    "serviceName": "서비스명",
    "projectName": "프로젝트명",
    "platformName": "플랫폼명",
    "viewName": "뷰 이름",
    "version": "버전",
    "startTime": "09:00",
    "endTime": "11:00",
    "createdAt": "2025-03-27T00:00:00.000Z",
    "updatedAt": "2025-03-27T00:00:00.000Z"
  }
  ```
- **Response (404)**:
  ```json
  {
    "statusCode": 404,
    "error": "Not Found",
    "message": "해당 업무 보고를 찾을 수 없습니다."
  }
  ```

### 4. 업무 보고 수정

- **URL**: `/task/:taskId`
- **Method**: `PUT`
- **Description**: 특정 업무 보고를 수정합니다. 본인이 작성한 보고 또는 관리자 권한이 필요합니다.
- **권한**: PERM_02(업무보고) 쓰기 권한
- **Path Parameters**:
  - `taskId`: 업무 보고 ID
- **Request Body**:
  ```json
  {
    "date": "2025-03-27",
    "categoryName": "업무유형",
    "taskName": "업무명",
    "comment": "업무 세부내용",
    "url": "https://example.com",
    "workMinute": 120,
    "costGrpId": "청구그룹ID",
    "serviceId": "서비스ID",
    "projectId": "프로젝트ID",
    "platformName": "플랫폼명",
    "viewName": "뷰 이름",
    "version": "1.0",
    "startTime": "09:00",
    "endTime": "11:00"
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "업무 보고가 수정되었습니다."
  }
  ```
- **Response (403)**:
  ```json
  {
    "statusCode": 403,
    "error": "Forbidden",
    "message": "해당 업무 보고를 수정할 권한이 없습니다."
  }
  ```

### 5. 업무 보고 삭제

- **URL**: `/task/:taskId`
- **Method**: `DELETE`
- **Description**: 특정 업무 보고를 삭제합니다. 본인이 작성한 보고 또는 관리자 권한이 필요합니다.
- **권한**: PERM_02(업무보고) 쓰기 권한
- **Path Parameters**:
  - `taskId`: 업무 보고 ID
- **Response (200)**:
  ```json
  {
    "message": "업무 보고가 삭제되었습니다."
  }
  ```
- **Response (403)**:
  ```json
  {
    "statusCode": 403,
    "error": "Forbidden",
    "message": "해당 업무 보고를 삭제할 권한이 없습니다."
  }
  ```