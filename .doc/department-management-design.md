# 부서 관리 기능 설계

## 1. 개요

### 1.1 배경
- 초기 설계 시 부서 관리 기능(`deptPath`)이 포함되었으나 실제 구현에서 누락됨
- 통계 및 사용자 관리 시 부서별 그루핑 기능이 필요한 상태
- 현재는 단순 문자열(`deptPath`)로 설계되어 있어 확장성과 유지보수성 문제

### 1.2 목표
- 부서 마스터 데이터를 독립적으로 관리
- 부서 계층 구조 지원 (부-자 관계)
- 부서별 사용자 통계 및 필터링 기능 제공
- 부서 CRUD 관리 기능 구현

### 1.3 범위
- **Phase 1 (MVP)**: 단일 레벨 부서 관리 및 기본 CRUD
- **Phase 2 (향후)**: 부서 계층 구조, 부서 이동 히스토리

---

## 2. 데이터베이스 설계

### 2.1 DEPARTMENTS 테이블

```sql
CREATE TABLE departments (
  -- 기본 정보
  department_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,  -- 부서 코드 (예: "DEV", "SALES")
  description TEXT,

  -- 계층 구조 (Self-Referencing FK)
  parent_department_id INTEGER REFERENCES departments(department_id) ON DELETE SET NULL,
  depth INTEGER DEFAULT 0,  -- 계층 깊이 (0 = 최상위)
  path TEXT,  -- 계층 경로 (예: "/1/3/5")

  -- 메타데이터
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,  -- 표시 순서

  -- 감사 필드
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 제약조건
  CONSTRAINT check_depth CHECK (depth >= 0),
  CONSTRAINT check_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- 인덱스
CREATE INDEX idx_departments_parent ON departments(parent_department_id);
CREATE INDEX idx_departments_is_active ON departments(is_active);
CREATE INDEX idx_departments_path ON departments USING GIST (path gist_trgm_ops);
CREATE INDEX idx_departments_code ON departments(code);

-- 전체 텍스트 검색 인덱스
CREATE INDEX idx_departments_name_trgm ON departments USING GIN (name gin_trgm_ops);

COMMENT ON TABLE departments IS '부서 마스터 테이블';
COMMENT ON COLUMN departments.department_id IS '부서 고유 식별자';
COMMENT ON COLUMN departments.name IS '부서명';
COMMENT ON COLUMN departments.code IS '부서 코드 (고유)';
COMMENT ON COLUMN departments.parent_department_id IS '상위 부서 ID (NULL = 최상위 부서)';
COMMENT ON COLUMN departments.depth IS '계층 깊이 (0 = 최상위)';
COMMENT ON COLUMN departments.path IS '계층 경로 (materialied path)';
```

### 2.2 MEMBERS 테이블 수정

기존 `members` 테이블에 부서 참조 추가:

```sql
ALTER TABLE members
ADD COLUMN department_id INTEGER REFERENCES departments(department_id) ON DELETE SET NULL;

CREATE INDEX idx_members_department ON members(department_id);

COMMENT ON COLUMN members.department_id IS '소속 부서 ID';
```

**참고**: 기존 `deptPath` 필드가 있다면 데이터 마이그레이션 후 제거:
1. 기존 `deptPath` 값으로 부서 마스터 생성
2. `members.department_id` 매핑
3. `deptPath` 컬럼 제거 (선택사항, 호환성 위해 유지 가능)

---

## 3. API 설계

### 3.1 부서 관리 API

#### 3.1.1 부서 목록 조회

```
GET /api/v3/departments
```

**Query Parameters:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 50)
- `isActive`: 활성 상태 필터 (true/false/all)
- `search`: 부서명 또는 코드로 검색
- `parentId`: 상위 부서 ID로 필터 (하위 부서만 조회)
- `includeInactive`: 비활성 부서 포함 여부

**Response (200):**
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
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### 3.1.2 부서 상세 조회

```
GET /api/v3/departments/:departmentId
```

**Response (200):**
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
    }
  ],
  "members": [
    {
      "member_id": 10,
      "name": "홍길동",
      "account_id": "hong",
      "role_name": "개발자"
    }
  ],
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

#### 3.1.3 부서 생성

```
POST /api/v3/departments
```

**권한**: PERM_06(사용자 관리) 쓰기 권한 또는 관리자

**Request Body:**
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

**Response (201):**
```json
{
  "message": "부서가 생성되었습니다.",
  "department_id": 1
}
```

