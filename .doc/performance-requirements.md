# 성능 요구사항

## 개요

이 문서는 업무 보고 시스템의 성능 목표와 최적화 전략을 정의합니다. Core Web Vitals 및 사용자 경험을 기반으로 한 구체적인 측정 지표를 포함합니다.

## 성능 목표

### Core Web Vitals

| 지표 | 목표 | 우수 | 경고 | 개선 필요 |
|------|------|------|------|----------|
| **LCP** (Largest Contentful Paint) | < 2.5s | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **FID** (First Input Delay) | < 100ms | < 100ms | 100ms - 300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **FCP** (First Contentful Paint) | < 1.8s | < 1.8s | 1.8s - 3.0s | > 3.0s |
| **TTFB** (Time to First Byte) | < 600ms | < 600ms | 600ms - 1500ms | > 1500ms |
| **TTI** (Time to Interactive) | < 3.8s | < 3.8s | 3.8s - 7.3s | > 7.3s |

### 추가 성능 지표

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 초기 JavaScript 번들 크기 | < 200KB (gzip) | Vite bundle analyzer |
| 페이지 전환 시간 | < 500ms | Custom Performance API |
| API 응답 시간 (p95) | < 500ms | Supabase Dashboard |
| 첫 렌더링까지 시간 | < 1.5s | Lighthouse |
| 메모리 사용량 | < 100MB | Chrome DevTools |
| 프레임률 (FPS) | > 50 fps | Performance Monitor |

---

## 1. 번들 사이즈 최적화

### 1.1 코드 스플리팅

```typescript
// src/components/AppRouter.tsx

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 라우트별 코드 스플리팅
const Dashboard = lazy(() => import('../pages/Dashboard'));
const TaskList = lazy(() => import('../pages/TaskList'));
const TaskForm = lazy(() => import('../pages/TaskForm'));
const AdminPanel = lazy(() => import('../pages/admin/AdminPanel'));

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tasks/new" element={<TaskForm />} />
          <Route path="/admin/*" element={<AdminPanel />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### 1.2 번들 분석

```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "analyze": "vite build --mode analyze && vite-bundle-visualizer"
  },
  "devDependencies": {
    "vite-bundle-visualizer": "^1.2.1"
  }
}
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 벤더 청크 분리
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query', 'jotai'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
    chunkSizeWarningLimit: 500, // KB
  },
});
```

### 1.3 트리 쉐이킹

```typescript
// ❌ 나쁜 예 - 전체 라이브러리 import
import _ from 'lodash';
import * as dateFns from 'date-fns';

// ✅ 좋은 예 - 필요한 함수만 import
import { debounce } from 'lodash-es';
import { format, parseISO } from 'date-fns';
```

---

## 2. 렌더링 최적화

### 2.1 React.memo 사용

```typescript
// src/components/TaskItem.tsx

import { memo } from 'react';

