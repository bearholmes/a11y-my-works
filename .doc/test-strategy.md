# 테스트 전략

## 개요

이 문서는 업무 보고 시스템의 종합적인 테스트 전략을 정의합니다. 품질 보증과 회귀 방지를 위한 체계적인 테스트 프레임워크를 수립합니다.

## 테스트 원칙

### 핵심 원칙
1. **자동화**: 반복 가능한 모든 테스트는 자동화
2. **격리**: 각 테스트는 독립적으로 실행 가능
3. **빠른 피드백**: 개발자가 즉시 결과를 확인할 수 있도록
4. **신뢰성**: 테스트 결과가 일관되고 예측 가능
5. **유지보수성**: 코드 변경 시 테스트도 쉽게 업데이트 가능

---

## 테스트 피라미드

```
              ╱╲
             ╱E2E╲         수량: 적음 (5-10개)
            ╱Tests╲        속도: 느림
           ╱────────╲       신뢰도: 높음
          ╱          ╲
         ╱Integration╲     수량: 중간 (20-30개)
        ╱    Tests    ╲    속도: 중간
       ╱──────────────╲   신뢰도: 중간
      ╱                ╲
     ╱   Unit Tests     ╲  수량: 많음 (50-100개)
    ╱____________________╲ 속도: 빠름
                           신뢰도: 중간
```

### 비율 목표
- **단위 테스트 (Unit)**: 70%
- **통합 테스트 (Integration)**: 20%
- **E2E 테스트**: 10%

---

## 테스트 기술 스택

### 추천 도구

```json
{
  "devDependencies": {
    // 테스트 프레임워크
    "vitest": "^2.0.0",

    // React 테스트
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@testing-library/jest-dom": "^6.5.0",

    // E2E 테스트
    "playwright": "^1.48.0",
    "@playwright/test": "^1.48.0",

    // 모킹
    "msw": "^2.6.0",

    // 커버리지
    "@vitest/coverage-v8": "^2.0.0"
  }
}
```

### 선택 이유

| 도구 | 용도 | 이유 |
|------|------|------|
| Vitest | 테스트 러너 | Vite와 완벽한 통합, 빠른 실행 속도 |
| Testing Library | 컴포넌트 테스트 | 사용자 중심 테스트, React 공식 권장 |
| Playwright | E2E 테스트 | 크로스 브라우저 지원, 안정적 |
| MSW | API 모킹 | 네트워크 레벨 모킹, 실제와 유사 |

---

## 1. 단위 테스트 (Unit Tests)

### 대상
- 유틸리티 함수
- 커스텀 훅
- 상태 관리 로직
- 비즈니스 로직
- 순수 함수

### 설정

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/*',
      ],
      threshold: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 각 테스트 후 정리
afterEach(() => {
  cleanup();
});

// Supabase 모킹
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));
```

### 테스트 예시

#### 1.1 유틸리티 함수 테스트

```typescript
// src/utils/timeUtils.ts
/**
 * 분 단위 시간을 "HH:MM" 형식으로 변환
 */
export function minutesToTime(minutes: number): string {
  if (minutes < 0 || minutes > 1440) {
    throw new Error('시간은 0~1440분 사이여야 합니다');
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * "HH:MM" 형식을 분 단위로 변환
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);

  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error('잘못된 시간 형식입니다');
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('유효하지 않은 시간입니다');
  }

  return hours * 60 + minutes;
}
```

```typescript
// src/utils/timeUtils.test.ts
import { describe, it, expect } from 'vitest';
import { minutesToTime, timeToMinutes } from './timeUtils';