#### 3.1.4 부서 수정

```
PUT /api/v3/departments/:departmentId
```

**권한**: PERM_06(사용자 관리) 쓰기 권한 또는 관리자

**Request Body:**
```json
{
  "name": "개발팀",
  "description": "소프트웨어 개발 및 유지보수",
  "is_active": true,
  "sort_order": 1
}
```

**Response (200):**
```json
{
  "message": "부서 정보가 수정되었습니다."
}
```

**참고**: `code`와 `parent_department_id`는 생성 후 수정 불가 (데이터 무결성)

#### 3.1.5 부서 삭제

```
DELETE /api/v3/departments/:departmentId
```

**권한**: PERM_06(사용자 관리) 쓰기 권한 또는 관리자

**Response (200):**
```json
{
  "message": "부서가 삭제되었습니다."
}
```

**Response (400) - 하위 부서 또는 소속 사용자 존재:**
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "이 부서에는 3명의 소속 사용자가 있습니다. 먼저 사용자를 다른 부서로 이동하거나 비활성화해주세요."
}
```

#### 3.1.6 부서 계층 구조 조회 (트리)

```
GET /api/v3/departments/tree
```

**Response (200):**
```json
{
  "data": [
    {
      "department_id": 1,
      "name": "개발팀",
      "code": "DEV",
      "member_count": 5,
      "children": [
        {
          "department_id": 2,
          "name": "프론트엔드팀",
          "code": "FE",
          "member_count": 3,
          "children": []
        },
        {
          "department_id": 3,
          "name": "백엔드팀",
          "code": "BE",
          "member_count": 2,
          "children": []
        }
      ]
    }
  ]
}
```

### 3.2 사용자 관리 API 수정

#### 3.2.1 사용자 목록 조회 (수정)

기존 `GET /api/v3/members`에 Query Parameter 추가:

**Query Parameters (추가):**
- `departmentId`: 부서 ID로 필터
- `includeSubDepartments`: 하위 부서 포함 여부 (기본값: false)

**Response 수정:**
```json
{
  "data": [
    {
      "member_id": 10,
      "account_id": "hong",
      "name": "홍길동",
      "email": "hong@example.com",
      "department_id": 1,
      "department_name": "개발팀",
      "department_code": "DEV",
      // ... 기타 필드
    }
  ]
}
```

#### 3.2.2 사용자 등록/수정 (수정)

기존 Request Body에 `department_id` 필드 추가:

```json
{
  "name": "홍길동",
  "account_id": "hong",
  "email": "hong@example.com",
  "department_id": 1,  // 추가
  // ... 기타 필드
}
```

---

## 4. 프론트엔드 설계

### 4.1 타입 정의 추가

```typescript
// src/types/database.ts

export interface Department {
  department_id: number;
  name: string;
  code: string;
  description?: string;
  parent_department_id?: number;
  parent_department_name?: string;
  depth: number;
  path: string;
  is_active: boolean;
  sort_order: number;
  member_count?: number;  // 조회 시만 포함
  created_at: string;
  updated_at: string;
}

export interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[];
}

// Member 타입 수정
export interface Member {
  // ... 기존 필드
  department_id?: number;
  department_name?: string;  // JOIN 시만 포함
  department_code?: string;  // JOIN 시만 포함
}

// Database 인터페이스에 추가
export interface Database {
  public: {
    Tables: {
      // ... 기존 테이블
      departments: {
        Row: Department;
        Insert: Omit<Department, 'department_id' | 'created_at' | 'updated_at' | 'member_count'>;
        Update: Partial<Omit<Department, 'department_id' | 'created_at' | 'code' | 'parent_department_id'>>;
      };
    };
  };
}
```

### 4.2 API 서비스 추가

```typescript
// src/services/api.ts

