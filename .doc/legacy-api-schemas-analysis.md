# Legacy API 스키마 분석 문서

## 개요

기존 `.tmp/schemas` 폴더의 Fastify 기반 API 스키마 구조를 분석하여 React + Supabase 환경에서 참고할 TypeScript 타입 정의와 API 구조를 정리했습니다.

## 분석된 스키마 구조

### 1. 공통 스키마 (`common-schemas.js`)

#### HTTP 응답 코드
```javascript
HTTP_OK = 200
HTTP_CREATED = 201  
HTTP_BAD_REQUEST = 400
HTTP_UNAUTHORIZED = 401
HTTP_FORBIDDEN = 403
HTTP_NOT_FOUND = 404
HTTP_INTERNAL_ERROR = 500
```

#### 공통 응답 스키마
- **commonError**: 일반 오류 응답
- **commonCreatedSuccess**: 리소스 생성 성공
- **commonCreatedError**: 리소스 생성 실패
- **commonUpdatedSuccess**: 리소스 수정 성공
- **commonUpdatedError**: 리소스 수정 실패
- **commonDeletedSuccess**: 리소스 삭제 성공
- **commonDeletedError**: 리소스 삭제 실패

#### 페이지네이션 스키마
```javascript
paginationQuery: {
  page: number (minimum: 1, default: 1)
  pageSize: number (minimum: 1, maximum: 100, default: 20)
  sort: string
  order: 'asc' | 'desc' (default: 'desc')
}

paginationResponse: {
  total: number
  page: number
  pageSize: number
  pageCount: number
}
```

#### 공통 필드 스키마
```javascript
timestampFields: {
  createdAt: string (date-time)
  updatedAt: string (date-time)
}

commonItem: {
  id: string
  name: string
  code?: string
  description?: string
  isActive: boolean (default: true)
  createdId: string
  createdAt: string
  updatedId?: string
  updatedAt?: string
}
```

### 2. 인증 스키마 (`auth/index.js`)

#### 로그인 API
```javascript
// Request
loginSchema.body: {
  accountId: string (maxLength: 255)
  password: string (maxLength: 255)
}

// Response (200)
{
  message: string
  type: string
  token: string (JWT)
  logged: boolean
}
```

#### 토큰 갱신 API
```javascript
reissuanceSchema.response[200]: {
  message: string
  type: string
  token: string (새 JWT)
  logged: boolean
}
```

#### 로그아웃 API
```javascript
logoutSchema.response[200]: {
  message: string
  logged: boolean
}
```

#### 우회 로그인 API (관리자 기능)
```javascript
bypassSchema.body: {
  accountId: string (대상 사용자)
}

bypassSchema.response[200]: {
  message: string
  type: string
  token: string
  logged: boolean
  bypassInfo: {
    originalUser: string
    expiresIn: number
    issuedAt: string
  }
}
```

### 3. 업무일지 스키마 (`task/index.js`)

#### 업무일지 목록 조회
```javascript
taskListSchema.querystring: {
  startDate: string (format: date)
  endDate: string (format: date)
  memberId: string
  taskType: string (업무 유형 코드)
  costGroupId: string
  serviceId: string
  projectId: string
  platformId: string
  keyword: string
  page: number (minimum: 1, default: 1)
  pageSize: number (minimum: 1, maximum: 100, default: 20)
}
```

#### 업무일지 응답 구조
```javascript
{
  pagination: {
    total: number
    page: number
  }
  tasks: Array<{
    taskId: string
    memberId: string
    taskDate: string
    taskType: string
    taskName: string
    taskDetail: string
    taskUrl: string
    workTime: number
    costGroupId: string
    serviceId: string
    projectId: string
    platformId: string
    startTime: string
    endTime: string
    createdAt: string
    updatedAt: string
  }>
}
```

### 4. 사용자 관리 스키마 (`member/index.js`)

#### 사용자 목록 조회
```javascript
memberListSchema.querystring: {
  keyword?: string (maxLength: 100)
  page: number
  pageSize: number
}

memberListSchema.response[200]: {
  total: number
  page: number
  rows: Array<{
    memberId: number
    accountId: string
    name: string
    isActive: boolean
    deptPath: string (부서 경로)
    roles?: {
      roleId: number
      roleName: string
    }
    createdId: string
    createdAt: string
    updatedId?: string
    updatedAt?: string
  }>
}
```

