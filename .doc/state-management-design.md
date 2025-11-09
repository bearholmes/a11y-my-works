# 상태 관리 설계

## 개요

이 문서는 업무 보고 시스템의 상태 관리 전략을 정의합니다. Jotai (전역 상태)와 TanStack Query (서버 상태)의 역할 분리와 최적화 전략을 포함합니다.

## 상태 관리 철학

### 핵심 원칙
1. **서버 상태와 클라이언트 상태 분리**: TanStack Query vs Jotai
2. **단일 진실 공급원 (Single Source of Truth)**: 중복 상태 최소화
3. **지역성 우선 (Locality First)**: 가능한 로컬 상태 사용
4. **성능 최적화**: 불필요한 리렌더링 방지
5. **타입 안정성**: TypeScript를 활용한 타입 세이프 상태 관리

---

## 1. 상태 분류 및 도구 선택

### 1.1 상태 유형별 도구

| 상태 유형 | 도구 | 사용 예시 | 지속성 |
|----------|------|----------|--------|
| 서버 상태 | TanStack Query | 업무 목록, 프로젝트 목록 | 캐시 (5분) |
| 전역 UI 상태 | Jotai | 사용자 정보, 세션 | LocalStorage |
| 지역 UI 상태 | React useState | 모달 열림/닫힘, 폼 입력 | 메모리 |
| 폼 상태 | React Hook Form | 업무 작성 폼 | 메모리 |
| URL 상태 | React Router | 페이지, 필터, 정렬 | URL |

### 1.2 상태 선택 가이드

```typescript
/**
 * 상태 도구 선택 플로우차트
 */
function selectStateManagement(question: string): string {
  // 1. 서버 데이터인가?
  if (isServerData) {
    return 'TanStack Query'; // API 응답, DB 데이터
  }

  // 2. 여러 컴포넌트에서 공유되는가?
  if (needsGlobalState) {
    // 3. 지속성이 필요한가?
    if (needsPersistence) {
      return 'Jotai + LocalStorage'; // 사용자 세션, 테마 설정
    }
    return 'Jotai'; // 전역 UI 상태
  }

  // 4. 폼 데이터인가?
  if (isFormData) {
    return 'React Hook Form'; // 복잡한 폼 검증
  }

  // 5. URL과 동기화되어야 하는가?
  if (needsURLSync) {
    return 'React Router (useSearchParams)'; // 필터, 페이지네이션
  }

  // 기본: 지역 상태
  return 'React useState'; // 간단한 UI 상태
}
```

---

## 2. TanStack Query (서버 상태 관리)

### 2.1 설정

```typescript
// src/App.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 캐싱 전략
      staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
      cacheTime: 30 * 60 * 1000, // 30분간 캐시 유지
      refetchOnWindowFocus: false, // 창 포커스 시 재조회 비활성화
      refetchOnMount: true, // 마운트 시 재조회
      refetchOnReconnect: true, // 재연결 시 재조회

      // 재시도 전략
      retry: (failureCount, error) => {
        // 재시도 가능한 에러인 경우만
        if (error instanceof NetworkError) {
          return failureCount < 3;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // 뮤테이션 재시도 (기본 비활성화)
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

### 2.2 Query 키 전략

```typescript
// src/utils/queryKeys.ts

/**
 * Query 키 팩토리 함수
 * 계층적 구조로 관리
 */
export const queryKeys = {
  // 인증
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },

  // 업무
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (filters: TaskQuery) => [...queryKeys.tasks.lists(), filters] as const,
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.tasks.details(), id] as const,
  },

  // 멤버
  members: {
    all: ['members'] as const,
    current: () => [...queryKeys.members.all, 'current'] as const,
    lists: () => [...queryKeys.members.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.members.lists(), filters] as const,
    detail: (id: number) => [...queryKeys.members.all, 'detail', id] as const,
  },

  // 프로젝트 계층
  costGroups: {
    all: ['costGroups'] as const,
    list: () => [...queryKeys.costGroups.all, 'list'] as const,
  },

  services: {
    all: ['services'] as const,
    list: (costGroupId?: number) =>
      [...queryKeys.services.all, 'list', costGroupId] as const,
  },

  projects: {
    all: ['projects'] as const,
    list: (serviceId?: number) =>
      [...queryKeys.projects.all, 'list', serviceId] as const,
  },
} as const;
```

### 2.3 커스텀 훅 패턴

```typescript
// src/hooks/useTasks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskAPI } from '../services/api';
import { queryKeys } from '../utils/queryKeys';
import { useErrorHandler } from './useErrorHandler';
import type { TaskQuery, Task } from '../types/database';

/**
 * 업무 목록 조회 훅
 */
export function useTasks(query: TaskQuery = {}) {
  const { handleError } = useErrorHandler();

  return useQuery({
    queryKey: queryKeys.tasks.list(query),
    queryFn: () => taskAPI.getTasks(query),
    onError: handleError,
    keepPreviousData: true, // 페이지네이션 시 이전 데이터 유지
    select: (data) => ({
      // 데이터 변환 (선택적)
      tasks: data.data.map(task => ({
        ...task,
        // 추가 계산 필드
        formattedDate: new Date(task.task_date).toLocaleDateString('ko-KR'),
      })),
      pagination: data.pagination,
    }),
  });
}

