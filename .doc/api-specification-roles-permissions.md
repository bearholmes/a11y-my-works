# 역할 및 권한 API 명세서

## 개요

이 문서는 업무 보고 시스템의 역할 및 권한 관련 API를 설명합니다. 모든 API는 기본 URL `/api/v3`에서 시작합니다.

## 역할 관리 API

### 1. 역할 목록 조회

- **URL**: `/roles`
- **Method**: `GET`
- **Description**: 역할 목록을 조회합니다.
- **권한**: PERM_08(권한 관리) 읽기 권한
- **Query Parameters**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 10)
  - `isActive`: 활성 상태 (true/false)
  - `search`: 검색어
- **Response (200)**:
  ```json
  {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 5,
      "totalPages": 1
    },
    "data": [
      {
        "roleId": "역할ID",
        "name": "역할명",
        "description": "역할 설명",
        "isActive": true,
        "createdAt": "2025-03-27T00:00:00.000Z",
        "updatedAt": "2025-03-27T00:00:00.000Z",
        "memberCount": 15
      }
    ]
  }
  ```

### 2. 역할 상세 조회

- **URL**: `/roles/:roleId`
- **Method**: `GET`
- **Description**: 특정 역할의 상세 정보와 권한 목록을 조회합니다.
- **권한**: PERM_08(권한 관리) 읽기 권한
- **Path Parameters**:
  - `roleId`: 역할 ID
- **Response (200)**:
  ```json
  {
    "roleId": "역할ID",
    "name": "역할명",
    "description": "역할 설명",
    "isActive": true,
    "createdAt": "2025-03-27T00:00:00.000Z",
    "updatedAt": "2025-03-27T00:00:00.000Z",
    "permissions": [
      {
        "permissionId": "권한ID",
        "key": "PERM_01",
        "name": "대시보드",
        "read": true,
        "write": true
      }
    ]
  }
  ```

### 3. 역할 등록

- **URL**: `/roles`
- **Method**: `POST`
- **Description**: 새로운 역할을 등록합니다.
- **권한**: PERM_08(권한 관리) 쓰기 권한
- **Request Body**:
  ```json
  {
    "name": "역할명",
    "description": "역할 설명",
    "isActive": true,
    "permissions": [
      {
        "permissionId": "권한ID",
        "read": true,
        "write": true
      }
    ]
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "역할이 등록되었습니다.",
    "roleId": "생성된_역할ID"
  }
  ```

### 4. 역할 수정

- **URL**: `/roles/:roleId`
- **Method**: `PUT`
- **Description**: 특정 역할의 정보와 권한을 수정합니다.
- **권한**: PERM_08(권한 관리) 쓰기 권한
- **Path Parameters**:
  - `roleId`: 역할 ID
- **Request Body**:
  ```json
  {
    "name": "역할명",
    "description": "역할 설명",
    "isActive": true,
    "permissions": [
      {
        "permissionId": "권한ID",
        "read": true,
        "write": true
      }
    ]
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "역할이 수정되었습니다."
  }
  ```

### 5. 역할 삭제

- **URL**: `/roles/:roleId`
- **Method**: `DELETE`
- **Description**: 특정 역할을 삭제합니다.
- **권한**: PERM_08(권한 관리) 쓰기 권한
- **Path Parameters**:
  - `roleId`: 역할 ID
- **Response (200)**:
  ```json
  {
    "message": "역할이 삭제되었습니다."
  }
  ```
- **Response (400)**:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "이 역할에는 사용자가 할당되어 있으므로 삭제할 수 없습니다."
  }
  ```

## 권한 관리 API

### 1. 권한 목록 조회

- **URL**: `/permission`
- **Method**: `GET`
- **Description**: 권한 목록을 조회합니다.
- **권한**: PERM_08(권한 관리) 읽기 권한
- **Query Parameters**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 10)
  - `search`: 검색어
- **Response (200)**:
  ```json
  {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 10,
      "totalPages": 1
    },
    "data": [
      {
        "permissionId": "권한ID",
        "key": "PERM_01",
        "name": "대시보드",
        "createdAt": "2025-03-27T00:00:00.000Z",
        "updatedAt": "2025-03-27T00:00:00.000Z"
      }
    ]
  }
  ```

### 2. 권한 등록

- **URL**: `/permission`
- **Method**: `POST`
- **Description**: 새로운 권한을 등록합니다.
- **권한**: PERM_08(권한 관리) 쓰기 권한
- **Request Body**:
  ```json
  {
    "key": "PERM_11",
    "name": "새 권한명"
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "권한이 등록되었습니다.",
    "permissionId": "생성된_권한ID"
  }
  ```

### 3. 권한 수정

- **URL**: `/permission/:permissionId`
- **Method**: `PUT`
- **Description**: 특정 권한을 수정합니다.
- **권한**: PERM_08(권한 관리) 쓰기 권한
- **Path Parameters**:
  - `permissionId`: 권한 ID
- **Request Body**:
  ```json
  {
    "name": "수정된 권한명"
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "권한이 수정되었습니다."
  }
  ```

### 4. 권한 삭제

- **URL**: `/permission/:permissionId`
- **Method**: `DELETE`
- **Description**: 특정 권한을 삭제합니다.
- **권한**: PERM_08(권한 관리) 쓰기 권한
- **Path Parameters**:
  - `permissionId`: 권한 ID
- **Response (200)**:
  ```json
  {
    "message": "권한이 삭제되었습니다."
  }
  ```
- **Response (400)**:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "이 권한은 역할에 할당되어 있으므로 삭제할 수 없습니다."
  }
  ```