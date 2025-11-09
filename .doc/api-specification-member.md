# 사용자 관리 API 명세서

## 개요

이 문서는 업무 보고 시스템의 사용자 관리 관련 API를 설명합니다. 모든 API는 기본 URL `/api/v3`에서 시작합니다.

## 사용자 관리 API

### 1. 사용자 목록 조회

- **URL**: `/member`
- **Method**: `GET`
- **Description**: 사용자 목록을 조회합니다.
- **권한**: PERM_06(사용자 관리) 읽기 권한
- **Query Parameters**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 10)
  - `roleId`: 역할 ID
  - `isActive`: 활성 상태 (true/false)
  - `search`: 검색어 (이름, 계정ID)
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
        "memberId": "회원ID",
        "accountId": "계정ID",
        "name": "이름",
        "email": "이메일",
        "mobile": "휴대폰번호",
        "roleId": "역할ID",
        "roleName": "역할명",
        "deptPath": "부서 정보",
        "isActive": true,
        "createdAt": "2025-03-27T00:00:00.000Z",
        "updatedAt": "2025-03-27T00:00:00.000Z"
      }
    ]
  }
  ```

### 2. 사용자 상세 조회

- **URL**: `/member/:memberId`
- **Method**: `GET`
- **Description**: 특정 사용자의 상세 정보를 조회합니다.
- **권한**: PERM_06(사용자 관리) 읽기 권한
- **Path Parameters**:
  - `memberId`: 회원 ID
- **Response (200)**:
  ```json
  {
    "memberId": "회원ID",
    "accountId": "계정ID",
    "name": "이름",
    "email": "이메일",
    "mobile": "휴대폰번호",
    "roleId": "역할ID",
    "roleName": "역할명",
    "deptPath": "부서 정보",
    "isActive": true,
    "createdAt": "2025-03-27T00:00:00.000Z",
    "updatedAt": "2025-03-27T00:00:00.000Z"
  }
  ```

### 3. 사용자 등록

- **URL**: `/member`
- **Method**: `POST`
- **Description**: 새로운 사용자를 등록합니다.
- **권한**: PERM_06(사용자 관리) 쓰기 권한
- **Request Body**:
  ```json
  {
    "accountId": "계정ID",
    "name": "이름",
    "email": "이메일",
    "mobile": "휴대폰번호",
    "password": "비밀번호",
    "roleId": "역할ID",
    "deptPath": "부서 정보",
    "isActive": true
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "사용자가 등록되었습니다.",
    "memberId": "생성된_회원ID"
  }
  ```
- **Response (400)**:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "이미 사용 중인 계정 ID입니다."
  }
  ```

### 4. 사용자 수정

- **URL**: `/member/:memberId`
- **Method**: `PUT`
- **Description**: 특정 사용자의 정보를 수정합니다.
- **권한**: PERM_06(사용자 관리) 쓰기 권한
- **Path Parameters**:
  - `memberId`: 회원 ID
- **Request Body**:
  ```json
  {
    "name": "이름",
    "email": "이메일",
    "mobile": "휴대폰번호",
    "roleId": "역할ID",
    "deptPath": "부서 정보",
    "isActive": true
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "사용자 정보가 수정되었습니다."
  }
  ```

### 5. 사용자 삭제

- **URL**: `/member/:memberId`
- **Method**: `DELETE`
- **Description**: 특정 사용자를 삭제합니다.
- **권한**: PERM_06(사용자 관리) 쓰기 권한
- **Path Parameters**:
  - `memberId`: 회원 ID
- **Response (200)**:
  ```json
  {
    "message": "사용자가 삭제되었습니다."
  }
  ```
- **Response (400)**:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "이 사용자는 업무 보고가 존재하므로 비활성화만 가능합니다."
  }
  ```

### 6. 비밀번호 변경

- **URL**: `/member/password/:memberId`
- **Method**: `PUT`
- **Description**: 특정 사용자의 비밀번호를 변경합니다. 자신의 비밀번호는 자신이 변경할 수 있고, 관리자는 모든 사용자의 비밀번호를 변경할 수 있습니다.
- **권한**: PERM_06(사용자 관리) 쓰기 권한 또는 본인
- **Path Parameters**:
  - `memberId`: 회원 ID
- **Request Body**:
  ```json
  {
    "currentPassword": "현재 비밀번호", // 관리자가 아닌 본인일 경우 필수
    "newPassword": "새 비밀번호",
    "confirmPassword": "새 비밀번호 확인"
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "비밀번호가 변경되었습니다."
  }
  ```
- **Response (400)**:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "현재 비밀번호가 일치하지 않습니다."
  }
  ```