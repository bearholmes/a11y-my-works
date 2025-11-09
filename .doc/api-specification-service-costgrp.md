# 서비스 및 청구그룹 API 명세서

## 개요

이 문서는 업무 보고 시스템의 서비스 및 청구그룹 관련 API를 설명합니다. 모든 API는 기본 URL `/api/v3`에서 시작합니다.

## 서비스 API

### 1. 서비스 목록 조회

- **URL**: `/service`
- **Method**: `GET`
- **Description**: 서비스 목록을 조회합니다.
- **권한**: PERM_04(서비스 관리) 읽기 권한
- **Query Parameters**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 10)
  - `costGrpId`: 청구그룹 ID
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
        "serviceId": "서비스ID",
        "name": "서비스명",
        "costGrpId": "청구그룹ID",
        "costGrpName": "청구그룹명",
        "comment": "메모",
        "isActive": true,
        "createdAt": "2025-03-27T00:00:00.000Z",
        "updatedAt": "2025-03-27T00:00:00.000Z",
        "projectCount": 5
      }
    ]
  }
  ```

### 2. 서비스 등록

- **URL**: `/service`
- **Method**: `POST`
- **Description**: 새로운 서비스를 등록합니다.
- **권한**: PERM_04(서비스 관리) 쓰기 권한
- **Request Body**:
  ```json
  {
    "name": "서비스명",
    "costGrpId": "청구그룹ID",
    "comment": "메모",
    "isActive": true
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "서비스가 등록되었습니다.",
    "serviceId": "생성된_서비스ID"
  }
  ```

### 3. 서비스 수정

- **URL**: `/service/:serviceId`
- **Method**: `PUT`
- **Description**: 특정 서비스를 수정합니다.
- **권한**: PERM_04(서비스 관리) 쓰기 권한
- **Path Parameters**:
  - `serviceId`: 서비스 ID
- **Request Body**:
  ```json
  {
    "name": "서비스명",
    "costGrpId": "청구그룹ID",
    "comment": "메모",
    "isActive": true
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "서비스가 수정되었습니다."
  }
  ```

### 4. 서비스 삭제

- **URL**: `/service/:serviceId`
- **Method**: `DELETE`
- **Description**: 특정 서비스를 삭제합니다.
- **권한**: PERM_04(서비스 관리) 쓰기 권한
- **Path Parameters**:
  - `serviceId`: 서비스 ID
- **Response (200)**:
  ```json
  {
    "message": "서비스가 삭제되었습니다."
  }
  ```
- **Response (400)**:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "이 서비스는 프로젝트에서 사용 중이므로 삭제할 수 없습니다."
  }
  ```

## 청구그룹 API

### 1. 청구그룹 목록 조회

- **URL**: `/cost-grp`
- **Method**: `GET`
- **Description**: 청구그룹 목록을 조회합니다.
- **권한**: PERM_05(청구그룹 관리) 읽기 권한
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
      "totalCount": 20,
      "totalPages": 2
    },
    "data": [
      {
        "costGrpId": "청구그룹ID",
        "name": "청구그룹명",
        "comment": "메모",
        "isActive": true,
        "createdAt": "2025-03-27T00:00:00.000Z",
        "updatedAt": "2025-03-27T00:00:00.000Z",
        "serviceCount": 3
      }
    ]
  }
  ```

### 2. 청구그룹 등록

- **URL**: `/cost-grp`
- **Method**: `POST`
- **Description**: 새로운 청구그룹을 등록합니다.
- **권한**: PERM_05(청구그룹 관리) 쓰기 권한
- **Request Body**:
  ```json
  {
    "name": "청구그룹명",
    "comment": "메모",
    "isActive": true
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "청구그룹이 등록되었습니다.",
    "costGrpId": "생성된_청구그룹ID"
  }
  ```

### 3. 청구그룹 수정

- **URL**: `/cost-grp/:costGrpId`
- **Method**: `PUT`
- **Description**: 특정 청구그룹을 수정합니다.
- **권한**: PERM_05(청구그룹 관리) 쓰기 권한
- **Path Parameters**:
  - `costGrpId`: 청구그룹 ID
- **Request Body**:
  ```json
  {
    "name": "청구그룹명",
    "comment": "메모",
    "isActive": true
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "청구그룹이 수정되었습니다."
  }
  ```

### 4. 청구그룹 삭제

- **URL**: `/cost-grp/:costGrpId`
- **Method**: `DELETE`
- **Description**: 특정 청구그룹을 삭제합니다.
- **권한**: PERM_05(청구그룹 관리) 쓰기 권한
- **Path Parameters**:
  - `costGrpId`: 청구그룹 ID
- **Response (200)**:
  ```json
  {
    "message": "청구그룹이 삭제되었습니다."
  }
  ```
- **Response (400)**:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "이 청구그룹은 서비스에서 사용 중이므로 삭제할 수 없습니다."
  }
  ```