interface TaskItemProps {
  task: Task;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

/**
 * Task 아이템 컴포넌트 (메모이제이션)
 * task props가 변경될 때만 리렌더링
 */
export const TaskItem = memo(function TaskItem({
  task,
  onEdit,
  onDelete,
}: TaskItemProps) {
  return (
    <div className="task-item">
      <h3>{task.task_name}</h3>
      <button onClick={() => onEdit(task.task_id)}>Edit</button>
      <button onClick={() => onDelete(task.task_id)}>Delete</button>
    </div>
  );
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수 (선택적)
  return prevProps.task.task_id === nextProps.task.task_id &&
         prevProps.task.updated_at === nextProps.task.updated_at;
});
```

### 2.2 useMemo / useCallback

```typescript
// src/pages/TaskList.tsx

import { useMemo, useCallback } from 'react';

function TaskList() {
  const { data } = useTasks();

  // 계산 비용이 높은 작업 메모이제이션
  const taskStats = useMemo(() => {
    if (!data) return null;

    return {
      total: data.tasks.length,
      completed: data.tasks.filter(t => t.status === 'COMPLETED').length,
      totalTime: data.tasks.reduce((sum, t) => sum + (t.work_time || 0), 0),
    };
  }, [data]);

  // 함수 메모이제이션 (자식 컴포넌트 props로 전달 시)
  const handleEdit = useCallback((id: number) => {
    navigate(`/tasks/edit/${id}`);
  }, [navigate]);

  const handleDelete = useCallback((id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  return (
    <div>
      <Stats data={taskStats} />
      {data?.tasks.map(task => (
        <TaskItem
          key={task.task_id}
          task={task}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

### 2.3 가상화 (Virtualization)

```typescript
// 긴 목록 렌더링 최적화
// npm install @tanstack/react-virtual

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

function VirtualizedTaskList({ tasks }: { tasks: Task[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // 각 아이템 높이 (px)
    overscan: 5, // 보이지 않는 영역에도 5개 추가 렌더링
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <TaskItem task={tasks[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 3. 네트워크 최적화

### 3.1 HTTP 캐싱 헤더

```typescript
// vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*).html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

### 3.2 리소스 프리로드

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>업무 보고 시스템</title>

    <!-- 폰트 프리로드 -->
    <link
      rel="preload"
      href="/fonts/pretendard.woff2"
      as="font"
      type="font/woff2"
      crossorigin
    />

    <!-- Supabase API 프리커넥트 -->
    <link rel="preconnect" href="https://xxx.supabase.co" />
    <link rel="dns-prefetch" href="https://xxx.supabase.co" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 3.3 이미지 최적화

```typescript
// src/components/OptimizedImage.tsx

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

/**
 * 최적화된 이미지 컴포넌트
 * - 지연 로딩 (lazy loading)
 * - 반응형 이미지
 * - WebP 포맷 지원
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
}: OptimizedImageProps) {
  return (
    <picture>
      <source srcSet={`${src}.webp`} type="image/webp" />
      <source srcSet={`${src}.jpg`} type="image/jpeg" />
      <img
        src={`${src}.jpg`}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}
```

---

## 4. 데이터 최적화

### 4.1 페이지네이션

```typescript
// 서버 사이드 페이지네이션

function TaskListPage() {
  const { filters, updateFilters } = useTaskFilters();
  const { data, isLoading } = useTasks({
    page: filters.page || 1,
    pageSize: 20, // 한 페이지에 20개만
  });

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage });
  };

  return (
    <div>
      <TaskList tasks={data?.tasks} />
      <Pagination
        current={filters.page || 1}
        total={data?.pagination.pageCount || 1}
        onChange={handlePageChange}
      />
    </div>
  );
}
```

### 4.2 무한 스크롤

```typescript
// src/hooks/useInfiniteTasks.ts

import { useInfiniteQuery } from '@tanstack/react-query';
import { taskAPI } from '../services/api';
import { queryKeys } from '../utils/queryKeys';

export function useInfiniteTasks() {
  return useInfiniteQuery({
    queryKey: queryKeys.tasks.lists(),
    queryFn: ({ pageParam = 1 }) => taskAPI.getTasks({ page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.pageCount) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
}

// 사용 예시
function InfiniteTaskList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTasks();

  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div>
      {data?.pages.map((page) =>
        page.data.map((task) => <TaskItem key={task.task_id} task={task} />)
      )}
      <div ref={observerRef} />
      {isFetchingNextPage && <LoadingSpinner />}
    </div>
  );
}
```

### 4.3 데이터 선택적 로드

```typescript
// 필요한 필드만 조회

// ❌ 나쁜 예 - 모든 필드 조회
const { data } = await supabase.from('tasks').select('*');

// ✅ 좋은 예 - 필요한 필드만 조회
const { data } = await supabase
  .from('tasks')
  .select('task_id, task_name, work_time, task_date');

// 관계 데이터도 선택적으로
const { data } = await supabase
  .from('tasks')
  .select(`
    task_id,
    task_name,
    projects(name),
    members(name)
  `);
```

---

## 5. 성능 모니터링

### 5.1 Web Vitals 측정

```typescript
// src/utils/analytics.ts

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

/**
 * Core Web Vitals 수집 및 로깅
 */
export function initPerformanceMonitoring() {
  function sendToAnalytics(metric: any) {
    console.log('[Performance]', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });

    // 프로덕션: Analytics 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      // Google Analytics, Mixpanel 등
      // gtag('event', metric.name, {
      //   value: Math.round(metric.value),
      //   metric_rating: metric.rating,
      // });
    }
  }

  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
```

### 5.2 커스텀 성능 메트릭

```typescript
// src/utils/performanceMetrics.ts

/**
 * 페이지 전환 시간 측정
 */
export function measurePageTransition(pageName: string) {
  const start = performance.now();

  return () => {
    const end = performance.now();
    const duration = end - start;

    console.log(`[Page Transition] ${pageName}: ${duration.toFixed(2)}ms`);

    // 목표: < 500ms
    if (duration > 500) {
      console.warn(`Page transition is slow: ${duration.toFixed(2)}ms`);
    }
  };
}

// 사용 예시
function TaskListPage() {
  useEffect(() => {
    const endMeasure = measurePageTransition('TaskList');
    return endMeasure;
  }, []);

  return <div>...</div>;
}

/**
 * API 호출 시간 측정
 */
export async function measureAPICall<T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const start = performance.now();

  try {
    const result = await apiCall();
    const end = performance.now();
    const duration = end - start;

    console.log(`[API Call] ${name}: ${duration.toFixed(2)}ms`);

    // 목표: < 500ms
    if (duration > 500) {
      console.warn(`API call is slow: ${name} - ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`[API Call Failed] ${name}: ${(end - start).toFixed(2)}ms`, error);
    throw error;
  }
}
```

---

## 6. Lighthouse 성능 점수 목표

### 목표 점수

| 카테고리 | 목표 점수 | 현재 상태 |
|----------|-----------|----------|
| Performance | > 90 | 측정 필요 |
| Accessibility | > 95 | 측정 필요 |
| Best Practices | > 90 | 측정 필요 |
| SEO | > 90 | 측정 필요 |

### Lighthouse CI 설정

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

---

## 7. 성능 체크리스트

### 개발 단계
- [ ] 코드 스플리팅 적용
- [ ] React.memo 사용 (필요한 곳)
- [ ] useMemo/useCallback 최적화
- [ ] TanStack Query 캐싱 전략
- [ ] 이미지 lazy loading
- [ ] 폰트 최적화

### 빌드 단계
- [ ] 번들 사이즈 < 200KB (gzip)
- [ ] Tree shaking 검증
- [ ] Source map 프로덕션 비활성화
- [ ] CSS 압축
- [ ] 불필요한 의존성 제거

### 배포 단계
- [ ] CDN 설정
- [ ] HTTP 캐싱 헤더
- [ ] Brotli 압축
- [ ] HTTPS 활성화
- [ ] 리소스 프리로드

### 모니터링
- [ ] Lighthouse CI 설정
- [ ] Web Vitals 추적
- [ ] 에러 모니터링 (Sentry)
- [ ] 성능 대시보드 구축

---

## 8. 성능 저하 시 대응

### 문제 식별
1. Lighthouse 점수 하락 감지
2. 사용자 리포트 확인
3. Performance Profiler 분석

### 대응 절차
1. **즉시 대응** (Performance Score < 70)
   - 팀 알림
   - 원인 파악
   - Hot fix 준비

2. **단기 대응** (1-2일)
   - 병목 구간 최적화
   - 긴급 패치 배포

3. **장기 대응** (1-2주)
   - 아키텍처 개선
   - 리팩토링
   - 모니터링 강화

---

**문서 버전**: 1.0
**작성일**: 2025-11-09
**최종 수정**: 2025-11-09
**작성자**: 개발팀
**다음 검토 예정**: 2025-12-09 (1개월 후)
