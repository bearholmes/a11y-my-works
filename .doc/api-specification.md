# 업무 보고 시스템 API 명세서 개요

이 문서는 업무 보고 시스템의 API 명세를 제공합니다. 모든 API는 기본 URL `/api/v3`에서 시작합니다.

## 목차

1. [인증 및 권한 관리 API](./api-specification-auth.md)
   - 로그인, 토큰 갱신, 로그아웃, 우회 로그인 등

2. [업무 보고 API](./api-specification-task.md)
   - 업무 보고 목록 조회, 등록, 수정, 삭제 등

3. [프로젝트 관리 API](./api-specification-project.md)
   - 프로젝트 목록 조회, 등록, 수정, 삭제, URL 관리 등

4. [서비스 및 청구그룹 API](./api-specification-service-costgrp.md)
   - 서비스 및 청구그룹 목록 조회, 등록, 수정, 삭제 등

5. [사용자 관리 API](./api-specification-member.md)
   - 사용자 목록 조회, 등록, 수정, 삭제, 비밀번호 변경 등

6. [공통 코드 및 공휴일 API](./api-specification-code-holiday.md)
   - 코드 그룹, 코드, 공휴일 관리 등

7. [공통 기능 및 리포트 API](./api-specification-common-report.md)
   - 필터, 대시보드, 리포트 생성, 로그 조회 등

8. [역할 및 권한 API](./api-specification-roles-permissions.md)
   - 역할 및 권한 관리 등

## 공통 정보

### 인증 방식
- JWT(JSON Web Token) 기반 인증
- 액세스 토큰과 리프레시 토큰으로 구성
- 인증이 필요한 API 호출 시 요청 헤더에 액세스 토큰 포함
  ```
  Authorization: Bearer [액세스 토큰]
  ```

### 권한 체계
- 모든 API는 특정 권한(Permission)이 필요
- 권한은 역할(Role)에 매핑
- 대부분의 API는 `read` 또는 `write` 권한 필요

### 공통 응답 형식

#### 성공 응답
```json
{
  "message": "성공 메시지",
  "data": {
    // 응답 데이터
  }
}
```

#### 페이지네이션 응답
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 100,
    "totalPages": 10
  },
  "data": [
    // 데이터 배열
  ]
}
```

#### 오류 응답
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "오류 메시지"
}
```

### 공통 상태 코드
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `500`: 서버 오류

## 권한 키 및 설명

| 권한 키 | 권한 이름 | 설명 |
|--------|----------|-----|
| PERM_01 | 대시보드 | 대시보드 조회 및 관리 |
| PERM_02 | 업무보고 | 업무 보고 조회 및 관리 |
| PERM_03 | 프로젝트 관리 | 프로젝트 조회 및 관리 |
| PERM_04 | 서비스 관리 | 서비스 조회 및 관리 |
| PERM_05 | 청구그룹 관리 | 청구그룹 조회 및 관리 |
| PERM_06 | 사용자 관리 | 사용자 조회 및 관리 |
| PERM_07 | 공통코드 관리 | 공통코드 조회 및 관리 |
| PERM_08 | 권한 관리 | 권한 및 역할 조회 및 관리 |
| PERM_09 | 공휴일 관리 | 공휴일 조회 및 관리 |
| PERM_10 | 사용자 로그 | 사용자 로그 조회 |

## 참고사항

1. 모든 API는 권한에 따라 접근이 제한될 수 있습니다.
2. 일부 API는 추가적인 데이터 접근 제어가 적용될 수 있습니다.
3. 날짜 형식은 기본적으로 "YYYY-MM-DD"를 사용합니다.
4. 시간 형식은 기본적으로 "HH:MM"을 사용합니다.
5. 타임스탬프는 ISO 8601 형식(예: "2025-03-27T00:00:00.000Z")을 사용합니다.