describe('timeUtils', () => {
  describe('minutesToTime', () => {
    it('should convert minutes to HH:MM format', () => {
      expect(minutesToTime(0)).toBe('00:00');
      expect(minutesToTime(60)).toBe('01:00');
      expect(minutesToTime(125)).toBe('02:05');
      expect(minutesToTime(1440)).toBe('24:00');
    });

    it('should throw error for invalid minutes', () => {
      expect(() => minutesToTime(-1)).toThrow('시간은 0~1440분 사이여야 합니다');
      expect(() => minutesToTime(1441)).toThrow('시간은 0~1440분 사이여야 합니다');
    });
  });

  describe('timeToMinutes', () => {
    it('should convert HH:MM format to minutes', () => {
      expect(timeToMinutes('00:00')).toBe(0);
      expect(timeToMinutes('01:00')).toBe(60);
      expect(timeToMinutes('02:05')).toBe(125);
    });

    it('should throw error for invalid format', () => {
      expect(() => timeToMinutes('invalid')).toThrow('잘못된 시간 형식입니다');
      expect(() => timeToMinutes('25:00')).toThrow('유효하지 않은 시간입니다');
    });
  });
});
```

#### 1.2 커스텀 훅 테스트

```typescript
// src/hooks/useAuth.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
  });

  it('should sign in successfully', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    const mockSession = { user: mockUser, access_token: 'token' };

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth());

    const { error } = await result.current.signIn('test@example.com', 'password');

    expect(error).toBe(null);
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('should handle sign in error', async () => {
    const mockError = new Error('Invalid credentials');

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: mockError,
    } as any);

    const { result } = renderHook(() => useAuth());

    const { error } = await result.current.signIn('test@example.com', 'wrong');

    expect(error).toEqual(mockError);
  });
});
```

#### 1.3 상태 관리 테스트 (Jotai)

```typescript
// src/stores/authStore.test.ts
import { describe, it, expect } from 'vitest';
import { createStore } from 'jotai';
import { userAtom, sessionAtom, loadingAtom } from './authStore';

describe('authStore', () => {
  it('should initialize with null user', () => {
    const store = createStore();
    expect(store.get(userAtom)).toBe(null);
  });

  it('should update user atom', () => {
    const store = createStore();
    const mockUser = { id: '123', email: 'test@example.com' };

    store.set(userAtom, mockUser as any);

    expect(store.get(userAtom)).toEqual(mockUser);
  });

  it('should update loading atom', () => {
    const store = createStore();

    expect(store.get(loadingAtom)).toBe(false);

    store.set(loadingAtom, true);

    expect(store.get(loadingAtom)).toBe(true);
  });
});
```

---

## 2. 통합 테스트 (Integration Tests)

### 대상
- 컴포넌트 + API 통합
- 컴포넌트 + 상태 관리 통합
- 여러 컴포넌트 간 상호작용
- TanStack Query 훅

### MSW 설정

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // 로그인
  http.post('*/auth/v1/token', async ({ request }) => {
    const body = await request.json();

    if (body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        access_token: 'mock-access-token',
        user: {
          id: '123',
          email: 'test@example.com',
        },
      });
    }

    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // 업무 조회
  http.get('*/rest/v1/tasks', () => {
    return HttpResponse.json([
      {
        task_id: 1,
        task_name: '테스트 업무',
        work_time: 120,
        member_id: 1,
      },
    ]);
  }),

  // 업무 생성
  http.post('*/rest/v1/tasks', async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      task_id: 2,
      ...body,
    });
  }),
];
```

```typescript
// src/test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```typescript
// src/test/setup.ts (추가)
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 테스트 예시

#### 2.1 컴포넌트 통합 테스트

```typescript
// src/components/LoginForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { LoginForm } from './LoginForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('LoginForm', () => {
  it('should render login form', () => {
    render(<LoginForm />, { wrapper: createWrapper() });

    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument();
  });

  it('should login successfully with valid credentials', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper: createWrapper() });

    await user.type(screen.getByLabelText(/이메일/i), 'test@example.com');
    await user.type(screen.getByLabelText(/비밀번호/i), 'password');
    await user.click(screen.getByRole('button', { name: /로그인/i }));

    await waitFor(() => {
      expect(screen.queryByText(/로그인 실패/i)).not.toBeInTheDocument();
    });
  });

  it('should show error message with invalid credentials', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper: createWrapper() });

    await user.type(screen.getByLabelText(/이메일/i), 'test@example.com');
    await user.type(screen.getByLabelText(/비밀번호/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /로그인/i }));

    await waitFor(() => {
      expect(screen.getByText(/이메일 또는 비밀번호가 올바르지 않습니다/i)).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper: createWrapper() });

    await user.click(screen.getByRole('button', { name: /로그인/i }));

    expect(await screen.findByText(/이메일을 입력해주세요/i)).toBeInTheDocument();
    expect(await screen.findByText(/비밀번호를 입력해주세요/i)).toBeInTheDocument();
  });
});
```

