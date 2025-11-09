# 프로젝트 관리 API 명세서

## 개요

이 문서는 업무 보고 시스템의 프로젝트 관리 관련 API를 설명합니다. 모든 API는 기본 URL `/api/v3`에서 시작합니다.

## 프로젝트 API

### 1. 프로젝트 목록 조회

- **URL**: `/project`
- **Method**: `GET`
- **Description**: 프로젝트 목록을 조회합니다.
- **권한**: PERM_03(프로젝트 관리) 읽기 권한
- **Query Parameters**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 10)
  - `serviceId`: 서비스 ID
  - `platformName`: 플랫폼명
  - `isActive`: 활성 상태 (true/false)
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
        "projectId": "프로젝트ID",
        "name": "프로젝트명",
        "serviceId": "서비스ID",
        "serviceName": "서비스명",
        "platformName": "플랫폼명",
        "version": "버전",
        "type": "업무타입",
        "comment": "메모",
        "isActive": true,
        "createdAt": "2025-03-27T00:00:00.000Z",
        "updatedAt": "2025-03-27T00:00:00.000Z",
        "urlCount": 3
      }
    ]
  }
  ```

### 2. 프로젝트 상세 조회

- **URL**: `/project/:projectId`
- **Method**: `GET`
- **Description**: 특정 프로젝트의 상세 정보를 조회합니다.
- **권한**: PERM_03(프로젝트 관리) 읽기 권한
- **Path Parameters**:
  - `projectId`: 프로젝트 ID
- **Response (200)**:
  ```json
  {
    "projectId": "프로젝트ID",
    "name": "프로젝트명",
    "serviceId": "서비스ID",
    "serviceName": "서비스명",
    "platformName": "플랫폼명",
    "version": "버전",
    "type": "업무타입",
    "comment": "메모",
    "isActive": true,
    "createdAt": "2025-03-27T00:00:00.000Z",
    "updatedAt": "2025-03-27T00:00:00.000Z",
    "urls": [
      {
        "urlId": "URLID",
        "url": "https://example.com",
        "description": "URL 설명"
      }
    ]
  }
  ```
- **Response (404)**:
  ```json
  {
    "statusCode": 404,
    "error": "Not Found",
    "message": "해당 프로젝트를 찾을 수 없습니다."
  }
  ```

### 3. 프로젝트 등록

- **URL**: `/project`
- **Method**: `POST`
- **Description**: 새로운 프로젝트를 등록합니다.
- **권한**: PERM_03(프로젝트 관리) 쓰기 권한
- **Request Body**:
  ```json
  {
    "name": "프로젝트명",
    "serviceId": "서비스ID",
    "platformName": "플랫폼명",
    "version": "1.0",
    "type": "업무타입",
    "comment": "메모",
    "isActive": true
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "프로젝트가 등록되었습니다.",
    "projectId": "생성된_프로젝트ID"
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

### 4. 프로젝트 수정

- **URL**: `/project/:projectId`
- **Method**: `PUT`
- **Description**: 특정 프로젝트를 수정합니다.
- **권한**: PERM_03(프로젝트 관리) 쓰기 권한
- **Path Parameters**:
  - `projectId`: 프로젝트 ID
- **Request Body**:
  ```json
  {
    "name": "프로젝트명",
    "serviceId": "서비스ID",
    "platformName": "플랫폼명",
    "version": "1.0",
    "type": "업무타입",
    "comment": "메모",
    "isActive": true
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "프로젝트가 수정되었습니다."
  }
  ```
- **Response (404)**:
  ```json
  {
    "statusCode": 404,
    "error": "Not Found",
    "message": "해당 프로젝트를 찾을 수 없습니다."
  }
  ```

### 5. 프로젝트 삭제

- **URL**: `/project/:projectId`
- **Method**: `DELETE`
- **Description**: 특정 프로젝트를 삭제합니다.
- **권한**: PERM_03(프로젝트 관리) 쓰기 권한
- **Path Parameters**:
  - `projectId`: 프로젝트 ID
- **Response (200)**:
  ```json
  {
    "message": "프로젝트가 삭제되었습니다."
  }
  ```
- **Response (400)**:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "이 프로젝트는 업무 보고에서 사용 중이므로 삭제할 수 없습니다."
  }
  ```

### 6. 프로젝트 링크 등록

- **URL**: `/project/link`
- **Method**: `POST`
- **Description**: 프로젝트에 새로운 URL을 등록합니다.
- **권한**: PERM_03(프로젝트 관리) 쓰기 권한
- **Request Body**:
  ```json
  {
    "projectId": "프로젝트ID",
    "url": "https://example.com",
    "description": "URL 설명"
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "URL이 등록되었습니다.",
    "urlId": "생성된_URLID"
  }
  ```

### 7. 프로젝트 링크 수정

- **URL**: `/project/link/:projectLinkId`
- **Method**: `PUT`
- **Description**: 프로젝트의 특정 URL을 수정합니다.
- **권한**: PERM_03(프로젝트 관리) 쓰기 권한
- **Path Parameters**:
  - `projectLinkId`: 프로젝트 링크 ID
- **Request Body**:
  ```json
  {
    "url": "https://example.com",
    "description": "URL 설명"
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "URL이 수정되었습니다."
  }
  ```

### 8. 프로젝트 링크 삭제

- **URL**: `/project/link/:projectLinkId`
- **Method**: `DELETE`
- **Description**: 프로젝트의 특정 URL을 삭제합니다.
- **권한**: PERM_03(프로젝트 관리) 쓰기 권한
- **Path Parameters**:
  - `projectLinkId`: 프로젝트 링크 ID
- **Response (200)**:
  ```json
  {
    "message": "URL이 삭제되었습니다."
  }
  ```