# 인증 및 권한 관리 API 명세서

## 개요

이 문서는 업무 보고 시스템의 인증 및 권한 관리 관련 API를 설명합니다. 모든 API는 기본 URL `/api/v3`에서 시작합니다.

## 인증 방식
- JWT(JSON Web Token) 기반 인증을 사용합니다.
- 액세스 토큰과 리프레시 토큰으로 구성되어 있습니다.
- 인증이 필요한 API 호출 시 요청 헤더에 액세스 토큰을 포함해야 합니다.

```
Authorization: Bearer [액세스 토큰]
```

## 공통 응답 형식

### 성공 응답
```json
{
  "message": "성공 메시지",
  "data": { /* 응답 데이터 */ }
}
```

### 오류 응답
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "오류 메시지"
}
```

## 인증 API

### 1. 로그인

- **URL**: `/auth/login`
- **Method**: `POST`
- **Description**: 계정 아이디와 비밀번호를 이용하여 인증하고 토큰을 발급합니다.
- **권한**: 인증 불필요
- **Request Body**:
  ```json
  {
    "accountId": "사용자ID",
    "password": "비밀번호"
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "로그인 성공",
    "type": "bearer",
    "token": "JWT_TOKEN",
    "logged": true
  }
  ```
- **Response (400)**:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "계정 정보가 일치하지 않습니다."
  }
  ```

### 2. 토큰 갱신

- **URL**: `/auth/reissuance`
- **Method**: `POST`
- **Description**: 리프레시 토큰을 이용하여 새로운 액세스 토큰을 발급합니다.
- **권한**: 인증 불필요
- **Request Body**:
  ```json
  {
    "refreshToken": "REFRESH_TOKEN"
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "토큰 재발급 성공",
    "type": "bearer",
    "token": "NEW_JWT_TOKEN"
  }
  ```
- **Response (400)**:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "유효하지 않은 리프레시 토큰입니다."
  }
  ```

### 3. 로그아웃

- **URL**: `/auth/logout`
- **Method**: `GET`
- **Description**: 현재 세션을 종료하고 토큰을 무효화합니다.
- **권한**: 인증 필요
- **Response (200)**:
  ```json
  {
    "message": "로그아웃 성공"
  }
  ```

### 4. 로그인 상태 확인

- **URL**: `/auth/verify`
- **Method**: `GET`
- **Description**: 현재 인증 상태를 확인합니다.
- **권한**: 인증 필요
- **Response (200)**:
  ```json
  {
    "isAuthenticated": true,
    "user": {
      "memberId": "회원ID",
      "accountId": "계정ID",
      "name": "이름",
      "role": "역할명"
    }
  }
  ```

### 5. 우회 로그인

- **URL**: `/auth/bypass`
- **Method**: `POST`
- **Description**: 관리자가 다른 사용자 계정으로 로그인할 수 있는 기능입니다.
- **권한**: 인증 필요 + PERM_06(사용자 관리) 또는 PERM_08(권한 관리) 쓰기 권한
- **Request Body**:
  ```json
  {
    "accountId": "로그인할_사용자ID"
  }
  ```
- **Response (200)**:
  ```json
  {
    "message": "우회 로그인 성공",
    "type": "bearer",
    "token": "BYPASS_JWT_TOKEN",
    "logged": true
  }
  ```
- **Response (403)**:
  ```json
  {
    "statusCode": 403,
    "error": "Forbidden",
    "message": "우회 로그인을 위한 권한이 없습니다."
  }
  ```

### 6. 우회 로그인 상태 확인

- **URL**: `/auth/bypass/verify`
- **Method**: `GET`
- **Description**: 현재 우회 로그인 상태를 확인합니다.
- **권한**: 인증 필요
- **Response (200)**:
  ```json
  {
    "isBypass": true,
    "originalUser": {
      "memberId": "관리자ID",
      "accountId": "관리자계정ID",
      "timestamp": "2025-03-27T00:00:00.000Z"
    },
    "currentUser": {
      "memberId": "현재사용자ID"
    }
  }
  ```