/**
 * 업무 생성 훅
 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: taskAPI.createTask,

    // 낙관적 업데이트
    onMutate: async (newTask) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });

      // 이전 데이터 백업
      const previousTasks = queryClient.getQueryData(queryKeys.tasks.lists());

      // 낙관적으로 캐시 업데이트
      queryClient.setQueryData(queryKeys.tasks.lists(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: [
            ...old.data,
            { ...newTask, task_id: Date.now(), created_at: new Date() },
          ],
        };
      });

      // 백업 데이터 반환 (롤백용)
      return { previousTasks };
    },

    // 성공 시
    onSuccess: (data, variables, context) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.current() });
    },

    // 실패 시 롤백
    onError: (error, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          queryKeys.tasks.lists(),
          context.previousTasks
        );
      }
      handleError(error);
    },

    // 항상 실행
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

/**
 * 업무 수정 훅
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) =>
      taskAPI.updateTask(id, updates),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.detail(id) });

      const previousTask = queryClient.getQueryData(queryKeys.tasks.detail(id));

      queryClient.setQueryData(queryKeys.tasks.detail(id), (old: any) => ({
        ...old,
        ...updates,
      }));

      return { previousTask };
    },

    onSuccess: (data, { id }) => {
      queryClient.setQueryData(queryKeys.tasks.detail(id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
    },

    onError: (error, { id }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(queryKeys.tasks.detail(id), context.previousTask);
      }
      handleError(error);
    },
  });
}

/**
 * 업무 삭제 훅
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: taskAPI.deleteTask,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },

    onError: handleError,
  });
}
```

### 2.4 Prefetching 전략

```typescript
// src/utils/prefetch.ts

import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { businessAPI } from '../services/api';

/**
 * 업무 작성 페이지 진입 시 필요한 데이터 미리 로드
 */
export async function prefetchTaskFormData(queryClient: QueryClient) {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.costGroups.list(),
      queryFn: businessAPI.getCostGroups,
      staleTime: 10 * 60 * 1000, // 10분
    }),
    // 서비스와 프로젝트는 사용자가 선택 후 로드
  ]);
}

// 사용 예시
function TaskFormPage() {
  const queryClient = useQueryClient();

  useEffect(() => {
    prefetchTaskFormData(queryClient);
  }, [queryClient]);

  return <TaskForm />;
}
```

---

## 3. Jotai (전역 클라이언트 상태)

### 3.1 Atom 정의

```typescript
// src/stores/authStore.ts

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Session, User } from '@supabase/supabase-js';

/**
 * 사용자 정보 atom (메모리)
 */
export const userAtom = atom<User | null>(null);

/**
 * 세션 정보 atom (LocalStorage)
 */
export const sessionAtom = atomWithStorage<Session | null>(
  'auth-session',
  null,
  undefined,
  { getOnInit: true }
);

/**
 * 로딩 상태 atom
 */
export const loadingAtom = atom<boolean>(false);

/**
 * 파생 atom: 로그인 여부
 */
export const isAuthenticatedAtom = atom((get) => {
  const user = get(userAtom);
  return user !== null;
});

/**
 * 파생 atom: 사용자 이름
 */
export const userNameAtom = atom((get) => {
  const user = get(userAtom);
  return user?.email?.split('@')[0] || 'Guest';
});
```

### 3.2 UI 상태 Atoms

```typescript
// src/stores/uiStore.ts

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

/**
 * 테마 설정 (LocalStorage 지속)
 */
export const themeAtom = atomWithStorage<'light' | 'dark'>('theme', 'light');

/**
 * 사이드바 열림/닫힘 상태
 */
export const sidebarOpenAtom = atom<boolean>(true);

/**
 * 토스트 알림 queue
 */
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export const toastQueueAtom = atom<ToastMessage[]>([]);

/**
 * 토스트 추가 action atom
 */
export const addToastAtom = atom(
  null,
  (get, set, toast: Omit<ToastMessage, 'id'>) => {
    const queue = get(toastQueueAtom);
    const newToast = {
      ...toast,
      id: `toast-${Date.now()}`,
    };
    set(toastQueueAtom, [...queue, newToast]);

    // 자동 제거 (duration 후)
    setTimeout(() => {
      set(toastQueueAtom, (prev) => prev.filter((t) => t.id !== newToast.id));
    }, toast.duration || 5000);
  }
);

/**
 * 토스트 제거 action atom
 */
export const removeToastAtom = atom(null, (get, set, id: string) => {
  set(toastQueueAtom, (prev) => prev.filter((t) => t.id !== id));
});
```

### 3.3 Atom 사용 패턴

```typescript
// 컴포넌트에서 사용

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { userAtom, isAuthenticatedAtom, addToastAtom } from '../stores';

