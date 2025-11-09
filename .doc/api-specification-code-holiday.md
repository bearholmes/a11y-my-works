# 공통 코드 및 공휴일 API 명세서

## 개요

이 문서는 업무 보고 시스템의 공통 코드 및 공휴일 관련 API를 설명합니다. 모든 API는 기본 URL `/api/v3`에서 시작합니다.

## 공통 코드 API

### 1. 공통 코드 그룹 목록 조회

- **URL**: `/code/group`
- **Method**: `GET`
- **Description**: 코드 그룹 목록을 조회합니다.
- **권한**: PERM_07(공통코드 관리) 읽기 권한
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
      "totalCount": 15,
      "totalPages": 2
    },
    "data": [
      {
        "codeGroupId": "코드그룹ID",
        "name": "코드그룹명",
        "description": "설명",
        "isActive": true,
        "createdAt": "2025-03-27T00:00:00.000Z",
        "updatedAt": "2025-03-27T00:00:00.000Z",
        "codeCount": 8
      }
    ]
  }
  ```

### 2. 코드 그룹 등록

- **URL**: `/code/group`
- **Method**: `POST`
- **Description**: 새로운 코드 그룹을 등록합니다.
- **권한**: PERM_07(공통코드 관리) 쓰기 권한
- **Request Body**:
  ```json
  {
    "name": "코드그룹명",
    "description": "설명",
    "isActive": true
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "코드 그룹이 등록되었습니다.",
    "codeGroupId": "생성된_코드그룹ID"
  }
  ```

### 3. 코드 그룹 수정

- **URL**: `/code/group/:codeGroupId`
- **Method**: `PUT`
- **Description**: 특정 코드 그룹을 수정합니다.
- **권한**: PERM_07(공통코드 관리) 쓰기 권한
- **Path Parameters**:
  - `codeGroupId`: 코드 그룹 ID
- **Request Body**:
  ```json
  {
    "name": "코드그룹명",
    "description": "설명",
    "isActive": true
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "코드 그룹이 수정되었습니다."
  }
  ```

### 4. 코드 그룹 삭제

- **URL**: `/code/group/:codeGroupId`
- **Method**: `DELETE`
- **Description**: 특정 코드 그룹을 삭제합니다.
- **권한**: PERM_07(공통코드 관리) 쓰기 권한
- **Path Parameters**:
  - `codeGroupId`: 코드 그룹 ID
- **Response (200)**:
  ```json
  {
    "message": "코드 그룹이 삭제되었습니다."
  }
  ```
- **Response (400)**:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "이 코드 그룹에는 코드가 존재하므로 삭제할 수 없습니다."
  }
  ```

### 5. 코드 목록 조회

- **URL**: `/code`
- **Method**: `GET`
- **Description**: 코드 목록을 조회합니다.
- **권한**: PERM_07(공통코드 관리) 읽기 권한
- **Query Parameters**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 10)
  - `codeGroupId`: 코드 그룹 ID
  - `isActive`: 활성 상태 (true/false)
  - `search`: 검색어
- **Response (200)**:
  ```json
  {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 30,
      "totalPages": 3
    },
    "data": [
      {
        "codeId": "코드ID",
        "codeGroupId": "코드그룹ID",
        "codeGroupName": "코드그룹명",
        "name": "코드명",
        "key": "코드키",
        "value": "코드값",
        "sort": 1,
        "isActive": true,
        "createdAt": "2025-03-27T00:00:00.000Z",
        "updatedAt": "2025-03-27T00:00:00.000Z"
      }
    ]
  }
  ```

### 6. 코드 등록

- **URL**: `/code`
- **Method**: `POST`
- **Description**: 새로운 코드를 등록합니다.
- **권한**: PERM_07(공통코드 관리) 쓰기 권한
- **Request Body**:
  ```json
  {
    "codeGroupId": "코드그룹ID",
    "name": "코드명",
    "key": "코드키",
    "value": "코드값",
    "sort": 1,
    "isActive": true
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "코드가 등록되었습니다.",
    "codeId": "생성된_코드ID"
  }
  ```

### 7. 코드 수정

- **URL**: `/code/:codeId`
- **Method**: `PUT`
- **Description**: 특정 코드를 수정합니다.
- **권한**: PERM_07(공통코드 관리) 쓰기 권한
- **Path Parameters**:
  - `codeId`: 코드 ID
- **Request Body**:
  ```json
  {
    "name": "코드명",
    "value": "코드값",
    "sort": 1,
    "isActive": true
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "코드가 수정되었습니다."
  }
  ```

### 8. 코드 삭제

- **URL**: `/code/:codeId`
- **Method**: `DELETE`
- **Description**: 특정 코드를 삭제합니다.
- **권한**: PERM_07(공통코드 관리) 쓰기 권한
- **Path Parameters**:
  - `codeId`: 코드 ID
- **Response (200)**:
  ```json
  {
    "message": "코드가 삭제되었습니다."
  }
  ```
- **Response (400)**:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "이 코드는 사용 중이므로 삭제할 수 없습니다."
  }
  ```

## 공휴일 API

### 1. 공휴일 목록 조회

- **URL**: `/holiday`
- **Method**: `GET`
- **Description**: 공휴일 목록을 조회합니다.
- **권한**: PERM_09(공휴일 관리) 읽기 권한
- **Query Parameters**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 10)
  - `year`: 연도 (예: 2025)
  - `search`: 검색어
- **Response (200)**:
  ```json
  {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 25,
      "totalPages": 3
    },
    "data": [
      {
        "holidayId": "공휴일ID",
        "date": "2025-01-01",
        "name": "신정",
        "description": "새해 첫날",
        "createdAt": "2025-03-27T00:00:00.000Z",
        "updatedAt": "2025-03-27T00:00:00.000Z"
      }
    ]
  }
  ```

### 2. 공휴일 등록

- **URL**: `/holiday`
- **Method**: `POST`
- **Description**: 새로운 공휴일을 등록합니다.
- **권한**: PERM_09(공휴일 관리) 쓰기 권한
- **Request Body**:
  ```json
  {
    "date": "2025-01-01",
    "name": "신정",
    "description": "새해 첫날"
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "공휴일이 등록되었습니다.",
    "holidayId": "생성된_공휴일ID"
  }
  ```

### 3. 공휴일 수정

- **URL**: `/holiday/:holidayId`
- **Method**: `PUT`
- **Description**: 특정 공휴일을 수정합니다.
- **권한**: PERM_09(공휴일 관리) 쓰기 권한
- **Path Parameters**:
  - `holidayId`: 공휴일 ID
- **Request Body**:
  ```json
  {
    "date": "2025-01-01",
    "name": "신정",
    "description": "새해 첫날"
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "공휴일이 수정되었습니다."
  }
  ```

### 4. 공휴일 삭제

- **URL**: `/holiday/:holidayId`
- **Method**: `DELETE`
- **Description**: 특정 공휴일을 삭제합니다.
- **권한**: PERM_09(공휴일 관리) 쓰기 권한
- **Path Parameters**:
  - `holidayId`: 공휴일 ID
- **Response (200)**:
  ```json
  {
    "message": "공휴일이 삭제되었습니다."
  }
  ```