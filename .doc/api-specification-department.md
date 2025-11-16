# 부서 관리 API 명세서

## 개요

이 문서는 업무 보고 시스템의 부서 관리 관련 API를 설명합니다. 모든 API는 기본 URL `/api/v3`에서 시작합니다.

## 부서 관리 API

### 1. 부서 목록 조회

- **URL**: `/departments`
- **Method**: `GET`
- **Description**: 부서 목록을 조회합니다.
- **권한**: 모든 인증된 사용자
- **Query Parameters**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 50)
  - `isActive`: 활성 상태 (true/false, 기본값: true)
  - `search`: 검색어 (부서명, 코드)
  - `parentId`: 상위 부서 ID (하위 부서만 조회)
  - `includeInactive`: 비활성 부서 포함 여부 (기본값: false)
- **Response (200)**:
  ```json
  {
    "pagination": {
      "page": 1,
      "limit": 50,
      "totalCount": 10,
      "totalPages": 1
    },
    "data": [
      {
        "department_id": 1,
        "name": "개발팀",
        "code": "DEV",
        "description": "소프트웨어 개발 부서",
        "parent_department_id": null,
        "parent_department_name": null,
        "depth": 0,
        "path": "/1",
        "is_active": true,
        "sort_order": 0,
        "member_count": 15,
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z"
      },
      {
        "department_id": 2,
        "name": "프론트엔드팀",
        "code": "FE",
        "description": "프론트엔드 개발",
        "parent_department_id": 1,
        "parent_department_name": "개발팀",
        "depth": 1,
        "path": "/1/2",
        "is_active": true,
        "sort_order": 0,
        "member_count": 7,
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

### 2. 부서 상세 조회

- **URL**: `/departments/:departmentId`
- **Method**: `GET`
- **Description**: 특정 부서의 상세 정보를 조회합니다.
- **권한**: 모든 인증된 사용자
- **Path Parameters**:
  - `departmentId`: 부서 ID
- **Response (200)**:
  ```json
  {
    "department_id": 1,
    "name": "개발팀",
    "code": "DEV",
    "description": "소프트웨어 개발 부서",
    "parent_department_id": null,
    "parent_department_name": null,
    "depth": 0,
    "path": "/1",
    "is_active": true,
    "sort_order": 0,
    "member_count": 15,
    "child_departments": [
      {
        "department_id": 2,
        "name": "프론트엔드팀",
        "code": "FE",
        "member_count": 7
      },
      {
        "department_id": 3,
        "name": "백엔드팀",
        "code": "BE",
        "member_count": 8
      }
    ],
    "members": [
      {
        "member_id": 10,
        "name": "홍길동",
        "account_id": "hong",
        "role_name": "개발자",
        "is_active": true
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
  ```
- **Response (404)**:
  ```json
  {
    "statusCode": 404,
    "error": "Not Found",
    "message": "부서를 찾을 수 없습니다."
  }
  ```

### 3. 부서 계층 구조 조회 (트리)

- **URL**: `/departments/tree`
- **Method**: `GET`
- **Description**: 부서 계층 구조를 트리 형태로 조회합니다.
- **권한**: 모든 인증된 사용자
- **Query Parameters**:
  - `includeInactive`: 비활성 부서 포함 여부 (기본값: false)
- **Response (200)**:
  ```json
  {
    "data": [
      {
        "department_id": 1,
        "name": "개발팀",
        "code": "DEV",
        "is_active": true,
        "member_count": 5,
        "children": [
          {
            "department_id": 2,
            "name": "프론트엔드팀",
            "code": "FE",
            "is_active": true,
            "member_count": 3,
            "children": []
          },
          {
            "department_id": 3,
            "name": "백엔드팀",
            "code": "BE",
            "is_active": true,
            "member_count": 2,
            "children": []
          }
        ]
      },
      {
        "department_id": 4,
        "name": "기획팀",
        "code": "PM",
        "is_active": true,
        "member_count": 4,
        "children": []
      }
    ]
  }
  ```

### 4. 부서 생성

- **URL**: `/departments`
- **Method**: `POST`
- **Description**: 새로운 부서를 생성합니다.
- **권한**: PERM_06(사용자 관리) 쓰기 권한 또는 ADMIN 역할
- **Request Body**:
  ```json
  {
    "name": "개발팀",
    "code": "DEV",
    "description": "소프트웨어 개발 부서",
    "parent_department_id": null,
    "is_active": true,
    "sort_order": 0
  }
  ```
- **필드 설명**:
  - `name` (필수): 부서명 (최대 100자)
  - `code` (필수): 부서 코드 (최대 50자, 영문 대문자 및 언더스코어 권장, 고유값)
  - `description` (선택): 부서 설명
  - `parent_department_id` (선택): 상위 부서 ID (NULL = 최상위 부서)
  - `is_active` (선택): 활성 상태 (기본값: true)
  - `sort_order` (선택): 표시 순서 (기본값: 0)
- **Response (201)**:
  ```json
  {
    "message": "부서가 생성되었습니다.",
    "department_id": 1
  }
  ```
- **Response (400) - 중복된 코드**:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "이미 사용 중인 부서 코드입니다."
  }
  ```
- **Response (400) - 유효하지 않은 상위 부서**:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "상위 부서를 찾을 수 없습니다."
  }
  ```

### 5. 부서 수정

- **URL**: `/departments/:departmentId`
- **Method**: `PUT`
- **Description**: 특정 부서의 정보를 수정합니다.
- **권한**: PERM_06(사용자 관리) 쓰기 권한 또는 ADMIN 역할
- **Path Parameters**:
  - `departmentId`: 부서 ID
- **Request Body**:
  ```json
  {
    "name": "개발팀",
    "description": "소프트웨어 개발 및 유지보수",
    "is_active": true,
    "sort_order": 1
  }
  ```
- **필드 설명**:
  - `name` (선택): 부서명
  - `description` (선택): 부서 설명
  - `is_active` (선택): 활성 상태
  - `sort_order` (선택): 표시 순서
- **참고**: `code`와 `parent_department_id`는 생성 후 수정 불가 (데이터 무결성 유지)
- **Response (200)**:
  ```json
  {
    "message": "부서 정보가 수정되었습니다."
  }
  ```
- **Response (404)**:
  ```json
  {
    "statusCode": 404,
    "error": "Not Found",
    "message": "부서를 찾을 수 없습니다."
  }
  ```

### 6. 부서 삭제

- **URL**: `/departments/:departmentId`
- **Method**: `DELETE`
- **Description**: 특정 부서를 삭제합니다. 하위 부서가 있거나 소속 사용자가 있는 경우 삭제할 수 없습니다.
- **권한**: PERM_06(사용자 관리) 쓰기 권한 또는 ADMIN 역할
- **Path Parameters**:
  - `departmentId`: 부서 ID
- **Response (200)**:
  ```json
  {
    "message": "부서가 삭제되었습니다."
  }
  ```
- **Response (400) - 하위 부서 존재**:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "이 부서에는 2개의 하위 부서가 있습니다. 먼저 하위 부서를 삭제하거나 다른 부서로 이동해주세요."
  }
  ```
- **Response (400) - 소속 사용자 존재**:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "이 부서에는 3명의 소속 사용자가 있습니다. 먼저 사용자를 다른 부서로 이동하거나 비활성화해주세요."
  }
  ```
- **Response (404)**:
  ```json
  {
    "statusCode": 404,
    "error": "Not Found",
    "message": "부서를 찾을 수 없습니다."
  }
  ```

### 7. 부서별 통계 조회

- **URL**: `/departments/:departmentId/stats`
- **Method**: `GET`
- **Description**: 특정 부서의 통계 정보를 조회합니다.
- **권한**: 모든 인증된 사용자
- **Path Parameters**:
  - `departmentId`: 부서 ID
- **Query Parameters**:
  - `startDate`: 시작 날짜 (YYYY-MM-DD)
  - `endDate`: 종료 날짜 (YYYY-MM-DD)
  - `includeSubDepartments`: 하위 부서 포함 여부 (기본값: false)
- **Response (200)**:
  ```json
  {
    "department_id": 1,
    "department_name": "개발팀",
    "member_count": 15,
    "active_member_count": 14,
    "task_stats": {
      "total_tasks": 120,
      "total_work_hours": 960,
      "avg_work_hours_per_member": 68.57
    },
    "sub_departments": [
      {
        "department_id": 2,
        "department_name": "프론트엔드팀",
        "member_count": 7,
        "total_tasks": 60,
        "total_work_hours": 480
      }
    ]
  }
  ```

---

## 사용자 관리 API 수정 사항

### 사용자 목록 조회 (수정)

기존 `GET /api/v3/members` API에 부서 관련 기능 추가:

**추가 Query Parameters**:
- `departmentId`: 부서 ID로 필터
- `includeSubDepartments`: 하위 부서 포함 여부 (기본값: false)

**Response 수정**:
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
      "member_id": 10,
      "account_id": "hong",
      "name": "홍길동",
      "email": "hong@example.com",
      "mobile": "010-1234-5678",
      "role_id": 2,
      "role_name": "개발자",
      "department_id": 1,
      "department_name": "개발팀",
      "department_code": "DEV",
      "is_active": true,
      "requires_daily_report": true,
      "created_at": "2025-03-27T00:00:00.000Z",
      "updated_at": "2025-03-27T00:00:00.000Z"
    }
  ]
}
```

### 사용자 등록 (수정)

기존 `POST /api/v3/members` API에 부서 필드 추가:

**Request Body (수정)**:
```json
{
  "account_id": "hong",
  "name": "홍길동",
  "email": "hong@example.com",
  "mobile": "010-1234-5678",
  "password": "securePassword123!",
  "role_id": 2,
  "department_id": 1,
  "is_active": true,
  "requires_daily_report": true
}
```

**추가 필드**:
- `department_id` (선택): 소속 부서 ID

### 사용자 수정 (수정)

기존 `PUT /api/v3/members/:memberId` API에 부서 필드 추가:

**Request Body (수정)**:
```json
{
  "name": "홍길동",
  "email": "hong@example.com",
  "mobile": "010-1234-5678",
  "role_id": 2,
  "department_id": 1,
  "is_active": true,
  "requires_daily_report": true
}
```

---

## 에러 코드

| 상태 코드 | 설명 |
|----------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 (유효성 검증 실패, 비즈니스 규칙 위반) |
| 401 | 인증 실패 (로그인 필요) |
| 403 | 권한 없음 |
| 404 | 리소스를 찾을 수 없음 |
| 500 | 서버 내부 오류 |

---

## 부서 코드 네이밍 규칙

부서 코드(`code`)는 다음 규칙을 따르는 것을 권장합니다:

- **형식**: 영문 대문자 및 언더스코어 (`A-Z`, `_`)
- **길이**: 2-10자
- **예시**:
  - `DEV`: 개발팀
  - `FE`: 프론트엔드팀
  - `BE`: 백엔드팀
  - `PM`: 기획팀
  - `DESIGN`: 디자인팀
  - `SALES`: 영업팀
  - `HR`: 인사팀

---

## 부서 계층 구조 설명

부서는 **Materialized Path** 패턴을 사용하여 계층 구조를 표현합니다:

- `depth`: 계층 깊이 (0 = 최상위, 1 = 1단계 하위, ...)
- `path`: 계층 경로 (예: `/1/2/5` = 부서 1 > 부서 2 > 부서 5)

**예시**:
```
개발팀 (ID: 1, depth: 0, path: /1)
  ├── 프론트엔드팀 (ID: 2, depth: 1, path: /1/2)
  └── 백엔드팀 (ID: 3, depth: 1, path: /1/3)
      └── 데이터베이스팀 (ID: 4, depth: 2, path: /1/3/4)
```

**장점**:
- 하위 부서 조회: `WHERE path LIKE '/1/%'`
- 상위 부서 조회: `WHERE path IN ('/1', '/1/3')`
- 계층 깊이 제한 확인: `WHERE depth < 5`

---

**문서 버전**: 1.0
**작성일**: 2025-11-16
**작성자**: Claude Code
**참고**: `api-specification-member.md`와 함께 참조