#### 2.2 API 훅 통합 테스트

```typescript
// src/hooks/useTasks.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTasks, useCreateTask } from './useTasks';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useTasks', () => {
  it('should fetch tasks successfully', async () => {
    const { result } = renderHook(() => useTasks({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].task_name).toBe('테스트 업무');
  });
});

describe('useCreateTask', () => {
  it('should create task successfully', async () => {
    const { result } = renderHook(() => useCreateTask(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        task_name: '새 업무',
        work_time: 60,
        member_id: 1,
      } as any);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.task_name).toBe('새 업무');
  });
});
```

---

## 3. E2E 테스트 (End-to-End Tests)

### 대상
- 사용자 시나리오 (User Journey)
- 크리티컬 패스 (업무 보고 작성 플로우)
- 인증 플로우
- 주요 기능 통합

### Playwright 설정

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 테스트 예시

#### 3.1 인증 플로우

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("로그인")');

    // 대시보드로 리다이렉트 확인
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('대시보드');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'wrong');
    await page.click('button:has-text("로그인")');

    await expect(page.locator('text=이메일 또는 비밀번호가 올바르지 않습니다')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("로그인")');

    // 로그아웃
    await page.click('button:has-text("로그아웃")');

    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL('/login');
  });
});
```

#### 3.2 업무 보고 작성 플로우

```typescript
// e2e/task-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Task Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("로그인")');
    await expect(page).toHaveURL('/');
  });

  test('should create task successfully', async ({ page }) => {
    // 업무 작성 페이지로 이동
    await page.click('text=업무 보고 작성');
    await expect(page).toHaveURL('/tasks/new');

    // 비용 그룹 선택
    await page.selectOption('select[name="cost_group_id"]', '1');

    // 서비스 선택 (드롭다운 활성화 대기)
    await page.waitForSelector('select[name="service_id"]:not([disabled])');
    await page.selectOption('select[name="service_id"]', '1');

    // 프로젝트 선택
    await page.waitForSelector('select[name="project_id"]:not([disabled])');
    await page.selectOption('select[name="project_id"]', '1');

    // 업무 정보 입력
    await page.fill('input[name="task_name"]', 'E2E 테스트 업무');
    await page.fill('textarea[name="task_detail"]', '자동화 테스트로 생성된 업무입니다');
    await page.fill('input[name="work_time"]', '120');

    // 제출
    await page.click('button:has-text("제출")');

    // 성공 메시지 확인
    await expect(page.locator('text=업무 보고가 등록되었습니다')).toBeVisible();

    // 목록 페이지로 이동 확인
    await expect(page).toHaveURL('/tasks');

    // 생성된 업무 확인
    await expect(page.locator('text=E2E 테스트 업무')).toBeVisible();
  });

  test('should validate work time limit', async ({ page }) => {
    await page.goto('/tasks/new');

    await page.fill('input[name="work_time"]', '1500'); // 24시간 초과

    await page.click('button:has-text("제출")');

    await expect(page.locator('text=작업 시간은 24시간을 초과할 수 없습니다')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/tasks/new');

    await page.click('button:has-text("제출")');

    await expect(page.locator('text=필수 항목입니다').first()).toBeVisible();
  });
});
```

---

## 4. 접근성 테스트

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should not have accessibility violations on login page', async ({ page }) => {
    await page.goto('/login');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility violations on dashboard', async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("로그인")');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/login');

    // Tab으로 이동
    await page.keyboard.press('Tab'); // 이메일 필드
    await expect(page.locator('input[type="email"]')).toBeFocused();

    await page.keyboard.press('Tab'); // 비밀번호 필드
    await expect(page.locator('input[type="password"]')).toBeFocused();

    await page.keyboard.press('Tab'); // 로그인 버튼
    await expect(page.locator('button:has-text("로그인")')).toBeFocused();
  });
});
```

---

## 5. 커버리지 목표

### 전체 목표
- **라인 커버리지**: 80% 이상
- **함수 커버리지**: 80% 이상
- **브랜치 커버리지**: 75% 이상
- **구문 커버리지**: 80% 이상