function UserProfile() {
  // 읽기 + 쓰기
  const [user, setUser] = useAtom(userAtom);

  // 읽기만
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  // 쓰기만 (리렌더링 방지)
  const addToast = useSetAtom(addToastAtom);

  const handleLogout = () => {
    setUser(null);
    addToast({
      type: 'success',
      message: '로그아웃되었습니다',
    });
  };

  return <div>{user?.email}</div>;
}
```

---

## 4. URL 상태 관리

### 4.1 검색 파라미터 동기화

```typescript
// src/hooks/useTaskFilters.ts

import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import type { TaskQuery } from '../types/database';

/**
 * URL 쿼리 파라미터와 동기화된 필터 훅
 */
export function useTaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL에서 필터 파싱
  const filters: TaskQuery = useMemo(() => ({
    page: parseInt(searchParams.get('page') || '1', 10),
    pageSize: parseInt(searchParams.get('pageSize') || '20', 10),
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    keyword: searchParams.get('keyword') || undefined,
    projectId: searchParams.get('projectId') || undefined,
    serviceId: searchParams.get('serviceId') || undefined,
    memberId: searchParams.get('memberId') || undefined,
  }), [searchParams]);

  // 필터 업데이트 함수
  const updateFilters = (newFilters: Partial<TaskQuery>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    setSearchParams(params, { replace: true }); // 히스토리 스택 쌓지 않음
  };

  // 필터 초기화
  const resetFilters = () => {
    setSearchParams({}, { replace: true });
  };

  return {
    filters,
    updateFilters,
    resetFilters,
  };
}

// 사용 예시
function TaskListPage() {
  const { filters, updateFilters } = useTaskFilters();
  const { data, isLoading } = useTasks(filters);

  return (
    <div>
      <input
        value={filters.keyword || ''}
        onChange={(e) => updateFilters({ keyword: e.target.value, page: 1 })}
      />
      {/* ... */}
    </div>
  );
}
```

---

## 5. 상태 정규화 (Normalization)

### 5.1 중복 데이터 제거

```typescript
// TanStack Query의 select를 사용한 데이터 정규화

export function useTasks() {
  return useQuery({
    queryKey: queryKeys.tasks.lists(),
    queryFn: taskAPI.getTasks,
    select: (data) => {
      // 중복 제거 및 정규화
      const tasksById = new Map<number, Task>();
      const projectsById = new Map<number, Project>();

      data.data.forEach((task) => {
        tasksById.set(task.task_id, task);

        if (task.projects) {
          projectsById.set(task.project_id!, task.projects);
        }
      });

      return {
        tasks: Array.from(tasksById.values()),
        projects: Array.from(projectsById.values()),
        pagination: data.pagination,
      };
    },
  });
}
```

---

## 6. 성능 최적화

### 6.1 선택적 구독 (Selective Subscription)

```typescript
// 필요한 데이터만 구독하여 리렌더링 최소화

function TaskCount() {
  // 전체 데이터가 아닌 개수만 구독
  const taskCount = useQuery({
    queryKey: queryKeys.tasks.all,
    queryFn: taskAPI.getTasks,
    select: (data) => data.pagination.total, // count만 추출
  });

  // count가 변경될 때만 리렌더링
  return <div>Total: {taskCount.data}</div>;
}
```

### 6.2 메모이제이션

```typescript
// useMemo를 활용한 계산 캐싱

function TaskStats() {
  const { data: tasks } = useTasks();

  const stats = useMemo(() => {
    if (!tasks) return null;

    return {
      total: tasks.data.length,
      totalTime: tasks.data.reduce((sum, task) => sum + (task.work_time || 0), 0),
      completedCount: tasks.data.filter(task => task.status === 'COMPLETED').length,
    };
  }, [tasks]); // tasks가 변경될 때만 재계산

  return <div>{/* ... */}</div>;
}
```

---

## 7. 디버깅

### 7.1 React Query Devtools

```typescript
// 개발 환경에서만 활성화

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

{process.env.NODE_ENV === 'development' && (
  <ReactQueryDevtools
    initialIsOpen={false}
    position="bottom-right"
  />
)}
```

### 7.2 Jotai Devtools

```typescript
import { DevTools } from 'jotai-devtools';

{process.env.NODE_ENV === 'development' && <DevTools />}
```

---

## 8. 모범 사례

### DO ✅
- 서버 데이터는 항상 TanStack Query 사용
- Query 키는 queryKeys 팩토리 함수 사용
- 낙관적 업데이트로 UX 개선
- select를 사용하여 선택적 구독
- 에러 핸들링 모든 mutation에 추가

### DON'T ❌
- 서버 데이터를 Jotai에 중복 저장
- Query 키를 하드코딩
- 모든 데이터를 전역 상태로 관리
- 불필요한 쿼리 무효화
- 에러를 무시

---

**문서 버전**: 1.0
**작성일**: 2025-11-09
**최종 수정**: 2025-11-09
**작성자**: 개발팀