export const departmentAPI = {
  /**
   * 부서 목록 조회
   */
  getDepartments: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
    parentId?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.isActive !== undefined) queryParams.set('isActive', String(params.isActive));
    if (params?.search) queryParams.set('search', params.search);
    if (params?.parentId) queryParams.set('parentId', String(params.parentId));

    return await ofetch(`/api/v3/departments?${queryParams}`);
  },

  /**
   * 부서 상세 조회
   */
  getDepartment: async (departmentId: number) => {
    return await ofetch(`/api/v3/departments/${departmentId}`);
  },

  /**
   * 부서 계층 구조 조회
   */
  getDepartmentTree: async () => {
    return await ofetch('/api/v3/departments/tree');
  },

  /**
   * 부서 생성
   */
  createDepartment: async (data: {
    name: string;
    code: string;
    description?: string;
    parent_department_id?: number;
    is_active?: boolean;
    sort_order?: number;
  }) => {
    return await ofetch('/api/v3/departments', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * 부서 수정
   */
  updateDepartment: async (
    departmentId: number,
    data: {
      name?: string;
      description?: string;
      is_active?: boolean;
      sort_order?: number;
    }
  ) => {
    return await ofetch(`/api/v3/departments/${departmentId}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * 부서 삭제
   */
  deleteDepartment: async (departmentId: number) => {
    return await ofetch(`/api/v3/departments/${departmentId}`, {
      method: 'DELETE',
    });
  },
};
```

### 4.3 페이지 구성

#### 4.3.1 부서 목록 페이지

**경로**: `/departments`

**기능**:
- 부서 목록 테이블 표시 (부서명, 코드, 상위 부서, 소속 인원, 상태)
- 검색 및 필터링 (부서명/코드, 활성 상태)
- 부서 생성 버튼
- 수정/삭제 버튼
- 페이지네이션

**화면 구성**:
```
┌─────────────────────────────────────────────────────────┐
│ [부서 관리]                        [+ 부서 추가]          │
├─────────────────────────────────────────────────────────┤
│ [검색: ___________] [상태: 전체▼]  [검색]                │
├─────────────────────────────────────────────────────────┤
│ 부서명    │ 코드  │ 상위 부서 │ 인원 │ 상태  │ 작업      │
├─────────────────────────────────────────────────────────┤
│ 개발팀    │ DEV   │ -         │ 15   │ 활성  │ [수정]   │
│ 프론트엔드팀 │ FE  │ 개발팀    │ 7    │ 활성  │ [수정]   │
│ 백엔드팀   │ BE   │ 개발팀    │ 8    │ 활성  │ [수정]   │
└─────────────────────────────────────────────────────────┘
```

#### 4.3.2 부서 등록/수정 폼

**경로**: `/departments/new`, `/departments/edit/:id`

**필드**:
- 부서명 (필수)
- 부서 코드 (필수, 수정 불가)
- 설명
- 상위 부서 (선택, 수정 불가)
- 활성 상태 (체크박스)
- 표시 순서

#### 4.3.3 사용자 목록 페이지 수정

`src/pages/MemberList.tsx` 수정:

**추가 기능**:
- 부서 필터 드롭다운
- 테이블에 부서명 컬럼 추가

**화면 구성**:
```
┌─────────────────────────────────────────────────────────┐
│ [검색: ___________] [상태: 전체▼] [부서: 전체▼] [검색]   │
├─────────────────────────────────────────────────────────┤
│ 이름  │ 계정 ID │ 이메일 │ 부서 │ 역할 │ 상태 │ 작업    │
├─────────────────────────────────────────────────────────┤
│ 홍길동 │ hong   │ ...    │ 개발팀│ 개발자│ 활성 │ [수정] │
└─────────────────────────────────────────────────────────┘
```

#### 4.3.4 사용자 등록/수정 폼 수정

`src/pages/MemberForm.tsx` 수정:

**추가 필드**:
- 부서 선택 (드롭다운)

#### 4.3.5 통계 페이지 수정

`src/pages/ResourceStats.tsx` 수정:

**추가 섹션**:
- 부서별 리소스 통계 카드
- 부서별 투입 시간 차트

`src/pages/AdminDashboard.tsx` 수정:

**추가 필터**:
- 부서별 필터 (드롭다운)
- 하위 부서 포함 체크박스

---

## 5. 구현 순서

### Phase 1: 백엔드 및 데이터베이스 (2-3일)
1. ✅ 부서 테이블 생성 마이그레이션 작성
2. ✅ 사용자 테이블에 `department_id` 추가
3. ✅ 부서 CRUD API 구현 (Supabase Functions 또는 RLS 정책)
4. ✅ 사용자 API에 부서 필터 추가
5. ✅ 부서 계층 구조 조회 API 구현

### Phase 2: 프론트엔드 타입 및 서비스 (1일)
1. ✅ `Department` 타입 정의
2. ✅ `Member` 타입에 부서 필드 추가
3. ✅ `departmentAPI` 서비스 구현
4. ✅ `memberAPI`에 부서 필터 파라미터 추가

### Phase 3: 부서 관리 UI (2-3일)
1. ✅ 부서 목록 페이지 (`/departments`)
2. ✅ 부서 등록/수정 폼 (`/departments/new`, `/departments/edit/:id`)
3. ✅ 라우팅 추가
4. ✅ 네비게이션 메뉴에 부서 관리 추가

### Phase 4: 사용자 관리 UI 개선 (1-2일)
1. ✅ `MemberList.tsx`: 부서 컬럼 및 필터 추가
2. ✅ `MemberForm.tsx`: 부서 선택 필드 추가

### Phase 5: 통계 UI 개선 (1-2일)
1. ✅ `ResourceStats.tsx`: 부서별 통계 섹션 추가
2. ✅ `AdminDashboard.tsx`: 부서 필터 추가

### Phase 6: 문서 업데이트 (1일)
1. ✅ `database-erd.md` 업데이트
2. ✅ `api-specification.md` 업데이트 (부서 API 추가)
3. ✅ `domain-model.md` 업데이트 (조직 관리 컨텍스트 확장)

---

## 6. 마이그레이션 전략

### 6.1 기존 데이터 마이그레이션

레거시 시스템에 `deptPath` 데이터가 있는 경우:

1. **부서 마스터 생성**:
   ```sql
   INSERT INTO departments (name, code, is_active)
   SELECT DISTINCT
     COALESCE(dept_path, '미분류') AS name,
     UPPER(REPLACE(COALESCE(dept_path, 'UNASSIGNED'), ' ', '_')) AS code,
     true AS is_active
   FROM members
   WHERE dept_path IS NOT NULL AND dept_path != '';
   ```

2. **사용자 매핑**:
   ```sql
   UPDATE members m
   SET department_id = (
     SELECT d.department_id
     FROM departments d
     WHERE d.name = m.dept_path
   )
   WHERE m.dept_path IS NOT NULL;
   ```

3. **검증**:
   ```sql
   -- 매핑되지 않은 사용자 확인
   SELECT member_id, name, dept_path
   FROM members
   WHERE dept_path IS NOT NULL
     AND dept_path != ''
     AND department_id IS NULL;
   ```

### 6.2 하위 호환성

기존 API 클라이언트와의 호환성을 위해 `deptPath` 필드를 계속 반환할 수 있음:

```typescript
// API 응답에 포함
{
  "member_id": 10,
  "department_id": 1,
  "department_name": "개발팀",
  "deptPath": "개발팀",  // 하위 호환용 (deprecated)
  // ...
}
```

---

## 7. 보안 및 권한

### 7.1 RLS (Row Level Security) 정책

```sql
-- 부서 조회: 모든 인증된 사용자
CREATE POLICY "부서 조회 허용"
ON departments FOR SELECT
TO authenticated
USING (true);

-- 부서 생성/수정/삭제: 관리자만
CREATE POLICY "부서 관리 권한"
ON departments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members m
    JOIN roles r ON m.role_id = r.role_id
    WHERE m.auth_id = auth.uid()
      AND (r.name = 'ADMIN' OR r.name = 'MANAGER')
  )
);
```

### 7.2 권한 체크

- **부서 조회**: 모든 인증된 사용자
- **부서 생성/수정/삭제**: `PERM_06(사용자 관리)` 쓰기 권한 또는 ADMIN 역할

---

## 8. 테스트 계획

### 8.1 단위 테스트
- 부서 CRUD API 테스트
- 부서 계층 구조 조회 테스트
- 부서 삭제 제약조건 테스트 (소속 사용자 존재 시)

### 8.2 통합 테스트
- 사용자 생성 시 부서 매핑
- 부서별 사용자 목록 조회
- 부서별 통계 집계

### 8.3 UI 테스트
- 부서 목록/등록/수정 폼 렌더링
- 부서 필터 동작 확인
- 부서 삭제 제약조건 메시지 표시

---

## 9. 향후 확장 가능성

### Phase 2 (향후 개선)
1. **부서 계층 구조 심화**:
   - 무한 깊이 계층 지원
   - 부서 이동 (하위 부서 함께 이동)
   - 계층 경로 breadcrumb 표시

2. **부서 히스토리**:
   - 부서 이동 이력 추적
   - 시점별 부서 조회

3. **부서별 대시보드**:
   - 부서별 성과 지표
   - 부서 간 비교 차트

4. **부서 권한 관리**:
   - 부서별 접근 권한 설정
   - 부서 관리자 역할

---

**문서 버전**: 1.0
**작성일**: 2025-11-16
**작성자**: Claude Code
**상태**: 설계 완료, 검토 대기