### 영역별 목표

| 영역 | 커버리지 목표 | 비고 |
|------|--------------|------|
| 비즈니스 로직 | 90% | 핵심 기능 |
| API 서비스 | 85% | 에러 처리 포함 |
| 유틸리티 함수 | 95% | 순수 함수 |
| 커스텀 훅 | 80% | 복잡한 로직 위주 |
| 컴포넌트 | 70% | UI 변경 빈번 |
| 타입 정의 | 제외 | 런타임 코드 아님 |

---

## 6. CI/CD 통합

### GitHub Actions 워크플로우

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run linter
        run: pnpm lint

      - name: Run type check
        run: pnpm typecheck

      - name: Run unit tests
        run: pnpm test:unit

      - name: Run integration tests
        run: pnpm test:integration

      - name: Generate coverage report
        run: pnpm test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json

  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### package.json 스크립트

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --coverage",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch"
  }
}
```

---

## 7. 테스트 작성 가이드라인

### DO ✅

1. **AAA 패턴 사용**
   ```typescript
   it('should do something', () => {
     // Arrange (준비)
     const input = 'test';

     // Act (실행)
     const result = doSomething(input);

     // Assert (검증)
     expect(result).toBe('expected');
   });
   ```

2. **의미 있는 테스트 이름**
   ```typescript
   // Good
   it('should return error when work time exceeds 24 hours', () => {});

   // Bad
   it('test1', () => {});
   ```

3. **하나의 테스트에 하나의 개념**
   ```typescript
   // Good
   it('should validate email format', () => {});
   it('should validate password length', () => {});

   // Bad
   it('should validate form', () => {
     // 이메일, 비밀번호, 이름 모두 검증
   });
   ```

4. **사용자 관점에서 테스트**
   ```typescript
   // Good - 사용자가 보는 텍스트
   screen.getByRole('button', { name: /로그인/i });

   // Bad - 구현 세부사항
   screen.getByTestId('login-button');
   ```

### DON'T ❌

1. **테스트 간 의존성 생성**
2. **구현 세부사항 테스트**
3. **테스트에서 로직 작성**
4. **하드코딩된 대기 시간 사용** (waitFor 사용)
5. **너무 많은 것을 한 번에 테스트**

---

## 8. 모범 사례

### 테스트 데이터 관리

```typescript
// src/test/fixtures/taskData.ts
export const mockTask = {
  task_id: 1,
  task_name: '테스트 업무',
  task_detail: '테스트 세부 내용',
  work_time: 120,
  member_id: 1,
  task_date: '2025-11-09',
  created_at: '2025-11-09T00:00:00Z',
  updated_at: '2025-11-09T00:00:00Z',
};

export const mockMember = {
  member_id: 1,
  account_id: 'test_user',
  name: '테스트 사용자',
  email: 'test@example.com',
  is_active: true,
};
```

### 테스트 유틸리티

```typescript
// src/test/utils/renderWithProviders.tsx
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}
```

---

## 9. 구현 로드맵

### Phase 1: 기본 설정 (1주)
- [ ] Vitest 설정
- [ ] Testing Library 설정
- [ ] MSW 설정
- [ ] 기본 테스트 유틸리티 작성

### Phase 2: 단위 테스트 (2주)
- [ ] 유틸리티 함수 테스트 작성
- [ ] 커스텀 훅 테스트 작성
- [ ] 상태 관리 테스트 작성
- [ ] 커버리지 80% 달성

### Phase 3: 통합 테스트 (2주)
- [ ] 컴포넌트 테스트 작성
- [ ] API 통합 테스트 작성
- [ ] 폼 유효성 검증 테스트

### Phase 4: E2E 테스트 (1주)
- [ ] Playwright 설정
- [ ] 주요 시나리오 테스트 작성
- [ ] 크로스 브라우저 테스트

### Phase 5: CI/CD (1주)
- [ ] GitHub Actions 워크플로우 설정
- [ ] 자동 테스트 실행
- [ ] 커버리지 리포트 통합

---

**문서 버전**: 1.0
**작성일**: 2025-11-09
**최종 수정**: 2025-11-09
**작성자**: 개발팀