#### 사용자 등록
```javascript
memberCreateSchema.body: {
  accountId: string (maxLength: 100)
  name: string (maxLength: 100)
  email?: string
  mobile?: string
  deptPath?: string
  roleId: number
  password: string
}
```

## React + Supabase 환경으로의 변환

### 1. TypeScript 타입 정의

```typescript
// 공통 타입
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationResponse {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface TimestampFields {
  created_at: string;
  updated_at: string;
}

// 인증 관련 타입
export interface LoginRequest {
  email: string; // Supabase Auth 사용 시 email
  password: string;
}

export interface LoginResponse {
  user: User;
  session: Session;
}

// 업무일지 타입
export interface TaskQuery extends PaginationQuery {
  startDate?: string;
  endDate?: string;
  memberId?: string;
  taskType?: string;
  costGroupId?: string;
  serviceId?: string;
  projectId?: string;
  platformId?: string;
  keyword?: string;
}

export interface Task extends TimestampFields {
  task_id: number;
  member_id: number;
  task_date: string;
  task_type: string;
  task_name: string;
  task_detail?: string;
  task_url?: string;
  work_time?: number;
  cost_group_id?: number;
  service_id?: number;
  project_id?: number;
  platform_id?: number;
  start_time?: string;
  end_time?: string;
}

// 사용자 타입
export interface Member extends TimestampFields {
  member_id: number;
  auth_id: string; // Supabase Auth UUID
  account_id: string;
  name: string;
  email: string;
  mobile?: string;
  role_id?: number;
  is_active: boolean;
}
```

### 2. API 요청 함수 예시

```typescript
// services/api.ts
import { supabase } from '../lib/supabase';

export const taskAPI = {
  async getTasks(query: TaskQuery) {
    let queryBuilder = supabase
      .from('tasks')
      .select(`
        *,
        members(name),
        projects(name),
        services(name),
        cost_groups(name)
      `)
      .order('created_at', { ascending: false });

    if (query.startDate) {
      queryBuilder = queryBuilder.gte('task_date', query.startDate);
    }
    if (query.endDate) {
      queryBuilder = queryBuilder.lte('task_date', query.endDate);
    }
    if (query.keyword) {
      queryBuilder = queryBuilder.ilike('task_name', `%${query.keyword}%`);
    }

    const { data, error, count } = await queryBuilder
      .range(
        ((query.page || 1) - 1) * (query.pageSize || 20),
        (query.page || 1) * (query.pageSize || 20) - 1
      );

    if (error) throw error;

    return {
      data,
      pagination: {
        total: count || 0,
        page: query.page || 1,
        pageSize: query.pageSize || 20,
        pageCount: Math.ceil((count || 0) / (query.pageSize || 20))
      }
    };
  }
};
```

### 3. React Hook 예시

```typescript
// hooks/useTasks.ts
import { useQuery } from '@tanstack/react-query';
import { taskAPI } from '../services/api';

export function useTasks(query: TaskQuery) {
  return useQuery({
    queryKey: ['tasks', query],
    queryFn: () => taskAPI.getTasks(query),
    keepPreviousData: true
  });
}
```

## 주요 변경사항

### 기존 시스템 → 신규 시스템

1. **인증 방식**
   - 기존: JWT + 리프레시 토큰
   - 신규: Supabase Auth (이메일 기반)

2. **API 방식**
   - 기존: REST API (Fastify)
   - 신규: Supabase Client SDK

3. **데이터 페칭**
   - 기존: axios/fetch
   - 신규: TanStack Query + Supabase

4. **스키마 검증**
   - 기존: Fastify 스키마
   - 신규: Zod (React Hook Form과 연동)

5. **테이블/필드명**
   - 기존: camelCase (memberId, taskType)
   - 신규: snake_case (member_id, task_type)

## 구현 우선순위

### Phase 1: 기본 CRUD
1. 인증 (로그인/회원가입/로그아웃)
2. 업무일지 조회/생성/수정/삭제
3. 사용자 관리 (관리자)

### Phase 2: 고급 기능
1. 필터링 및 검색
2. 페이지네이션
3. 실시간 업데이트

### Phase 3: 관리 기능
1. 권한 관리
2. 코드 관리
3. 리포트 기능

이 분석을 통해 기존 API의 구조와 기능을 파악하고, React + Supabase 환경에 적합한 형태로 재구현할 수 있는 기반을 마련했습니다.